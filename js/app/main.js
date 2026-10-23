/* Boot: first render. */
/* ================= boot ================= */
themeChanged();
render((location.hash || '').replace(/^#/, '') || '/');
