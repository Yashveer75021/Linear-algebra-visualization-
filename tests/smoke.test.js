// Smoke test: opens every lesson, switches 2D/3D, moves every control, and fails on any page error.
// Run: npm install && npx playwright install chromium && npm test
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(URL);
  await page.waitForSelector('.block');
  const count = await page.$$eval('.block', b => b.length);

  for (let i = 1; i <= count; i++) {
    await page.click(`.block[data-i="${i}"]`, { force: true });
    await page.waitForSelector('.viewport');
    const title = await page.textContent('h1');
    const hasToggle = await page.$('.seg button[data-id="3d"]');
    for (const mode of hasToggle ? ['2d', '3d'] : ['2d']) {
      if (hasToggle) await page.click(`.seg button[data-id="${mode}"]`);
      await page.evaluate(() => {
        document.querySelectorAll('.panel input[type=range]').forEach(el => {
          if (!el.offsetParent) return;
          el.value = (+el.min + +el.max) / 2 + (+el.max - +el.min) * 0.2;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        document.querySelectorAll('.panel .chips button, .panel .btn.sm').forEach(b => { if (b.offsetParent && !/Spin/.test(b.textContent)) b.click(); });
      });
      await page.waitForTimeout(200);
    }
    console.log('ok  ', String(i).padStart(2, '0'), title);
    await page.click('.back');
  }
  await browser.close();
  if (errors.length) { console.error('FAILED:\n' + errors.join('\n')); process.exit(1); }
  console.log(`All ${count} lessons passed.`);
})();
