// 雾窗 / Fog Glass — p5.js + ml5.js HandPose
// keypoints[8] 是食指指尖。摄像头和关键点同时镜像，移动方向才一致。
const W = 960;
const H = 720;
const BRUSH_SIZE = 20;
const BRUSHES = [
  { name: 'Fingertip', description: 'Fine, rounded strokes', width: 20, height: 20 },
  { name: 'Sponge', description: 'Wide, textured strokes', width: 72, height: 46 },
  { name: 'Squeegee', description: 'Straight, clean streaks', width: 108, height: 10 }
];
let brushIndex = 0;
let brushStamps = [];
let clap = { phase: 'idle', openFrames: 0, lastSeen: 0, lastRatio: 0, started: 0, until: 0 };
let paintResumeAt = 0;
let toolNoticeUntil = 0;
const DROP_COUNT = 24;
const DROP_TIME_SCALE = .2; // 水珠以最初 20% 的速度运动。
let droplets = [];
let fog, scene, grain, frosted, blurred;
let detectionTimer;
let inferenceCount = 0;
let lastDiagnostic = 0;
let inferenceMs = 0;
let video, handPose, cameraStream;
let hands = [];
let lastDetection = 0;
let handTracks = [];
let nextTrackId = 1;
const HAND_CONFIRM_FRAMES = 3;
const HAND_MIN_CONFIDENCE = .75;
let previousMouse = null;
let pointerOnControls = false;
let controlPointerDown = false;
let cameraReady = false;
let trackingReady = false;
let starting = false;
let fogElapsed = 0;

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent('canvas-holder');
  // 保留 960×720 绘画坐标，只按剩余的显示空间等比缩放。
  const canvasSpace = document.querySelector('.canvas-space');
  const holder = document.getElementById('canvas-holder');
  const fitCanvas = () => {
    const available = canvasSpace.getBoundingClientRect();
    const displayWidth = Math.max(0, Math.floor(Math.min(available.width - 2, (available.height - 2) * W / H)));
    holder.style.width = `${displayWidth + 2}px`;
  };
  new ResizeObserver(fitCanvas).observe(canvasSpace);
  fitCanvas();
  pixelDensity(1);
  fog = createGraphics(W, H);
  scene = createGraphics(W, H);
  grain = createGraphics(W, H);
  frosted = createGraphics(W, H);
  blurred = createGraphics(W / 4, H / 4);
  for (const layer of [fog, scene, grain, frosted, blurred]) layer.pixelDensity(1);
  makeScene();
  makeGrain();
  makeBrushStamps();
  resetFog();
  document.getElementById('camera-button').addEventListener('click', startCamera);
  document.getElementById('reset-button').addEventListener('click', resetFog);
  document.getElementById('tool-button').addEventListener('click', cycleBrush);
  const controls = document.querySelector('.actions');
  controls.addEventListener('pointerenter', () => { pointerOnControls = true; });
  controls.addEventListener('pointerleave', () => { pointerOnControls = false; });
  controls.addEventListener('pointerdown', () => { controlPointerDown = true; previousMouse = null; });
  window.addEventListener('pointerup', () => { controlPointerDown = false; });
  window.addEventListener('pointercancel', () => { controlPointerDown = false; });
}

