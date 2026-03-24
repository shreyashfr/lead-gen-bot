// Run from: /home/ubuntu/.openclaw/workspace/skills/twitter-scout/
// node scripts/login_test.js

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

chromium.use(StealthPlugin());

const PROXY = {
  server:   'http://isp.decodo.com:10002',
  username: 'sp22adtw9l',
  password: 'iifDj2fZ60XI+s6hdc',
};

const EMAIL    = 'syashchavannew@gmail.com';
const PASSWORD = 'headless300';
const SESSION_FILE = path.join(__dirname, '../session.json');
const DEBUG_DIR    = path.join(__dirname, '..');

function askOTP() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n>>> OTP REQUIRED — Enter the code sent to your email/phone: ', (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

(async () => {
  console.log('🐦 Launching stealth browser via Decodo proxy...');
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

  // ── Step 1: Load login page ──────────────────────────────────────────────
  console.log('📄 Navigating to login...');
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_1_loaded.png') });

  // ── Step 2: Fill email ───────────────────────────────────────────────────
  console.log('📧 Filling email...');
  await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
  await page.locator('input[autocomplete="username"]').pressSequentially(EMAIL, { delay: 120 });
  await page.waitForTimeout(1000);

  const val = await page.locator('input[autocomplete="username"]').inputValue();
  console.log('Typed value confirmed:', val);
  await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_2_typed.png') });

  await page.locator('button:has-text("Next")').click();

  // ── Step 3: Wait for EITHER unusual activity OR password field ───────────
  console.log('⏳ Waiting for next step (unusual activity or password)...');
  try {
    await page.waitForSelector(
      'input[data-testid="ocfEnterTextTextInput"], input[type="password"]',
      { timeout: 15000 }
    );
  } catch (e) {
    await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_3_stuck.png') });
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 500));
    console.log('❌ Neither step appeared. Page:\n', txt);
    await browser.close();
    process.exit(1);
  }

  await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_3_after_next.png') });

  // Handle unusual activity check (asks for username or phone)
  if (await page.locator('input[data-testid="ocfEnterTextTextInput"]').count() > 0) {
    console.log('⚠️  Unusual activity check — entering username ShreyashCh18875...');
    await page.locator('input[data-testid="ocfEnterTextTextInput"]').pressSequentially('ShreyashCh18875', { delay: 100 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_4_after_verify.png') });

    // Now wait for password field
    console.log('⏳ Waiting for password field after verification...');
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  }

  // ── Step 4: Password ─────────────────────────────────────────────────────
  if (await page.locator('input[type="password"]').count() > 0) {
    console.log('🔑 Password field found! Entering password...');
    await page.locator('input[type="password"]').pressSequentially(PASSWORD, { delay: 90 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_5_after_pw.png') });
    console.log('URL after password:', page.url());
  } else {
    console.log('❌ No password field found after verification step');
    await browser.close();
    process.exit(1);
  }

  // ── Step 5: OTP / 2FA if prompted ────────────────────────────────────────
  const otpSelectors = [
    'input[data-testid="ocfEnterTextTextInput"]',
    'input[inputmode="numeric"]',
    'input[autocomplete="one-time-code"]',
  ];
  for (const sel of otpSelectors) {
    if (await page.locator(sel).count() > 0) {
      console.log('🔐 OTP required!');
      const otp = await askOTP();
      await page.locator(sel).pressSequentially(otp, { delay: 100 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(4000);
      break;
    }
  }

  // ── Step 6: Confirm success ───────────────────────────────────────────────
  const finalUrl = page.url();
  await page.screenshot({ path: path.join(DEBUG_DIR, 'debug_6_final.png') });
  console.log('\nFinal URL:', finalUrl);

  if (!finalUrl.includes('/login') && !finalUrl.includes('/flow')) {
    console.log('✅ LOGIN SUCCESSFUL! Saving session...');
    const state = await context.storageState();
    fs.writeFileSync(SESSION_FILE, JSON.stringify(state, null, 2));
    console.log('💾 Session saved to:', SESSION_FILE);
  } else {
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 500));
    console.log('❌ Login failed.\nPage text:', txt);
  }

  await browser.close();
})().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
