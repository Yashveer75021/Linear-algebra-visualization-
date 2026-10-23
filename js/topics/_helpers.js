/* Shared topic helpers: TOPICS registry, dimension toggle, presets. Load before the topic files. */
/* ================= topic helpers ================= */
function dimToggle(ctx, initial, onChange) {
  const sg = Seg([{ id: '2d', label: '2D' }, { id: '3d', label: '3D' }], initial, onChange);
  ctx.bar.prepend(sg.el);
  return sg;
}
function resetViewBtn(ctx, scene) {
  const b = h('<button type="button" class="btn ghost sm">Reset view</button>');
  b.addEventListener('click', () => scene.reset());
  ctx.tools.append(b);
  return b;
}
const eqRow = html => h('<div class="eq">' + html + '</div>');

const TOPICS = [];
