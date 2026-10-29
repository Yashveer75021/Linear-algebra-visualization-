/* Lesson 11: Span of the vector space and basis */
/* ---------------- 11. Span and Basis ---------------- */
TOPICS.push({
  id: 'basis', cat: 'vec', dims: ['2D', '3D'],
  title: 'Span and basis of a vector space',
  short: 'Which vectors cover the whole space — and the fewest that can?',
  lede: 'The span of a set of vectors is every point you can reach by taking linear combinations. A basis is the leanest spanning set: no vector is redundant and together they reach every point in the space.',
  ideas: [
    ['A basis spans and is independent.', 'Two vectors form a basis for ℝ² if and only if they are not parallel. Any third vector in ℝ² is then a linear combination of them.'],
    ['Coordinates depend on the basis.', 'The same point has different coordinates in the standard basis {e₁, e₂} and in a custom basis {b₁, b₂}. Drag the basis vectors to see the grid warp.'],
    ['Dimension = number of basis vectors.', 'You always need exactly two independent vectors to cover ℝ², exactly three to cover ℝ³. That count is the dimension of the space.'],
    ['In 3D, three vectors either span ℝ³ or collapse.', 'If the third vector lies in the plane of the first two, the triple is dependent and spans only a plane, not all of ℝ³.']
  ],
  tries: [
    'Drag b\u2081 and b\u2082 until they are parallel. What happens to the grid?',
    'Press \u201cFind coordinates\u201d and drag the target point. Read off the basis coordinates.',
    'In 3D, press \u201cPut b\u2083 in the plane\u201d. Does the set still span ℝ³?',
    'Switch to 3D and drag the scene to see the spanning plane from different angles.'
  ],
  build(ctx) {
    /* ---- shared state ---- */
    const S = {
      b1: [2, 0], b2: [0, 2],          // 2D basis vectors
      target: [3, 2],                    // 2D target point
      mode: '2d',
      // 3D basis vectors
      b1_3: [2.5, 0, 0], b2_3: [0, 2.5, 0], b3_3: [0, 0, 2.5]
    };

    /* ---- canvases ---- */
    const c2 = ctx.canvas(), c3 = ctx.canvas();
    const p  = ctx.own(new Plot2D(c2, { x: [-8, 8], y: [-6, 6], snap: .5 }));
    const s3 = ctx.own(new Scene3D(c3, { range: 4 }));
    resetViewBtn(ctx, s3);

    /* ---- helpers ---- */
    const det2 = () => S.b1[0] * S.b2[1] - S.b1[1] * S.b2[0];
    const isDependent2 = () => Math.abs(det2()) < 0.08;

    // Solve target = α·b1 + β·b2  (Cramer's rule)
    function basisCoords(tgt) {
      const D = det2();
      if (Math.abs(D) < 0.05) return null;
      const alpha = (tgt[0] * S.b2[1] - tgt[1] * S.b2[0]) / D;
      const beta  = (S.b1[0] * tgt[1] - S.b1[1] * tgt[0]) / D;
      return [alpha, beta];
    }

    /* ---- 2D handles ---- */
    p.addHandle({ get: () => S.b1,     set: (x, y) => { S.b1 = [x, y]; readout2D(); }, color: 'blue' });
    p.addHandle({ get: () => S.b2,     set: (x, y) => { S.b2 = [x, y]; readout2D(); }, color: 'green' });
    p.addHandle({ get: () => S.target, set: (x, y) => { S.target = [x, y]; readout2D(); }, color: 'orange' });
    p.onDrag = () => readout2D();

    /* ---- 2D draw ---- */
    p.onDraw = q => {
      q.grid();
      const [b1x, b1y] = S.b1, [b2x, b2y] = S.b2;
      const dep = isDependent2();

      /* ---- shaded basis parallelogram ---- */
      if (!dep) {
        q.poly([[0, 0], [b1x, b1y], [b1x + b2x, b1y + b2y], [b2x, b2y]],
          { fill: rgba(TH.blue, .08), stroke: rgba(TH.blue, .25), width: 1 });
      }

      /* ---- basis grid lines ---- */
      const N = 6;
      for (let i = -N; i <= N; i++) {
        const ax = i * b1x, ay = i * b1y;
        const bx = i * b2x, by = i * b2y;
        if (!dep) {
          q.line(ax - N * b2x, ay - N * b2y, ax + N * b2x, ay + N * b2y,
            { color: TH.green, alpha: .18, width: 1 });
          q.line(bx - N * b1x, by - N * b1y, bx + N * b1x, by + N * b1y,
            { color: TH.blue,  alpha: .18, width: 1 });
        }
      }

      /* ---- degenerate span: show the line ---- */
      if (dep) {
        const L = Math.hypot(b1x, b1y) > .05 ? S.b1 : S.b2;
        const n = Math.hypot(L[0], L[1]);
        if (n > .05)
          q.line(-L[0] / n * 14, -L[1] / n * 14, L[0] / n * 14, L[1] / n * 14,
            { color: TH.orange, width: 2.5, alpha: .6, dash: [10, 7] });
      }

      /* ---- draw coordinates of target ---- */
      const coords = basisCoords(S.target);
      if (coords && !dep) {
        const [a, b] = coords;
        // parallelogram walk: a·b1 then b·b2
        const mid = [a * b1x, a * b1y];
        q.line(0, 0, mid[0], mid[1],
          { color: TH.blue, dash: [6, 5], alpha: .5, width: 1.8 });
        q.line(mid[0], mid[1], S.target[0], S.target[1],
          { color: TH.green, dash: [6, 5], alpha: .5, width: 1.8 });
      }

      /* ---- basis vectors ---- */
      q.arrow(0, 0, b1x, b1y, { color: TH.blue,  width: 3.4 });
      q.arrow(0, 0, b2x, b2y, { color: TH.green, width: 3.4 });
      q.text('b\u2081', b1x, b1y, { dx: 0, dy: -18, color: TH.blue });
      q.text('b\u2082', b2x, b2y, { dx: 0, dy: -18, color: TH.green });

      /* ---- target point ---- */
      q.dot(S.target[0], S.target[1], { r: 7, color: TH.orange, ring: TH.surface });
      q.text('t', S.target[0], S.target[1], { dx: 10, dy: -10, color: TH.orange });
    };

    /* ---- 3D draw ---- */
    s3.onDraw = s => {
      s.axes();
      const [u, v, w] = [S.b1_3, S.b2_3, S.b3_3];

      /* span plane of b1 & b2 */
      const k = 1.3;
      const pt = (a, b) => [a * u[0] + b * v[0], a * u[1] + b * v[1], a * u[2] + b * v[2]];
      const triple = dot3(u, cross3(v, w));
      const dep3 = Math.abs(triple) < 0.15;

      s.poly([pt(-k, -k), pt(k, -k), pt(k, k), pt(-k, k)],
        { fill: rgba(dep3 ? TH.orange : TH.blue, .14),
          stroke: rgba(TH.blue, .55), width: 1.4 });

      /* grid lines on the plane */
      for (let a = -k; a <= k + .01; a += .42) {
        s.line(pt(a, -k), pt(a, k),  { color: TH.blue,  alpha: .28, width: 1, layer: 1.2 });
        s.line(pt(-k, a), pt(k, a),  { color: TH.green, alpha: .28, width: 1, layer: 1.2 });
      }

      s.arrow([0, 0, 0], u, { color: TH.blue,   width: 3.4, label: 'b\u2081' });
      s.arrow([0, 0, 0], v, { color: TH.green,  width: 3.4, label: 'b\u2082' });
      s.arrow([0, 0, 0], w, { color: TH.orange, width: 4,   label: 'b\u2083' });

      if (dep3)
        s.dot(w, { r: 6, color: TH.orange, ring: TH.surface });
    };

    /* ---- 2D controls ---- */
    const formula2D = box('formula'), stats2D = box('stats');

    // "Find coordinates" button
    const btnFind = h('<button type="button" class="btn sm">Find coordinates</button>');
    const msgFind = h('<p class="note"></p>');
    btnFind.addEventListener('click', () => {
      const coords = basisCoords(S.target);
      if (!coords) {
        msgFind.textContent = 'b\u2081 and b\u2082 are parallel \u2014 not a basis.';
      } else {
        const [a, b] = coords;
        msgFind.innerHTML =
          't = ' + num(a, 2) + '\u00b7b\u2081 + ' + num(b, 2) + '\u00b7b\u2082';
      }
    });

    const snapCheck = Check('Snap handles to grid', true, v => { p.snap = v ? .5 : 0; });
    const sec2Dctrl = sec('Basis vectors', (() => {
      const note = h('<p class="note" style="margin-top:6px">Drag the blue (b\u2081) and green (b\u2082) tips on the canvas, or drag the orange target.</p>');
      return note;
    })(), btnFind, msgFind);
    const sec2Dread = sec('Readout', formula2D, stats2D);
    const sec2Dsnap = sec('', snapCheck.el);

    /* ---- 3D controls ---- */
    const stats3D = box('stats');
    const sB3 = ['x', 'y', 'z'].map((n, i) =>
      Slider({ name: 'b\u2083\u0020' + ['x', 'y', 'z'][i], color: 'var(--orange)',
        min: -3.5, max: 3.5, step: .1, value: S.b3_3[i],
        onInput: v => { S.b3_3[i] = v; readout3D(); s3.render(); } }));

    const moveTo3 = target => {
      const from = S.b3_3.slice();
      ctx.tween(600, e => {
        S.b3_3 = from.map((q, i) => lerp(q, target[i], e));
        sB3.forEach((sl, i) => sl.set(S.b3_3[i]));
        readout3D(); s3.render();
      });
    };

    const bInPlane  = h('<button type="button" class="btn sm ghost">Put b\u2083 in the plane</button>');
    const bOutPlane = h('<button type="button" class="btn sm ghost">Lift b\u2083 out</button>');
    bInPlane.addEventListener('click', () => {
      const [u, v] = [S.b1_3, S.b2_3];
      moveTo3([.55 * u[0] + .6 * v[0], .55 * u[1] + .6 * v[1], .55 * u[2] + .6 * v[2]]);
    });
    bOutPlane.addEventListener('click', () => moveTo3([0, 0, 2.5]));
    const row3btns = box('row'); row3btns.append(bInPlane, bOutPlane);
    const sec3Dctrl = sec('Third basis vector b\u2083', sB3[0].el, sB3[1].el, sB3[2].el, row3btns);
    const sec3Dread = sec('Readout', stats3D);

    ctx.panel.append(sec2Dctrl, sec2Dsnap, sec2Dread, sec3Dctrl, sec3Dread);

    /* ---- readout functions ---- */
    function readout2D() {
      const dep = isDependent2();
      formula2D.innerHTML =
        '<span class="big">Span{b\u2081, b\u2082}</span> = ' +
        (dep
          ? '<span class="badge warn">a line</span>'
          : '<span class="badge">all of ℝ²</span>');

      const coords = basisCoords(S.target);
      if (dep || !coords) {
        stats2D.innerHTML =
          '<div class="stat"><span>Is a basis?</span><b><span class="badge warn">No \u2014 dependent</span></b></div>' +
          '<p class="note">b\u2081 and b\u2082 point the same direction. They span only a line, so they cannot form a basis for ℝ².</p>';
      } else {
        const [a, b] = coords;
        const P = [S.b1[0] * a + S.b2[0] * b, S.b1[1] * a + S.b2[1] * b];
        const err = Math.hypot(P[0] - S.target[0], P[1] - S.target[1]);
        stats2D.innerHTML =
          '<div class="stat"><span>Is a basis?</span><b><span class="badge">Yes \u2014 independent</span></b></div>' +
          '<div class="stat"><span>Basis coords of t</span><b>(' + num(a, 2) + ', ' + num(b, 2) + ')</b></div>' +
          '<div class="stat"><span>Reconstruction error</span><b>' + num(err, 3) + '</b></div>';
      }
      p.render();
    }

    function readout3D() {
      const [u, v, w] = [S.b1_3, S.b2_3, S.b3_3];
      const triple = dot3(u, cross3(v, w));
      const dep = Math.abs(triple) < 0.15;
      stats3D.innerHTML =
        '<div class="stat"><span>det[b\u2081 b\u2082 b\u2083] (scalar triple)</span><b>' + num(triple, 2) + '</b></div>' +
        '<div class="stat"><span>Span{b\u2081, b\u2082, b\u2083}</span><b>' +
        (dep
          ? '<span class="badge warn">only a plane</span>'
          : '<span class="badge">all of ℝ³</span>') +
        '</b></div>' +
        '<p class="note">' +
        (dep
          ? 'b\u2083 lies in the span of b\u2081 and b\u2082. The triple is dependent and cannot be a basis for ℝ³.'
          : 'The three vectors point in genuinely different directions. They form a basis for ℝ³.') +
        '</p>';
      s3.render();
    }

    /* ---- mode switch ---- */
    function setMode(m) {
      S.mode = m;
      c2.hidden = m !== '2d'; c3.hidden = m !== '3d';
      [sec2Dctrl, sec2Dread].forEach(s => { s.hidden = m !== '2d'; });
      [sec3Dctrl, sec3Dread].forEach(s => { s.hidden = m !== '3d'; });
      snapCheck.el.parentElement.hidden = m !== '2d';

      ctx.note(m === '2d'
        ? 'Blue grid = basis grid; orange dot = target point'
        : 'Blue sheet = span of b\u2081 and b\u2082');
      ctx.hint(m === '2d'
        ? 'Drag the blue b\u2081, green b\u2082 tips and the orange target to explore the basis.'
        : 'Use the sliders to move b\u2083. Drag the scene to rotate.');
      if (m === '2d') readout2D(); else readout3D();
      (m === '2d' ? p : s3).render();
    }

    dimToggle(ctx, '2d', setMode);
    setMode('2d');
  }
});
