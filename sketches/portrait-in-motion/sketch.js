let bgColor = "#202020";
let fgColor = "cyan";

let palette = [
  "green",
  "yellow",,
  "orange",
  "pink",
  "maroon",
  "black",
  "#ff00ff"
];

let palette2 = [
  "green",
  "#04f8e0",
  "yellow",
  "orange",
  "blue()",
  "pink",
  "maroon",
  "black",
  "cyan",
  
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(bgColor);
  
}function draw() {

  // FADE
  noStroke();
  fill(32, 32, 32, 15);
  rectMode(CORNER);
  rect(0, 0, width, height);



  noStroke();
  fill(fgColor);

  fgColor = color(
    random(200, 255),
    random(10, 40),
    random(0, 20),
    random(30, 100)
  );

  let x = random(0.4, 0.6) * width;
  let y = random(0.7, 0.8) * height;

  if (dist(width / 2, height / 2, x, y) > 0.15 * width) {
    ellipse(x, y, random(10, 40));
  }


  let b = random(palette);
  let c = random(palette2);

  // stroke(c);
  let x1 = random(0.1, 0.9) * width;
  let y1 = random(0.1, 0.9) * height;

  let x2 = random(0.3, 0.7) * width;
  let y2 = random(0.3, 0.6) * height;

  stroke(c);
  strokeWeight(1);

  if (random() < 0.1) {
    line(x1, y1, x2, y2);
  }

  stroke(c);
  noFill();

  rectMode(CENTER);

  if (random() < 0.15) {
    rect(x1,y1,random(20, 50),random(10, 50));
  }
  beginShape();

  vertex(width / 2 - 100, height / 2 - 300);
  vertex(width / 2 - 250, height / 2 - 220); // top left
  vertex(width / 2 - 235, height / 2 - 100); // left temple
  vertex(width / 2 - 190, height / 2 + 70);  // left cheek
  vertex(width / 2 - 110, height / 2 + 200); // jaw left
  vertex(width / 2,       height / 2 + 250); // chin
  vertex(width / 2 + 110, height / 2 + 200); // jaw right
  vertex(width / 2 + 190, height / 2 + 80);  // right cheek
  vertex(width / 2 + 235, height / 2 - 100); // right temple
  vertex(width / 2 + 250, height / 2 - 220);
  vertex(width / 2 + 100, height / 2 - 300);

  endShape(CLOSE);

  noFill();
  stroke(b);
  strokeWeight(2)

  rect(width / 2 - 140, width / 2 - 170,random(50, 150),random(50, 150));
  rect(width / 2 + 140,width / 2 - 170,random(50, 150),random(50, 150));

  fill(c);
  noStroke();
  
  ellipse(width / 2 - 140, width / 2 - 170, 30);
  ellipse(width / 2 + 140, width / 2 - 170, 30);



  for (let i = 0; i < 2; i++) {

    let circleX = width / 2 - 30 + i * 50;
    let circleY = height / 2;

    fill(random(palette));
    noStroke();

    ellipse(circleX,circleY,random(20, 50));
  }
  
  for (let i = 0; i < 8; i++) {

  let hairX = random(width / 2 - 200, width / 2 + 200);

  let hairY = random(height / 2 - 320, height / 2 - 240);

  noFill();
  stroke(random(palette2));

  rect(hairX, hairY, random(20, 60), random(20, 80));
  }
}