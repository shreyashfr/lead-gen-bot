const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
chromium.use(StealthPlugin());

const PROXY = { server: 'http://isp.decodo.com:10002', username: 'sp22adtw9l', password: 'iifDj2fZ60XI+s6hdc' };

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    proxy: PROXY,
  });
  const context = await browser.newContext({
    proxy: PROXY,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'en-US',
    timezoneId: 'Asia/Calcutta',
  });
  const page = await context.newPage();

  // Intercept all requests after clicking Next
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('twitter.com') || req.url().includes('x.com') || req.url().includes('api')) {
      requests.push({ method: req.method(), url: req.url().slice(0, 100) });
    }
  });

  await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.locator('input[autocomplete="username"]').pressSequentially('syashchavannew@gmail.com', { delay: 120 });
  await page.waitForTimeout(1000);

  console.log('Clicking Next — watching network...');
  requests.length = 0; // reset
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(6000);

  console.log('\n📡 Network requests after clicking Next:');
  if (requests.length === 0) {
    console.log('  ⚠️  NO REQUESTS MADE — form submission is being blocked CLIENT-SIDE');
  } else {
    requests.forEach(r => console.log(`  ${r.method} ${r.url}`));
  }

  await page.screenshot({ path: '/home/ubuntu/.openclaw/workspace/skills/twitter-scout/debug_network.png' });
  await browser.close();
})().catch(e => console.error('Error:', e.message));
