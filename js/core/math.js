/* 2x2 / 3x3 matrix helpers, vectors, and HTML for matrices. */
/* ================= math ================= */
const M2 = {
  I: () => [[1, 0], [0, 1]],
  det: M => M[0][0] * M[1][1] - M[0][1] * M[1][0],
  mul: (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]],
  apply: (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]],
  inv: M => { const d = M2.det(M); return Math.abs(d) < 1e-9 ? null : [[M[1][1] / d, -M[0][1] / d], [-M[1][0] / d, M[0][0] / d]]; },
  lerp: (A, B, t) => A.map((r, i) => r.map((x, j) => x + (B[i][j] - x) * t)),
  copy: M => M.map(r => r.slice())
};
const M3 = {
  I: () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  det: M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]),
  apply: (M, v) => [0, 1, 2].map(i => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]),
  lerp: (A, B, t) => A.map((r, i) => r.map((x, j) => x + (B[i][j] - x) * t)),
  copy: M => M.map(r => r.slice()),
  col: (M, j) => [M[0][j], M[1][j], M[2][j]]
};
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = v => Math.hypot.apply(null, v);

/* ================= html snippets for math ================= */
const vecHTML = (v, d = 1) => '<span class="vec">' + v.map(x => '<i>' + num(x, d) + '</i>').join('') + '</span>';
const matHTML = (M, d = 1) => '<span class="mat" style="--c:' + M[0].length + '">' + M.flat().map(x => '<i>' + num(x, d) + '</i>').join('') + '</span>';
