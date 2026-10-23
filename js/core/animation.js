/* tween() helper (respects reduced motion). */
/* ================= animation ================= */
function tween(ms, fn, done) {
  if (reduced()) { fn(1, 1); if (done) done(); return () => { }; }
  let st = null, raf = 0, dead = false;
  const step = ts => {
    if (dead) return;
    if (st === null) st = ts;
    const t = clamp((ts - st) / ms, 0, 1);
    fn(easeIO(t), t);
    if (t < 1) raf = requestAnimationFrame(step); else if (done) done();
  };
  raf = requestAnimationFrame(step);
  return () => { dead = true; cancelAnimationFrame(raf); };
}
