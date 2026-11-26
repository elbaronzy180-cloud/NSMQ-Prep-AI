// Playground page: type the start of some text, and the model continues it.
//
// The request goes to the backend address from Settings and carries your
// secret token. If no backend is set, or it can't be reached, a clear message
// is shown. You can also press "Show a sample reply" to preview the layout.

import { h } from '../dom.js';
import { getSettings } from '../settings.js';
import { askModel } from '../api.js';
import { makeSampleReply } from '../sampleData.js';

const help = {
  title: 'The Playground',
  body: [
    'Type the beginning of a sentence or story in the box, then press "Continue". The model reads what you wrote and guesses what words come next, one small piece at a time.',
    '"Length" is how much new text to write. "Creativity" controls how adventurous the guesses are: low means safe and predictable, high means surprising but sometimes silly.',
    'Your text is sent to the backend address you set in Settings, along with your secret token. If that is not set up yet, you will see a "Not connected" message. A small model will not write perfectly, and that is normal and useful to see.',
  ],
};

function render(root) {
  const settings = getSettings();
  const connectedSettings = Boolean(settings.backendUrl);

  const promptBox = h('textarea', { id: 'prompt', placeholder: 'Once upon a time, a small fox…', maxlength: '2000' });
  const lengthInput = h('input', { type: 'range', id: 'length', min: '10', max: '200', value: '60' });
  const tempInput = h('input', { type: 'range', id: 'temp', min: '0.1', max: '1.5', step: '0.1', value: '0.8' });
  const lengthLabel = h('span', {}, '60');
  const tempLabel = h('span', {}, '0.8');
  const status = h('div');          // not-connected / error messages
  const result = h('div');          // the model's reply
  const goBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Continue');
  const sampleBtn = h('button', { class: 'btn', type: 'button' }, 'Show a sample reply');

  lengthInput.addEventListener('input', () => { lengthLabel.textContent = lengthInput.value; });
  tempInput.addEventListener('input', () => { tempLabel.textContent = tempInput.value; });

  /** Show the prompt (faded) followed by the new text (bold). */
  function showReply(prompt, newText, isSample) {
    result.replaceChildren(h('section', { class: 'card' },
      h('div', { class: 'row' },
        h('h2', {}, 'Model reply'),
        isSample ? h('span', { class: 'badge badge-sample' }, 'Sample reply') : null),
      h('p', { class: 'reply' },
        h('span', { class: 'prompt-part' }, prompt),
        h('span', { class: 'new-part' }, newText)),
      isSample ? h('p', { class: 'hint' }, 'This was not written by your model. It is only here to show the layout.') : null));
  }

  function showNotConnected(reason) {
    status.replaceChildren(h('div', { class: 'notice notice-error', role: 'alert' },
      h('p', {}, h('b', {}, 'Not connected. '), reason),
      h('p', {}, h('a', { href: '#/settings' }, 'Open Settings'), ' to set the backend address and token.')));
  }

  async function onContinue() {
    const prompt = promptBox.value;
    result.replaceChildren();
    status.replaceChildren();

    if (!prompt.trim()) {
      status.append(h('div', { class: 'notice notice-warn' }, h('p', {}, 'Type a few words first, then press Continue.')));
      return;
    }
    if (!connectedSettings) {
      showNotConnected('No backend address is set yet.');
      return;
    }

    goBtn.disabled = true;
    goBtn.textContent = 'Thinking…';
    try {
      const text = await askModel({
        backendUrl: settings.backendUrl,
        token: settings.token,
        prompt,
        maxNewTokens: Number(lengthInput.value),
        temperature: Number(tempInput.value),
      });
      showReply(prompt, text, false);
    } catch (err) {
      showNotConnected(err.message);
    } finally {
      goBtn.disabled = false;
      goBtn.textContent = 'Continue';
    }
  }

  goBtn.addEventListener('click', onContinue);
  sampleBtn.addEventListener('click', () => {
    const prompt = promptBox.value.trim() || 'Once upon a time, a small fox lived near the river and';
    status.replaceChildren();
    showReply(prompt, makeSampleReply(prompt), true);
  });

  root.append(
    h('h1', {}, 'Playground'),
    h('p', { class: 'page-intro' }, 'Type the start of some text and let your model continue it.'),
    connectedSettings ? null : h('div', { class: 'notice notice-warn' },
      h('p', {}, h('b', {}, 'Not connected. '), 'No backend address is set yet, so the model cannot answer.'),
      h('p', {}, h('a', { href: '#/settings' }, 'Open Settings'), ' to add it.')),
    status,
    h('section', { class: 'card' },
      h('div', { class: 'field' }, h('label', { for: 'prompt' }, 'Start of your text'), promptBox),
      h('div', { class: 'field' },
        h('label', { for: 'length' }, 'Length: ', lengthLabel, ' tokens'), lengthInput,
        h('p', { class: 'hint' }, 'How much new text to write.')),
      h('div', { class: 'field' },
        h('label', { for: 'temp' }, 'Creativity: ', tempLabel), tempInput,
        h('p', { class: 'hint' }, 'Low = safe and predictable. High = surprising.')),
      h('div', { class: 'row', style: 'justify-content:flex-start' }, goBtn, sampleBtn),
    ),
    result,
  );
}

export default { title: 'Playground', help, render };
