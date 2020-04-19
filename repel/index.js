/**
 * Input values that define the size of the canvas.
 */
const width = 400;
const height = 600;

/**
 * Input value: number of horizontal lines.
 */
const nLines = 80;

/**
 * Input value: number of control points in each line.
 */
const nPoints = 500;



// The horizontal lines.
const originalLines = [];

/**
 * p5 will run this function first.
 */
function setup() {
  createCanvas(width, height, SVG);
  
  strokeWeight(1);
  stroke(0, 0, 0);
  noFill();
  noLoop();

  // Make a set of horizontal lines.
  for (let y = 0; y < height; y += height / nLines) {
    originalLines.push(makeLine([0, y], [width, y], nPoints));
  }
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
 * Repel points in the given set of lines that are close to the mouse.
 */
function messWithLines(lines) {
  const newLines = [];

  // Maximum distance from the mouse that we'll check a control point.
  const checkThresh = 50;
  for (const line of lines) {
    const newLine = [];
    for (const point of line) {
      const d = dist(...point, mouseX, mouseY);
      if (d < checkThresh + 50) {
        const vec = createVector(point[0] - mouseX, point[1] - mouseY);
        vec.setMag(((checkThresh - d) / checkThresh) * 10);
        newLine.push([point[0] + vec.x, point[1] + vec.y]);
      } else {
        newLine.push([point[0], point[1]]);
      }
    }
    newLines.push(newLine);
  }
  return newLines;
}

/**
 * p5 will run this function after setup. Draw stuff here.
 */
function draw() {  
  // Clears the canvas.
  background(255, 255, 255);

  // Draw the horizontal lines.
  for (const line of messWithLines(originalLines)) {
    drawCurve(line);
  }
}

function mouseMoved() {
  redraw();
}