async function startCamera() {
  if (starting || trackingReady) return;
  starting = true;
  const button = document.getElementById('camera-button');
  button.disabled = true;
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Open this page on localhost or HTTPS to enable the camera.');
    }
    if (!cameraReady) {
      setStatus('Requesting camera access…');
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      // 用 p5.MediaElement 包装视频，供 image() 和 HandPose 共用。
      video = createVideo([]);
      video.hide();
      video.elt.muted = true;
      video.elt.playsInline = true;
      video.elt.srcObject = cameraStream;
      await new Promise((resolve, reject) => {
        video.elt.onloadedmetadata = resolve;
        video.elt.onerror = () => reject(new Error('Could not read the camera feed.'));
        if (video.elt.readyState >= 1) resolve();
      });
      video.size(video.elt.videoWidth, video.elt.videoHeight);
      await video.elt.play();
      cameraReady = true;
    }
    setStatus('Camera connected. Loading hand tracking…');
    if (typeof ml5 === 'undefined') throw new Error('ml5.js failed to load. Check your connection and refresh.');
    // ml5 1.2.1 的工厂返回实例，不是加载完成的 Promise。
    // 必须等待 ready；直接 await ml5.handPose() 会在 model=null 时开始识别。
    if (!handPose) handPose = ml5.handPose({
      maxHands: 2,
      flipped: false,
      // 使用随作业保存的 MediaPipe 模型，避开旧 TFHub 地址的重定向错误。
      runtime: 'mediapipe',
      modelType: 'full',
      solutionPath: new URL('vendor/hands/', window.location.href).href
    });
    try {
      await withTimeout(handPose.ready, 60000, 'Hand tracking took too long to load. Check your connection and retry.');
    } catch (error) {
      handPose = null;
      throw error;
    }
    inferenceCount = 0;
    trackingReady = true;
    detectFrame();
    button.textContent = 'Camera on';
  } catch (error) {
    const message = error.name === 'NotAllowedError' ? 'Camera access was denied. Allow access and retry.'
      : error.name === 'NotFoundError' ? 'No camera found. Connect a camera and retry.'
      : error.name === 'NotReadableError' ? 'Camera unavailable. Another app may be using it.'
      : error.message;
    setStatus(`${message} You can still click and drag to draw.`);
    button.textContent = 'Retry';
  } finally {
    starting = false;
    button.disabled = trackingReady;
  }
}

function draw() {
  if (cameraReady) {
    const rect = videoRect();
    push();
    translate(W, 0);
    scale(-1, 1);
    image(video, rect.x, rect.y, rect.w, rect.h);
    pop();
  } else {
    image(scene, 0, 0);
  }

  // 累积到 400ms 再补雾，避免很低的 alpha 被 Canvas 的 8-bit 精度舍掉。
  if (document.getElementById('regrow').checked) {
    fogElapsed += Math.min(deltaTime, 100);
    if (fogElapsed >= 400) {
      const alpha = 255 * (1 - Math.exp(-fogElapsed / 22000));
      fog.noStroke();
      fog.fill(191, 209, 217, alpha);
      fog.rect(0, 0, W, H);
      fogElapsed = 0;
    }
  } else fogElapsed = 0;

  const activeTracks = getActiveTracks(millis());
  const cursors = [];
  if (cameraReady) {
    const rect = videoRect();
    for (const track of activeTracks) {
      if (clap.phase === 'closing' || clap.phase === 'contact' || millis() < paintResumeAt) {
        track.previous = null;
        continue;
      }
      const raw = {
        x: W - (rect.x + track.tip.x * rect.w),
        y: rect.y + track.tip.y * rect.h
      };
      if (raw.x < 0 || raw.x > W || raw.y < 0 || raw.y > H) {
        track.previous = null;
        continue;
      }
      const previous = track.previous;
      const amount = 1 - Math.exp(-Math.min(deltaTime, 100) / 55);
      const point = previous ? {
        x: lerp(previous.x, raw.x, amount), y: lerp(previous.y, raw.y, amount)
      } : raw;
      paint(point, previous);
      track.previous = point;
      cursors.push(point);
    }
  }

  if (mouseIsPressed && !pointerOnControls && !controlPointerDown && mouseX >= 0 && mouseX <= W && mouseY >= 0 && mouseY <= H) {
    const point = { x: mouseX, y: mouseY };
    paint(point, previousMouse);
    previousMouse = point;
    cursors.push(point);
  } else previousMouse = null;

  if (millis() - lastDiagnostic > 500) {
    document.getElementById('diagnostic').textContent = `v0.7.5 · ${cameraReady ? 'Camera connected' : 'Waiting for camera'} · ${inferenceCount} frames processed · ${activeTracks.length} / 2 hands confirmed${inferenceCount ? ` · ${inferenceMs}ms` : ''}`;
    lastDiagnostic = millis();
  }
  const hint = document.getElementById('gesture-status');
  const hintText = gestureHint();
  if (hint.textContent !== hintText) hint.textContent = hintText;
  const materialToast = document.getElementById('material-toast');
  const hideNotice = millis() >= toolNoticeUntil;
  if (materialToast.hidden !== hideNotice) materialToast.hidden = hideNotice;
  updateDroplets();
  drawGlass();
  drawDroplets();
  if (cameraReady && document.getElementById('debug-hand').checked) drawTrackingPreview(activeTracks);
  for (const cursor of cursors) {
    noFill();
    stroke(255, 245, 222, 150);
    strokeWeight(1.5);
    const brush = BRUSHES[brushIndex];
    if (brushIndex === 0) circle(cursor.x, cursor.y, brush.width + 7);
    else rect(cursor.x - brush.width / 2, cursor.y - brush.height / 2, brush.width, brush.height, brushIndex === 1 ? 10 : 2);
  }
  if (trackingReady) {
    if (clap.phase === 'closing' || clap.phase === 'contact') setStatus('Clap gesture in progress · Bring your hands together to switch tools.');
    else if (!inferenceCount) setStatus('Model ready. Starting hand tracking…');
    else if (millis() - lastDetection > 5000) setStatus('Tracking is slow. Check the camera preview in the upper-left corner.');
    else setStatus(activeTracks.length ? `${activeTracks.length} hand(s) confirmed · Wipe with your index fingers. Clap to switch tools.` : 'Tracking active · Show one or both hands fully and hold still briefly before moving.');
  }
}

