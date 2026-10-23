/* Lesson 4: dot */
/* ---------------- 4. Dot product ---------------- */
TOPICS.push({
  id: 'dot', cat: 'prod', dims: ['2D'],
  title: 'Dot product and projection',
  short: 'How much of one vector points along another.',
  lede: 'The dot product multiplies matching components and adds them up. It tells you how much two vectors point the same way.',
  ideas: [
    ['Two ways to compute it.', 'u \u00b7 v = u<sub>x</sub>v<sub>x</sub> + u<sub>y</sub>v<sub>y</sub>, and also |u||v|cos \u03b8. They always agree.'],
    ['The sign tells you the angle.', 'Positive means less than 90\u00b0. Zero means exactly 90\u00b0. Negative means more than 90\u00b0.'],
    ['Projection is a shadow.', 'The orange segment is the part of v that lies along u. Its signed length is (u \u00b7 v) / |u|.']
  ],
  tries: [
    'Press \u201cMake v perpendicular\u201d. What is the dot product now?',
    'Drag v so it points the opposite way to u. What sign does the dot product have?',
    'Keep v the same length and swing it around u. When is the dot product largest?'
  ],
  build(ctx) {
    const S = { u: [4, 1], v: [2, 3], proj: true };
    const c2 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-6, 6], y: [-4.5, 4.5], snap: .5 }));
    p.addHandle({ get: () => S.u, set: (x, y) => { S.u = [x, y]; }, color: 'blue' });
    p.addHandle({ get: () => S.v, set: (x, y) => { S.v = [x, y]; }, color: 'green' });
    p.onDrag = () => { sync(); readout(); };
    p.onDraw = q => {
      q.grid();
      const [ux, uy] = S.u, [vx, vy] = S.v, lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy), d = ux * vx + uy * vy;
      if (S.proj && lu > .05) {
        const k = d / (lu * lu), px = k * ux, py = k * uy;
        q.line(vx, vy, px, py, { color: TH.orange, dash: [5, 5], width: 2 });
        q.line(0, 0, px, py, { color: TH.orange, width: 9, alpha: .4 });
        const ex = ux / lu, ey = uy / lu, pe = [-ey, ex], side = Math.sign((vx - px) * pe[0] + (vy - py) * pe[1]) || 1, a = .26, sg = k >= 0 ? -1 : 1;
        if (Math.hypot(vx - px, vy - py) > .35 && Math.abs(k) > .1) {
          const d1 = [ex * sg * a, ey * sg * a], d2 = [pe[0] * side * a, pe[1] * side * a];
          q.poly([[px, py], [px + d1[0], py + d1[1]], [px + d1[0] + d2[0], py + d1[1] + d2[1]], [px + d2[0], py + d2[1]]], { stroke: TH.orange, width: 1.6 });
        }
        q.dot(px, py, { r: 5, color: TH.orange });
      }
      if (lu > .3 && lv > .3) {
        const a0 = Math.atan2(uy, ux); let da = Math.atan2(vy, vx) - a0;
        while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        q.arc(0, 0, .85, a0, a0 + da, { color: TH.ink, width: 2, alpha: .7 });
        const mid = a0 + da / 2; q.text('\u03b8', 1.25 * Math.cos(mid), 1.25 * Math.sin(mid), { color: TH.ink });
      }
      q.arrow(0, 0, ux, uy, { color: TH.blue, label: 'u' });
      q.arrow(0, 0, vx, vy, { color: TH.green, label: 'v' });
    };
    const mk = (name, col, get, set) => Slider({ name, color: col, min: -6, max: 6, step: .5, value: get(), onInput: v => { set(v); readout(); p.render(); } });
    const sUx = mk('u<sub>x</sub>', 'var(--blue)', () => S.u[0], v => { S.u = [v, S.u[1]]; });
    const sUy = mk('u<sub>y</sub>', 'var(--blue)', () => S.u[1], v => { S.u = [S.u[0], v]; });
    const sVx = mk('v<sub>x</sub>', 'var(--green)', () => S.v[0], v => { S.v = [v, S.v[1]]; });
    const sVy = mk('v<sub>y</sub>', 'var(--green)', () => S.v[1], v => { S.v = [S.v[0], v]; });
    const sync = () => { sUx.set(S.u[0]); sUy.set(S.u[1]); sVx.set(S.v[0]); sVy.set(S.v[1]); };
    const bPerp = h('<button type="button" class="btn sm ghost">Make v perpendicular</button>');
    const bPar = h('<button type="button" class="btn sm ghost">Make v parallel</button>');
    const goV = to => { const f = S.v.slice(); ctx.tween(600, e => { S.v = [lerp(f[0], to[0], e), lerp(f[1], to[1], e)]; sync(); readout(); p.render(); }); };
    bPerp.addEventListener('click', () => { const lu = Math.hypot(S.u[0], S.u[1]), lv = Math.hypot(S.v[0], S.v[1]); if (lu > .05) goV([-S.u[1] / lu * lv, S.u[0] / lu * lv]); });
    bPar.addEventListener('click', () => { const lu = Math.hypot(S.u[0], S.u[1]), lv = Math.hypot(S.v[0], S.v[1]); if (lu > .05) goV([S.u[0] / lu * lv, S.u[1] / lu * lv]); });
    const rowB = box('row'); rowB.append(bPerp, bPar);
    const snap = Check('Snap handles to grid', true, v => { p.snap = v ? .5 : 0; });
    const stats = box('stats'), formula = box('formula');
    ctx.panel.append(sec('Vector u', sUx.el, sUy.el), sec('Vector v', sVx.el, sVy.el, rowB),
      sec('Show', Check('Projection of v onto u', true, v => { S.proj = v; p.render(); }).el, snap.el), sec('Readout', formula, stats));
    function readout() {
      const [ux, uy] = S.u, [vx, vy] = S.v, lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy), d = ux * vx + uy * vy;
      const cos = lu > .01 && lv > .01 ? clamp(d / (lu * lv), -1, 1) : 0, th = deg(Math.acos(cos));
      formula.innerHTML = '<span class="big">u \u00b7 v</span> = (' + num(ux) + ')(' + num(vx) + ') + (' + num(uy) + ')(' + num(vy) + ') = <span class="big">' + num(d, 2) + '</span><br>' +
        '= |u||v|cos \u03b8 = ' + num(lu, 2) + ' \u00d7 ' + num(lv, 2) + ' \u00d7 cos(' + num(th, 1) + '\u00b0)';
      const kind = Math.abs(d) < .05 ? '<span class="badge warn">perpendicular</span>' : d > 0 ? '<span class="badge">acute, same side</span>' : '<span class="badge bad">obtuse, opposite side</span>';
      stats.innerHTML = '<div class="stat"><span>Angle \u03b8</span><b>' + num(th, 1) + '\u00b0</b></div>' +
        '<div class="stat"><span>Projection length</span><b>' + (lu > .05 ? num(d / lu, 2) : '\u2014') + '</b></div>' +
        '<div class="stat"><span>Relationship</span><b>' + kind + '</b></div>';
    }
    ctx.note('Orange: the part of v along u'); ctx.hint('Drag the blue and green handles.');
    readout(); p.render();
  }
});
