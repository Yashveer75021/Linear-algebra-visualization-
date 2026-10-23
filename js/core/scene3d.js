/* Scene3D: 3D canvas with orbit camera and painter's algorithm. */
/* ================= 3D scene (orbit camera, painter's algorithm) ================= */
class Scene3D {
  constructor(cv, o) {
    o = o || {};
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.range = o.range || 4;
    this.yaw0 = this.yaw = o.yaw == null ? -.62 : o.yaw;
    this.pitch0 = this.pitch = o.pitch == null ? .42 : o.pitch;
    this.items = []; this.onDraw = () => { }; this.w = 0; this.h = 0; this.raf = 0; this.sc = 40;
    cv.style.touchAction = 'none'; cv.style.cursor = 'grab';
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(cv.parentElement);
    let drag = null;
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      this.yaw += (e.clientX - drag.x) * .009;
      this.pitch = clamp(this.pitch + (e.clientY - drag.y) * .007, -1.35, 1.35);
      drag = { x: e.clientX, y: e.clientY }; this.render();
    });
    const end = () => { drag = null; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    LIVE.add(this);
  }
  destroy() { this.ro.disconnect(); cancelAnimationFrame(this.raf); LIVE.delete(this); }
  reset() { this.yaw = this.yaw0; this.pitch = this.pitch0; this.render(); }
  size() {
    const p = this.cv.parentElement, w = p.clientWidth, hh = p.clientHeight;
    if (!w || !hh || this.cv.hidden) return false;
    const dpr = window.devicePixelRatio || 1;
    if (this.cv.width !== Math.round(w * dpr) || this.cv.height !== Math.round(hh * dpr)) {
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(hh * dpr);
    }
    this.cv.style.width = w + 'px'; this.cv.style.height = hh + 'px';
    this.w = w; this.h = hh; this.dpr = dpr;
    this.sc = Math.min(w, hh) / (this.range * 2.15);
    return true;
  }
  render() {
    if (!this.size()) return;
    this.t = { cy: Math.cos(this.yaw), sy: Math.sin(this.yaw), cp: Math.cos(this.pitch), sp: Math.sin(this.pitch) };
    this.items = [];
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.onDraw(this);
    this.flush();
  }
  request() { if (this.raf) return; this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); }); }
  P(p) {
    const t = this.t;
    const x1 = p[0] * t.cy - p[1] * t.sy, y1 = p[0] * t.sy + p[1] * t.cy, z1 = p[2];
    const y2 = y1 * t.cp - z1 * t.sp, z2 = y1 * t.sp + z1 * t.cp;
    const D = this.range * 6, k = D / (D + y2);
    return { x: this.w / 2 + x1 * k * this.sc, y: this.h / 2 + 8 - z2 * k * this.sc, d: y2 };
  }
  line(a, b, o) { o = o || {}; this.items.push({ t: 'l', a, b, o, layer: o.layer == null ? 2 : o.layer, d: (this.P(a).d + this.P(b).d) / 2 }); }
  poly(pts, o) { o = o || {}; this.items.push({ t: 'p', pts, o, layer: 1, d: pts.reduce((s, p) => s + this.P(p).d, 0) / pts.length }); }
  dot(p, o) { this.items.push({ t: 'd', p, o: o || {}, layer: 2, d: this.P(p).d - .01 }); }
  arrow(a, b, o) { this.items.push({ t: 'a', a, b, o: o || {}, layer: 2, d: (this.P(a).d + this.P(b).d) / 2 - .02 }); }
  label(s, p, o) { this.items.push({ t: 't', s, p, o: o || {}, layer: 3, d: 0 }); }
  axes() {
    const R = this.range;
    for (let i = -R; i <= R; i++) {
      this.line([i, -R, 0], [i, R, 0], { color: TH.grid, width: 1, layer: 0 });
      this.line([-R, i, 0], [R, i, 0], { color: TH.grid, width: 1, layer: 0 });
    }
    const ax = (b, col, name) => {
      this.arrow([0, 0, 0], b, { color: col, width: 1.8, alpha: .75, head: 9, layer: 0 });
      this.label(name, b.map(v => v * 1.06), { color: col });
    };
    ax([R, 0, 0], TH.blue, 'x'); ax([0, R, 0], TH.green, 'y'); ax([0, 0, R], TH.violet, 'z');
    this.line([-R, 0, 0], [0, 0, 0], { color: TH.axis, width: 1, alpha: .5, layer: 0 });
    this.line([0, -R, 0], [0, 0, 0], { color: TH.axis, width: 1, alpha: .5, layer: 0 });
    this.line([0, 0, -R], [0, 0, 0], { color: TH.axis, width: 1, alpha: .5, layer: 0 });
  }
  /* parallelepiped with origin o3 and edge vectors a,b,c */
  para(o3, a, b, c, o) {
    o = o || {};
    const V = (i, j, k) => [o3[0] + a[0] * i + b[0] * j + c[0] * k, o3[1] + a[1] * i + b[1] * j + c[1] * k, o3[2] + a[2] * i + b[2] * j + c[2] * k];
    if (o.fill) {
      const F = [[[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
      [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]],
      [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]];
      F.forEach(f => this.poly(f.map(v => V(v[0], v[1], v[2])), { fill: o.fill }));
    }
    const E = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      E.push([V(0, i, j), V(1, i, j)], [V(i, 0, j), V(i, 1, j)], [V(i, j, 0), V(i, j, 1)]);
    }
    E.forEach(e => this.line(e[0], e[1], { color: o.edge || TH.ink, width: o.width || 1.6, dash: o.dash, alpha: o.edgeAlpha == null ? 1 : o.edgeAlpha, layer: 1.5 }));
  }
  flush() {
    const c = this.ctx;
    this.items.sort((a, b) => a.layer - b.layer || b.d - a.d);
    for (const it of this.items) {
      const o = it.o;
      c.save();
      if (it.t === 'l') {
        const A = this.P(it.a), B = this.P(it.b);
        c.strokeStyle = o.color || TH.ink; c.lineWidth = o.width || 2; c.globalAlpha = o.alpha == null ? 1 : o.alpha; c.lineCap = 'round';
        if (o.dash) c.setLineDash(o.dash);
        c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
      } else if (it.t === 'p') {
        c.beginPath();
        it.pts.forEach((p, i) => { const q = this.P(p); i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y); });
        c.closePath(); c.fillStyle = o.fill; c.fill();
        if (o.stroke) { c.strokeStyle = o.stroke; c.lineWidth = o.width || 1.5; c.stroke(); }
      } else if (it.t === 'd') {
        const q = this.P(it.p);
        c.beginPath(); c.arc(q.x, q.y, o.r || 5, 0, TAU); c.fillStyle = o.color || TH.ink; c.fill();
        if (o.ring) { c.lineWidth = 2.5; c.strokeStyle = o.ring; c.stroke(); }
      } else if (it.t === 'a') {
        const A = this.P(it.a), B = this.P(it.b);
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy);
        if (L > 2) {
          const ux = dx / L, uy = dy / L, head = Math.min(o.head || 13, L * .7);
          c.globalAlpha = o.alpha == null ? 1 : o.alpha;
          c.strokeStyle = c.fillStyle = o.color || TH.ink; c.lineWidth = o.width || 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
          c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x - ux * head * .6, B.y - uy * head * .6); c.stroke();
          c.beginPath(); c.moveTo(B.x, B.y);
          c.lineTo(B.x - ux * head + uy * head * .46, B.y - uy * head - ux * head * .46);
          c.lineTo(B.x - ux * head - uy * head * .46, B.y - uy * head + ux * head * .46);
          c.closePath(); c.fill();
          if (o.label) this.label(o.label, it.b, { color: o.color, dx: ux * (14 + 3.6 * o.label.length), dy: uy * (14 + 3.6 * o.label.length) });
        }
      } else if (it.t === 't') {
        const q = this.P(it.p);
        c.font = '700 ' + (o.size || 13) + 'px ' + MONO; c.textAlign = 'center'; c.textBaseline = 'middle';
        const px = q.x + (o.dx || 0), py = q.y + (o.dy || 0);
        c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = TH.bg; c.strokeText(it.s, px, py);
        c.fillStyle = o.color || TH.text; c.fillText(it.s, px, py);
      }
      c.restore();
    }
  }
}
