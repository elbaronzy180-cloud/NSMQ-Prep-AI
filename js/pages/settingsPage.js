// Settings page: where you tell the app your two web addresses and your token.
// Saved only in this browser (see settings.js). Nothing is sent anywhere
// until you use the Training or Playground page.

import { h } from '../dom.js';
import { getSettings, saveSettings, isWebAddress } from '../settings.js';

const help = {
  title: 'The Settings page',
  body: [
    'This is where you connect Model Lab to your own training run. There are three boxes.',
    '"Metrics address" is the web address of your metrics.json file. The Training page reads it every few seconds. "Backend address" is where the Playground sends your text. "Secret token" is a password the backend checks, so only you can use it.',
    'These are saved only in this browser on this device. They are not stored in the app\'s code. If you leave a box empty, the app uses clearly labelled sample data instead.',
  ],
};

function render(root) {
  const current = getSettings();
  const feedback = h('div');

  const metricsInput = h('input', { type: 'url', id: 'metricsUrl', value: current.metricsUrl, placeholder: 'https://example.com/metrics.json', autocomplete: 'off', inputmode: 'url' });
  const backendInput = h('input', { type: 'url', id: 'backendUrl', value: current.backendUrl, placeholder: 'https://example.com/generate', autocomplete: 'off', inputmode: 'url' });
  const tokenInput = h('input', { type: 'password', id: 'token', value: current.token, autocomplete: 'off', placeholder: 'Paste your secret token' });

  function onSave() {
    const values = { metricsUrl: metricsInput.value.trim(), backendUrl: backendInput.value.trim(), token: tokenInput.value.trim() };

    // Check the addresses look like real web addresses before saving.
    for (const [key, label] of [['metricsUrl', 'Metrics address'], ['backendUrl', 'Backend address']]) {
      if (values[key] && !isWebAddress(values[key])) {
        feedback.replaceChildren(h('div', { class: 'notice notice-error', role: 'alert' },
          h('p', {}, `${label} must start with https:// (or http://).`)));
        return;
      }
    }
    // Browsers block a secure page (https) from calling an insecure (http) address.
    const insecure = [values.metricsUrl, values.backendUrl].some(u => u.startsWith('http://'));
    const onHttps = location.protocol === 'https:';

    const ok = saveSettings(values);
    feedback.replaceChildren(ok
      ? h('div', { class: 'notice notice-ok', role: 'status' },
          h('p', {}, 'Saved on this device.'),
          insecure && onHttps ? h('p', {}, 'Heads up: this app is on https, so the browser will block http:// addresses. Use https:// ones.') : null)
      : h('div', { class: 'notice notice-error', role: 'alert' },
          h('p', {}, 'Your browser would not let me save. Private browsing can cause this.')));
  }

  function onClear() {
    saveSettings({});
    metricsInput.value = backendInput.value = tokenInput.value = '';
    feedback.replaceChildren(h('div', { class: 'notice notice-ok', role: 'status' }, h('p', {}, 'Cleared. The app will use sample data.')));
  }

  root.append(
    h('h1', {}, 'Settings'),
    h('p', { class: 'page-intro' }, 'Connect Model Lab to your training run. Leave boxes empty to use sample data.'),
    feedback,
    h('section', { class: 'card' },
      h('div', { class: 'field' },
        h('label', { for: 'metricsUrl' }, 'Metrics address'), metricsInput,
        h('p', { class: 'hint' }, 'Web address of your metrics.json file. The Training page reads it.')),
      h('div', { class: 'field' },
        h('label', { for: 'backendUrl' }, 'Backend address'), backendInput,
        h('p', { class: 'hint' }, 'Where the Playground sends your text.')),
      h('div', { class: 'field' },
        h('label', { for: 'token' }, 'Secret token'), tokenInput,
        h('p', { class: 'hint' }, 'Sent with every Playground request. Stored only in this browser. Never share it or paste it into code.')),
      h('div', { class: 'row', style: 'justify-content:flex-start' },
        h('button', { class: 'btn btn-primary', type: 'button', onclick: onSave }, 'Save'),
        h('button', { class: 'btn', type: 'button', onclick: onClear }, 'Clear all')),
    ),
  );
}

export default { title: 'Settings', help, render };
