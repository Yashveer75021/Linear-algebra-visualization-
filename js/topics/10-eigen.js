/* Lesson 10: eigen */
/* ---------------- 10. Eigenvectors and eigenvalues ---------------- */
function eigen(A) {
  const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1], tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det;
  const vec = l => {
    const r1 = [b, l - a], r2 = [d - l, -c], n1 = Math.hypot(r1[0], r1[1]), n2 = Math.hypot(r2[0], r2[1]), n = Math.max(n1, n2), r = n1 >= n2 ? r1 : r2;
    return n < 1e-6 ? null : [r[0] / n, r[1] / n];
  };
  if (disc > 1e-9) { const s = Math.sqrt(disc), l1 = tr / 2 + s, l2 = tr / 2 - s; return { type: 'real', tr, det, vals: [l1, l2], vecs: [vec(l1), vec(l2)] }; }
  if (disc > -1e-9) { const l = tr / 2, v = vec(l); return { type: v ? 'repeated' : 'scalar', tr, det, vals: [l, l], vecs: v ? [v] : [] }; }
  return { type: 'complex', tr, det, re: tr / 2, im: Math.sqrt(-disc), vals: [], vecs: [] };
}
TOPICS.push({
  id: 'eigen', cat: 'mat', dims: ['2D'],
  title: 'Eigenvectors and eigenvalues',
  short: 'The directions a matrix only stretches.',
  lede: 'Most vectors turn when a matrix acts on them. Eigenvectors are the special directions that only get stretched or flipped. The eigenvalue is the stretch factor.',
  ideas: [
    ['Ax = \u03bbx.', 'Along an eigenvector, the matrix acts like a plain number \u03bb. The blue arrow x and the orange arrow Ax line up.'],
    ['The circle becomes an ellipse.', 'The orange curve is where every unit vector lands. Eigenvectors sit along the axes of that ellipse when the matrix is symmetric.'],
    ['Rotations have none.', 'If a matrix turns every direction, no real vector keeps its direction, and the eigenvalues are complex.']
  ],
  tries: [
    'Press \u201cSpin x\u201d with the Symmetric preset. When do x and Ax line up?',
    'Choose \u201cRotation\u201d. Do x and Ax ever line up?',
    'Choose \u201cShear\u201d. How many eigenvector directions can you find?'
  ],
  build(ctx) {
    const S = { A: [[2, 1], [1, 2]], th: rad(25), spin: false };
    const c2 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-6, 6], y: [-4.5, 4.5] }));
    p.addHandle({ get: () => [Math.cos(S.th), Math.sin(S.th)], set: (x, y) => { S.th = Math.atan2(y, x); }, color: 'blue', limit: 1 });
    p.onDrag = () => { syncTh(); readout(); };
    const aligned = () => { const x = [Math.cos(S.th), Math.sin(S.th)], Ax = M2.apply(S.A, x), L = Math.hypot(Ax[0], Ax[1]); return L > 1e-6 && Math.abs(x[0] * Ax[1] - x[1] * Ax[0]) / L < .045; };
    p.onDraw = q => {
      q.grid();
      const E = eigen(S.A), pts = [];
      for (let k = 0; k <= 120; k++) { const f = k / 120 * TAU, v = M2.apply(S.A, [Math.cos(f), Math.sin(f)]); pts.push(v); }
      q.arc(0, 0, 1, 0, TAU, { color: TH.ink, width: 1.4, alpha: .4 });
      q.poly(pts, { stroke: rgba(TH.orange, .55), width: 2.2 });
      E.vecs.forEach((v, i) => {
        q.line(-v[0] * 14, -v[1] * 14, v[0] * 14, v[1] * 14, { color: TH.green, width: 2, alpha: .6, dash: [8, 6] });
        q.text('\u03bb = ' + num(E.vals[i], 2), v[0] * 3.9, v[1] * 3.9, { color: TH.green, size: 13, dy: -14 });
      });
      const x = [Math.cos(S.th), Math.sin(S.th)], Ax = M2.apply(S.A, x);
      if (aligned()) q.dot(Ax[0], Ax[1], { r: 12, color: TH.green, alpha: .25 });
      q.arrow(0, 0, Ax[0], Ax[1], { color: TH.orange, width: 4, label: 'Ax' });
      q.arrow(0, 0, x[0], x[1], { color: TH.blue, width: 3.6, label: 'x' });
    };
    const names = ['a', 'b', 'c', 'd'];
    const sl = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([i, j], k) => Slider({
      name: names[k], min: -3, max: 3, step: .1, value: S.A[i][j],
      onInput: v => { S.A[i][j] = v; presets.set(''); readout(); p.render(); }
    }));
    const syncA = () => [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([i, j], k) => sl[k].set(S.A[i][j]));
    const sTh = Slider({ name: '\u03b8', color: 'var(--blue)', min: 0, max: 360, step: 1, value: Math.round(deg(S.th)), fmt: v => Math.round(v) + '\u00b0', onInput: v => { S.th = rad(v); readout(); p.render(); } });
    const syncTh = () => sTh.set(((Math.round(deg(S.th)) % 360) + 360) % 360);
    const P = { stretch: [[2, 0], [0, .5]], sym: [[2, 1], [1, 2]], shear: [[1, 1], [0, 1]], rot: [[.5, -Math.sqrt(3) / 2], [Math.sqrt(3) / 2, .5]], mirror: [[1, 0], [0, -1]] };
    const goA = A2 => { const f = M2.copy(S.A); ctx.tween(650, e => { S.A = M2.lerp(f, A2, e); syncA(); readout(); p.render(); }); };
    const presets = Seg([{ id: 'sym', label: 'Symmetric' }, { id: 'stretch', label: 'Stretch' }, { id: 'shear', label: 'Shear' }, { id: 'rot', label: 'Rotation' }, { id: 'mirror', label: 'Mirror' }], 'sym', id => goA(P[id]), 'chips');
    /* spin */
    let raf = 0, last = 0;
    const loop = ts => { if (!S.spin) { raf = 0; return; } const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; S.th += dt * .6; syncTh(); readout(); p.render(); raf = requestAnimationFrame(loop); };
    ctx.cleanup(() => { S.spin = false; cancelAnimationFrame(raf); });
    const spin = h('<button type="button" class="btn sm">Spin x</button>');
    spin.addEventListener('click', () => { S.spin = !S.spin; spin.textContent = S.spin ? 'Stop spinning' : 'Spin x'; if (S.spin) { last = 0; raf = requestAnimationFrame(loop); } });
    const stats = box('stats'), formula = box('formula'), evs = box('stats');
    ctx.panel.append(sec('Presets', presets.el), sec('Matrix A', sl[0].el, sl[1].el, sl[2].el, sl[3].el),
      sec('Direction of x', sTh.el, (() => { const r = box('row'); r.append(spin); return r; })()), sec('Readout', stats), sec('Eigenvalues', formula, evs));
    function readout() {
      const x = [Math.cos(S.th), Math.sin(S.th)], Ax = M2.apply(S.A, x), L = Math.hypot(Ax[0], Ax[1]), E = eigen(S.A);
      stats.innerHTML = '<div class="stat"><span>x</span><b>' + vecHTML(x, 2) + '</b></div><div class="stat"><span>Ax</span><b>' + vecHTML(Ax, 2) + '</b></div>' +
        '<div class="stat"><span>Stretch |Ax| / |x|</span><b>' + num(L, 2) + '</b></div>' +
        '<div class="stat"><span>Same direction?</span><b>' + (aligned() ? '<span class="badge">eigenvector</span>' : '<span class="badge warn">turned</span>') + '</b></div>';
      formula.innerHTML = 'det(A \u2212 \u03bbI) = \u03bb\u00b2 \u2212 ' + num(E.tr, 2) + '\u03bb + ' + num(E.det, 2) + ' = 0';
      if (E.type === 'real') evs.innerHTML = E.vals.map((l, i) => '<div class="stat"><span>\u03bb' + (i ? '\u2082' : '\u2081') + ' = ' + num(l, 2) + '</span><b>' + vecHTML(E.vecs[i], 2) + '</b></div>').join('');
      else if (E.type === 'repeated') evs.innerHTML = '<div class="stat"><span>\u03bb = ' + num(E.vals[0], 2) + ' (twice)</span><b>' + vecHTML(E.vecs[0], 2) + '</b></div><p class="note">Only one direction survives, so the dashed line appears once.</p>';
      else if (E.type === 'scalar') evs.innerHTML = '<div class="stat"><span>\u03bb = ' + num(E.vals[0], 2) + '</span><b>every vector</b></div><p class="note">This matrix only scales, so every direction is an eigenvector.</p>';
      else evs.innerHTML = '<div class="stat"><span>\u03bb</span><b>' + num(E.re, 2) + ' \u00b1 ' + num(E.im, 2) + 'i</b></div><p class="note">The eigenvalues are complex. This matrix turns every direction, so there are no real eigenvectors.</p>';
    }
    ctx.note('Orange curve: where the unit circle lands'); ctx.hint('Drag the blue arrow around the circle, or press Spin x.');
    readout(); p.render();
  }
});
