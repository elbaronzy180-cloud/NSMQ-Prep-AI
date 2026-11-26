// The "front door" of the app. It does four jobs:
//   1. Shows the right page for the address after the # (e.g. #/learn)
//   2. Wires up the "What am I looking at?" and light/dark buttons
//   3. Registers the service worker (this is what lets you install the app)

import { showHelp } from './help.js';
import training from './pages/training.js';
import playground from './pages/playground.js';
import learn from './pages/learn.js';
import settingsPage from './pages/settingsPage.js';

// Each page is an object: { title, help, render(container) }.
// render() may return a "cleanup" function, called when you leave the page.
const pages = { training, playground, learn, settings: settingsPage };

const main = document.getElementById('page');
let cleanup = null;        // cleanup function of the page currently shown
let currentHelp = null;    // help text of the page currently shown

function showPage() {
  // "#/learn" -> "learn". Unknown or empty addresses fall back to Training.
  const name = location.hash.replace('#/', '');
  const page = pages[name] || pages.training;
  const routeName = pages[name] ? name : 'training';

  if (cleanup) cleanup();            // stop timers etc. from the previous page
  main.replaceChildren();            // clear the old page
  cleanup = page.render(main) || null;
  currentHelp = page.help;
  document.title = `${page.title} · Model Lab`;

  // Highlight the matching menu link.
  document.querySelectorAll('.nav a').forEach(link => {
    if (link.dataset.route === routeName) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });   // helps screen-reader users notice the change
}

window.addEventListener('hashchange', showPage);
showPage();

// ---- "What am I looking at?" ----
document.getElementById('help-btn').addEventListener('click', () => {
  if (currentHelp) showHelp(currentHelp);
});

// ---- Light / dark button: cycles auto -> light -> dark -> auto ----
document.getElementById('theme-btn').addEventListener('click', () => {
  const root = document.documentElement;
  const now = root.getAttribute('data-theme');   // 'light', 'dark' or null (auto)
  const next = now === null ? 'light' : now === 'light' ? 'dark' : null;
  if (next) root.setAttribute('data-theme', next);
  else root.removeAttribute('data-theme');
  try {
    if (next) localStorage.setItem('modellab.theme', next);
    else localStorage.removeItem('modellab.theme');
  } catch (e) { /* storage blocked: the choice just won't be remembered */ }

  const names = { light: 'Light mode', dark: 'Dark mode' };
  document.getElementById('theme-btn').title = names[next] || 'Automatic (follows your phone)';
});

// ---- Installable app support ----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Not fatal: the app still works in the browser, it just can't go offline.
  });
}
