/* Light/dark toggle. */
/* ================= theme ================= */
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
const isDark = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : !!(mq && mq.matches); };
const MOON = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
function themeChanged() {
  readTheme();
  const b = $('#themeBtn'); if (b) { b.innerHTML = isDark() ? SUN : MOON; b.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme'); }
  LIVE.forEach(o => o.render());
}
if (mq) (mq.addEventListener ? mq.addEventListener('change', themeChanged) : mq.addListener(themeChanged));
$('#themeBtn').addEventListener('click', () => { document.documentElement.setAttribute('data-theme', isDark() ? 'light' : 'dark'); themeChanged(); });