// 单帧识别便于捕获运行错误，避免库内部循环失败后页面仍显示正常。
async function detectFrame() {
  if (!trackingReady) return;
  try {
    const started = performance.now();
    hands = await withTimeout(handPose.detect(video.elt), 15000, 'Hand tracking timed out. Click to retry.');
    inferenceMs = Math.round(performance.now() - started);
    lastDetection = millis();
    updateHandTracks(hands, lastDetection);
    inferenceCount++;
    detectionTimer = setTimeout(detectFrame, 30);
  } catch (error) {
    trackingReady = false;
    hands = [];
    handTracks = [];
    handPose = null;
    const button = document.getElementById('camera-button');
    button.disabled = false;
    button.textContent = 'Retry';
    setStatus(`Tracking stopped: ${error.message} Click to retry.`);
    console.error('HandPose detection failed:', error);
  }
}

function getActiveTracks(now) {
  return handTracks.filter(track => {
    const active = track.hits >= HAND_CONFIRM_FRAMES && now - track.seen < 500;
    if (!active) track.previous = null;
    return active;
  });
}

function handSample(hand, minConfidence = HAND_MIN_CONFIDENCE, forGesture = false) {
  const points = hand.keypoints;
  if (!Number.isFinite(hand.confidence) || hand.confidence < minConfidence ||
      !points || points.length < 21 || !points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) return null;
  const normalize = p => ({ x: p.x / video.width, y: p.y / video.height });
  const wrist = normalize(points[0]);
  const palm = normalize(points[9]);
  // 极小、退化的关键点组不参与绘画；不要求特定手势。
  if (Math.hypot(palm.x - wrist.x, palm.y - wrist.y) < .025) return null;
  const tip = normalize(points[8]);
  if (!forGesture && (tip.x < 0 || tip.x > 1 || tip.y < 0 || tip.y > 1)) return null;
  const center = [0, 5, 9, 13, 17].map(i => normalize(points[i]));
  const palmCenter = { x: center.reduce((sum, p) => sum + p.x, 0) / 5,
    y: center.reduce((sum, p) => sum + p.y, 0) / 5 };
  const palmSize = Math.hypot(palm.x - wrist.x, palm.y - wrist.y);
  return { hand, wrist, tip, palmCenter, palmSize, label: hand.handedness };
}

