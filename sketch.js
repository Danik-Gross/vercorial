let O;            // хвост (центр мобильной области)
let r = 80;       // радиус AO
let d2 = 40;      // половина диагонали BD
let offset = 0.25;// смещение «живого фокуса» вдоль AO (0..0.6)
let velocity;     // скорость центра O

function setup() {
  createCanvas(windowWidth, windowHeight);
  O = createVector(width / 2, height / 2);
  velocity = createVector(0, 0);
}

function draw() {
  background(20);

  // Курсор C
  const C = createVector(mouseX, mouseY);

  // Направление от O к C
  let dir = p5.Vector.sub(C, O);
  const distOC = dir.mag();
  if (distOC < 1e-6) dir.set(1, 0); else dir.div(distOC);

  // Целевая точка центра мобильной области
  const T = p5.Vector.sub(C, p5.Vector.mult(dir, r));

  // Остриё A — на границе области; если курсор ближе r, A = C
  let A = p5.Vector.add(O, p5.Vector.mult(dir, r));
  if (distOC <= r) A = C.copy();

  // Середина AO
  const M = p5.Vector.add(O, p5.Vector.mult(p5.Vector.sub(A, O), 0.5));

  // «Живой фокус» X
  let dynamicOffset = offset + 0.05 * sin(frameCount * 0.02);
  dynamicOffset = constrain(dynamicOffset, 0.1, 0.6);
  const X = p5.Vector.add(O, p5.Vector.mult(p5.Vector.sub(M, O), dynamicOffset));

  // Перпендикуляр к AO
  const v = createVector(-(A.y - O.y), (A.x - O.x)).normalize();

  // Диагональ BD
  let dynamicD2 = d2 + 5 * sin(frameCount * 0.03);
  let B = p5.Vector.add(X, p5.Vector.mult(v, dynamicD2));
  let D = p5.Vector.sub(X, p5.Vector.mult(v, dynamicD2));

  // Ограничение BD
  const clampBD = () => {
    const OB = p5.Vector.dist(O, B);
    const OD = p5.Vector.dist(O, D);
    if (OB > r || OD > r) {
      let maxLen = min(p5.Vector.dist(O, X), r - 2);
      dynamicD2 = maxLen;
      B = p5.Vector.add(X, p5.Vector.mult(v, dynamicD2));
      D = p5.Vector.sub(X, p5.Vector.mult(v, dynamicD2));
    }
  };
  clampBD();

  // Угол при A
  const vAB = p5.Vector.sub(B, A).normalize();
  const vAD = p5.Vector.sub(D, A).normalize();
  let dot = vAB.dot(vAD);
  dot = constrain(dot, -1, 1);
  const angleA = acos(dot);

  // Скорость движения центра O
  const minAccel = 0.02;
  const maxAccel = 0.18;
  const accelFactor = map(angleA, 0, PI, maxAccel, minAccel);

  const spring = p5.Vector.sub(T, O).mult(accelFactor);
  velocity.add(spring);
  velocity.mult(0.86);
  O.add(velocity);

  // Пересборка после движения
  let newDir = p5.Vector.sub(C, O);
  const newDistOC = newDir.mag();
  if (newDistOC < 1e-6) newDir.set(1, 0); else newDir.div(newDistOC);

  A = p5.Vector.add(O, p5.Vector.mult(newDir, r));
  if (newDistOC <= r) A = C.copy();

  const newM = p5.Vector.add(O, p5.Vector.mult(p5.Vector.sub(A, O), 0.5));
  const newX = p5.Vector.add(O, p5.Vector.mult(p5.Vector.sub(newM, O), dynamicOffset));
  const ortho = createVector(-(A.y - O.y), (A.x - O.x)).normalize();
  B = p5.Vector.add(newX, p5.Vector.mult(ortho, dynamicD2));
  D = p5.Vector.sub(newX, p5.Vector.mult(ortho, dynamicD2));
  clampBD();

  // Рисование изоромба
  fill(40, 140, 255, 90);
  stroke(230);
  strokeWeight(2);
  beginShape();
  vertex(A.x, A.y);
  vertex(B.x, B.y);
  vertex(O.x, O.y);
  vertex(D.x, D.y);
  endShape(CLOSE);

  // Диагонали
  stroke(255, 255, 255, 150);
  line(A.x, A.y, O.x, O.y); // AO
  line(B.x, B.y, D.x, D.y); // BD

  // Точки
  noStroke();
  fill(255);
  circle(O.x, O.y, 8); // O — хвост
  circle(A.x, A.y, 8); // A — остриё
  fill(255, 120, 120);
  circle(newX.x, newX.y, 6); // X — живой фокус
  fill(255, 200, 0);
  circle(C.x, C.y, 6); // курсор
}

function mousePressed() {
  d2 = random(18, r * 0.55);
  offset = random(0.12, 0.6);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}