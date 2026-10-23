/* Home page, topic page template, hash router. */
/* ================= pages ================= */
const app = $('#app');
let cleanups = [], current = null;
const own = fn => cleanups.push(fn);
function clear() { cleanups.forEach(fn => { try { fn(); } catch (e) { } }); cleanups = []; }
const ARROW_L = '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>';
const FOOT = '<footer class="foot">Linear Algebra Lab. Drag, rotate and watch the numbers move.</footer>';

/* Snake layout: row 0 runs left to right, row 1 right to left, and so on, so the dashed path never crosses.
   Works for any number of topics. Columns follow the screen width. */
function layoutWorld(world) {
  const cols = window.innerWidth > 980 ? 3 : window.innerWidth > 640 ? 2 : 1;
  const blocks = $$('.block', world).sort((a, b) => +a.dataset.i - +b.dataset.i);
  blocks.forEach((b, i) => {
    const row = Math.floor(i / cols), pos = i % cols, col = row % 2 ? cols - 1 - pos : pos;
    b.style.gridColumn = String(col + 1); b.style.gridRow = String(row + 1);
  });
  const legend = $('.legend', world);
  if (!legend) return;
  const n = blocks.length, lastRow = Math.floor((n - 1) / cols), used = n - lastRow * cols, free = cols - used;
  if (cols < 3) return;
  if (free > 0) {
    const start = lastRow % 2 ? 1 : used + 1;
    legend.style.gridRow = String(lastRow + 1); legend.style.gridColumn = start + ' / span ' + free;
  } else { legend.style.gridRow = String(lastRow + 2); legend.style.gridColumn = '1 / span ' + cols; }
}