function updateHandTracks(results, now) {
  const samples = results.map(hand => handSample(hand)).filter(Boolean).slice(0, 2);
  // 拍手时侧面的手置信度容易降低。手势判断与绘画过滤分开，不能把低可信点直接拿来画。
  const gestureSamples = results.map(hand => handSample(hand, .35, true)).filter(Boolean).slice(0, 2);
  updateClap(gestureSamples, now);
  const old = handTracks.filter(track => now - track.seen < 500);
  // 两只手的检测顺序可能交换。比较整体配对成本，用位置为主、左右手标签为辅。
  let best = { cost: Infinity, matches: [] };
  function match(index, used, matches, cost) {
    if (index === samples.length) {
      if (cost < best.cost) best = { cost, matches: [...matches] };
      return;
    }
    match(index + 1, used, [...matches, -1], cost + .32);
    for (let i = 0; i < old.length; i++) {
      if (used.includes(i)) continue;
      const sample = samples[index], track = old[i];
      const distance = Math.hypot(sample.wrist.x - track.wrist.x, sample.wrist.y - track.wrist.y);
      if (distance > .3) continue;
      const labelCost = sample.label && track.label && sample.label !== track.label ? .08 : 0;
      match(index + 1, [...used, i], [...matches, i], cost + distance + labelCost);
    }
  }
  match(0, [], [], 0);
  handTracks = samples.map((sample, index) => {
    const track = old[best.matches[index]];
    if (!track) return { ...sample, id: nextTrackId++, hits: 1, seen: now, previous: null };
    const jump = Math.hypot(sample.tip.x - track.tip.x, sample.tip.y - track.tip.y) > .2;
    return { ...sample, id: track.id, seen: now,
      hits: jump ? 1 : track.hits + 1,
      previous: jump ? null : track.previous };
  });
}

// 摄像头只判断二维合拢/分开，不使用麦克风，也不假设能测量真实接触。
function updateClap(samples, now) {
  const gapLimit = Math.min(1800, Math.max(900, inferenceMs * 4));
  const separation = samples.length === 2 ? Math.hypot(
    samples[0].palmCenter.x - samples[1].palmCenter.x,
    samples[0].palmCenter.y - samples[1].palmCenter.y) : null;
  function cancel() {
    clap = { phase: 'idle', openFrames: 0, lastSeen: now, until: 0 };
  }
  if (clap.phase === 'cooldown') {
    if (now < clap.until || separation === null ||
        separation < Math.max(.16, (clap.openDistance || .3) * .65)) return;
    cancel();
  }
  if (separation === null) {
    // 侧手或重叠常导致其中一只手消失。只有此前明确靠近才保留候选，
    // 重新看到分开的双手后再确认，单手消失本身不会切换。
    if (now - clap.lastSeen <= gapLimit) {
      const centeredHand = samples.length === 1 && clap.midpoint &&
        Math.hypot(samples[0].palmCenter.x - clap.midpoint.x,
          samples[0].palmCenter.y - clap.midpoint.y) < clap.openDistance * .30;
      if ((clap.phase === 'closing' && clap.contraction >= .18) ||
          (clap.phase === 'open' && centeredHand)) {
        clap.phase = 'contact'; clap.started = now;
      }
      return;
    }
    cancel();
    return;
  }
  if (clap.phase !== 'idle' && now - clap.lastSeen > gapLimit) cancel();
  const size = Math.max(.035, (samples[0].palmSize + samples[1].palmSize) / 2);
  if (clap.phase === 'idle') {
    // 不必夸张地张开双臂；连续两帧看见分开的双手即可准备。
    if (separation > Math.max(.16, size * 1.8)) {
      clap.openFrames++;
      if (clap.openFrames >= 2) {
        clap.phase = 'open'; clap.scale = size; clap.openDistance = separation;
        clap.contraction = 0;
      }
    } else clap.openFrames = 0;
  }
  if (clap.phase === 'open') {
    if (separation >= clap.openDistance) {
      clap.openDistance = separation;
      clap.midpoint = { x: (samples[0].palmCenter.x + samples[1].palmCenter.x) / 2,
        y: (samples[0].palmCenter.y + samples[1].palmCenter.y) / 2 };
    }
    clap.contraction = 1 - separation / clap.openDistance;
    if (clap.contraction >= .18) { clap.phase = 'closing'; clap.started = now; }
  }
  if (clap.phase === 'closing') {
    clap.contraction = Math.max(clap.contraction, 1 - separation / clap.openDistance);
    // 使用分开时的掌心尺度，并兼顾相对距离，侧手尺寸收缩不再阻止触发。
    if ((separation / clap.scale <= 2.2 && clap.contraction >= .30) ||
        separation <= clap.openDistance * .48) {
      finishClap(now);
      return;
    }
    if (now - clap.started > 2500 || separation >= clap.openDistance * .98) cancel();
  } else if (clap.phase === 'contact') {
    if (now - clap.started > gapLimit) cancel();
    else if (separation >= clap.openDistance * .65 ||
             separation <= Math.max(clap.scale * 2.2, clap.openDistance * .48)) {
      finishClap(now);
      return;
    }
  }
  clap.lastSeen = now;
}

