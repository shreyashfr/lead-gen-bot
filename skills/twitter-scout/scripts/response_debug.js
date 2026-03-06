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

  // Capture response bodies
  page.on('response', async res => {
    if (res.url().includes('onboarding/task.json') || res.url().includes('user_flow')) {
      try {
        const body = await res.json();
        console.log(`\n📥 RESPONSE from ${res.url().slice(0, 70)}`);
        console.log('Status:', res.status());
        console.log('Body:', JSON.stringify(body, null, 2).slice(0, 1500));
      } catch (e) {}
    }
  });

  await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.locator('input[autocomplete="username"]').pressSequentially('syashchavannew@gmail.com', { delay: 120 });
  await page.waitForTimeout(1000);

  console.log('Clicking Next...');
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(6000);

  await browser.close();
})().catch(e => console.error('Error:', e.message));
