/* Lesson 6: transform */
/* ---------------- 6. Matrices as transformations ---------------- */
const PRESETS2 = {
  shear: [[1, 1], [0, 1]],
  rot45: [[Math.SQRT1_2, -Math.SQRT1_2], [Math.SQRT1_2, Math.SQRT1_2]],
  rot90: [[0, -1], [1, 0]],
  scale: [[2, 0], [0, 2]],
  stretchx: [[2, 0], [0, 1]],
  reflect: [[1, 0], [0, -1]],
  singular: [[1, 2], [.5, 1]],
  identity: [[1, 0], [0, 1]]
};
const detBadge = (d, flips) => Math.abs(d) < .005 ? '<span class="badge bad">det = 0, singular</span>' : d < 0 ? '<span class="badge warn">det = ' + num(d, 2) + (flips || '') + '</span>' : '<span class="badge">det = ' + num(d, 2) + '</span>';

TOPICS.push({
  id: 'transform', cat: 'mat', dims: ['2D', '3D'],
  title: 'Matrices as transformations',
  short: 'A matrix bends the whole grid. Drag it and see.',
  lede: 'A matrix is a recipe for moving space. Its columns say where the arrows i and j land, and every other point follows from that.',
  ideas: [
    ['Columns are landing spots.', 'The first column of A is where (1, 0) goes. The second column is where (0, 1) goes. Drag the blue and green tips to edit them directly.'],
    ['Lines stay lines.', 'Grid lines stay straight and evenly spaced, and the origin never moves. That is what \u201clinear\u201d means.'],
    ['The determinant is the area scale.', 'If det(A) = 2, every shape doubles in area. If it is 0, space is squashed flat and cannot be undone.']
  ],
  tries: [
    'Choose \u201cRotate 45\u00b0\u201d. What is the determinant, and why?',
    'Choose \u201cSingular\u201d. Why is the \u201cUndo\u201d button switched off?',
    'Switch to 3D and choose \u201cFlatten\u201d. What happens to the cube?'
  ],
  build(ctx) {
    const S = { A: [[2, 1], [0, 1]], B: [[1, .5, 0], [0, 1, 0], [0, 0, 1.5]], t: 1, target: 1, x: [1, 1], mode: '2d' };
    const c2 = ctx.canvas(), c3 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-6, 6], y: [-4.5, 4.5], snap: .25 }));
    const s3 = ctx.own(new Scene3D(c3, { range: 3, yaw: -.7, pitch: .4 }));
    const reset = resetViewBtn(ctx, s3);
    const cur = () => M2.lerp(M2.I(), S.A, S.t), cur3 = () => M3.lerp(M3.I(), S.B, S.t);
    const ready = () => S.t === 1;
    p.addHandle({ get: () => { const M = cur(); return [M[0][0], M[1][0]]; }, set: (x, y) => { S.A[0][0] = x; S.A[1][0] = y; }, color: 'blue', enabled: ready, limit: .66 });
    p.addHandle({ get: () => { const M = cur(); return [M[0][1], M[1][1]]; }, set: (x, y) => { S.A[0][1] = x; S.A[1][1] = y; }, color: 'green', enabled: ready, limit: .66 });
    p.addHandle({ get: () => S.x, set: (x, y) => { S.x = [x, y]; }, color: 'ink', limit: .66 });
    p.onDrag = () => { syncA(); presets.set(''); readout(); };

    p.onDraw = q => {
      q.grid();
      const M = cur();
      drawTransformedGrid(q, M);
      q.poly([[0, 0], [1, 0], [1, 1], [0, 1]], { stroke: rgba(TH.ink, .5), width: 1.5, dash: [4, 4] });
      q.poly([[0, 0], [1, 0], [1, 1], [0, 1]].map(v => M2.apply(M, v)), { fill: rgba(TH.earth, .26), stroke: TH.earth, width: 2 });
      const Ax = M2.apply(M, S.x);
      q.arrow(0, 0, S.x[0], S.x[1], { color: TH.ink, alpha: .55, width: 2.4, head: 10, dash: [5, 5] });
      q.arrow(0, 0, Ax[0], Ax[1], { color: TH.orange, width: 3.4, label: 'Ax' });
      q.arrow(0, 0, M[0][0], M[1][0], { color: TH.blue, width: 4, label: "i\u2032" });
      q.arrow(0, 0, M[0][1], M[1][1], { color: TH.green, width: 4, label: "j\u2032" });
    };
    s3.onDraw = s => {
      s.axes();
      const M = cur3(), a = M3.col(M, 0), b = M3.col(M, 1), c = M3.col(M, 2);
      s.para([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], { edge: TH.stone, dash: [4, 5], width: 1.2, edgeAlpha: .9 });
      s.para([0, 0, 0], a, b, c, { fill: rgba(TH.blue, .13), edge: TH.blue, width: 1.7 });
      s.arrow([0, 0, 0], a, { color: TH.blue, width: 3.6, label: "i\u2032" });
      s.arrow([0, 0, 0], b, { color: TH.green, width: 3.6, label: "j\u2032" });
      s.arrow([0, 0, 0], c, { color: TH.violet, width: 3.6, label: "k\u2032" });
    };

    /* animation */
    let stop = () => { };
    const animateTo = v => { stop(); const f = S.t; stop = ctx.tween(850, e => { S.t = lerp(f, v, e); (S.mode === '2d' ? p : s3).render(); }, () => { S.t = v; updateBtn(); (S.mode === '2d' ? p : s3).render(); }); };
    const btn = h('<button type="button" class="btn sm"></button>');
    const isSing = () => S.mode === '2d' ? Math.abs(M2.det(S.A)) < .005 : Math.abs(M3.det(S.B)) < .005;
    function updateBtn() {
      if (S.mode === '2d') {
        btn.innerHTML = S.target === 1 ? 'Undo with A<sup>\u22121</sup>' : 'Re-apply A';
        btn.disabled = S.target === 1 && isSing();
      } else {
        btn.innerHTML = S.target === 1 ? 'Play back to identity' : 'Play from identity';
        btn.disabled = false;
      }
    }
    btn.addEventListener('click', () => { S.target = S.target === 1 ? 0 : 1; updateBtn(); animateTo(S.target); });
    const interrupt = () => { stop(); S.t = 1; S.target = 1; updateBtn(); };

    /* 2D controls */
    const names = ['<span>a<sub>11</sub></span>', 'a<sub>12</sub>', 'a<sub>21</sub>', 'a<sub>22</sub>'];
    const sl = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([i, j], k) => Slider({
      name: names[k], color: j === 0 ? 'var(--blue)' : 'var(--green)', min: -3, max: 3, step: .1, value: S.A[i][j],
      onInput: v => { S.A[i][j] = v; interrupt(); presets.set(''); readout(); p.render(); }
    }));
    const syncA = () => { [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([i, j], k) => sl[k].set(S.A[i][j])); updateBtn(); };
    const goA = A2 => { interrupt(); const f = M2.copy(S.A); ctx.tween(650, e => { S.A = M2.lerp(f, A2, e); syncA(); readout(); p.render(); }); };
    const presets = Seg([{ id: 'shear', label: 'Shear' }, { id: 'rot45', label: 'Rotate 45\u00b0' }, { id: 'scale', label: 'Scale 2\u00d7' }, { id: 'reflect', label: 'Reflection' }, { id: 'singular', label: 'Singular' }], '', id => goA(PRESETS2[id]), 'chips');
    const snap = Check('Snap handles to grid', true, v => { p.snap = v ? .25 : 0; });
    const stats2 = box('stats'), mats2 = box('');
    const sec2a = sec('Presets', presets.el), sec2b = sec('Matrix A', sl[0].el, sl[1].el, sl[2].el, sl[3].el, snap.el);
    const sec2c = sec('Readout', mats2, stats2);

    /* 3D controls */
    const mi = MatrixInput(3, S.B, (i, j, v) => { S.B[i][j] = v; interrupt(); presets3.set(''); readout(); s3.render(); });
    const P3 = {
      identity: M3.I(), stretch: [[1, 0, 0], [0, 1, 0], [0, 0, 2]], shear: [[1, .6, 0], [0, 1, 0], [0, 0, 1.5]],
      rotz: [[Math.SQRT1_2, -Math.SQRT1_2, 0], [Math.SQRT1_2, Math.SQRT1_2, 0], [0, 0, 1]],
      flatten: [[1, 0, 0], [0, 1, 0], [0, 0, 0]], mirror: [[1, 0, 0], [0, 1, 0], [0, 0, -1]]
    };
    const goB = B2 => { interrupt(); const f = M3.copy(S.B); ctx.tween(650, e => { S.B = M3.lerp(f, B2, e); mi.set(S.B); readout(); s3.render(); }); };
    const presets3 = Seg([{ id: 'stretch', label: 'Stretch z' }, { id: 'shear', label: 'Shear' }, { id: 'rotz', label: 'Rotate z 45\u00b0' }, { id: 'flatten', label: 'Flatten' }, { id: 'mirror', label: 'Mirror z' }], '', id => goB(P3[id]), 'chips');
    const stats3 = box('stats');
    const sec3a = sec('Presets', presets3.el), sec3b = sec('Matrix A (type numbers)', mi.el, h('<p class="note">Columns are where i, j and k land. Drag the scene to rotate it.</p>'));
    const sec3c = sec('Readout', stats3);
    const btnSec = sec('', btn);
    ctx.panel.append(sec2a, sec2b, sec3a, sec3b, btnSec, sec2c, sec3c);

    function readout() {
      if (S.mode === '2d') {
        const A = S.A, d = M2.det(A), inv = M2.inv(A), Ax = M2.apply(A, S.x);
        mats2.innerHTML = '<div class="eq"><span class="lab2">A</span>' + matHTML(A) + '<span class="lab2">A<sup>\u22121</sup></span>' + (inv ? matHTML(inv, 2) : '<span style="color:var(--muted)">none</span>') + '</div>' +
          '<div class="eq" style="margin-top:8px"><span class="lab2">Ax</span>' + matHTML(A) + vecHTML(S.x) + '=' + vecHTML(Ax, 2) + '</div>';
        stats2.innerHTML = '<div class="stat"><span>Determinant</span><b>' + detBadge(d, ', flips') + '</b></div>' +
          '<div class="stat"><span>Area scale |det|</span><b>' + num(Math.abs(d), 2) + '</b></div>';
      } else {
        const d = M3.det(S.B);
        stats3.innerHTML = '<div class="stat"><span>Determinant</span><b>' + detBadge(d, ', flips') + '</b></div>' +
          '<div class="stat"><span>Volume scale |det|</span><b>' + num(Math.abs(d), 2) + '</b></div>' +
          '<div class="stat"><span>Inverse exists</span><b>' + (Math.abs(d) < .005 ? 'no' : 'yes') + '</b></div>';
      }
    }
    function setMode(m) {
      stop(); S.t = 1; S.target = 1; S.mode = m;
      c2.hidden = m !== '2d'; c3.hidden = m !== '3d'; reset.hidden = m !== '3d';
      [sec2a, sec2b, sec2c].forEach(x => x.hidden = m !== '2d'); [sec3a, sec3b, sec3c].forEach(x => x.hidden = m !== '3d');
      ctx.note(m === '2d' ? 'Blue and green tips are the columns of A' : 'Dashed cube: before. Blue cube: after');
      ctx.hint(m === '2d' ? 'Drag the blue and green arrow tips, or the x handle.' : 'Edit the matrix and watch the cube change.');
      updateBtn(); readout(); (m === '2d' ? p : s3).render();
    }
    dimToggle(ctx, '2d', setMode);
    setMode('2d');
  }
});
