const N_PARTICLES = 70;

let int_threshold = 0.1; //fraction of world size

let activeParticle;

let brushLayer

class Particle {
  //blueprint for making objects (instances)

  constructor(_x = 100, _y = 100, _r = 10, _c = "gold", _vx = 0, _vy = 0) {
    //declare with default values
    this.x = _x;
    this.y = _y;
    this.r = _r;
    this.c = _c;
    this.vx = _vx;
    this.vy = _vy;
    this.label = "";
  }

  draw() {
    //method
    fill(this.c);
    stroke(this.c);
    circle(this.x, this.y, this.r);
    stroke("white");
    text(this.label, this.x, this.y);
  }

  // interact( other) {

  // }

  update() {
    this.x = this.x + this.vx;
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    // % width;
    this.y = this.y + this.vy;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
    // % height;
  }
}

//////////////////////////

// things that need to persist for the world
let bgColor = "black";

let particles = []; //store the particle array

let palette = ["pink", "orange", "yellow", "green", "blue", "purple", "white"];

function setup() {

    brushLayer = createGraphics(windowWidth, windowHeight);
  // createCanvas(500, 500);
  createCanvas(windowWidth, windowHeight);
  background(bgColor);

  strokeWeight(3);
  stroke(random(palette))

  for (let i = 0; i < N_PARTICLES; i++) {
    // let c = random(palette);
    let c = palette[i % palette.length];
    let x = random(width);
    let y = random(height);
    let r = 10;
    let p = new Particle(x, y, r, c); //actual creation

    p.vx = random(-1, 1);
    p.vy = random(-0.5, 0.5);
    // p.shape = random( ['rect','circle']);

    particles.push(p); // world ledger
  }
  console.log(particles);
}

function interaction(a, b) {
  let d = dist(a.x, a.y, b.x, b.y);
  if (d < 0.1 * width) {
    //check dist between two parts
    smooth();
    stroke(a.c);
    strokeWeight(3)
    line(a.x, a.y, b.x, b.y);
  }

  if (d < a.r + b.r) {

    if (b.r > a.r) {
      b.r = b.r + random(0.1, 0.2);
      a.r = a.r - 0.1;
    } else {
      b.r = b.r - 0.1;
      a.r = a.r + random(0.1,0.2);
      // a.vx =0;
      // a.vy=0;
    }
b.r = constrain(b.r, 1, 10);
a.r = constrain(a.r, 1, 10);
  }
}

function updateAndDrawParticles() {
  for (let p of particles) {
    //iterate over
    p.update();
    // noSmooth();
    p.draw();
  }

  // iterate over all pairs and have them interact
  for (let i = 0; i < particles.length - 1; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      //particles[i].interact(particles[j]);
      interaction(particles[i], particles[j]);
    }
  }
}

function draw() {
  background('black');
  updateAndDrawParticles();
  // console.log(dot1);
  image(brushLayer, 0, 0);
}
//////////////

function mousePressed() {
  let r = 10;
  let c = "#66B2FF";
  for(let i = 0; i < 5; i ++) {
  activeParticle = new Particle(mouseX+ i, mouseY + i, r, c, random(0.1,3), random(0.2,4));
  particles.push(activeParticle);
  }
}

// function mouseReleased() {
//   //compute direction of movement
//   let vx = (mouseX - activeParticle.x) * 0.1;
//   let vy = (mouseY - activeParticle.y) * 0.1;
//   activeParticle.vx = vx;
//   activeParticle.vy = vy;
//   particles.push(activeParticle);

  
// }

function mouseMoved() {
  let dx = mouseX-pmouseX;
  let dy = mouseY - pmouseY;

  let d = dist(pmouseX, pmouseY, mouseX, mouseY);
  
     for (let i = 0; i < 5; i++) {
     let offset = (i - 2) *10;
      let offsetX = (-dy / d) * offset;
      let offsetY = (dx / d) * offset;
      line(pmouseX + offsetX, pmouseY + offsetY, mouseX + offsetX, mouseY + offsetY);
     }
}