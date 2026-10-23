/* Lesson 5: cross */
/* ---------------- 5. Cross product ---------------- */
TOPICS.push({
  id: 'cross', cat: 'prod', dims: ['3D'],
  title: 'Cross product',
  short: 'A vector that stands at right angles to two others.',
  lede: 'In 3D, the cross product of u and v is a new vector that is perpendicular to both. Its length equals the area of the parallelogram they span.',
  ideas: [
    ['The right-hand rule gives the direction.', 'Curl your fingers from u toward v. Your thumb points along u \u00d7 v.'],
    ['Order matters.', 'Swapping the vectors flips the result: v \u00d7 u = \u2212(u \u00d7 v).'],
    ['Length is area.', '|u \u00d7 v| = |u||v| sin \u03b8. It is zero when the vectors are parallel, because the parallelogram is flat.']
  ],
  tries: [
    'Choose \u201ci \u00d7 j\u201d. Which axis does the result point along?',
    'Press \u201cSwap u and v\u201d. What happens to the orange arrow?',
    'Choose \u201cParallel\u201d. Why is the cross product the zero vector?'
  ],
  build(ctx) {
    const S = { u: [2, 0, 0], v: [.5, 1.5, 0], both: false };
    const c3 = ctx.canvas();
    const s3 = ctx.own(new Scene3D(c3, { range: 4, yaw: -.75, pitch: .45 }));
    resetViewBtn(ctx, s3);
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    s3.onDraw = s => {
      s.axes();
      const c = cross3(S.u, S.v), L = len(c), sf = L > 4.5 ? 4.5 / L : 1, cc = c.map(x => x * sf);
      s.poly([[0, 0, 0], S.u, add(S.u, S.v), S.v], { fill: rgba(TH.green, .22), stroke: rgba(TH.green, .8), width: 1.6 });
      s.arrow([0, 0, 0], S.u, { color: TH.blue, width: 3.4, label: 'u' });
      s.arrow([0, 0, 0], S.v, { color: TH.green, width: 3.4, label: 'v' });
      if (L > .05) {
        if (S.both) s.arrow([0, 0, 0], cc.map(x => -x), { color: TH.orange, width: 3, alpha: .5, label: 'v \u00d7 u' });
        s.arrow([0, 0, 0], cc, { color: TH.orange, width: 4.2, label: 'u \u00d7 v' });
      }
    };
    const names = ['\u2081', '\u2082', '\u2083'], cols = ['var(--blue)', 'var(--green)', 'var(--violet)'];
    const su = [0, 1, 2].map(i => Slider({ name: 'u' + names[i], color: cols[i], min: -3, max: 3, step: .1, value: S.u[i], onInput: v => { S.u[i] = v; readout(); s3.render(); } }));
    const sv = [0, 1, 2].map(i => Slider({ name: 'v' + names[i], color: cols[i], min: -3, max: 3, step: .1, value: S.v[i], onInput: v => { S.v[i] = v; readout(); s3.render(); } }));
    const sync = () => { su.forEach((s, i) => s.set(S.u[i])); sv.forEach((s, i) => s.set(S.v[i])); readout(); s3.render(); };
    const set = (u, v) => { const fu = S.u.slice(), fv = S.v.slice(); ctx.tween(600, e => { S.u = fu.map((q, i) => lerp(q, u[i], e)); S.v = fv.map((q, i) => lerp(q, v[i], e)); sync(); }); };
    const chips = Seg([{ id: 'ij', label: 'i \u00d7 j' }, { id: 'ji', label: 'j \u00d7 i' }, { id: 'par', label: 'Parallel' }, { id: 'tilt', label: 'Tilted' }], '', id => {
      if (id === 'ij') set([2, 0, 0], [0, 2, 0]);
      if (id === 'ji') set([0, 2, 0], [2, 0, 0]);
      if (id === 'par') set([2, 1, 0], [1, .5, 0]);
      if (id === 'tilt') set([2, .5, .5], [0, 2, 1]);
    }, 'chips');
    const swap = h('<button type="button" class="btn sm ghost">Swap u and v</button>');
    swap.addEventListener('click', () => set(S.v.slice(), S.u.slice()));
    const stats = box('stats'), formula = box('formula');
    ctx.panel.append(sec('Presets', chips.el, swap), sec('Vector u', su[0].el, su[1].el, su[2].el), sec('Vector v', sv[0].el, sv[1].el, sv[2].el),
      sec('Show', Check('Also show v \u00d7 u', false, v => { S.both = v; s3.render(); }).el), sec('Readout', formula, stats));
    swap.style.marginTop = '8px';
    function readout() {
      const c = cross3(S.u, S.v), L = len(c), lu = len(S.u), lv = len(S.v);
      const cs = lu > .01 && lv > .01 ? clamp(dot3(S.u, S.v) / (lu * lv), -1, 1) : 0, th = deg(Math.acos(cs));
      formula.innerHTML = '<span class="big">u \u00d7 v</span> = ' + vecHTML(c, 2) + '<br>= (u\u2082v\u2083 \u2212 u\u2083v\u2082, u\u2083v\u2081 \u2212 u\u2081v\u2083, u\u2081v\u2082 \u2212 u\u2082v\u2081)';
      stats.innerHTML = '<div class="stat"><span>Length |u \u00d7 v| (area)</span><b>' + num(L, 2) + '</b></div>' +
        '<div class="stat"><span>Angle between u and v</span><b>' + num(th, 1) + '\u00b0</b></div>' +
        '<div class="stat"><span>(u \u00d7 v) \u00b7 u, (u \u00d7 v) \u00b7 v</span><b>' + num(dot3(c, S.u), 1) + ', ' + num(dot3(c, S.v), 1) + '</b></div>' +
        (L < .05 ? '<div class="stat"><span>Result</span><b><span class="badge warn">zero vector</span></b></div>' : '') +
        (L > 4.5 ? '<p class="note">The orange arrow is drawn shorter than its true length so it stays in view.</p>' : '');
    }
    ctx.note('Drag the scene to rotate it'); ctx.hint('Change u and v with the sliders and watch the orange arrow.');
    readout(); s3.render();
  }
});
