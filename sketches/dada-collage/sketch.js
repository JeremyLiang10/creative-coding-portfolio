
let imgNames = [
  "dada_may06_388.jpeg",
  "photo2.jpg",
  "photo3.jpeg",
  "photo4.jpeg",
  "photo5.jpeg"
];

let imgs = [];
let particles = [];

let words = ["DADA", "NO!", "404", "ART?", "ERROR"];

let lastX = 0;
let lastY = 0;

let startX = 0;
let startY = 0;

let isDragging = false;

let stepSpacing = 32;
let explosionRadius = 220;
let maxParticles = 350;


async function setup() {
  createCanvas(windowWidth, windowHeight);

  background(242, 238, 226);

  for (let i = 0; i < imgNames.length; i++) {
    try {
      let img = await loadImage("assets/" + imgNames[i]);
      imgs.push(img);
    } catch (error) {
      console.log("Cannot load: " + imgNames[i]);
    }
  }
}


// DRAW

function draw() {
  background(242, 238, 226);

  drawPaper();

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
  }
}


class Particle {

  constructor(x, y) {

    this.x = x;
    this.y = y;

    this.vx = random(-1, 1);
    this.vy = random(-1, 1);

    this.angle = random(-0.5, 0.5);
    this.rotationSpeed = random(-0.02, 0.02);

    this.isText = random(1) < 0.2;

    if (this.isText) {

      this.word = random(words);
      this.size = random(22, 38);

      this.boxColor = random(["black", "red"]);

    }

    else {

      let img = random(imgs);

      this.size = floor(random(90, 180));

      this.size = min(
        this.size,
        img.width,
        img.height
      );


      let sx = floor(random(img.width - this.size));
      let sy = floor(random(img.height - this.size));


      this.piece = createImage(this.size, this.size);


      this.piece.copy(
        img,
        sx, sy, this.size, this.size,
        0, 0, this.size, this.size
      );


      let maskImg = createGraphics(this.size, this.size);

      maskImg.clear();
      maskImg.noStroke();
      maskImg.fill(255);


      if (random(1) < 0.5) {

        maskImg.circle(
          this.size / 2,
          this.size / 2,
          this.size * 0.9
        );

      } else {

        maskImg.beginShape();

        maskImg.vertex(10, 5);
        maskImg.vertex(this.size - 15, 10);
        maskImg.vertex(this.size - 5, this.size / 2);
        maskImg.vertex(this.size - 20, this.size - 5);
        maskImg.vertex(5, this.size - 15);

        maskImg.endShape(CLOSE);
      }


      this.piece.mask(maskImg);

      maskImg.remove();
    }
  }


  update() {

    this.x += this.vx;
    this.y += this.vy;

    this.angle += this.rotationSpeed;

    // Slow down
    this.vx *= 0.93;
    this.vy *= 0.93;

    this.rotationSpeed *= 0.92;
  }


  display() {

    push();

    translate(this.x, this.y);
    rotate(this.angle);

    if (this.isText) {

      textSize(this.size);
      textStyle(BOLD);

      let w = textWidth(this.word);

      rectMode(CENTER);

      fill(this.boxColor);
      noStroke();

      rect(0, 0, w + 20, this.size + 20);

      fill(255);

      textAlign(CENTER, CENTER);
      text(this.word, 0, 0);

    } else {

      imageMode(CENTER);

      image(
        this.piece,
        0, 0,
        this.size, this.size
      );
    }

    pop();
  }
}



function mousePressed() {

  startX = mouseX;
  startY = mouseY;

  lastX = mouseX;
  lastY = mouseY;

  isDragging = false;
}


// MOUSE DRAGGED

function mouseDragged() {

  let moved = dist(
    mouseX, mouseY,
    startX, startY
  );

  if (moved > 8) {
    isDragging = true;
  }

  let d = dist(
    mouseX, mouseY,
    lastX, lastY
  );

  if (d > stepSpacing && imgs.length > 0) {

    let p = new Particle(mouseX, mouseY);

    particles.push(p);

    if (particles.length > maxParticles) {
      particles.shift();
    }

    lastX = mouseX;
    lastY = mouseY;
  }

  return false;
}


function mouseReleased() {

  if (isDragging == false) {

    for (let i = 0; i < particles.length; i++) {

      let p = particles[i];

      let d = dist(
        mouseX, mouseY,
        p.x, p.y
      );

      if (d < explosionRadius) {

        let dx = p.x - mouseX;
        let dy = p.y - mouseY;

        if (d < 1) {
          dx = random(-1, 1);
          dy = random(-1, 1);
          d = max(1, dist(0, 0, dx, dy));
        }

        let force = map(
          d,
          0, explosionRadius,
          18, 2
        );

        p.vx += dx / d * force;
        p.vy += dy / d * force;

        p.rotationSpeed += random(-0.08, 0.08);
      }
    }
  }

  isDragging = false;
}



function drawPaper() {

  stroke(0, 15);

  for (let i = 0; i < 300; i++) {

    let x = random(width);
    let y = random(height);

    point(x, y);
  }
}



function keyPressed() {


  if (key == " ") {
    particles = [];
  }

  if (key == "s" || key == "S") {
    saveCanvas("DADA_Collage", "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}