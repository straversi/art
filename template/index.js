/**
 * Input values that define the size of the canvas.
 */
const width = 400;
const height = 600;

/**
 * Input values that bump y values of the three points
 * that define the central control curve.
 */
const a = 100;
const b = -130;
const c = 100;

/**
 * p5 will run this function first.
 */
function setup() {
  createCanvas(width, height, SVG);
  
  strokeWeight(1);
  stroke(0, 0, 0);
  noFill();

  for (let t = 0; t < 1; t += 1 / controlSize) {
    controlCurveTop.push([lerp(0, width, t), 0]);
  }
  for (let t = 0; t < 1; t += 1 / controlSize) {
    controlCurveSine.push([lerp(0, width, t), height / 2]);
  }
  // Bump y values to make a sine wave of sorts.
  controlCurveSine[1][1] += sineHeight / 2;
  controlCurveSine[2][1] -= sineHeight / 2;
  controlCurveSine[3][1] += sineHeight / 2;
  controlCurveSine[4][1] -= sineHeight / 2;
  for (let t = 0; t < 1; t += 1 / controlSize) {
    controlCurveBottom.push([lerp(0, width, t), height]);
  }
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
 * Three control curves. Curves are interpolated between these.
 */
const controlSize = 6;
const sineHeight = 40;
const controlCurveTop = [];
const controlCurveSine = [];
const controlCurveBottom = [];

/**
 * p5 will run this function after setup. Draw stuff here.
 */
function draw() {
  for (let t = 0; t < 1; t += 0.02) {
    drawCurve(lerpCurves(controlCurveTop, controlCurveSine, t));
  }
  for (let t = 0; t < 1; t += 0.02) {
    drawCurve(lerpCurves(controlCurveSine, controlCurveBottom, t));
  }
  // Don't keep calling draw.
  noLoop();
}