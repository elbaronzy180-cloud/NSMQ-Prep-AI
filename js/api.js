// Everything that talks to the outside world lives here:
//   1. fetchMetrics  - downloads metrics.json (Training page)
//   2. askModel      - sends your text to the backend (Playground page)
//
// Both throw an ApiError with a friendly `message` you can show directly,
// and a `kind` the pages can use to decide what to display.

export class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;   // 'not-set' | 'network' | 'auth' | 'server' | 'bad-data'
  }
}

/** fetch() with a time limit, so a stuck server cannot hang the page forever. */
async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e) {
    const why = e.name === 'AbortError' ? 'it took too long to answer' : 'the browser could not reach it';
    throw new ApiError('network', `Could not connect: ${why}. Check the address in Settings and that the server is running.`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Download metrics.json.
 * Expected shape (see README for the full description):
 *   { "step": 1200, "max_steps": 5000,
 *     "train_loss": [{"step": 100, "loss": 4.2}, ...],
 *     "val_loss":   [{"step": 100, "loss": 4.3}, ...],
 *     "sample": "text the model last wrote" }
 */
export async function fetchMetrics(url) {
  if (!url) throw new ApiError('not-set', 'No metrics address set yet.');

  // "no-store" asks the browser not to reuse an old copy, so we see live changes.
  const res = await fetchWithTimeout(url, { cache: 'no-store' }, 10000);
  if (!res.ok) throw new ApiError('server', `The metrics file could not be loaded (error ${res.status}).`);

  let data;
  try { data = await res.json(); }
  catch (e) { throw new ApiError('bad-data', 'The metrics file is not valid JSON.'); }

  if (!data || !Array.isArray(data.train_loss)) {
    throw new ApiError('bad-data', 'The metrics file is missing "train_loss". See the README for the expected format.');
  }
  return data;
}

/**
 * Ask the model to continue some text.
 * Sends:   POST <backendUrl>   { prompt, max_new_tokens, temperature }
 * Header:  Authorization: Bearer <your token>
 * Expects: { "text": "the continuation" }
 */
export async function askModel({ backendUrl, token, prompt, maxNewTokens, temperature }) {
  if (!backendUrl) throw new ApiError('not-set', 'No backend address set yet.');

  const res = await fetchWithTimeout(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // The secret token is sent with EVERY request. It comes from Settings,
      // never from the code.
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, max_new_tokens: maxNewTokens, temperature }),
  }, 60000);

  if (res.status === 401 || res.status === 403) {
    throw new ApiError('auth', 'The backend refused the token. Check the token in Settings.');
  }
  if (!res.ok) throw new ApiError('server', `The backend had a problem (error ${res.status}).`);

  let data;
  try { data = await res.json(); }
  catch (e) { throw new ApiError('bad-data', 'The backend replied, but not with JSON.'); }

  if (typeof data.text !== 'string') {
    throw new ApiError('bad-data', 'The backend reply is missing a "text" field.');
  }
  return data.text;
}
