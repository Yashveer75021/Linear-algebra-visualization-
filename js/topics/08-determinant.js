/* Lesson 8: determinant */
/* ---------------- 8. Determinant and inverse ---------------- */
TOPICS.push({
  id: 'determinant', cat: 'mat', dims: ['2D', '3D'],
  title: 'Determinant and inverse',
  short: 'How much a matrix scales area, and when you can undo it.',
  lede: 'The determinant is the signed area (or volume in 3D) of the shape the columns of a matrix make. It tells you how much the matrix scales space.',
  ideas: [
    ['Area scale.', 'The unit square becomes a parallelogram. Its area is |det|, so det = 3 means every shape grows three times in area.'],
    ['The sign is orientation.', 'A negative determinant means the matrix flips space, like looking in a mirror.'],
    ['Zero means no way back.', 'When the columns line up, the shape collapses to a line, and the inverse matrix does not exist.']
  ],
  tries: [
    'Drag the green tip across the blue arrow. Watch the sign of the determinant change.',
    'Choose \u201cSquash\u201d. What is the area, and does an inverse exist?',
    'In 3D, choose \u201cFlatten\u201d. What is the volume of the box?'
  ],
  build(ctx) {
    const S = { u: [2, 1], v: [-.5, 1.5], M: [[1.5, 0, 0], [.5, 1.5, 0], [0, 0, 1.2]], mode: '2d' };
    const c2 = ctx.canvas(), c3 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-6, 6], y: [-4.5, 4.5], snap: .5 }));
    const s3 = ctx.own(new Scene3D(c3, { range: 3, yaw: -.7, pitch: .4 }));
    const reset = resetViewBtn(ctx, s3);
    p.addHandle({ get: () => S.u, set: (x, y) => { S.u = [x, y]; }, color: 'blue' });
    p.addHandle({ get: () => S.v, set: (x, y) => { S.v = [x, y]; }, color: 'green' });
    p.onDrag = () => { sync(); chips2.set(''); readout(); };
    const col = d => d > .02 ? TH.green : d < -.02 ? TH.orange : TH.stone;
    p.onDraw = q => {
      q.grid();
      const [ux, uy] = S.u, [vx, vy] = S.v, d = ux * vy - vx * uy;
      q.poly([[0, 0], [1, 0], [1, 1], [0, 1]], { stroke: rgba(TH.ink, .5), width: 1.5, dash: [4, 4] });
      q.poly([[0, 0], [ux, uy], [ux + vx, uy + vy], [vx, vy]], { fill: Math.abs(d) < .02 ? null : rgba(col(d), .25), stroke: col(d), width: 2.4 });
      if (Math.abs(d) >= .02) q.text(num(d, 2), (ux + vx) / 2, (uy + vy) / 2, { size: 16, color: col(d) });
      const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
      if (lu > .3 && lv > .3) {
        const a0 = Math.atan2(uy, ux); let da = Math.atan2(vy, vx) - a0;
        while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        q.arc(0, 0, .55, a0, a0 + da, { color: TH.ink, width: 2, alpha: .65 });
      }
      q.arrow(0, 0, ux, uy, { color: TH.blue, label: "i\u2032" });
      q.arrow(0, 0, vx, vy, { color: TH.green, label: "j\u2032" });
    };
    s3.onDraw = s => {
      s.axes();
      const a = M3.col(S.M, 0), b = M3.col(S.M, 1), c = M3.col(S.M, 2), d = M3.det(S.M);
      s.para([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], { edge: TH.stone, dash: [4, 5], width: 1.2, edgeAlpha: .9 });
      s.para([0, 0, 0], a, b, c, { fill: Math.abs(d) < .02 ? null : rgba(col(d), .17), edge: col(d), width: 1.8 });
      s.arrow([0, 0, 0], a, { color: TH.blue, width: 3.4, label: "i\u2032" });
      s.arrow([0, 0, 0], b, { color: TH.green, width: 3.4, label: "j\u2032" });
      s.arrow([0, 0, 0], c, { color: TH.violet, width: 3.4, label: "k\u2032" });
    };
    /* 2D controls */
    const mk = (name, c, get, set) => Slider({ name, color: c, min: -4, max: 4, step: .5, value: get(), onInput: v => { set(v); chips2.set(''); readout(); p.render(); } });
    const sUx = mk('i\u2032<sub>x</sub>', 'var(--blue)', () => S.u[0], v => { S.u = [v, S.u[1]]; });
    const sUy = mk('i\u2032<sub>y</sub>', 'var(--blue)', () => S.u[1], v => { S.u = [S.u[0], v]; });
    const sVx = mk('j\u2032<sub>x</sub>', 'var(--green)', () => S.v[0], v => { S.v = [v, S.v[1]]; });
    const sVy = mk('j\u2032<sub>y</sub>', 'var(--green)', () => S.v[1], v => { S.v = [S.v[0], v]; });
    const sync = () => { sUx.set(S.u[0]); sUy.set(S.u[1]); sVx.set(S.v[0]); sVy.set(S.v[1]); };
    const go2 = (u, v) => { const fu = S.u.slice(), fv = S.v.slice(); ctx.tween(600, e => { S.u = [lerp(fu[0], u[0], e), lerp(fu[1], u[1], e)]; S.v = [lerp(fv[0], v[0], e), lerp(fv[1], v[1], e)]; sync(); readout(); p.render(); }); };
    const chips2 = Seg([{ id: 'id', label: 'Identity' }, { id: 'st', label: 'Stretch' }, { id: 'fl', label: 'Flip' }, { id: 'sq', label: 'Squash' }], '', id => {
      if (id === 'id') go2([1, 0], [0, 1]); if (id === 'st') go2([2, 0], [0, 1.5]); if (id === 'fl') go2([1, 0], [0, -1]); if (id === 'sq') go2([2, 1], [1, .5]);
    }, 'chips');
    const snap = Check('Snap handles to grid', true, v => { p.snap = v ? .5 : 0; });
    const f2 = box('formula'), st2 = box('stats');
    const secs2 = [sec('Presets', chips2.el), sec('Columns of the matrix', sUx.el, sUy.el, sVx.el, sVy.el, snap.el), sec('Readout', f2, st2)];
    /* 3D controls */
    const mi = MatrixInput(3, S.M, (i, j, v) => { S.M[i][j] = v; chips3.set(''); readout(); s3.render(); });
    const P3 = { id: M3.I(), st: [[2, 0, 0], [0, 1.5, 0], [0, 0, 1]], fl: [[1, 0, 0], [0, 1, 0], [0, 0, -1]], fa: [[1, 0, 1], [0, 1, 1], [0, 0, 0]] };
    const goM = Mt => { const f = M3.copy(S.M); ctx.tween(600, e => { S.M = M3.lerp(f, Mt, e); mi.set(S.M); readout(); s3.render(); }); };
    const chips3 = Seg([{ id: 'id', label: 'Identity' }, { id: 'st', label: 'Stretch' }, { id: 'fl', label: 'Flip z' }, { id: 'fa', label: 'Flatten' }], '', id => goM(P3[id]), 'chips');
    const f3 = box('formula'), st3 = box('stats');
    const secs3 = [sec('Presets', chips3.el), sec('Matrix (columns are the box edges)', mi.el), sec('Readout', f3, st3)];
    ctx.panel.append(...secs2, ...secs3);

    function readout() {
      if (S.mode === '2d') {
        const [a, c] = S.u, [b, d] = S.v, det = a * d - b * c, A = [[a, b], [c, d]], inv = M2.inv(A);
        f2.innerHTML = '<span class="big">det</span> ' + matHTML(A) + ' = ad \u2212 bc<br>= (' + num(a) + ')(' + num(d) + ') \u2212 (' + num(b) + ')(' + num(c) + ') = <span class="big">' + num(det, 2) + '</span>';
        st2.innerHTML = '<div class="stat"><span>Area of the parallelogram</span><b>' + num(Math.abs(det), 2) + '</b></div>' +
          '<div class="stat"><span>Orientation</span><b>' + (Math.abs(det) < .02 ? '<span class="badge bad">collapsed</span>' : det > 0 ? '<span class="badge">kept</span>' : '<span class="badge warn">flipped</span>') + '</b></div>' +
          '<div class="eq" style="margin-top:6px"><span class="lab2">A<sup>\u22121</sup></span>' + (inv ? matHTML(inv, 2) : '<span style="color:var(--muted)">does not exist</span>') + '</div>';
      } else {
        const M = S.M, d = M3.det(M);
        f3.innerHTML = '<span class="big">det</span> = a(ei \u2212 fh) \u2212 b(di \u2212 fg) + c(dh \u2212 eg)<br>= <span class="big">' + num(d, 2) + '</span>';
        st3.innerHTML = '<div class="stat"><span>Volume of the box</span><b>' + num(Math.abs(d), 2) + '</b></div>' +
          '<div class="stat"><span>Orientation</span><b>' + (Math.abs(d) < .02 ? '<span class="badge bad">collapsed</span>' : d > 0 ? '<span class="badge">kept</span>' : '<span class="badge warn">flipped</span>') + '</b></div>' +
          '<div class="stat"><span>Inverse exists</span><b>' + (Math.abs(d) < .02 ? 'no' : 'yes') + '</b></div>';
      }
    }
    function setMode(m) {
      S.mode = m; c2.hidden = m !== '2d'; c3.hidden = m !== '3d'; reset.hidden = m !== '3d';
      secs2.forEach(x => x.hidden = m !== '2d'); secs3.forEach(x => x.hidden = m !== '3d');
      ctx.note(m === '2d' ? 'Green: area kept orientation. Orange: flipped' : 'Dashed cube has volume 1');
      ctx.hint(m === '2d' ? 'Drag the blue and green tips and watch the area.' : 'Edit the matrix. The box is spanned by its columns.');
      readout(); (m === '2d' ? p : s3).render();
    }
    dimToggle(ctx, '2d', setMode);
    setMode('2d');
  }
});
