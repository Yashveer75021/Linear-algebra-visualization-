/* Tile-world thumbnails for the home page blocks. Add an entry to THUMBS for each new topic. */
/* ================= thumbnails: little tile worlds with a white drawing on top ================= */
function mosaic(seed) {
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const kinds = ['grass', 'water', 'earth', 'stone'], cs = [];
  for (let i = 0; i < 8; i++) cs.push({ x: rnd() * 10, y: rnd() * 6, k: i < 3 ? 'grass' : kinds[Math.floor(rnd() * 4)] });
  let out = '';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) {
    let best = cs[0], bd = 1e9;
    for (const q of cs) { const d = (q.x - c - .5) ** 2 + (q.y - r - .5) ** 2; if (d < bd) { bd = d; best = q; } }
    out += '<rect x="' + (c * 20) + '" y="' + (r * 20) + '" width="20.4" height="20.4" style="fill:var(--tile-' + best.k + ')"/>';
  }
  return out;
}
const arrP = (x0, y0, x1, y1, hs) => {
  const a = Math.atan2(y1 - y0, x1 - x0), f = n => n.toFixed(1);
  return 'M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1 + 'M' + f(x1 - hs * Math.cos(a - .5)) + ' ' + f(y1 - hs * Math.sin(a - .5)) + 'L' + x1 + ' ' + y1 + 'L' + f(x1 - hs * Math.cos(a + .5)) + ' ' + f(y1 - hs * Math.sin(a + .5));
};
const dotP = pts => pts.map(q => 'M' + q[0] + ' ' + q[1] + 'h.01').join('');
const DOT = ' stroke-dasharray="1 9" ';
const THUMBS = {
  vector: () => '<path class="hi" d="' + arrP(36, 92, 150, 34, 14) + '"/><path' + DOT + 'd="M150 34V92H36"/>',
  add: () => '<path d="' + arrP(30, 92, 100, 72, 11) + '"/><path d="' + arrP(100, 72, 132, 30, 11) + '"/><path' + DOT + 'd="M30 92L62 50L132 30"/><path class="hi" d="' + arrP(30, 92, 132, 30, 14) + '"/>',
  span: () => {
    const pts = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) pts.push([46 + 30 * i + 12 * j, 98 - 8 * i - 26 * j]);
    return '<path d="' + dotP(pts) + '"/><path d="' + arrP(46, 98, 76, 90, 10) + '"/><path class="hi" d="' + arrP(46, 98, 58, 72, 10) + '"/>';
  },
  dot: () => '<path d="' + arrP(36, 94, 160, 94, 12) + '"/><path class="hi" d="' + arrP(36, 94, 110, 34, 12) + '"/><path' + DOT + 'd="M110 34V94"/><path d="M70 94A34 34 0 0 0 62.4 72.6"/>',
  cross: () => '<path class="fl" d="M46 98L118 98L156 70L84 70Z"/><path class="hi" d="' + arrP(101, 84, 101, 24, 13) + '"/>',
  transform: () => {
    let d = ''; for (let i = 0; i < 5; i++) d += 'M' + (30 + 26 * i) + ' 100L' + (30 + 26 * i + 54) + ' 22';
    for (let j = 0; j < 4; j++) d += 'M' + (30 + 18 * j) + ' ' + (100 - 26 * j) + 'L' + (30 + 18 * j + 104) + ' ' + (100 - 26 * j);
    return '<path d="' + d + '"/>';
  },
  multiply: () => '<path d="M14 52h28v28h-28z"/><path d="' + arrP(48, 66, 66, 66, 9) + '"/><path d="M92 46L112 66L92 86L72 66Z"/><path d="' + arrP(120, 66, 138, 66, 9) + '"/><path class="hi fl" d="M146 54h40v24h-40z"/>',
  determinant: () => '<path class="fl" d="M40 98L116 88L142 42L66 52Z"/><path' + DOT + 'd="M40 98h22v-22h-22z"/><path class="hi" d="' + arrP(40, 98, 116, 88, 11) + '"/>',
  cramer: () => '<path d="M20 95L180 35M30 30L170 100"/><circle class="hi" cx="100" cy="65" r="7"/>',
  eigen: () => '<ellipse cx="100" cy="60" rx="62" ry="26" transform="rotate(-28 100 60)"/><circle' + DOT + 'cx="100" cy="60" r="26"/><path class="hi" d="' + arrP(100, 60, 154.7, 30.9, 11) + arrP(100, 60, 45.3, 89.1, 11) + '"/>',
  basis: () => {
    /* basis grid: two non-parallel arrows + a parallelogram grid */
    const b1x = 54, b1y = 30, b2x = 14, b2y = 42;
    let grid = '';
    for (let i = -2; i <= 2; i++) {
      grid += 'M' + (100 + i*b1x - 3*b2x) + ' ' + (60 + i*b1y - 3*b2y) + 'L' + (100 + i*b1x + 3*b2x) + ' ' + (60 + i*b1y + 3*b2y);
      grid += 'M' + (100 + i*b2x - 3*b1x) + ' ' + (60 + i*b2y - 3*b1y) + 'L' + (100 + i*b2x + 3*b1x) + ' ' + (60 + i*b2y + 3*b1y);
    }
    return '<path d="' + grid + '"/>' +
      '<path class="hi" d="' + arrP(100, 60, 100 + b1x, 60 + b1y, 11) + '"/>' +
      '<path d="' + arrP(100, 60, 100 + b2x, 60 + b2y, 11) + '"/>' +
      '<circle cx="' + (100 + b1x + b2x) + '" cy="' + (60 + b1y + b2y) + '" r="5"/>';
  }
};
function thumbSVG(id, i) {
  const inner = THUMBS[id] ? THUMBS[id]() : '';
  return '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g shape-rendering="crispEdges">' + mosaic(i + 3) + '</g><g class="sh">' + inner + '</g><g class="fg">' + inner + '</g></svg>';
}
