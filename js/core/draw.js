/* Shared drawing: transformed grid. */
/* ================= shared drawing: transformed grid ================= */
function drawTransformedGrid(p, M, o) {
  o = o || {};
  const N = o.n || 12;
  const T = (x, y) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
  for (let i = -N; i <= N; i++) {
    const a = T(i, -N), b = T(i, N), c = T(-N, i), d = T(N, i);
    const axis = i === 0;
    p.line(a[0], a[1], b[0], b[1], { color: axis ? TH.green : TH.blue, alpha: axis ? .85 : .3, width: axis ? 2 : 1.2 });
    p.line(c[0], c[1], d[0], d[1], { color: axis ? TH.blue : TH.blue, alpha: axis ? .85 : .3, width: axis ? 2 : 1.2 });
  }
}
