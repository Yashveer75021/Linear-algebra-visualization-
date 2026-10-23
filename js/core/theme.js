/* Reads CSS colour tokens so canvases follow light/dark mode. */
/* ================= theme (read from CSS tokens so canvas follows light/dark) ================= */
let TH = {};
function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  TH = {
    bg: g('--cv-bg'), grid: g('--cv-grid'), axis: g('--cv-axis'), text: g('--cv-text'),
    ink: g('--ink'), surface: g('--surface'), brand: g('--brand'), muted: g('--muted'),
    blue: g('--blue'), green: g('--green'), orange: g('--orange'), red: g('--red'),
    earth: g('--earth'), stone: g('--stone'), violet: g('--violet')
  };
}
function rgba(c, a) {
  c = (c || '').trim();
  if (c[0] !== '#') return c;
  let x = c.slice(1);
  if (x.length === 3) x = x.split('').map(q => q + q).join('');
  const n = parseInt(x, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
