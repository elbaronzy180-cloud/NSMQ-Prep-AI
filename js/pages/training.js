// Training page: shows how a training run is going, refreshed every few seconds.
//
// Where the numbers come from:
//   - If you set a "metrics address" in Settings: that file, fetched live.
//   - If not: invented SAMPLE data, clearly labelled as sample.

import { h, formatNumber } from '../dom.js';
import { getSettings } from '../settings.js';
import { fetchMetrics } from '../api.js';
import { drawLossChart } from '../chart.js';
import { makeSampleMetrics, sampleStepForTick } from '../sampleData.js';

const REFRESH_MS = 5000;   // how often to look for new numbers

const help = {
  title: 'The Training page',
  body: [
    'This page shows a model learning, live. Training means the computer reads lots of text and keeps adjusting itself to get better at guessing the next word.',
    'The graph shows "loss", a score for how wrong the model is. Lower is better. The solid line is the training loss (how it does on text it is studying). The dashed line is the validation loss (how it does on text it has never studied).',
    '"Step" counts how many small learning rounds are done. The box at the bottom shows the latest thing the model wrote, so you can see its writing improve as the loss goes down.',
    'If you see the yellow "Sample" label, the numbers are made up for practice. Add your metrics address in Settings to see the real thing.',
  ],
};

function render(root) {
  const settings = getSettings();
  const usingSample = !settings.metricsUrl;
  let tick = 0;   // counts refreshes; only used to move the sample data along

  // --- Build the page skeleton once; refresh() fills in the numbers. ---
  const badge = h('span', { class: 'badge' });
  const updated = h('span', { class: 'hint' });
  const message = h('div');                                  // errors appear here
  const stepValue = h('div', { class: 'value' }, '–');
  const trainValue = h('div', { class: 'value' }, '–');
  const valValue = h('div', { class: 'value' }, '–');
  const progressBar = h('div', { style: 'width:0%' });
  const chartBox = h('div');
  const sampleBox = h('div', { class: 'sample-text' }, 'Waiting for the first sample…');

  const stat = (label, valueEl) => h('div', { class: 'stat' }, h('div', { class: 'label' }, label), valueEl);

  root.append(
    h('h1', {}, 'Training'),
    h('p', { class: 'page-intro' }, 'Watch a small language model learn. Updates every few seconds.'),
    message,
    h('section', { class: 'card' },
      h('div', { class: 'row' }, badge, updated),
      h('div', { class: 'stats' },
        stat('Current step', stepValue),
        stat('Training loss', trainValue),
        stat('Validation loss', valValue),
      ),
      h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Training progress' }, progressBar),
    ),
    h('section', { class: 'card' },
      h('h2', {}, 'Loss over time'),
      chartBox,
      h('div', { class: 'legend' },
        h('span', {}, h('i', { class: 'l-train' }), 'Training'),
        h('span', {}, h('i', { class: 'l-val' }), 'Validation'),
      ),
      h('p', { class: 'hint' }, 'Lower is better.'),
    ),
    h('section', { class: 'card' },
      h('h2', {}, 'Latest sample from the model'),
      sampleBox,
    ),
  );

  /** Put one metrics object onto the screen. */
  function show(metrics, isSample) {
    const train = metrics.train_loss || [];
    const val = metrics.val_loss || [];
    const lastTrain = train[train.length - 1];
    const lastVal = val[val.length - 1];
    const step = metrics.step ?? (lastTrain ? lastTrain.step : 0);

    badge.className = 'badge ' + (isSample ? 'badge-sample' : 'badge-live');
    badge.textContent = isSample ? 'Sample data' : 'Live';
    updated.textContent = 'Updated ' + new Date().toLocaleTimeString();

    stepValue.textContent = metrics.max_steps
      ? `${formatNumber(step)} / ${formatNumber(metrics.max_steps)}`
      : formatNumber(step);
    trainValue.textContent = lastTrain ? lastTrain.loss.toFixed(2) : '–';
    valValue.textContent = lastVal ? lastVal.loss.toFixed(2) : '–';
    progressBar.style.width = metrics.max_steps ? `${Math.min(100, (step / metrics.max_steps) * 100)}%` : '0%';

    chartBox.replaceChildren(drawLossChart(train, val));
    sampleBox.textContent = metrics.sample || '(no sample yet)';
    message.replaceChildren();
  }

  /** One refresh: get numbers (real or sample) and show them. */
  async function refresh() {
    try {
      if (usingSample) {
        show(makeSampleMetrics(sampleStepForTick(tick++)), true);
      } else {
        show(await fetchMetrics(settings.metricsUrl), false);
      }
    } catch (err) {
      // Keep whatever is already on screen, and say what went wrong.
      badge.className = 'badge badge-error';
      badge.textContent = 'Not connected';
      message.replaceChildren(h('div', { class: 'notice notice-error' },
        h('p', {}, err.message),
        h('p', {}, h('a', { href: '#/settings' }, 'Check Settings'), '. I will keep trying every few seconds.')));
    }
  }

  if (usingSample) {
    message.append(h('div', { class: 'notice notice-warn' },
      h('p', {}, h('b', {}, 'This is sample data. '), 'The numbers are made up so you can see how the page works.'),
      h('p', {}, 'Add your metrics address in ', h('a', { href: '#/settings' }, 'Settings'), ' to see a real training run.')));
  }

  refresh();
  const timer = setInterval(refresh, REFRESH_MS);
  return () => clearInterval(timer);   // cleanup: stop refreshing when you leave
}

export default { title: 'Training', help, render };
