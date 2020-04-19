const width = 400;
const height = 600;

/**
 * Input value: number of horizontal lines.
 */
const nLines = 120;

/**
 * Input value: number of control points in each line.
 */
const nPoints = 100;


// Curves that have been added by the user.
let inputCurves = [];

/**
 * p5 will run this function first.
 */
function setup() {
  createCanvas(width, height, SVG);
  
  strokeWeight(1);
  stroke(0, 0, 0);
  noFill();
  noLoop();

  document.addEventListener('equationUpdate', (e) => {
    inputCurves = [];
    for (const equation of e.detail.equations) {
      inputCurves.push(makeInputLine(equation));
    }
    redraw();
  });
  
  document.addEventListener('save', () => {
    save('test.svg')
  });
}

/**
 * Make a line from the given equation, centered in the canvas size.
 */
function makeInputLine(equationString) {
  const line = [];
  for (let x = -1; x < 1; x += 2 / nPoints) {
    // Offset x, y by width/2, height/2 to center the equation
    // on the canvas size.
    line.push([
      (x * width/2) + width/2,
      -1 * (eval(equationString) * width/2) + height/2,
    ]);
  }
  return line;
}

/**
 * Make a line between pointA and pointB with n total points.
 */
function makeLine(pointA, pointB, n) {
  const line = [];
  for (let t = 0; t < 1; t += 1 / n) {
    line.push(lerpPoints(pointA, pointB, t));
  }
  return line;
}

/**
 * Lerp between `pointA` and `pointB` at parameter `t`.
 * Each is an [x, y] point.
 */
function lerpPoints(pointA, pointB, t) {
  return [
    lerp(pointA[0], pointB[0], t),
    lerp(pointA[1], pointB[1], t)
  ];
}

/**
 * Lerp between `curveA` and `curveB` at parameter `t`.
 * Each is a list of [x, y] points.
 */
function lerpCurves(curveA, curveB, t) {
  return curveA.map((pointA, i) => {
    const pointB = curveB[i];
    return lerpPoints(pointA, pointB, t);
  });
}

/**
 * Draw a curve to the canvas defined by the set of [x, y]
 * points in `points`.
 */
function drawCurve(points) {
  beginShape();
  curveVertex(...points[0]);
  for (const point of points) {
    curveVertex(...point);
  }
  curveVertex(...points[points.length - 1]);
  endShape();
}

/**
 * p5 will run this function after setup. Draw stuff here.
 */
function draw() {  
  // Clears the canvas.
  background(255, 255, 255);

  const topLine = makeLine([0, 0], [width, 0], nPoints);
  const bottomLine = makeLine([0, height], [width, height], nPoints);

  const curvesToDraw = [topLine, ...inputCurves, bottomLine];
  const linesBetweenCurves = nLines / (curvesToDraw.length - 1);
  // Inerpolate between the curves.
  for (let i = 0; i < curvesToDraw.length - 1; i++) {
    const fromCurve = curvesToDraw[i];
    const toCurve = curvesToDraw[i+1];
    for (let t = 0; t < 1; t += 1 / linesBetweenCurves) {
      drawCurve(lerpCurves(fromCurve, toCurve, t));
    }
  }
}
