/* Plot2D: 2D canvas with grid, arrows and draggable handles. */
/* ================= 2D plot ================= */
class Plot2D {
  constructor(cv, o) {
    o = o || {};
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.range = { x: o.x || [-6, 6], y: o.y || [-6, 6] };
    this.snap = o.snap || 0;
    this.handles = []; this.hover = null; this.drag = null;
    this.onDraw = () => { }; this.onDrag = () => { };
    this.w = 0; this.h = 0; this.dpr = 1; this.scale = 40; this.ox = 0; this.oy = 0; this.raf = 0;
    cv.style.touchAction = 'none';
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(cv.parentElement);
    cv.addEventListener('pointerdown', e => this.down(e));
    cv.addEventListener('pointermove', e => this.move(e));
    cv.addEventListener('pointerup', e => this.up(e));
    cv.addEventListener('pointercancel', e => this.up(e));
    LIVE.add(this);
  }
  destroy() { this.ro.disconnect(); cancelAnimationFrame(this.raf); LIVE.delete(this); }
  size() {
    const p = this.cv.parentElement, w = p.clientWidth, hh = p.clientHeight;
    if (!w || !hh || this.cv.hidden) return false;
    const dpr = window.devicePixelRatio || 1;
    if (this.cv.width !== Math.round(w * dpr) || this.cv.height !== Math.round(hh * dpr)) {
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(hh * dpr);
    }
    this.cv.style.width = w + 'px'; this.cv.style.height = hh + 'px';
    this.w = w; this.h = hh; this.dpr = dpr;
    const rx = this.range.x, ry = this.range.y;
    this.scale = Math.min(w / (rx[1] - rx[0]), hh / (ry[1] - ry[0]));
    this.ox = w / 2 - (rx[0] + rx[1]) / 2 * this.scale;
    this.oy = hh / 2 + (ry[0] + ry[1]) / 2 * this.scale;
    return true;
  }
  render() {
    if (!this.size()) return;
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    this.onDraw(this);
    this.drawHandles();
  }
  request() { if (this.raf) return; this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); }); }
  sx(x) { return this.ox + x * this.scale; }
  sy(y) { return this.oy - y * this.scale; }
  wx(px) { return (px - this.ox) / this.scale; }
  wy(py) { return (this.oy - py) / this.scale; }

  grid(o) {
    o = o || {};
    const c = this.ctx, w = this.w, hh = this.h;
    const x0 = Math.floor(this.wx(0)), x1 = Math.ceil(this.wx(w)), y0 = Math.floor(this.wy(hh)), y1 = Math.ceil(this.wy(0));
    const step = this.scale < 26 ? 2 : 1;
    c.save();
    c.lineWidth = 1; c.strokeStyle = TH.grid;
    for (let i = Math.ceil(x0 / step) * step; i <= x1; i += step) { if (!i) continue; const X = Math.round(this.sx(i)) + .5; c.beginPath(); c.moveTo(X, 0); c.lineTo(X, hh); c.stroke(); }
    for (let j = Math.ceil(y0 / step) * step; j <= y1; j += step) { if (!j) continue; const Y = Math.round(this.sy(j)) + .5; c.beginPath(); c.moveTo(0, Y); c.lineTo(w, Y); c.stroke(); }
    c.strokeStyle = TH.axis; c.lineWidth = 1.6;
    const ax = this.sx(0), ay = this.sy(0);
    if (ay >= 0 && ay <= hh) { c.beginPath(); c.moveTo(0, ay); c.lineTo(w, ay); c.stroke(); }
    if (ax >= 0 && ax <= w) { c.beginPath(); c.moveTo(ax, 0); c.lineTo(ax, hh); c.stroke(); }
    if (o.labels !== false) {
      c.font = '500 11px ' + MONO; c.fillStyle = TH.text;
      c.textAlign = 'center'; c.textBaseline = 'top';
      const ty = clamp(ay + 5, 2, hh - 15);
      for (let i = Math.ceil(x0 / step) * step; i <= x1; i += step) if (i && this.sx(i) > 10 && this.sx(i) < w - 10) c.fillText(String(i).replace('-', '\u2212'), this.sx(i), ty);
      c.textAlign = 'right'; c.textBaseline = 'middle';
      const tx = clamp(ax - 7, 22, w - 4);
      for (let j = Math.ceil(y0 / step) * step; j <= y1; j += step) if (j && this.sy(j) > 10 && this.sy(j) < hh - 10) c.fillText(String(j).replace('-', '\u2212'), tx, this.sy(j));
      c.font = '700 13px ' + MONO; c.textAlign = 'center';
      c.fillText('x', w - 12, clamp(ay - 12, 12, hh - 12));
      c.fillText('y', clamp(ax + 12, 12, w - 12), 12);
    }
    c.restore();
  }
  line(x0, y0, x1, y1, o) {
    o = o || {};
    const c = this.ctx; c.save();
    c.strokeStyle = o.color || TH.ink; c.lineWidth = o.width || 2; c.globalAlpha = o.alpha == null ? 1 : o.alpha; c.lineCap = 'round';
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(this.sx(x0), this.sy(y0)); c.lineTo(this.sx(x1), this.sy(y1)); c.stroke(); c.restore();
  }
  poly(pts, o) {
    o = o || {};
    const c = this.ctx; c.save();
    c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(this.sx(p[0]), this.sy(p[1])) : c.moveTo(this.sx(p[0]), this.sy(p[1])));
    c.closePath();
    if (o.fill) { c.fillStyle = o.fill; c.fill(); }
    if (o.stroke) { c.strokeStyle = o.stroke; c.lineWidth = o.width || 2; c.lineJoin = 'round'; if (o.dash) c.setLineDash(o.dash); c.stroke(); }
    c.restore();
  }
  arrow(x0, y0, x1, y1, o) {
    o = o || {};
    const c = this.ctx;
    const a = [this.sx(x0), this.sy(y0)], b = [this.sx(x1), this.sy(y1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (L < 2) return;
    const ux = dx / L, uy = dy / L, head = Math.min(o.head || 13, L * .7);
    c.save();
    c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    c.strokeStyle = c.fillStyle = o.color || TH.ink;
    c.lineWidth = o.width || 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0] - ux * head * .6, b[1] - uy * head * .6); c.stroke();
    c.setLineDash([]);
    c.beginPath(); c.moveTo(b[0], b[1]);
    c.lineTo(b[0] - ux * head + uy * head * .46, b[1] - uy * head - ux * head * .46);
    c.lineTo(b[0] - ux * head - uy * head * .46, b[1] - uy * head + ux * head * .46);
    c.closePath(); c.fill(); c.restore();
    if (o.label) { const off = 18 + 3.6 * o.label.length; this.text(o.label, x1, y1, { dx: ux * off + (o.ldx || 0), dy: uy * off + (o.ldy || 0), color: o.color }); }
  }
  arc(x, y, r, a0, a1, o) {
    o = o || {};
    const c = this.ctx; c.save();
    c.strokeStyle = o.color || TH.ink; c.lineWidth = o.width || 2; c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    c.beginPath(); c.arc(this.sx(x), this.sy(y), r * this.scale, -a0, -a1, a1 > a0); c.stroke(); c.restore();
  }
  dot(x, y, o) {
    o = o || {};
    const c = this.ctx; c.save();
    c.beginPath(); c.arc(this.sx(x), this.sy(y), o.r || 5, 0, TAU);
    c.fillStyle = o.color || TH.ink; c.globalAlpha = o.alpha == null ? 1 : o.alpha; c.fill();
    if (o.ring) { c.globalAlpha = 1; c.lineWidth = 2.5; c.strokeStyle = o.ring; c.stroke(); }
    c.restore();
  }
  text(s, x, y, o) {
    o = o || {};
    const c = this.ctx; c.save();
    c.font = (o.weight || 700) + ' ' + (o.size || 13) + 'px ' + (o.font || MONO);
    c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    const px = this.sx(x) + (o.dx || 0), py = this.sy(y) + (o.dy || 0);
    c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = TH.bg; c.strokeText(s, px, py);
    c.fillStyle = o.color || TH.text; c.fillText(s, px, py); c.restore();
  }
  /* handles */
  addHandle(hd) { this.handles.push(hd); return hd; }
  drawHandles() {
    const c = this.ctx;
    for (const hd of this.handles) {
      if (hd.enabled && !hd.enabled()) continue;
      const p = hd.get(), px = this.sx(p[0]), py = this.sy(p[1]);
      const act = this.hover === hd || this.drag === hd;
      c.save();
      c.beginPath(); c.arc(px, py, 10 + (act ? 3 : 0), 0, TAU);
      c.fillStyle = TH.surface; c.fill();
      const col = TH[hd.color] || hd.color;
      c.lineWidth = 3.2; c.strokeStyle = col; c.stroke();
      c.beginPath(); c.arc(px, py, 3.6, 0, TAU); c.fillStyle = col; c.fill();
      c.restore();
    }
  }
  pick(e) {
    const r = this.cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    let best = null, bd = 1e9;
    for (const hd of this.handles) {
      if (hd.enabled && !hd.enabled()) continue;
      const p = hd.get(), d = Math.hypot(this.sx(p[0]) - px, this.sy(p[1]) - py);
      if (d < bd) { bd = d; best = hd; }
    }
    return bd <= (e.pointerType === 'touch' ? 34 : 22) ? best : null;
  }
  down(e) {
    const hd = this.pick(e);
    if (!hd) return;
    this.drag = hd; this.cv.setPointerCapture(e.pointerId); this.cv.style.cursor = 'grabbing';
    this.move(e); e.preventDefault();
  }
  move(e) {
    const r = this.cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (this.drag) {
      let x = this.wx(px), y = this.wy(py);
      if (this.snap) { x = Math.round(x / this.snap) * this.snap; y = Math.round(y / this.snap) * this.snap; }
      const lim = this.drag.limit || 1;
      x = clamp(x, this.range.x[0] * lim, this.range.x[1] * lim); y = clamp(y, this.range.y[0] * lim, this.range.y[1] * lim);
      this.drag.set(x, y); this.onDrag(this.drag); this.render();
    } else {
      const hd = this.pick(e);
      if (hd !== this.hover) { this.hover = hd; this.cv.style.cursor = hd ? 'grab' : 'default'; this.render(); }
    }
  }
  up() { if (this.drag) { this.drag = null; this.cv.style.cursor = 'default'; this.render(); } }
}
