/* Lesson 1: vector */
/* ---------------- 1. What is a vector ---------------- */
TOPICS.push({
  id: 'vector', cat: 'vec', dims: ['2D', '3D'],
  title: 'What is a vector?',
  short: 'An arrow with a length and a direction, or just a list of numbers.',
  lede: 'A vector is an arrow that starts at the origin and ends at a point. It has a length and a direction, and you can write it as a short list of numbers.',
  ideas: [
    ['Components are steps.', 'The vector (3, 2) means: go 3 units along x, then 2 units along y. In 3D you add one more number for z.'],
    ['Length comes from Pythagoras.', 'In 2D, |v| = \u221a(x\u00b2 + y\u00b2). In 3D, add z\u00b2 under the root.'],
    ['A unit vector keeps only direction.', 'Divide a vector by its own length and you get a vector of length 1 that points the same way.']
  ],
  tries: [
    'Drag the tip to (3, 4). The length comes out as exactly 5.',
    'Set the x component to 0. Which way does the arrow point?',
    'Switch to 3D and set x, y and z all to 2. Is the length bigger than 2\u221a2?'
  ],
  build(ctx) {
    const S = { v2: [3, 2], v3: [2, 3, 2], mode: '2d', comps: true, unit: false };
    const c2 = ctx.canvas(), c3 = ctx.canvas();
    const p2 = ctx.own(new Plot2D(c2, { x: [-6, 6], y: [-4.5, 4.5], snap: .5 }));
    const s3 = ctx.own(new Scene3D(c3, { range: 4 }));
    const reset = resetViewBtn(ctx, s3);

    p2.addHandle({ get: () => S.v2, set: (x, y) => { S.v2 = [x, y]; }, color: 'orange' });
    p2.onDrag = () => { sl2[0].set(S.v2[0]); sl2[1].set(S.v2[1]); readout(); };

    p2.onDraw = p => {
      p.grid();
      const [x, y] = S.v2, L = Math.hypot(x, y);
      if (S.comps) {
        p.arrow(0, 0, x, 0, { color: TH.blue, width: 2.6, head: 10, alpha: .9 });
        p.arrow(x, 0, x, y, { color: TH.green, width: 2.6, head: 10, alpha: .9 });
      }
      if (S.unit && L > .01) p.arrow(0, 0, x / L, y / L, { color: TH.ink, width: 3, head: 10, alpha: .75 });
      p.arrow(0, 0, x, y, { color: TH.orange, width: 4.2, label: 'v' });
      if (L > .4) p.arc(0, 0, .8, 0, Math.atan2(y, x), { color: TH.orange, width: 2, alpha: .8 });
    };
    s3.onDraw = s => {
      s.axes();
      const [x, y, z] = S.v3, L = len(S.v3);
      if (S.comps) {
        s.para([0, 0, 0], [x, 0, 0], [0, y, 0], [0, 0, z], { fill: rgba(TH.orange, .06), edge: TH.stone, dash: [4, 5], width: 1.3, edgeAlpha: .9 });
        s.arrow([0, 0, 0], [x, 0, 0], { color: TH.blue, width: 2.6, head: 10, alpha: .95 });
        s.arrow([x, 0, 0], [x, y, 0], { color: TH.green, width: 2.6, head: 10, alpha: .95 });
        s.arrow([x, y, 0], [x, y, z], { color: TH.violet, width: 2.6, head: 10, alpha: .95 });
      }
      if (S.unit && L > .01) s.arrow([0, 0, 0], [x / L, y / L, z / L], { color: TH.ink, width: 3, head: 10, alpha: .8 });
      s.arrow([0, 0, 0], [x, y, z], { color: TH.orange, width: 4.2, label: 'v' });
    };

    /* controls */
    const mk = (n, col, get, set, v2) => Slider({
      name: n, color: col, min: v2 ? -5 : -4, max: v2 ? 5 : 4, step: .5, value: get(),
      onInput: v => { set(v); readout(); (S.mode === '2d' ? p2 : s3).render(); }
    });
    const sl2 = [mk('x', 'var(--blue)', () => S.v2[0], v => { S.v2 = [v, S.v2[1]]; }, true),
    mk('y', 'var(--green)', () => S.v2[1], v => { S.v2 = [S.v2[0], v]; }, true)];
    const sl3 = [mk('x', 'var(--blue)', () => S.v3[0], v => { S.v3 = [v, S.v3[1], S.v3[2]]; }),
    mk('y', 'var(--green)', () => S.v3[1], v => { S.v3 = [S.v3[0], v, S.v3[2]]; }),
    mk('z', 'var(--violet)', () => S.v3[2], v => { S.v3 = [S.v3[0], S.v3[1], v]; })];
    const secEdit2 = sec('Set the components', sl2[0].el, sl2[1].el);
    const secEdit3 = sec('Set the components', sl3[0].el, sl3[1].el, sl3[2].el);
    const snap = Check('Snap to grid', true, v => { p2.snap = v ? .5 : 0; });
    const secShow = sec('Show', Check('Components', true, v => { S.comps = v; redraw(); }).el, Check('Unit vector', false, v => { S.unit = v; redraw(); }).el, snap.el);
    const stats = box('stats'), formula = box('formula');
    const secRead = sec('Readout', stats, formula);
    ctx.panel.append(secEdit2, secEdit3, secShow, secRead);

    function redraw() { (S.mode === '2d' ? p2 : s3).render(); }
    function readout() {
      const v = S.mode === '2d' ? S.v2 : S.v3, L = len(v), u = L > 1e-9 ? v.map(q => q / L) : v.map(() => 0);
      stats.innerHTML =
        '<div class="stat"><span>Components</span><b>' + vecHTML(v) + '</b></div>' +
        '<div class="stat"><span>Length</span><b>' + num(L, 2) + '</b></div>' +
        (S.mode === '2d' ? '<div class="stat"><span>Direction</span><b>' + num(deg(Math.atan2(v[1], v[0])), 1) + '\u00b0</b></div>' : '') +
        '<div class="stat"><span>Unit vector</span><b>' + vecHTML(u, 2) + '</b></div>';
      formula.innerHTML = '|v| = \u221a(' + v.map(q => num(q) + '\u00b2').join(' + ') + ') = <span class="big">' + num(L, 2) + '</span>';
    }
    function setMode(m) {
      S.mode = m; c2.hidden = m !== '2d'; c3.hidden = m !== '3d';
      secEdit2.hidden = m !== '2d'; secEdit3.hidden = m !== '3d'; snap.el.hidden = m !== '2d'; reset.hidden = m !== '3d';
      ctx.note(m === '2d' ? 'Drag the orange handle' : 'Drag the scene to rotate it');
      ctx.hint(m === '2d' ? 'Drag the tip of the arrow, or use the sliders.' : 'Use the sliders to move the tip. Drag the scene to look around.');
      readout(); redraw();
    }
    dimToggle(ctx, '2d', setMode);
    setMode('2d');
  }
});
