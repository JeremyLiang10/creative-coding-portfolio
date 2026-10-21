function setup() {
  createCanvas(500, 500);

  noLoop();
}

function draw() {
  background(220);

  //hair
  noStroke();
  fill(35,30,30);

  ellipse(250, 105, 270, 150);
  ellipse(125, 135, 65, 150);
  ellipse(375, 135, 65, 150);

  //ear
  fill(245, 205, 180);
  ellipse(108, 245, 35, 65);
  ellipse(392, 245, 35, 65);

  //face
  fill('#FFE5CC');
  circle(250,225,275);//face

  //ear on top
  fill(245, 205, 180);
  ellipse(392, 245, 35, 65);

  
  //hair on top
  fill(35,35,35)
  ellipse(145, 85, 75, 120);
  ellipse(180, 65, 75, 120);
  ellipse(220, 60, 75, 115);
  ellipse(260, 60, 75, 115);
  ellipse(300, 70, 75, 120);
  ellipse(340, 90, 70, 120);

  //eye
  fill('white');
  circle(190,205,55);
  circle(300,205,55);

  //eyeball
  fill('black');
  circle(190,205,27.5);
  circle(300,205,27.5);

  //highlight
  fill('white');
  circle(185,200,6);
  circle(295,200,6)

  //nose
  fill(255,204,204)
  rect(225, 225, 20, 20);

  //mouse
  stroke('red')
  strokeWeight(5)
  fill(255, 102, 102);
  ellipse(225,290,30,50);

  noStroke();
  fill(255, 153, 153, 150);
  ellipse(175, 250, 60, 25);
  ellipse(295, 250, 60, 25);

  //shirt
  fill(255);
  ellipse(250, 445, 250, 150);

  //collar
  fill(25, 30, 40);
  triangle(220, 360, 250, 410, 280, 360);//x1,y1,x2,y2,x3,y3

  //crossbag
  stroke('green');
  strokeWeight(17);
  line(200,385,285,500);


}