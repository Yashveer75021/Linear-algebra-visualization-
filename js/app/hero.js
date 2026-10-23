/* Live demo in the home page hero. */
/* ================= hero demo ================= */
function heroDemo(stage, own) {
  const cv = $('canvas', stage), ro = $('.rm', stage);
  const S = { A: [[1.3, -.6], [.5, 1]], t: 1 };
  const p = new Plot2D(cv, { x: [-5, 5], y: [-4, 4], snap: 0 });
  own(() => p.destroy());
  const cur = () => M2.lerp(M2.I(), S.A, S.t), ready = () => S.t === 1;
  p.addHandle({ get: () => { const M = cur(); return [M[0][0], M[1][0]]; }, set: (x, y) => { S.A[0][0] = x; S.A[1][0] = y; }, color: 'blue', enabled: ready, limit: .55 });
  p.addHandle({ get: () => { const M = cur(); return [M[0][1], M[1][1]]; }, set: (x, y) => { S.A[0][1] = x; S.A[1][1] = y; }, color: 'green', enabled: ready, limit: .55 });
  const show = () => { ro.innerHTML = matHTML(cur()) + '<span style="color:var(--muted)">det ' + num(M2.det(cur()), 2) + '</span>'; };
  p.onDrag = show;
  p.onDraw = q => {
    q.grid({ labels: false });
    const M = cur();
    drawTransformedGrid(q, M);
    q.poly([[0, 0], [1, 0], [1, 1], [0, 1]], { stroke: rgba(TH.ink, .45), width: 1.4, dash: [4, 4] });
    q.poly([[0, 0], [1, 0], [1, 1], [0, 1]].map(v => M2.apply(M, v)), { fill: rgba(TH.earth, .28), stroke: TH.earth, width: 2 });
    q.arrow(0, 0, M[0][0], M[1][0], { color: TH.blue, width: 4 });
    q.arrow(0, 0, M[0][1], M[1][1], { color: TH.green, width: 4 });
    show();
  };
  S.t = 0; p.render();
  let t0 = setTimeout(() => { own(tween(1700, e => { S.t = e; p.render(); }, () => { S.t = 1; p.render(); })); }, 450);
  own(() => clearTimeout(t0));
}
