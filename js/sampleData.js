// Realistic SAMPLE data, used until your real backend exists.
// Everything made here is invented, and the pages label it "Sample".
//
// The numbers follow the shape real training usually has:
//  - loss drops fast at first, then slowly flattens out
//  - validation loss starts to creep up later (a hint of overfitting)

const MAX_STEPS = 5000;
const EVERY = 100;   // one data point every 100 steps

// A repeatable "random" wobble, so the same step always gives the same number.
function wobble(step, seed) {
  const s = Math.sin(step * 12.9898 + seed * 78.233) * 43758.5453;
  return (s - Math.floor(s)) - 0.5;   // between -0.5 and 0.5
}

function trainLossAt(step) {
  return 1.6 + 3.2 * Math.exp(-step / 900) + wobble(step, 1) * 0.12;
}

function valLossAt(step) {
  // Follows the training loss, then drifts upward after about step 3000.
  const drift = step > 3000 ? ((step - 3000) / 2000) * 0.35 : 0;
  return 1.75 + 3.2 * Math.exp(-step / 950) + drift + wobble(step, 2) * 0.06;
}

// What the model "writes" gets better as training goes on.
const SAMPLES = [
  { from: 0,    text: 'thq e,, ofo  wh\nxz the aaand ti' },
  { from: 500,  text: 'the king was and the sea of the town that he were not' },
  { from: 1500, text: 'The old king walked to the sea and said that the town was quiet.' },
  { from: 3000, text: 'Once upon a time, a small fox lived near the river. Every morning it' +
                      ' watched the boats drift past and wondered where they went.' },
];

/**
 * Build a metrics object as if training had reached `step`.
 * It has the same shape as the real metrics.json would have.
 */
export function makeSampleMetrics(step) {
  const train_loss = [], val_loss = [];
  for (let s = EVERY; s <= step; s += EVERY) {
    train_loss.push({ step: s, loss: +trainLossAt(s).toFixed(3) });
    if (s % 200 === 0) val_loss.push({ step: s, loss: +valLossAt(s).toFixed(3) });
  }
  const sample = [...SAMPLES].reverse().find(item => step >= item.from) || SAMPLES[0];
  return { step, max_steps: MAX_STEPS, train_loss, val_loss, sample: sample.text };
}

/** Sample training "moves along" a little each time you refresh, then starts over. */
export function sampleStepForTick(tick) {
  const START = 1500;   // begin part-way so the graph already has a shape
  return START + ((tick * 100) % (MAX_STEPS - START + EVERY));
}

// A few canned Playground replies, so you can see what a reply looks like.
const SAMPLE_REPLIES = [
  ' the river was calm, and the fox decided to follow the boats all the way to the sea.',
  ' a small village where everyone knew the sound of the morning bell.',
  ' the answer was simple, though nobody in the room had thought of it before.',
];

export function makeSampleReply(prompt) {
  const index = prompt.length % SAMPLE_REPLIES.length;
  return SAMPLE_REPLIES[index];
}