function finishClap(now) {
  cycleBrush();
  paintResumeAt = now + 300;
  clap.phase = 'cooldown';
  clap.until = now + 1400;
}

function gestureHint() {
  if (millis() < toolNoticeUntil) return `Switched to ${BRUSHES[brushIndex].name}. Move your index finger to try it.`;
  if (clap.phase === 'open') return 'Clap: Ready. Bring your hands together.';
  if (clap.phase === 'closing') return 'Clap: Hands moving together…';
  if (clap.phase === 'contact') return 'Clap: Show both hands again to confirm.';
  if (clap.phase === 'cooldown') return 'Tool switched. Separate your hands to prepare for the next clap.';
  return 'Clap: Start with both hands apart and visible to the camera.';
}

function cycleBrush() {
  brushIndex = (brushIndex + 1) % BRUSHES.length;
  toolNoticeUntil = millis() + 2000;
  for (const track of handTracks) track.previous = null;
  previousMouse = null;
  const brush = BRUSHES[brushIndex];
  const toolButton = document.getElementById('tool-button');
  toolButton.textContent = brush.name;
  toolButton.setAttribute('aria-label', `Switch material: ${brush.name}`);
  document.getElementById('material-name').textContent = brush.name;
  document.getElementById('material-description').textContent = brush.description;
  const toast = document.getElementById('material-toast');
  toast.textContent = `Switched to ${brush.name}`;
  toast.hidden = false;
}

