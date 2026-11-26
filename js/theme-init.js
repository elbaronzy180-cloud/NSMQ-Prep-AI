// Applies the saved light/dark choice immediately, before the page is drawn.
// "auto" (no saved choice) means: follow the phone's own setting.
try {
  const saved = localStorage.getItem('modellab.theme');
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  }
} catch (e) {
  // Storage can be blocked (private mode). Falling back to auto is fine.
}
