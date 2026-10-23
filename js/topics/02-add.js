/* Lesson 2: add */
/* ---------------- 2. Adding and scaling ---------------- */
TOPICS.push({
  id: 'add', cat: 'vec', dims: ['2D'],
  title: 'Adding and scaling vectors',
  short: 'Slide arrows tip to tail, stretch them, flip them.',
  lede: 'Adding vectors means walking along one, then the other. Scaling stretches, shrinks or flips a vector.',
  ideas: [
    ['Tip to tail.', 'Move v so its tail sits on the tip of u. The arrow from the start to the end is u + v.'],
    ['Order does not matter.', 'Walk u then v, or v then u, and you land on the same point. That is why the picture is a parallelogram.'],
    ['Subtracting is adding the opposite.', 'u \u2212 v is the arrow from the tip of v to the tip of u.'],
    ['Scaling multiplies every component.', 'Multiply by 2 and the arrow doubles. Multiply by \u22121 and it points the other way.']
  ],
  tries: [
    'Make u and v point in opposite directions. What happens to the length of u + v?',
    'In Scale mode, set k to \u22121, then to 0. What is left of the vector?',
    'In Add mode, check that |u + v| is never bigger than |u| + |v|.'
  ],
  build(ctx) {
    const S = { u: [3, 1], v: [1, 3], k: 1.5, mode: 'add' };
    const c2 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-8, 8], y: [-6, 6], snap: .5 }));
    p.addHandle({ get: () => S.u, set: (x, y) => { S.u = [x, y]; }, color: 'blue' });
    p.addHandle({ get: () => S.v, set: (x, y) => { S.v = [x, y]; }, color: 'green', enabled: () => S.mode !== 'scale' });
    p.onDrag = () => { syncSliders(); readout(); };

    p.onDraw = q => {
      q.grid();
      const [ux, uy] = S.u, [vx, vy] = S.v;
      if (S.mode === 'add') {
        const wx = ux + vx, wy = uy + vy;
        q.poly([[0, 0], [ux, uy], [wx, wy], [vx, vy]], { fill: rgba(TH.orange, .08) });
        q.arrow(ux, uy, wx, wy, { color: TH.green, dash: [6, 6], alpha: .6, width: 2.4 });
        q.arrow(vx, vy, wx, wy, { color: TH.blue, dash: [6, 6], alpha: .6, width: 2.4 });
        q.arrow(0, 0, ux, uy, { color: TH.blue, label: 'u' });
        q.arrow(0, 0, vx, vy, { color: TH.green, label: 'v' });
        q.arrow(0, 0, wx, wy, { color: TH.orange, width: 4.4, label: 'u + v' });
      } else if (S.mode === 'sub') {
        const dx = ux - vx, dy = uy - vy;
        q.arrow(ux, uy, dx, dy, { color: TH.green, dash: [6, 6], alpha: .6, width: 2.4 });
        q.arrow(0, 0, dx, dy, { color: TH.orange, dash: [6, 6], alpha: .55, width: 2.4 });
        q.arrow(0, 0, ux, uy, { color: TH.blue, label: 'u' });
        q.arrow(0, 0, vx, vy, { color: TH.green, label: 'v' });
        q.arrow(vx, vy, ux, uy, { color: TH.orange, width: 4.4, label: 'u \u2212 v' });
      } else {
        const L = Math.hypot(ux, uy);
        if (L > .05) {
          const f = 14 / L;
          q.line(-ux * f, -uy * f, ux * f, uy * f, { color: TH.stone, dash: [3, 7], alpha: .7, width: 1.5 });
          for (let m = -4; m <= 4; m++) if (m) q.dot(ux * m, uy * m, { r: 2.8, color: TH.stone, alpha: .8 });
        }
        q.arrow(0, 0, S.k * ux, S.k * uy, { color: TH.orange, width: 4.4, label: 'k\u00b7u' });
        q.arrow(0, 0, ux, uy, { color: TH.blue, width: 3, label: 'u' });
      }
    };

    const mode = Seg([{ id: 'add', label: 'u + v' }, { id: 'sub', label: 'u \u2212 v' }, { id: 'scale', label: 'k \u00b7 u' }], 'add', m => { S.mode = m; applyMode(); }, 'chips');
    const mk = (name, col, get, set) => Slider({ name, color: col, min: -6, max: 6, step: .5, value: get(), onInput: v => { set(v); readout(); p.render(); } });
    const sUx = mk('u<sub>x</sub>', 'var(--blue)', () => S.u[0], v => { S.u = [v, S.u[1]]; });
    const sUy = mk('u<sub>y</sub>', 'var(--blue)', () => S.u[1], v => { S.u = [S.u[0], v]; });
    const sVx = mk('v<sub>x</sub>', 'var(--green)', () => S.v[0], v => { S.v = [v, S.v[1]]; });
    const sVy = mk('v<sub>y</sub>', 'var(--green)', () => S.v[1], v => { S.v = [S.v[0], v]; });
    const sK = Slider({ name: 'k', color: 'var(--orange)', min: -3, max: 3, step: .1, value: S.k, onInput: v => { S.k = v; readout(); p.render(); } });
    const vSec = sec('Vector v', sVx.el, sVy.el);
    const kSec = sec('Scale factor', sK.el);
    const stats = box('stats'), formula = box('formula');
    const snap = Check('Snap to grid', true, v => { p.snap = v ? .5 : 0; });
    ctx.panel.append(sec('Operation', mode.el), sec('Vector u', sUx.el, sUy.el), vSec, kSec, sec('', snap.el), sec('Readout', formula, stats));

    function syncSliders() { sUx.set(S.u[0]); sUy.set(S.u[1]); sVx.set(S.v[0]); sVy.set(S.v[1]); }
    function applyMode() {
      vSec.hidden = S.mode === 'scale'; kSec.hidden = S.mode !== 'scale';
      ctx.hint(S.mode === 'scale' ? 'Drag the blue handle for u, then change k.' : 'Drag the blue and green handles.');
      ctx.note(S.mode === 'add' ? 'Tip to tail: u, then v' : S.mode === 'sub' ? 'u \u2212 v runs from the tip of v to the tip of u' : 'k stretches or flips u');
      readout(); p.render();
    }
    function readout() {
      const [ux, uy] = S.u, [vx, vy] = S.v, lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
      if (S.mode === 'scale') {
        const r = [S.k * ux, S.k * uy];
        formula.innerHTML = '<span class="big">k\u00b7u</span> = ' + num(S.k, 1) + ' \u00b7 ' + vecHTML(S.u) + ' = ' + vecHTML(r);
        stats.innerHTML = '<div class="stat"><span>|u|</span><b>' + num(lu, 2) + '</b></div><div class="stat"><span>|k\u00b7u| = |k|\u00b7|u|</span><b>' + num(Math.abs(S.k) * lu, 2) + '</b></div><div class="stat"><span>Direction</span><b>' + (Math.abs(S.k) < .05 ? 'none' : S.k > 0 ? 'same as u' : 'opposite to u') + '</b></div>';
      } else {
        const sg = S.mode === 'add' ? 1 : -1, r = [ux + sg * vx, uy + sg * vy], lr = Math.hypot(r[0], r[1]);
        formula.innerHTML = '<span class="big">u ' + (sg > 0 ? '+' : '\u2212') + ' v</span> = ' + vecHTML(S.u) + (sg > 0 ? ' + ' : ' \u2212 ') + vecHTML(S.v) + ' = ' + vecHTML(r);
        stats.innerHTML = '<div class="stat"><span>|u|, |v|</span><b>' + num(lu, 2) + ', ' + num(lv, 2) + '</b></div><div class="stat"><span>Length of result</span><b>' + num(lr, 2) + '</b></div>' +
          (sg > 0 ? '<div class="stat"><span>|u + v| \u2264 |u| + |v|</span><b>' + num(lr, 2) + ' \u2264 ' + num(lu + lv, 2) + '</b></div>' : '');
      }
    }
    applyMode();
  }
});
