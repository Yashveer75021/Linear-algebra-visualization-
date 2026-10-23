/* Lesson 9: cramer */
/* ---------------- 9. Systems and Cramer's rule ---------------- */
TOPICS.push({
  id: 'cramer', cat: 'mat', dims: ['2D'],
  title: 'Systems and Cramer\u2019s rule',
  short: 'Solve equations by comparing areas.',
  lede: 'A linear system asks: which mix of the columns a\u2081 and a\u2082 makes b? Cramer\u2019s rule answers it by comparing the areas of parallelograms.',
  ideas: [
    ['D is the base area.', 'The parallelogram made by a\u2081 and a\u2082 has area D = det[a\u2081 a\u2082].'],
    ['Swap a column for b.', 'Replace a\u2081 with b to get the area D<sub>x</sub>. Replace a\u2082 with b to get D<sub>y</sub>.'],
    ['Solutions are area ratios.', 'x = D<sub>x</sub> / D and y = D<sub>y</sub> / D. If D = 0 the columns line up and there is no single answer.']
  ],
  tries: [
    'Drag b around. Watch x and y change while D stays the same.',
    'Switch to \u201cRows\u201d. The two lines cross exactly at (x, y).',
    'Drag a\u2082 onto the line through a\u2081 so D becomes 0. What happens to the lines?'
  ],
  build(ctx) {
    const S = { a1: [2, 1], a2: [1, 3], b: [5, 5], view: 'areas', show: 'all' };
    const c2 = ctx.canvas();
    const RA = { x: [-4, 10], y: [-3, 8] }, RL = { x: [-6, 6], y: [-4.5, 4.5] };
    const p = ctx.own(new Plot2D(c2, { x: RA.x, y: RA.y, snap: .5 }));
    const areas = () => S.view === 'areas';
    p.addHandle({ get: () => S.a1, set: (x, y) => { S.a1 = [x, y]; }, color: 'blue', enabled: areas });
    p.addHandle({ get: () => S.a2, set: (x, y) => { S.a2 = [x, y]; }, color: 'green', enabled: areas });
    p.addHandle({ get: () => S.b, set: (x, y) => { S.b = [x, y]; }, color: 'orange', enabled: areas });
    p.onDrag = () => { sync(); readout(); };
    const dets = () => {
      const [a, c] = S.a1, [b, d] = S.a2, [e, f] = S.b;
      const D = a * d - b * c, Dx = e * d - b * f, Dy = a * f - e * c;
      return { D, Dx, Dy, x: Math.abs(D) > 1e-6 ? Dx / D : NaN, y: Math.abs(D) > 1e-6 ? Dy / D : NaN };
    };
    const add = (u, v) => [u[0] + v[0], u[1] + v[1]];
    const centroid = pts => [pts.reduce((s, q) => s + q[0], 0) / pts.length, pts.reduce((s, q) => s + q[1], 0) / pts.length];
    p.onDraw = q => {
      q.grid();
      const { D, Dx, Dy, x, y } = dets(), a1 = S.a1, a2 = S.a2, b = S.b;
      if (areas()) {
        const shapes = [
          ['D', 'D', [[0, 0], a1, add(a1, a2), a2], TH.stone, D],
          ['Dx', 'Dx', [[0, 0], b, add(b, a2), a2], TH.violet, Dx],
          ['Dy', 'Dy', [[0, 0], a1, add(a1, b), b], TH.earth, Dy]];
        shapes.forEach(sh => {
          if (S.show !== 'all' && S.show !== sh[0]) return;
          q.poly(sh[2], { fill: rgba(sh[3], .2), stroke: sh[3], width: 2 });
        });
        shapes.forEach(sh => {
          if (S.show !== 'all' && S.show !== sh[0]) return;
          const c = centroid(sh[2]);
          q.text(sh[1] === 'D' ? 'D = ' + num(sh[4], 1) : sh[1] === 'Dx' ? 'Dx = ' + num(sh[4], 1) : 'Dy = ' + num(sh[4], 1), c[0], c[1], { size: 12.5, color: sh[3] });
        });
        if (!isNaN(x)) {
          q.arrow(0, 0, x * a1[0], x * a1[1], { color: TH.blue, dash: [6, 6], alpha: .6, width: 2.4, head: 10 });
          q.arrow(x * a1[0], x * a1[1], b[0], b[1], { color: TH.green, dash: [6, 6], alpha: .6, width: 2.4, head: 10 });
        }
        q.arrow(0, 0, a1[0], a1[1], { color: TH.blue, label: 'a\u2081' });
        q.arrow(0, 0, a2[0], a2[1], { color: TH.green, label: 'a\u2082' });
        q.arrow(0, 0, b[0], b[1], { color: TH.orange, width: 3.8, label: 'b' });
      } else {
        const L = (pp, qq, r, col) => {
          if (Math.abs(pp) < 1e-9 && Math.abs(qq) < 1e-9) return;
          if (Math.abs(qq) > 1e-9) q.line(-30, (r + 30 * pp) / qq, 30, (r - 30 * pp) / qq, { color: col, width: 3 });
          else q.line(r / pp, -30, r / pp, 30, { color: col, width: 3 });
        };
        L(a1[0], a2[0], b[0], TH.blue); L(a1[1], a2[1], b[1], TH.green);
        if (!isNaN(x)) { q.dot(x, y, { r: 8, color: TH.orange, ring: TH.surface }); q.text('(' + num(x, 2) + ', ' + num(y, 2) + ')', x, y, { dy: -20, color: TH.orange, size: 13 }); }
      }
    };
    /* controls */
    const view = Seg([{ id: 'areas', label: 'Areas' }, { id: 'rows', label: 'Rows' }], 'areas', id => setView(id));
    ctx.bar.prepend(view.el);
    const showSeg = Seg([{ id: 'all', label: 'All shapes' }, { id: 'D', label: 'D' }, { id: 'Dx', label: 'D<sub>x</sub>' }, { id: 'Dy', label: 'D<sub>y</sub>' }], 'all', id => { S.show = id; p.render(); }, 'chips');
    const mk = (name, c, get, set) => Slider({ name, color: c, min: -4, max: 8, step: .5, value: get(), onInput: v => { set(v); readout(); p.render(); } });
    const sl = [
      mk('a<sub>1x</sub>', 'var(--blue)', () => S.a1[0], v => { S.a1 = [v, S.a1[1]]; }), mk('a<sub>1y</sub>', 'var(--blue)', () => S.a1[1], v => { S.a1 = [S.a1[0], v]; }),
      mk('a<sub>2x</sub>', 'var(--green)', () => S.a2[0], v => { S.a2 = [v, S.a2[1]]; }), mk('a<sub>2y</sub>', 'var(--green)', () => S.a2[1], v => { S.a2 = [S.a2[0], v]; }),
      mk('b<sub>x</sub>', 'var(--orange)', () => S.b[0], v => { S.b = [v, S.b[1]]; }), mk('b<sub>y</sub>', 'var(--orange)', () => S.b[1], v => { S.b = [S.b[0], v]; })];
    const sync = () => { const v = [S.a1[0], S.a1[1], S.a2[0], S.a2[1], S.b[0], S.b[1]]; sl.forEach((s, i) => s.set(v[i])); };
    const snap = Check('Snap handles to grid', true, v => { p.snap = v ? .5 : 0; });
    const eqs = box('formula'), res = box('stats'), dbox = box('');
    const showSec = sec('Show', showSeg.el);
    const det = h('<details class="more"><summary>Edit the numbers</summary></details>');
    sl.forEach(s => det.append(s.el)); det.append(snap.el);
    ctx.panel.append(sec('System', eqs), showSec, sec('Solution', res, dbox), sec('', det));
    const eqStr = (pp, qq, r) => num(pp) + 'x ' + (qq < 0 ? '\u2212' : '+') + ' ' + num(Math.abs(qq)) + 'y = ' + num(r);
    function readout() {
      const d = dets(), a1 = S.a1, a2 = S.a2, b = S.b;
      eqs.innerHTML = eqStr(a1[0], a2[0], b[0]) + '<br>' + eqStr(a1[1], a2[1], b[1]);
      const ok = Math.abs(d.D) > 1e-6;
      res.innerHTML = ok
        ? '<div class="stat"><span>x = D<sub>x</sub> / D</span><b>' + num(d.Dx, 1) + ' / ' + num(d.D, 1) + ' = ' + num(d.x, 2) + '</b></div><div class="stat"><span>y = D<sub>y</sub> / D</span><b>' + num(d.Dy, 1) + ' / ' + num(d.D, 1) + ' = ' + num(d.y, 2) + '</b></div>'
        : '<div class="stat"><span>D</span><b><span class="badge bad">D = 0</span></b></div><p class="note">The columns line up, so the parallelogram has no area and there is no single solution. Drag a vector to bring D back.</p>';
      dbox.innerHTML = '<div class="eq" style="margin-top:8px"><span class="lab2">D</span>' + matHTML([[a1[0], a2[0]], [a1[1], a2[1]]]) + '</div>' +
        '<div class="eq"><span class="lab2">D<sub>x</sub></span>' + matHTML([[b[0], a2[0]], [b[1], a2[1]]]) + '</div>' +
        '<div class="eq"><span class="lab2">D<sub>y</sub></span>' + matHTML([[a1[0], b[0]], [a1[1], b[1]]]) + '</div>';
    }
    function setView(v) {
      S.view = v; p.range = v === 'areas' ? RA : RL; p.snap = 0; p.snap = v === 'areas' ? .5 : 0; snap.set(true);
      showSec.hidden = v !== 'areas'; det.open = v === 'rows';
      ctx.note(v === 'areas' ? 'Each solution is a ratio of two areas' : 'Each equation is a line. The solution is where they cross');
      ctx.hint(v === 'areas' ? 'Drag a\u2081, a\u2082 and b.' : 'Change the numbers under \u201cEdit the numbers\u201d.');
      readout(); p.render();
    }
    setView('areas');
  }
});
