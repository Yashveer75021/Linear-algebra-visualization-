/* Lesson 3: span */
/* ---------------- 3. Linear combinations and span ---------------- */
TOPICS.push({
  id: 'span', cat: 'vec', dims: ['2D', '3D'],
  title: 'Linear combinations and span',
  short: 'Which points can you reach with two or three vectors?',
  lede: 'A linear combination is c\u2081u + c\u2082v: stretch each vector, then add. The span is every point you can reach by changing c\u2081 and c\u2082.',
  ideas: [
    ['Two independent vectors reach the whole plane.', 'Each dot in the picture is one choice of c\u2081 and c\u2082. They fill the plane evenly.'],
    ['Parallel vectors only reach a line.', 'If v lies along u, the second vector adds no new direction, so the span collapses to a line.'],
    ['In 3D, two vectors make a plane.', 'A third vector fills all of 3D only if it points out of that plane.']
  ],
  tries: [
    'Press \u201cReach the target\u201d and read off c\u2081 and c\u2082.',
    'Drag v onto the line through u. Can you still reach the orange target?',
    'In 3D, press \u201cPut w in the plane\u201d, then raise w\u2082. What changes?'
  ],
  build(ctx) {
    const S = { u: [2, 1], v: [-1, 2], t: [3, 4], c1: 1, c2: 1, mode: '2d', w: [1, 1, 3] };
    const U3 = [2.5, .5, 0], V3 = [0, 2.5, 1];
    const c2 = ctx.canvas(), c3 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-8, 8], y: [-6, 6], snap: .5 }));
    const s3 = ctx.own(new Scene3D(c3, { range: 4 }));
    const reset = resetViewBtn(ctx, s3);
    p.addHandle({ get: () => S.u, set: (x, y) => { S.u = [x, y]; }, color: 'blue' });
    p.addHandle({ get: () => S.v, set: (x, y) => { S.v = [x, y]; }, color: 'green' });
    p.addHandle({ get: () => S.t, set: (x, y) => { S.t = [x, y]; }, color: 'orange' });
    p.onDrag = () => { readout(); };

    const det2 = () => S.u[0] * S.v[1] - S.u[1] * S.v[0];
    p.onDraw = q => {
      q.grid();
      const [ux, uy] = S.u, [vx, vy] = S.v, dep = Math.abs(det2()) < .05;
      for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
        const x = i * ux + j * vx, y = i * uy + j * vy;
        if (x > -8.2 && x < 8.2 && y > -6.2 && y < 6.2) q.dot(x, y, { r: 2.6, color: TH.stone, alpha: .55 });
      }
      if (dep) {
        const d = Math.hypot(ux, uy) > .05 ? S.u : S.v, L = Math.hypot(d[0], d[1]);
        if (L > .05) q.line(-d[0] / L * 14, -d[1] / L * 14, d[0] / L * 14, d[1] / L * 14, { color: TH.orange, width: 2, alpha: .45, dash: [8, 6] });
      }
      const a = [S.c1 * ux, S.c1 * uy], P = [a[0] + S.c2 * vx, a[1] + S.c2 * vy];
      q.line(0, 0, S.c2 * vx, S.c2 * vy, { color: TH.green, dash: [5, 6], alpha: .4, width: 2 });
      q.line(S.c2 * vx, S.c2 * vy, P[0], P[1], { color: TH.blue, dash: [5, 6], alpha: .4, width: 2 });
      q.arrow(0, 0, ux, uy, { color: TH.blue, width: 2, alpha: .45, head: 9 });
      q.arrow(0, 0, vx, vy, { color: TH.green, width: 2, alpha: .45, head: 9 });
      q.arrow(0, 0, a[0], a[1], { color: TH.blue, width: 3.8 });
      q.arrow(a[0], a[1], P[0], P[1], { color: TH.green, width: 3.8 });
      q.dot(P[0], P[1], { r: 7, color: TH.ink, ring: TH.surface });
      q.text('u', ux, uy, { dx: 0, dy: -18, color: TH.blue }); q.text('v', vx, vy, { dx: 0, dy: -18, color: TH.green });
    };

    /* 3D */
    s3.onDraw = s => {
      s.axes();
      const k = 1.2, pt = (a, b) => [a * U3[0] + b * V3[0], a * U3[1] + b * V3[1], a * U3[2] + b * V3[2]];
      const inPlane = Math.abs(M3.det([U3, V3, S.w].map((r, i) => r))) < .12;
      s.poly([pt(-k, -k), pt(k, -k), pt(k, k), pt(-k, k)], { fill: rgba(inPlane ? TH.green : TH.blue, .16), stroke: rgba(TH.blue, .6), width: 1.4 });
      for (let a = -k; a <= k + .01; a += .4) {
        s.line(pt(a, -k), pt(a, k), { color: TH.blue, alpha: .3, width: 1, layer: 1.2 });
        s.line(pt(-k, a), pt(k, a), { color: TH.blue, alpha: .3, width: 1, layer: 1.2 });
      }
      s.arrow([0, 0, 0], U3, { color: TH.blue, width: 3.4, label: 'u' });
      s.arrow([0, 0, 0], V3, { color: TH.green, width: 3.4, label: 'v' });
      s.arrow([0, 0, 0], S.w, { color: TH.orange, width: 4, label: 'w' });
      if (inPlane) s.dot(S.w, { r: 6, color: TH.green, ring: TH.surface });
    };
    const trip = () => dot3(U3, cross3(V3, S.w));

    /* controls: 2D */
    const sC1 = Slider({ name: 'c\u2081', color: 'var(--blue)', min: -6, max: 6, step: .1, value: S.c1, onInput: v => { S.c1 = v; readout(); p.render(); } });
    const sC2 = Slider({ name: 'c\u2082', color: 'var(--green)', min: -6, max: 6, step: .1, value: S.c2, onInput: v => { S.c2 = v; readout(); p.render(); } });
    const reach = h('<button type="button" class="btn sm">Reach the target</button>');
    const msg = h('<p class="note"></p>');
    reach.addEventListener('click', () => {
      const [a, b] = S.u, [c, d] = S.v, D = a * d - b * c;
      let n1, n2;
      if (Math.abs(D) < .05) {
        const uu = a * a + b * b || 1; n1 = (S.t[0] * a + S.t[1] * b) / uu; n2 = 0;
        msg.textContent = 'u and v are parallel, so you can only reach points on one line. This is the closest point.';
      } else {
        n1 = (S.t[0] * d - c * S.t[1]) / D; n2 = (a * S.t[1] - b * S.t[0]) / D;
        msg.textContent = 'Solved with the determinant: c\u2081 = ' + num(n1, 2) + ' and c\u2082 = ' + num(n2, 2) + '.';
        if (Math.abs(n1) > 6 || Math.abs(n2) > 6) msg.textContent += ' That is beyond the slider range, so this is as close as the sliders go.';
      }
      n1 = clamp(n1, -6, 6); n2 = clamp(n2, -6, 6);
      const s1 = S.c1, s2 = S.c2;
      ctx.tween(700, e => { S.c1 = lerp(s1, n1, e); S.c2 = lerp(s2, n2, e); sC1.set(S.c1); sC2.set(S.c2); readout(); p.render(); });
    });
    const secComb = sec('Mix the vectors', sC1.el, sC2.el, reach, msg);
    reach.style.marginTop = '8px';
    const snap = Check('Snap handles to grid', true, v => { p.snap = v ? .5 : 0; });
    const st2 = box('stats'), f2 = box('formula');
    const sec2 = sec('Readout', f2, st2);
    /* controls: 3D */
    const sW = ['x', 'y', 'z'].map((n, i) => Slider({ name: 'w' + ['\u2081', '\u2082', '\u2083'][i], color: 'var(--orange)', min: -4, max: 4, step: .1, value: S.w[i], onInput: v => { S.w[i] = v; readout(); s3.render(); } }));
    const bIn = h('<button type="button" class="btn sm ghost">Put w in the plane</button>');
    const bOut = h('<button type="button" class="btn sm ghost">Lift w out of the plane</button>');
    const move = to => { const from = S.w.slice(); ctx.tween(600, e => { S.w = from.map((q, i) => lerp(q, to[i], e)); sW.forEach((s, i) => s.set(S.w[i])); readout(); s3.render(); }); };
    bIn.addEventListener('click', () => move([.6 * U3[0] + .7 * V3[0], .6 * U3[1] + .7 * V3[1], .6 * U3[2] + .7 * V3[2]]));
    bOut.addEventListener('click', () => move([1, 1, 3]));
    const row3 = box('row'); row3.append(bIn, bOut);
    const secW = sec('Choose w', sW[0].el, sW[1].el, sW[2].el, row3);
    const st3 = box('stats'), f3 = box('formula');
    const sec3 = sec('Readout', f3, st3);
    ctx.panel.append(secComb, sec('', snap.el), sec2, secW, sec3);

    function readout() {
      if (S.mode === '2d') {
        const [ux, uy] = S.u, [vx, vy] = S.v, D = det2(), P = [S.c1 * ux + S.c2 * vx, S.c1 * uy + S.c2 * vy];
        f2.innerHTML = '<span class="big">c\u2081u + c\u2082v</span> = ' + num(S.c1) + '\u00b7' + vecHTML(S.u) + ' + ' + num(S.c2) + '\u00b7' + vecHTML(S.v) + ' = ' + vecHTML(P);
        const hit = Math.hypot(P[0] - S.t[0], P[1] - S.t[1]) < .06;
        st2.innerHTML = '<div class="stat"><span>Target</span><b>' + vecHTML(S.t) + '</b></div>' +
          '<div class="stat"><span>Distance to target</span><b>' + num(Math.hypot(P[0] - S.t[0], P[1] - S.t[1]), 2) + '</b></div>' +
          '<div class="stat"><span>Span of u and v</span><b>' + (Math.abs(D) < .05 ? '<span class="badge warn">a line</span>' : '<span class="badge">the whole plane</span>') + '</b></div>' +
          (hit ? '<div class="stat"><span>Status</span><b><span class="badge">Target reached</span></b></div>' : '');
      } else {
        const T = trip();
        f3.innerHTML = '<span class="big">det[u v w]</span> = u \u00b7 (v \u00d7 w) = ' + num(T, 2);
        st3.innerHTML = '<div class="stat"><span>Span of u, v, w</span><b>' + (Math.abs(T) < .12 ? '<span class="badge warn">only a plane</span>' : '<span class="badge">all of 3D</span>') + '</b></div>' +
          '<p class="note">' + (Math.abs(T) < .12 ? 'w lies in the plane of u and v, so it adds no new direction.' : 'w points out of the plane, so u, v and w together reach every point in 3D.') + '</p>';
      }
    }
    function setMode(m) {
      S.mode = m; c2.hidden = m !== '2d'; c3.hidden = m !== '3d';
      secComb.hidden = sec2.hidden = m !== '2d'; snap.el.parentElement.hidden = m !== '2d';
      secW.hidden = sec3.hidden = m !== '3d'; reset.hidden = m !== '3d';
      ctx.note(m === '2d' ? 'Gray dots: every combination with whole numbers' : 'The blue sheet is the span of u and v');
      ctx.hint(m === '2d' ? 'Drag u, v and the orange target. Use c\u2081 and c\u2082 to reach it.' : 'Move w with the sliders. Drag the scene to rotate it.');
      readout(); (m === '2d' ? p : s3).render();
    }
    dimToggle(ctx, '2d', setMode);
    setMode('2d');
  }
});
