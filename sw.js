// Service worker: a small helper script the browser runs in the background.
// It does two things:
//   1. Keeps a copy of the app's own files so Model Lab opens instantly and
//      even with no internet (the pages show sample data / "Not connected").
//   2. Is required by phones before they offer "Add to Home Screen".
//
// It deliberately NEVER touches requests to other websites, so your metrics
// file and backend answers (and your token) are never stored by it.

const CACHE = 'model-lab-v1';   // change this number whenever you edit the app, so phones fetch the new files

const APP_FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'css/theme.css', 'css/layout.css',
  'js/theme-init.js', 'js/app.js', 'js/dom.js', 'js/settings.js', 'js/api.js',
  'js/chart.js', 'js/sampleData.js', 'js/help.js',
  'js/pages/training.js', 'js/pages/playground.js', 'js/pages/learn.js', 'js/pages/settingsPage.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
];

// Install: save the app files.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

// Activate: delete copies from older versions.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: for our own files, try the network first (so edits show up),
// and fall back to the saved copy when offline.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;   // leave other sites alone

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(saved => saved || caches.match('index.html')))
  );
});
