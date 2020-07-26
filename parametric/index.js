const width = 400;
const height = 600;

// The parametric curves.
// Default values match those in the GUI.
let Parametrics = [{
  x: 'cos(t)',
  y: 'sin(t)',
  tMin: '0',
  tMax: '2*PI',
  nPoints: '100',
  color: '#000000',
}];
let Name = 'name';

/**
 * p5 will run this function first.
 */
function setup() {
  createCanvas(width, height, SVG);
  
  strokeWeight(1);
  stroke(0, 0, 0);
  noFill();
  noLoop();

  document.addEventListener('update', (e) => {
    Parametrics = e.detail.parametrics;
    Name = e.detail.name;
    redraw();
  });
  
  document.addEventListener('save-svg', () => {
    save(`${Name}.svg`);
  });
}

/**
 * The point at which the following lines intersect:
 * 1. line from a to b
 * 2. y = y
 */
function getPointAtY(a, b, y) {
  const m = (b[1] - a[1]) / (b[0] - a[0]);
  const intersectX = ((y - a[1]) / m) + a[0];
  return [intersectX, y];
}

/**
 * Draw a curve to the canvas defined by the set of [x, y]
 * points in `points`.
 */
function drawCurve(points) {
  for (let i = 0; i < points.length; i++) {
    // When drawing a line between point A and point B,
    // if (point A in boundary XOR point B in boundary),
    // we need to clip that line at the boundary. This
    // prevent CNC drawers that ignore SVG viewbox from
    // drawing lines outside of the canvas boundaries.

    const topY = 0;
    const bottomY = height;
    const pointAUnderTop = points[i][1] >= topY;
    const pointAAboveBottom = points[i][1] <= bottomY;
    if (i === 0 && pointAUnderTop && pointAAboveBottom) {
      beginShape();
      curveVertex(...points[0]);
    }
    if ((i === points.length - 1)) {
      if (pointAUnderTop && pointAAboveBottom) {
        curveVertex(...points[i]);
        curveVertex(...points[i]);
        endShape();
      }
      continue; // Ends the loop since this is the last index.
    }

    const pointBUnderTop = points[i+1][1] >= topY;
    const pointBAboveBottom = points[i+1][1] <= bottomY;
    const pointAtTopLine = getPointAtY(points[i], points[i+1], topY);
    const pointAtBottomLine = getPointAtY(points[i], points[i+1], bottomY);
    // Always draw the current point if in bounds.
    // If current point is IN bounds and next point is OUT of bounds,
    // draw current point, interpolated point at boundary, then end the shape.
    // If current point is OUT of bounds and next point is IN bounds,
    // begin the shape, and draw interpolated point at boundary.
    if (pointAUnderTop && !pointBUnderTop) { // /
      curveVertex(...points[i]);
      curveVertex(...pointAtTopLine);
      curveVertex(...pointAtTopLine);
      endShape();
    } else if (!pointAUnderTop && pointBUnderTop) { // \
      beginShape();
      curveVertex(...pointAtTopLine);
      curveVertex(...pointAtTopLine);
    } else if (!pointAAboveBottom && pointBAboveBottom) { // /
      beginShape();
      curveVertex(...pointAtBottomLine);
      curveVertex(...pointAtBottomLine);
    } else if (pointAAboveBottom && !pointBAboveBottom) { // \
      curveVertex(...points[i]);
      curveVertex(...pointAtBottomLine);
      curveVertex(...pointAtBottomLine);
      endShape();
    } else if (pointAAboveBottom && pointAUnderTop && pointBAboveBottom && pointBUnderTop) {
      // Both points are in the boundary. Draw point safely.
      curveVertex(...points[i]);
    }
  }
}

/**
 * p5 will run this function after setup. Draw stuff here.
 */
function draw() {  
  // Reach into private clearCanvas. `background(255, 255, 255)`
  // does not work as expected with p5.svg.js extension; if used,
  // the extension will not clear out existing objects before
  // adding a new solid rect. This leads to massive file sizes.
  drawingContext.__clearCanvas();

  for (const Parametric of Parametrics) {
    const line = [];
    const tMin = eval(Parametric.tMin);
    const tMax = eval(Parametric.tMax);
    const nPoints = eval(Parametric.nPoints);
    for (let t = tMin; t < tMax; t += tMax / nPoints) {
      // Offset x, y by width/2, height/2 to center the equation
      // on the canvas size.
      // TODO: catch errors on eval and print to the UI. Requires
      // knowing when to delete the visible error state, e.g.
      // i.e. which methods cause errors.
      const x = eval(Parametric.x);
      const y = eval(Parametric.y);
      line.push([
        (x * width/2) + width/2,
        -1 * (y * width/2) + height/2,
      ]);
    }
    stroke(Parametric.color);
    drawCurve(line);
  }
}
