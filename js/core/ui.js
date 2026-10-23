/* Panel widgets: Slider, Seg, Check, MatrixInput. */
/* ================= UI components ================= */
function Slider(o) {
  const el = h('<label class="sl"><span class="sl-n" style="color:' + (o.color || 'inherit') + '">' + o.name + '</span><input type="range" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || .1) + '" value="' + o.value + '" aria-label="' + (o.aria || String(o.name).replace(/<[^>]+>/g, '')) + '"><output></output></label>');
  const inp = $('input', el), out = $('output', el);
  const fmt = o.fmt || (v => num(v, 1));
  const paint = () => { out.textContent = fmt(+inp.value); inp.style.setProperty('--p', ((inp.value - o.min) / (o.max - o.min) * 100) + '%'); };
  inp.addEventListener('input', () => { paint(); if (o.onInput) o.onInput(+inp.value); });
  paint();
  return { el, set(v) { inp.value = v; paint(); }, get: () => +inp.value, input: inp };
}
function Seg(options, value, onChange, cls) {
  const el = h('<div class="' + (cls || 'seg') + '" role="tablist">' + options.map(o => '<button type="button" role="tab" data-id="' + o.id + '">' + o.label + '</button>').join('') + '</div>');
  const set = id => $$('button', el).forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === id)));
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    set(b.dataset.id);
    if (onChange) onChange(b.dataset.id);
  });
  set(value);
  return { el, set };
}
function Check(label, checked, onChange) {
  const el = h('<label class="chk"><input type="checkbox"' + (checked ? ' checked' : '') + '><span>' + label + '</span></label>');
  $('input', el).addEventListener('change', e => onChange(e.target.checked));
  return { el, set(v) { $('input', el).checked = v; } };
}
function MatrixInput(n, M, onChange, step) {
  const el = h('<div class="mgrid" style="--c:' + n + '"></div>');
  const ins = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const inp = h('<input type="number" step="' + (step || .1) + '" aria-label="row ' + (i + 1) + ' column ' + (j + 1) + '">');
    inp.value = (+M[i][j]).toFixed(1);
    inp.addEventListener('input', () => { const v = parseFloat(inp.value); if (!isNaN(v)) onChange(i, j, clamp(v, -9, 9)); });
    ins.push(inp); el.append(inp);
  }
  return {
    el, set(Mx) { ins.forEach((inp, k) => { const i = Math.floor(k / n), j = k % n; if (document.activeElement !== inp) inp.value = (+Mx[i][j]).toFixed(1); }); }
  };
}
function sec(title, ...nodes) {
  const s = h('<section class="pg">' + (title ? '<h3>' + title + '</h3>' : '') + '</section>');
  nodes.forEach(n => { if (n) s.append(n); });
  return s;
}
function box(cls, html) { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; }
