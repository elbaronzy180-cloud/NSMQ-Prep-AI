// The "What am I looking at?" popup.
// Every page gives the router a `help` object: { title, body: ['paragraph', ...] }
// and this file shows it in the <dialog> element that lives in index.html.

import { h } from './dom.js';

export function showHelp(help) {
  const dialog = document.getElementById('help-dialog');
  document.getElementById('help-title').textContent = help.title;

  const body = document.getElementById('help-body');
  body.replaceChildren(...help.body.map(text => h('p', {}, text)));

  dialog.showModal();   // built-in browser popup: handles Esc key and focus for us
}
