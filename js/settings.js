// Settings: the three things you type in on the Settings page.
//
// They are saved in YOUR browser only (localStorage). They are never written
// into the code files and never uploaded anywhere except to the addresses you
// choose. That is how the secret token stays out of the page code.

const PREFIX = 'modellab.';

export const SETTING_NAMES = ['metricsUrl', 'backendUrl', 'token'];

/** Read one setting. Returns '' if it was never saved. */
function read(name) {
  try { return localStorage.getItem(PREFIX + name) || ''; }
  catch (e) { return ''; }   // storage blocked: behave as "not set"
}

/** Get all settings as one object, e.g. { metricsUrl: '...', backendUrl: '', token: '' } */
export function getSettings() {
  const out = {};
  for (const name of SETTING_NAMES) out[name] = read(name);
  return out;
}

/** Save settings. Returns false if the browser refused to store them. */
export function saveSettings(values) {
  try {
    for (const name of SETTING_NAMES) {
      const value = (values[name] || '').trim();
      if (value) localStorage.setItem(PREFIX + name, value);
      else localStorage.removeItem(PREFIX + name);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/** True only for web addresses starting with http:// or https:// */
export function isWebAddress(text) {
  try {
    const u = new URL(text);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}