function drawLinks(world) {
  const svg = $('svg.links', world), blocks = $$('.block', world).sort((a, b) => +a.dataset.i - +b.dataset.i), wr = world.getBoundingClientRect();
  svg.setAttribute('width', wr.width); svg.setAttribute('height', wr.height); svg.setAttribute('viewBox', '0 0 ' + wr.width + ' ' + wr.height);
  const R = el => { const r = el.getBoundingClientRect(); return { l: r.left - wr.left, r: r.right - wr.left, t: r.top - wr.top, b: r.bottom - wr.top, cx: (r.left + r.right) / 2 - wr.left, cy: (r.top + r.bottom) / 2 - wr.top }; };
  let d = '', dots = '';
  for (let i = 0; i < blocks.length - 1; i++) {
    const A = R(blocks[i]), B = R(blocks[i + 1]);
    let x1, y1, x2, y2, path;
    if (Math.abs(A.cy - B.cy) < 12) { if (B.cx > A.cx) { x1 = A.r; x2 = B.l; } else { x1 = A.l; x2 = B.r; } y1 = y2 = A.cy; path = 'M' + x1 + ' ' + y1 + 'H' + x2; }
    else {
      x1 = A.cx; y1 = A.b; x2 = B.cx; y2 = B.t;
      path = Math.abs(x1 - x2) < 4 ? 'M' + x1 + ' ' + y1 + 'V' + y2 : 'M' + x1 + ' ' + y1 + 'V' + (y1 + y2) / 2 + 'H' + x2 + 'V' + y2;
    }
    d += '<path d="' + path + '"/>'; dots += '<circle cx="' + x1 + '" cy="' + y1 + '" r="5"/><circle cx="' + x2 + '" cy="' + y2 + '" r="5"/>';
  }
  svg.innerHTML = d + dots;
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const numWord = (n, cap) => { const w = WORDS[n] || String(n); return cap ? w[0].toUpperCase() + w.slice(1) : w; };

function renderHome(scrollTo) {
  const N = TOPICS.length;
  document.title = 'Linear Algebra Lab';
  const blocks = TOPICS.map((t, i) => '<a class="block" data-cat="' + t.cat + '" data-i="' + (i + 1) + '" href="#/topic/' + t.id + '" data-link>' +
    '<span class="thumb">' + thumbSVG(t.id, i) + '</span><span class="meta"><span class="row"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><h3>' + t.title + '</h3></span>' +
    '<p>' + t.short + '</p><span class="dims">' + t.dims.map(d => '<span>' + d + '</span>').join('') + '</span></span></a>').join('');
  app.innerHTML =
    '<main class="wrap"><section class="hero"><div>' +
    '<p class="eyebrow">Interactive linear algebra</p><h1>See linear algebra move.</h1>' +
    '<p class="lede">' + numWord(N, true) + ' short lessons where every idea is something you can drag. Move a vector, bend the grid, spin a cube, and watch the numbers follow.</p>' +
    '<span class="pill">' + N + ' lessons, 2D and 3D</span>' +
    '<div class="cta"><a class="btn" href="#/topic/vector" data-link>Start with vectors</a><a class="btn ghost" href="#/topics" data-link>Browse topics</a></div></div>' +
    '<div class="stage"><canvas></canvas><div class="ro"><span>A =</span><span class="rm"></span></div><div class="cap">Drag the blue and green arrow tips to bend the grid.</div></div></section>' +
    '<section class="section short"><div><p class="eyebrow">How it works</p><h2>Learn by changing things</h2></div>' +
    '<div class="card"><p>Every lesson has one picture you can change and the numbers that go with it. Drag a handle or move a slider, switch between 2D and 3D when a lesson has both, and the readout updates as you go. Below the picture you will find the key ideas and a few things to try.</p></div></section>' +
    '<section class="section" id="topics"><p class="eyebrow">The topics</p><h2>' + numWord(N, true) + ' topics, one path</h2>' +
    '<p class="sub">Follow the dashed line from vectors to eigenvectors, or jump straight to any block.</p>' +
    '<div class="world"><svg class="links" aria-hidden="true"></svg>' + blocks +
    '<div class="legend" aria-label="Colour key"><div><i style="border-color:var(--brand)"></i><span><b>Green</b> vectors</span></div><div><i style="border-color:var(--orange)"></i><span><b>Orange</b> products of vectors</span></div><div><i style="border-color:var(--blue)"></i><span><b>Blue</b> matrices and systems</span></div></div></div></section>' +
    FOOT + '</main>';
  heroDemo($('.stage'), own);
  const world = $('.world');
  const relayout = () => { layoutWorld(world); drawLinks(world); };
  layoutWorld(world);
  const ro = new ResizeObserver(relayout);
  ro.observe(world); own(() => ro.disconnect());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => drawLinks(world));
  requestAnimationFrame(() => drawLinks(world));
  if (scrollTo) requestAnimationFrame(() => { const el = $('#topics'); if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' }); });
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function renderTopic(id) {
  const i = TOPICS.findIndex(t => t.id === id);
  if (i < 0) { renderHome(); return; }
  const t = TOPICS[i], prev = TOPICS[i - 1], next = TOPICS[i + 1], catName = { vec: 'Vectors', prod: 'Products of vectors', mat: 'Matrices and systems' }[t.cat];
  document.title = t.title + ' | Linear Algebra Lab';
  app.innerHTML =
    '<main class="wrap topic"><a class="back" href="#/" data-link>' + ARROW_L + 'All topics</a>' +
    '<header class="t-head"><p class="eyebrow">' + catName + ', lesson ' + (i + 1) + ' of ' + TOPICS.length + '</p><h1>' + t.title + '</h1><p class="lede">' + t.lede + '</p></header>' +
    '<section class="lab" aria-label="Interactive lab"><div class="lab-bar"><div class="barl" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"></div><p class="hint"></p></div>' +
    '<div class="lab-grid"><div class="viewport"><div class="vp-tools"></div><div class="vp-note"></div></div><aside class="panel" aria-label="Controls and readout"></aside></div></section>' +
    '<section class="learn"><div class="box"><h2>Key ideas</h2><ul>' + t.ideas.map(x => '<li><b>' + x[0] + '</b>' + x[1] + '</li>').join('') + '</ul></div>' +
    '<div class="box"><h2>Try this</h2><ol>' + t.tries.map(x => '<li>' + x + '</li>').join('') + '</ol></div></section>' +
    '<nav class="pager" aria-label="Lessons">' +
    (prev ? '<a class="prev" href="#/topic/' + prev.id + '" data-link><small>Previous</small><span>' + prev.title + '</span></a>' : '<span></span>') +
    (next ? '<a class="next" href="#/topic/' + next.id + '" data-link><small>Next</small><span>' + next.title + '</span></a>' : '<a class="next" href="#/" data-link><small>Finished</small><span>Back to all topics</span></a>') +
    '</nav>' + FOOT + '</main>';
  const view = $('.viewport'), noteEl = $('.vp-note'), hintEl = $('.hint');
  const owned = [];
  const ctx = {
    panel: $('.panel'), bar: $('.barl'), tools: $('.vp-tools'),
    canvas() { const c = document.createElement('canvas'); view.insertBefore(c, $('.vp-tools', view)); return c; },
    own(o) { owned.push(o); return o; },
    cleanup(fn) { owned.push({ destroy: fn }); },
    tween(ms, fn, done) { const c = tween(ms, fn, done); owned.push({ destroy: c }); return c; },
    note(s) { noteEl.textContent = s; },
    hint(s) { hintEl.textContent = s; }
  };
  own(() => owned.forEach(o => { try { o.destroy(); } catch (e) { } }));
  t.build(ctx);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function render(path) {
  if (path === current) return;
  current = path; clear();
  const m = path.match(/^\/topic\/([\w-]+)/);
  if (m) renderTopic(m[1]);
  else renderHome(path === '/topics');
}
function go(path) {
  try { location.hash = path; } catch (e) { }
  render(path);
}
window.addEventListener('hashchange', () => render((location.hash || '').replace(/^#/, '') || '/'));
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  const path = a.getAttribute('href').slice(1);
  if (path === current && path === '/topics') { const el = $('#topics'); if (el) el.scrollIntoView({ behavior: 'smooth' }); return; }
  go(path);
});
