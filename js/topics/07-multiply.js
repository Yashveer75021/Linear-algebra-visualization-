/* Lesson 7: multiply */
/* ---------------- 7. Matrix multiplication ---------------- */
TOPICS.push({
  id: 'multiply', cat: 'mat', dims: ['2D'],
  title: 'Matrix multiplication',
  short: 'Do one transformation, then the next.',
  lede: 'Multiplying matrices means doing one transformation after another. In A\u00b7B, the matrix B acts first and A acts second.',
  ideas: [
    ['Read it right to left.', 'In A\u00b7B, the matrix closest to the vector goes first. Scrub the slider to watch B act, then A.'],
    ['Each entry is a row times a column.', 'Click an entry of the product to see which row of A and which column of B make it.'],
    ['Order changes the answer.', 'Rotating then shearing is not the same as shearing then rotating, so A\u00b7B and B\u00b7A usually differ.']
  ],
  tries: [
    'Press \u201cSwap A and B\u201d. Does the final picture change?',
    'Choose Rotate 90\u00b0 for both A and B. What single transformation is A\u00b7B?',
    'Click each entry of the product and check the arithmetic by hand.'
  ],
  build(ctx) {
    const S = { A: M2.copy(PRESETS2.rot90), B: M2.copy(PRESETS2.shear), s: 0, sel: [0, 0] };
    const c2 = ctx.canvas();
    const p = ctx.own(new Plot2D(c2, { x: [-6, 6], y: [-4.5, 4.5] }));
    const F = [[0, 0], [.4, 0], [.4, .9], [.95, .9], [.95, 1.25], [.4, 1.25], [.4, 1.6], [1.25, 1.6], [1.25, 2], [0, 2]];
    const prod = () => M2.mul(S.A, S.B);
    const cur = () => S.s <= 1 ? M2.lerp(M2.I(), S.B, S.s) : M2.lerp(S.B, prod(), S.s - 1);
    p.onDraw = q => {
      q.grid();
      const M = cur();
      drawTransformedGrid(q, M);
      q.poly(F, { stroke: rgba(TH.ink, .5), width: 1.5, dash: [4, 4] });
      q.poly(F.map(v => M2.apply(M, v)), { fill: rgba(TH.orange, .3), stroke: TH.orange, width: 2.4 });
      q.arrow(0, 0, M[0][0], M[1][0], { color: TH.blue, width: 3.6, label: "i\u2032" });
      q.arrow(0, 0, M[0][1], M[1][1], { color: TH.green, width: 3.6, label: "j\u2032" });
    };
    const opts = [{ id: 'rot90', label: 'Rotate 90\u00b0' }, { id: 'rot45', label: 'Rotate 45\u00b0' }, { id: 'shear', label: 'Shear' }, { id: 'stretchx', label: 'Stretch x' }, { id: 'reflect', label: 'Reflect' }];
    const mkMat = key => {
      const mi = MatrixInput(2, S[key], (i, j, v) => { S[key][i][j] = v; chips.set(''); refresh(); });
      const chips = Seg(opts, key === 'A' ? 'rot90' : 'shear', id => { S[key] = M2.copy(PRESETS2[id]); mi.set(S[key]); refresh(); }, 'chips');
      return { mi, chips };
    };
    const mA = mkMat('A'), mB = mkMat('B');
    const stage = Seg([{ id: '0', label: 'Start' }, { id: '1', label: 'After B' }, { id: '2', label: 'After A\u00b7B' }], '0', id => goStage(+id), 'chips');
    const scrub = Slider({ name: 'step', min: 0, max: 2, step: .01, value: 0, fmt: v => num(v, 2), onInput: v => { stop(); S.s = v; stage.set(v === 0 ? '0' : v === 1 ? '1' : v === 2 ? '2' : ''); p.render(); } });
    let stop = () => { };
    const goStage = v => { stop(); const f = S.s; stop = ctx.tween(Math.max(300, Math.abs(v - f) * 800), e => { S.s = lerp(f, v, e); scrub.set(S.s); p.render(); }); };
    const play = h('<button type="button" class="btn sm">Play from the start</button>');
    play.addEventListener('click', () => { stop(); S.s = 0; scrub.set(0); stage.set('0'); stop = ctx.tween(2200, e => { S.s = e * 2; scrub.set(S.s); p.render(); }, () => stage.set('2')); });
    const swap = h('<button type="button" class="btn sm ghost">Swap A and B</button>');
    swap.addEventListener('click', () => { const t = S.A; S.A = S.B; S.B = t; mA.mi.set(S.A); mB.mi.set(S.B); mA.chips.set(''); mB.chips.set(''); refresh(); });
    const prodBox = box(''), stats = box('stats');
    ctx.panel.append(sec('Matrix A (acts second)', mA.chips.el, mA.mi.el), sec('Matrix B (acts first)', mB.chips.el, mB.mi.el),
      sec('Watch it happen', stage.el, scrub.el, (() => { const r = box('row'); r.append(play, swap); r.style.marginTop = '8px'; return r; })()),
      sec('The product', prodBox, stats));

    const cells = (M, o) => {
      o = o || {};
      let c = '';
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const t = num(M[i][j], 1);
        if (o.btn) c += '<button type="button" data-i="' + i + '" data-j="' + j + '" aria-pressed="' + (S.sel[0] === i && S.sel[1] === j) + '">' + t + '</button>';
        else c += '<i' + (((o.row != null && i === o.row) || (o.col != null && j === o.col)) ? ' class="hl"' : '') + '>' + t + '</i>';
      }
      return '<span class="mat" style="--c:2">' + c + '</span>';
    };
    prodBox.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b) return; S.sel = [+b.dataset.i, +b.dataset.j]; refresh(true); });
    function refresh() {
      const P = prod(), BA = M2.mul(S.B, S.A), [i, j] = S.sel;
      const n = S.A[i][0] * S.B[0][j] + S.A[i][1] * S.B[1][j];
      prodBox.innerHTML = '<div class="eq">' + cells(S.A, { row: i }) + '<span>\u00b7</span>' + cells(S.B, { col: j }) + '<span>=</span>' + cells(P, { btn: true }) + '</div>' +
        '<div class="formula" style="margin-top:10px">Entry (' + (i + 1) + ', ' + (j + 1) + ') = row ' + (i + 1) + ' of A \u00b7 column ' + (j + 1) + ' of B<br>= (' + num(S.A[i][0]) + ')(' + num(S.B[0][j]) + ') + (' + num(S.A[i][1]) + ')(' + num(S.B[1][j]) + ') = <span class="big">' + num(n, 2) + '</span></div>';
      const same = P.flat().every((x, k) => Math.abs(x - BA.flat()[k]) < 1e-6);
      stats.innerHTML = '<div class="eq" style="margin-top:6px"><span class="lab2">B\u00b7A</span>' + matHTML(BA) + '</div>' +
        '<div class="stat"><span>A\u00b7B equals B\u00b7A?</span><b>' + (same ? '<span class="badge">yes, this time</span>' : '<span class="badge warn">no</span>') + '</b></div>' +
        '<div class="stat"><span>det(A\u00b7B)</span><b>' + num(M2.det(P), 2) + ' = ' + num(M2.det(S.A), 2) + ' \u00d7 ' + num(M2.det(S.B), 2) + '</b></div>';
      p.render();
    }
    ctx.note('The orange F shows what each matrix does'); ctx.hint('Pick two transformations, then press Play or scrub the slider.');
    refresh();
  }
});
