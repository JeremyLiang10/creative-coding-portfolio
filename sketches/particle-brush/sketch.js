let bgColor = "#eee9df";
let particle = [];
let spacing = 32;
let influenceDistance = 140;
let pallete = ['green', 'red', 'yellow', 'orange', 'blue', 'purple'];

class Particle{
  constructor(_x, _y, _r) {
    this.x = _x;
    this.y = _y;
    this.px = _x;
    this.py = _y;
    this.r = _r;
    this.pr = _r;

    this.len = 14;
    this.pLen = 14;
    
    this.c = "#1b1b1b";


  }
  update() {
      let d = dist(mouseX, mouseY, this.x, this.y);

    if(d < influenceDistance && d > 0){
      let strength = (influenceDistance - d) / influenceDistance;

      let dx = this.x - mouseX;
      let dy = this.y - mouseY;

      dx = dx / d;
      dy = dy / d;

      this.x += dx * strength * 7;
      this.y += dy * strength * 7;

      this.r += strength * 0.12;

      this.len += strength * 2;

      if (d < 55) {
        this.c = random(pallete);
      }

    } else {

      this.c = "#1b1b1b";
    }
    this.x += (this.px - this.x) * 0.1;
    this.y += (this.py - this.y) * 0.1;

    this.r += (this.pr - this.r) * 0.1;
    this.len += (this.pLen - this.len) * 0.1;
  }


  draw() {
    stroke(this.c);
    strokeWeight(2);
    

    let x1 = this.x - cos(this.r) * this.len / 2;
    let y1 = this.y - sin(this.r) * this.len / 2;

    let x2 = this.x + cos(this.r) * this.len / 2;
    let y2 = this.y + sin(this.r) * this.len / 2;

    line(x1, y1, x2, y2);
  }

  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(bgColor);

  for (let y = spacing; y < height; y += spacing) {
    for (let x = spacing; x < width; x += spacing) {
      let angle;
      if ((x / spacing + y / spacing) % 2 == 0) {
        angle = 0;
      } else {
        angle = HALF_PI;
      }
      let c = new Particle(x, y, angle);
      particle.push(c);
    }
  }
}

function draw() {

  background(bgColor);

  for (let c of particle) {

    c.update();
    c.draw();
  }
}

function mousePressed() {

  for (let p of particle) {

    let d = dist(mouseX, mouseY, p.x, p.y);

    if (d < 120 && d > 0) {

      let strength = (120 - d) / 120;

      let dx = p.x - mouseX;
      let dy = p.y - mouseY;

      dx = dx / d;
      dy = dy / d;

      p.x += dx * strength * 40;
      p.y += dy * strength * 40;

      p.r += random(-1, 1) * strength;

      p.len += strength * 20;
    }
  }
}