// A tiny helper for building page elements from JavaScript.
//
//   h('p', { class: 'hint' }, 'Hello ', h('b', {}, 'world'))
//
// builds <p class="hint">Hello <b>world</b></p>.
// Text is always added as plain text (never as HTML), which keeps the page
// safe even if a metrics file or model reply contains odd characters like "<".

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === false || value === null || value === undefined) continue;
    if (key === 'class') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value === true ? '' : value);
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);   // strings become text nodes, elements are inserted
  }
  return el;
}

/** Make a number easy to read, e.g. 12345 -> "12,345" */
export function formatNumber(n) {
  return Number(n).toLocaleString();
}
