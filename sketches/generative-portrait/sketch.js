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
}

function draw() {

  
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

  stroke(c);

  let x1 = random(0.1, 0.9) * width;
  let y1 = random(0.1, 0.9) * height;

  let x2 = random(0.3, 0.7) * width;
  let y2 = random(0.3, 0.6) * height;

  // line(x1, y1, x2, y2);
  
 
  // if (x1 < 0.15 || x1 > 0.85) {
  //   rect(x1,y1,random(20,50),random(10,50))
  // }


  noFill(); 
  stroke(b);

  rectMode(CENTER);

  rect(200, 200, random(50, 150), random(50, 150));
  rect(550, 200, random(50, 150), random(50, 150));

  fill(c)
  ellipse(200,200,30);
  ellipse(550, 200, 30);

  for (let i = 0; i < 2; i++) {

    let circleX = width / 2 -30 + i * 50;
    let circleY = height / 2;

    fill(random(palette));
    noStroke();
    ellipse(circleX, circleY, random(20, 50));
  }
}