function makeBrushStamps() {
  brushStamps = BRUSHES.map((brush, index) => {
    if (index === 0) return null;
    const stamp = createGraphics(brush.width, brush.height);
    stamp.pixelDensity(1);
    const ctx = stamp.drawingContext;
    ctx.fillStyle = 'rgba(0,0,0,.96)';
    ctx.beginPath();
    ctx.roundRect(1, 1, brush.width - 2, brush.height - 2, index === 1 ? 11 : 2);
    ctx.fill();
    if (index === 1) {
      // 海绵孔隙和参差湿边；与均匀、平直的刮水器作区分。
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(0,0,0,${random(.2, .7)})`;
        ctx.beginPath(); ctx.arc(random(brush.width), random(brush.height), random(.6, 2), 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      for (let y = 5; y < brush.height; y += 8) ctx.fillRect(0, y, brush.width, 1);
    }
    return stamp;
  });
}

function paint(point, previous) {
  if (brushIndex === 0) { wipe(point, previous); return; }
  const stamp = brushStamps[brushIndex];
  const ctx = fog.drawingContext;
  const from = previous || point;
  const distance = Math.hypot(point.x - from.x, point.y - from.y);
  if (previous && distance < .5) return;
  const steps = Math.max(1, Math.ceil(distance / 4));
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 1; i <= steps; i++) {
    const x = from.x + (point.x - from.x) * i / steps;
    const y = from.y + (point.y - from.y) * i / steps;
    ctx.drawImage(stamp.canvas, x - stamp.width / 2, y - stamp.height / 2);
  }
  ctx.restore();
}

function withTimeout(promise, duration, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), duration); })
  ]).finally(() => clearTimeout(timer));
}

function drawGlass() {
  // 雾玻璃会散射下面的画面，因此在遮罩内绘制实时模糊的影像。
  const ctx = blurred.drawingContext;
  ctx.save();
  ctx.filter = 'blur(4px)';
  if (cameraReady) {
    const rect = videoRect();
    ctx.translate(W / 4, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video.elt, rect.x / 4 - 3, rect.y / 4 - 3, rect.w / 4 + 6, rect.h / 4 + 6);
  } else ctx.drawImage(scene.canvas, -3, -3, W / 4 + 6, H / 4 + 6);
  ctx.restore();
  frosted.clear();
  frosted.image(blurred, 0, 0, W, H);
  frosted.noStroke();
  frosted.fill(206, 217, 219, 118);
  frosted.rect(0, 0, W, H);
  frosted.image(grain, 0, 0);
  const glass = frosted.drawingContext;
  glass.save();
  glass.globalCompositeOperation = 'destination-in';
  glass.drawImage(fog.canvas, 0, 0);
  glass.restore();
  image(frosted, 0, 0);
}

function drawTrackingPreview(tracks) {
  const x = 18, y = 18, w = 160, h = 120;
  push();
  translate(x + w, y);
  scale(-1, 1);
  image(video, 0, 0, w, h);
  for (const track of tracks) {
    const hand = track.hand;
    stroke(130, 255, 201);
    strokeWeight(1);
    for (const [a, b] of handPose.getConnections()) {
      const p = hand.keypoints[a], q = hand.keypoints[b];
      line(p.x / video.width * w, p.y / video.height * h, q.x / video.width * w, q.y / video.height * h);
    }
    noStroke();
    fill(255, 224, 160);
    const tip = hand.keypoints[8];
    circle(tip.x / video.width * w, tip.y / video.height * h, 7);
  }
  pop();
  noFill();
  stroke(225, 240, 244, 140);
  strokeWeight(1);
  rect(x, y, w, h, 3);
}

function wipe(point, previous, brushSize = BRUSH_SIZE) {
  const ctx = fog.drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // 多层软边模拟指腹推开水汽，中心透明，边缘留有薄薄的湿气。
  for (const [size, opacity] of [[1.28, .09], [1.12, .16], [.98, .32], [.84, 1]]) {
    ctx.lineWidth = brushSize * size;
    ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillStyle = ctx.strokeStyle;
    if (previous) {
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(point.x, point.y, brushSize * size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function videoRect() {
  // cover 裁切：即使摄像头不是 4:3，也不把人脸拉伸变形。
  const factor = Math.max(W / video.width, H / video.height);
  const w = video.width * factor;
  const h = video.height * factor;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

function resetFog() {
  droplets = Array.from({ length: DROP_COUNT }, () => makeDroplet(false));
  fogElapsed = 0;
  fog.clear();
  fog.background(255, 246);
  // 轻微起伏的凝结密度，避免一整块均匀白色。
  fog.noStroke();
  for (let y = 0; y < H; y += 12) {
    for (let x = 0; x < W; x += 12) {
      fog.fill(255, 255 * noise(x * .005, y * .005));
      fog.rect(x, y, 12, 12);
    }
  }
  for (const track of handTracks) track.previous = null;
  previousMouse = null;
}

function makeGrain() {
  grain.clear();
  const ctx = grain.drawingContext;
  // 很细的水汽颗粒；较大的凝结水滴有暗边、透亮下缘和偏心高光。
  for (let i = 0; i < 22000; i++) {
    const x = random(W), y = random(H);
    ctx.fillStyle = random() < .5 ? 'rgba(255,255,255,.06)' : 'rgba(30,55,65,.035)';
    ctx.fillRect(x, y, 1, 1);
  }
  // 大颗水珠由动态层绘制，这里只保留附着的小颗粒。
  for (let i = 0; i < 1560; i++) {
    drawDroplet(ctx, random(W), random(H), i < 1250 ? random(.7, 1.8) : random(1.8, 3.6), random(1, 1.55));
  }
  // 玻璃两侧稍厚的冷凝水汽。
  const edge = ctx.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, 'rgba(227,238,240,.26)');
  edge.addColorStop(.18, 'rgba(227,238,240,0)');
  edge.addColorStop(.82, 'rgba(227,238,240,0)');
  edge.addColorStop(1, 'rgba(227,238,240,.26)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);
}

function drawDroplet(ctx, x, y, r, stretch) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, stretch);
    // 水滴内散射和折射的明暗近似；不作为物理光学模拟。
    const body = ctx.createRadialGradient(-r * .3, -r * .4, 0, 0, 0, r);
    body.addColorStop(0, 'rgba(245,253,255,.24)');
    body.addColorStop(.5, 'rgba(122,154,166,.04)');
    body.addColorStop(.82, 'rgba(27,54,68,.22)');
    body.addColorStop(1, 'rgba(33,57,68,.05)');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(32,58,68,.22)';
    ctx.lineWidth = .65;
    ctx.beginPath(); ctx.arc(0, 0, r * .92, .05, Math.PI * .92); ctx.stroke();
    ctx.strokeStyle = 'rgba(247,255,255,.65)';
    ctx.lineWidth = Math.max(.5, r * .15);
    ctx.beginPath(); ctx.arc(-r * .12, -r * .12, r * .63, Math.PI * 1.1, Math.PI * 1.55); ctx.stroke();
    ctx.strokeStyle = 'rgba(240,255,255,.28)';
    ctx.beginPath(); ctx.arc(0, r * .02, r * .8, .35, 1.35); ctx.stroke();
    ctx.restore();
}

function makeDroplet(fromTop) {
  return {
    x: random(20, W - 20),
    y: fromTop ? -12 : random(-12, H - 20),
    r: random(3.4, 6),
    speed: 0,
    seed: random(1000),
    age: random(20),
    // 各水珠起步时间不同，避免整齐地一起下落。
    wait: random(.2, 3)
  };
}

function updateDroplets() {
  // 秒作为运动单位；切回标签页时也不会突然划出很长的水痕。
  const dt = Math.min(deltaTime, 50) / 1000 * DROP_TIME_SCALE;
  for (let i = 0; i < droplets.length; i++) {
    const drop = droplets[i];
    drop.age += dt;
    if (drop.wait > 0) {
      drop.wait -= dt;
      continue;
    }
    const previous = { x: drop.x, y: drop.y };
    // 较大水珠流得稍快；噪声模拟玻璃表面阻力，引入停顿和微小偏移。
    const resistance = noise(drop.seed, drop.age * .35);
    const target = (5 + drop.r * 4) * (resistance < .38 ? .06 : .6 + resistance);
    drop.speed += (target - drop.speed) * Math.min(1, dt * 2.5);
    drop.y += drop.speed * dt;
    drop.x += (noise(drop.seed + 50, drop.y * .018) - .5) * dt * 9;
    if (drop.y > H + 12) {
      // 新生水珠从顶部开始，不能和上一条底部轨迹连接。
      droplets[i] = makeDroplet(true);
      continue;
    }
    if (drop.y > 0 && drop.y > previous.y) {
      wipe(drop, previous, drop.r * .95);
    }
  }
}

function drawDroplets() {
  for (const drop of droplets) {
    const stretch = 1.2 + Math.min(drop.speed / 65, .5);
    drawDroplet(drawingContext, drop.x, drop.y, drop.r, stretch);
  }
}

function makeScene() {
  // 摄像头未开启前的程序绘制背景，不需要额外图片文件。
  for (let y = 0; y < H; y++) {
    const c = lerpColor(color('#335b72'), color('#a2b4b7'), y / H);
    scene.stroke(c);
    scene.line(0, y, W, y);
  }
  scene.noStroke();
  for (let i = 0; i < 45; i++) {
    const x = random(W), h = random(100, 400), w = random(25, 75);
    scene.fill(24, 49, 66, 170);
    scene.rect(x, H - h, w, h);
    for (let yy = H - h + 15; yy < H; yy += 22) {
      if (random() > .35) {
        scene.fill(245, 212, 150, random(70, 180));
        scene.rect(x + 9, yy, 6, 9);
      }
    }
  }
}

function setStatus(message) {
  const status = document.getElementById('status');
  if (status.textContent !== message) status.textContent = message;
}

function keyPressed(event) {
  if (event.code === 'KeyB' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    cycleBrush();
    return false;
  }
  if (event.code === 'Space' && !['BUTTON', 'INPUT'].includes(document.activeElement.tagName)) {
    resetFog();
    return false;
  }
}

// 页面离开时释放摄像头。
window.addEventListener('pagehide', () => {
  trackingReady = false;
  clearTimeout(detectionTimer);
  if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
});
