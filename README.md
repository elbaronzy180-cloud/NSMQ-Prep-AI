# Model Lab

A personal learning tool for understanding how a small language model trains.
Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

| Page | What it does |
|------|--------------|
| **Training** | Reads `metrics.json` from the address you set, draws a live loss graph (training and validation), shows the current step and the model's latest sample. Refreshes every 5 seconds. |
| **Playground** | You type the start of some text; your backend continues it. |
| **Learn** | Plain-language explanations of tokens, loss, epochs and overfitting. |
| **Settings** | Where you enter the metrics address, backend address and secret token. |

Every page has a **What am I looking at?** button. Until you set real addresses, the app shows invented data, always labelled **Sample**.

## Run it on your computer

Browsers will not run the app's modules or its "install" feature straight from a double-clicked file, so serve the folder:

```bash
cd NSMQ-Prep-AI          # or whatever the project folder is called
python3 -m http.server 8000
```

Open <http://localhost:8000>. Stop it with Ctrl+C.

## Host it for free

The app is only static files, so any free static host works. Phones need **https** to install it; all of these give you https automatically.

- **GitHub Pages**: repo → Settings → Pages → deploy from the `main` branch, root folder. Free for public repos. The code contains no secrets (the token lives only in your browser), so a public repo is fine.
- **Cloudflare Pages** or **Netlify**: connect the repo, leave the build command empty, set the publish directory to `/` (the project root).

## Install it on your phone

Open your hosted address in the phone's browser.
- **Android (Chrome):** menu ⋮ → *Install app* / *Add to Home screen*.
- **iPhone (Safari):** Share button → *Add to Home Screen*.

## Connecting your real model

Set these in the **Settings** page. They are saved only in your browser.

### Metrics address → `metrics.json`

Your training script writes this file; any web address that serves it works. Shape (see `examples/metrics.example.json`):

```json
{
  "step": 1200,
  "max_steps": 5000,
  "train_loss": [{ "step": 100, "loss": 4.62 }],
  "val_loss":   [{ "step": 200, "loss": 4.41 }],
  "sample": "text the model last wrote"
}
```

`max_steps`, `val_loss` and `sample` are optional.

### Backend address → generate endpoint

The Playground sends:

```
POST <backend address>
Authorization: Bearer <your token>
Content-Type: application/json

{ "prompt": "Once upon a time", "max_new_tokens": 60, "temperature": 0.8 }
```

and expects `{ "text": "...the continuation..." }` back. Your backend **must check the token** and reject requests without it (return 401 or 403).

### Two things your servers must do

1. **Allow CORS.** The browser only lets this page read from another address if that server sends an `Access-Control-Allow-Origin` header (for the backend, also allow the `Authorization` and `Content-Type` headers and answer the `OPTIONS` preflight). Without it you will see "Not connected" even though the server is fine.
2. **Use https** if you host the app on https. Browsers block `http://` addresses from an https page.

### About the secret token

It is typed into Settings and stored in your browser's local storage on that device. It is never in the code files, so publishing the repo does not leak it. Because it lives in the browser, treat it as a personal password for your own backend, not as protection against someone who has your phone unlocked. Use a long random value, and change it if you ever think it leaked.

## How the code is organised

```
index.html            the page shell: top bar, menu, help popup
manifest.webmanifest  tells phones how to install the app
sw.js                 service worker: offline copy of the app files
css/theme.css         light and dark colours
css/layout.css        layout and components
js/app.js             router, help button, theme button
js/settings.js        save/load your three settings in the browser
js/api.js             fetchMetrics() and askModel() with friendly errors
js/chart.js           draws the loss graph as SVG
js/sampleData.js      invented sample data
js/dom.js, help.js    small helpers
js/pages/             one file per page
icons/                app icons (tools/make_icons.py regenerates the PNGs)
examples/             an example metrics.json
```

When you edit app files, bump `CACHE = 'model-lab-v1'` in `sw.js` (to `v2`, …) so phones pick up the new version.
