// Replay detector samples without a camera; these tests do not measure live accuracy.
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(join(__dirname, '../sketches/fog-glass/sketch.js'), 'utf8');
const detector = source.slice(source.indexOf('function updateClap('), source.indexOf('\nfunction gestureHint('));
function run(frames, inferenceMs = 100) {
  const ctx = vm.createContext({clap:{phase:'idle',openFrames:0,lastSeen:0},inferenceMs, count:0,paintResumeAt:0, cycleBrush(){this.count++;}});
  // cycleBrush must increment inside the VM global scope.
  vm.runInContext('function cycleBrush(){count++;}',ctx);
  vm.runInContext(detector,ctx);
  for (const [time,distance] of frames) {
    ctx.samples = distance === null ? [] : distance === 'center' ? [{palmCenter:{x:.5,y:.5},palmSize:.1}] : [
      {palmCenter:{x:.5-distance/2,y:.5},palmSize:.1},
      {palmCenter:{x:.5+distance/2,y:.5},palmSize:.1}];
    ctx.now=time;
    vm.runInContext('updateClap(samples,now)',ctx);
  }
  return ctx.count;
}
const cases = [
  ['visible contact',[[0,.5],[100,.5],[200,.34],[300,.18]],1],
  ['edge-on hands and overlap',[[0,.5],[100,.5],[200,.38],[300,null],[500,.4]],1],
  ['fast clap skips the closing frame',[[0,.5],[100,.5],[200,'center'],[500,.5]],1],
  ['closer starting position',[[0,.22],[100,.22],[200,.14]],1],
  ['one hand simply leaves',[[0,.5],[100,.5],[200,null],[500,.5]],0],
  ['small tracking jitter',[[0,.5],[100,.5],[200,.46],[300,.51]],0],
  ['lost tracking expires',[[0,.5],[100,.5],[200,.38],[300,null],[2400,.5]],0],
  ['held contact switches once',[[0,.5],[100,.5],[200,.18],[300,.18],[1800,.18]],1],
  ['separate before second clap',[[0,.5],[100,.5],[200,.18],[1700,.5],[1800,.5],[1900,.18]],2],
  ['slow model overlap',[[0,.5],[500,.5],[1000,.38],[1500,null],[2000,.5]],1,500]
];
for(const [name,frames,expected,latency] of cases){assert.equal(run(frames,latency),expected,name);console.log('PASS:',name);}
// Gesture filtering accepts an edge-of-frame finger without weakening drawing checks.
const handSample = source.slice(source.indexOf('function handSample('),source.indexOf('\nfunction updateHandTracks('));
const ctx=vm.createContext({video:{width:640,height:480},HAND_MIN_CONFIDENCE:.75});
vm.runInContext(handSample,ctx);
ctx.hand={confidence:.45,keypoints:Array.from({length:21},()=>({x:320,y:240}))};
ctx.hand.keypoints[9]={x:320,y:300};ctx.hand.keypoints[8]={x:-2,y:100};
assert.equal(vm.runInContext('handSample(hand)',ctx),null);
assert.ok(vm.runInContext('handSample(hand,.35,true)',ctx));
console.log('PASS: gesture and drawing confidence remain separate');
