// Draws the loss graph as an SVG image, with no chart library.
//
// SVG works in its own "viewBox" coordinate system (600 wide x 300 tall here)
// and scales to fit the screen, so the same code looks right on phone and desktop.
// Colours come from CSS classes, so light/dark mode works automatically.

const NS = 'http://www.w3.org/2000/svg';
const W = 600, H = 300;
const PAD = { left: 44, right: 12, top: 12, bottom: 28 };   // room for axis numbers

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/** Pick a "nice" round maximum for the y axis, e.g. 4.37 -> 5 */
function niceCeil(value) {
  const step = value > 5 ? 2 : 1;
  return Math.ceil(value / step) * step;
}

/**
 * @param {Array<{step:number, loss:number}>} train  training loss points
 * @param {Array<{step:number, loss:number}>} val    validation loss points (may be empty)
 * @returns {SVGElement}
 */
export function drawLossChart(train, val) {
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img' });

  const all = [...train, ...val];
  if (all.length === 0) {
    const t = svgEl('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', class: 'axis-text' });
    t.textContent = 'No data yet';
    svg.append(t);
    return svg;
  }

  // Work out the range of the data so we can map it onto the picture.
  const maxStep = Math.max(...all.map(p => p.step), 1);
  const maxLoss = niceCeil(Math.max(...all.map(p => p.loss)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = step => PAD.left + (step / maxStep) * plotW;
  const y = loss => PAD.top + plotH - (loss / maxLoss) * plotH;   // up = bigger loss

  // Horizontal grid lines with loss numbers on the left.
  const yTicks = Math.min(maxLoss, 6);       // one line per whole number, at most 6
  for (let i = 0; i <= yTicks; i++) {
    const loss = (maxLoss / yTicks) * i;
    svg.append(svgEl('line', { x1: PAD.left, x2: W - PAD.right, y1: y(loss), y2: y(loss), class: 'grid' }));
    const label = svgEl('text', { x: PAD.left - 6, y: y(loss) + 4, 'text-anchor': 'end', class: 'axis-text' });
    label.textContent = loss.toFixed(1);
    svg.append(label);
  }

  // A few step numbers along the bottom.
  for (let i = 0; i <= 4; i++) {
    const step = Math.round((maxStep / 4) * i);
    const label = svgEl('text', { x: x(step), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle', class: 'axis-text' });
    label.textContent = step.toLocaleString();
    svg.append(label);
  }

  // The two lines. "points" is a list like "10,20 30,40 ..."
  const toPoints = list => list.map(p => `${x(p.step).toFixed(1)},${y(p.loss).toFixed(1)}`).join(' ');
  if (val.length)   svg.append(svgEl('polyline', { points: toPoints(val),   class: 'line-val' }));
  if (train.length) svg.append(svgEl('polyline', { points: toPoints(train), class: 'line-train' }));

  // A plain-words description for screen readers.
  const last = train[train.length - 1];
  svg.setAttribute('aria-label',
    `Loss graph. Training loss is ${last ? last.loss.toFixed(2) : 'unknown'} at step ${last ? last.step : 0}.`);
  return svg;
}
