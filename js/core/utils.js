/* Small helpers: number formatting, DOM helpers, LIVE registry of canvases. */
/* ================= utils ================= */
const LIVE = new Set();
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const deg = r => r * 180 / Math.PI;
const rad = d => d * Math.PI / 180;
const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
const SANS = '"Manrope", ui-sans-serif, system-ui, sans-serif';
function num(v, d = 1) {
  let s = (+v).toFixed(d);
  if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
  return s.replace('-', '\u2212');
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
