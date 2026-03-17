#!/usr/bin/env node
/**
 * twitter-scout — Playwright-based viral tweet research pipeline
 * Uses saved session cookies (session.json) — no login required per run.
 * Mirrors reddit-scout output shape for coordinator integration.
 *
 * Usage:
 *   node pipeline.js --query "AI DevOps" --out /path/to/output --topN 10 [--printChat]
 */

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
chromium.use(StealthPlugin());

const fs   = require('fs');
const path = require('path');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
const QUERY      = getArg('--query', null);
const OUT_DIR    = getArg('--out', path.join(process.cwd(), 'twitter-scout'));
const TOP_N      = parseInt(getArg('--topN', '10'));
const PRINT_CHAT = args.includes('--printChat');

if (!QUERY) {
  console.error('Usage: node pipeline.js --query "topic" [--out dir] [--topN 10] [--printChat]');
  process.exit(1);
}

// Session file is always stored next to the script's parent (skill root)
const SESSION_FILE = path.join(__dirname, '../session.json');
if (!fs.existsSync(SESSION_FILE)) {
  console.error('❌ No session.json found. Provide Twitter cookies via session.json.');
  process.exit(1);
}
const SESSION = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));

// ── Decodo ISP Proxy ──────────────────────────────────────────────────────────
const PROXY = {
  server:   'http://isp.decodo.com:10001',
  username: 'sppvpg55cs',
  password: 'rQDiZB1vzq4qab+0d8',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function chat(msg) { if (PRINT_CHAT) console.log(msg); }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseMetric(text) {
  if (!text) return 0;
  const t = text.replace(/,/g, '').trim();
  if (t.endsWith('K')) return Math.round(parseFloat(t) * 1000);
  if (t.endsWith('M')) return Math.round(parseFloat(t) * 1_000_000);
  return parseInt(t) || 0;
}

function viralScore(metrics) {
  const raw = (metrics.likes || 0)
    + (metrics.retweets || 0) * 2
    + (metrics.quotes   || 0) * 2
    + (metrics.replies  || 0)
    + (metrics.bookmarks|| 0);
  return Math.min(10, Math.max(1, parseFloat((raw / 1000).toFixed(1)) || 1));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const slug   = slugify(QUERY);
  const runId  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 23) + 'Z';
  const runDir = path.join(OUT_DIR, slug, 'runs', runId);
  fs.mkdirSync(runDir, { recursive: true });

  chat(`🐦 Twitter-scout starting: "${QUERY}"`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    proxy: PROXY,
  });

  const context = await browser.newContext({
    proxy: PROXY,
    storageState: SESSION,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
  });

  const page = await context.newPage();

  // Verify session is still valid
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) {
    chat('❌ Session expired. Please refresh session.json with new cookies.');
    await browser.close();
    process.exit(1);
  }
  chat('✅ Session valid. Searching tweets...');

  // ── Search & scrape ───────────────────────────────────────────────────────
  const encoded = encodeURIComponent(QUERY);
  await page.goto(`https://x.com/search?q=${encoded}&f=top`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  try {
    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 15000 });
  } catch (e) {
    chat('⚠️ No tweets found on first load, retrying...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }

  const tweets = [];
  const seenIds = new Set();
  let scrolls = 0;

  while (tweets.length < TOP_N * 2 && scrolls < 8) {
    const articles = await page.$$('article[data-testid="tweet"]');

    for (const el of articles) {
      try {
        const linkEl = await el.$('a[href*="/status/"]');
        const href   = linkEl ? await linkEl.getAttribute('href') : null;
        const tweetId = href ? href.split('/status/')[1]?.split('/')[0] : null;
        if (!tweetId || seenIds.has(tweetId)) continue;
        seenIds.add(tweetId);

        // Author
        const authorEl = await el.$('[data-testid="User-Name"]');
        const authorText = authorEl ? (await authorEl.innerText()).split('\n').filter(Boolean) : [];
        const authorName   = authorText[0] || 'Unknown';
        const authorHandle = authorText[1] || 'unknown';

        // Text
        const textEl  = await el.$('[data-testid="tweetText"]');
        const tweetText = textEl ? await textEl.innerText() : '';
        if (!tweetText.trim()) continue;

        // Metrics
        const likeEl      = await el.$('[data-testid="like"] span');
        const rtEl        = await el.$('[data-testid="retweet"] span');
        const replyEl     = await el.$('[data-testid="reply"] span');
        const bookmarkEl  = await el.$('[data-testid="bookmark"] span');

        const metrics = {
          likes:     parseMetric(likeEl     ? await likeEl.innerText()     : ''),
          retweets:  parseMetric(rtEl       ? await rtEl.innerText()       : ''),
          replies:   parseMetric(replyEl    ? await replyEl.innerText()    : ''),
          bookmarks: parseMetric(bookmarkEl ? await bookmarkEl.innerText() : ''),
          quotes: 0,
        };

        // Images
        const imgEls = await el.$$('img[src*="pbs.twimg.com/media"]');
        const images = [];
        for (const img of imgEls) {
          const src = await img.getAttribute('src');
          if (src) images.push(src);
        }

        tweets.push({
          id: tweetId,
          text: tweetText.trim(),
          author_name: authorName,
          author_handle: authorHandle,
          metrics,
          images,
          viral_score: viralScore(metrics),
          url: `https://x.com${href}`,
        });
      } catch (e) { /* skip */ }
    }

    chat(`Found ${tweets.length} tweets... scrolling...`);
    await page.evaluate(() => window.scrollBy(0, 1800));
    await page.waitForTimeout(2500);
    scrolls++;
  }

  await browser.close();

  if (tweets.length === 0) {
    chat('⚠️ No tweets extracted.');
    process.exit(1);
  }

  // Sort by viral score
  const ranked   = tweets.sort((a, b) => b.viral_score - a.viral_score || b.metrics.likes - a.metrics.likes);
  const topTweets = ranked.slice(0, TOP_N);

  // ── Save outputs ──────────────────────────────────────────────────────────
  fs.writeFileSync(path.join(runDir, 'posts_ranked.json'),      JSON.stringify(ranked,    null, 2));
  fs.writeFileSync(path.join(runDir, 'top_posts_detailed.json'),JSON.stringify(topTweets, null, 2));
  fs.writeFileSync(path.join(runDir, 'run_meta.json'), JSON.stringify({
    query: QUERY, runId, topN: TOP_N, totalScanned: tweets.length, timestamp: new Date().toISOString()
  }, null, 2));

  // report.md
  const lines = [
    `# Twitter Scout Report — ${QUERY}`,
    `Run: ${runId} | Scanned: ${tweets.length} | Top ${topTweets.length}`,
    '',
  ];
  for (let i = 0; i < topTweets.length; i++) {
    const t = topTweets[i];
    const m = t.metrics;
    lines.push(
      `## ${i + 1}. ${t.author_name} (${t.author_handle})`,
      `**Viral Score:** ${t.viral_score}/10`,
      `**Tweet:** ${t.text}`,
      `**Metrics:** ❤️ ${m.likes}  🔁 ${m.retweets}  💬 ${m.replies}  🔖 ${m.bookmarks}`,
      `**Images:** ${t.images.length > 0 ? t.images.join(', ') : 'none'}`,
      `**URL:** ${t.url}`,
      '',
    );
  }
  fs.writeFileSync(path.join(runDir, 'report.md'), lines.join('\n'));

  chat(`\n✅ Twitter-scout complete! ${topTweets.length} viral tweets found.`);
  chat(`Top tweet: "${topTweets[0]?.text?.slice(0, 80)}..." (score ${topTweets[0]?.viral_score})`);

  // Print summary for coordinator
  console.log(`\n## Twitter Viral Signals — ${QUERY}\n`);
  for (let i = 0; i < Math.min(5, topTweets.length); i++) {
    const t = topTweets[i];
    console.log(`Post ${i + 1}: "${t.text.slice(0, 120)}${t.text.length > 120 ? '...' : ''}"`);
    console.log(`Author: ${t.author_name} (${t.author_handle})`);
    console.log(`Engagement: ❤️ ${t.metrics.likes}  🔁 ${t.metrics.retweets}  💬 ${t.metrics.replies}  🔖 ${t.metrics.bookmarks}`);
    console.log(`Images: ${t.images.length}`);
    console.log(`Viral Score: ${t.viral_score}/10`);
    console.log(`URL: ${t.url}`);
    console.log('');
  }
  console.log(`Full report: ${path.join(runDir, 'report.md')}`);
}

run().catch(e => {
  console.error('twitter-scout failed:', e.message);
  process.exit(1);
});
