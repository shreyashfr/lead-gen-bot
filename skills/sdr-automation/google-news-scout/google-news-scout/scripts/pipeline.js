#!/usr/bin/env node
/**
 * google-news-scout — Google News RSS-based research pipeline
 * Fetches Google News RSS for a query, ranks by recency, extracts article signals.
 * Zero API key needed. Mirrors reddit/twitter/youtube-scout output shape.
 *
 * Usage:
 *   node pipeline.js --query "AI careers 2026" --out /path/to/output --topN 10 [--printChat]
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const xml2js = require('xml2js');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
const QUERY      = getArg('--query', null);
const OUT_DIR    = getArg('--out', path.join(process.cwd(), 'google-news-scout'));
const TOP_N      = parseInt(getArg('--topN', '10'));
const DAYS_BACK  = parseInt(getArg('--daysBack', '7'));  // filter articles older than this
const PRINT_CHAT = args.includes('--printChat');

if (!QUERY) {
  console.error('Usage: node pipeline.js --query "topic" [--out dir] [--topN 10] [--printChat]');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function chat(msg) { if (PRINT_CHAT) console.log(msg); }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoogleNewsScout/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      }
    }, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function recencyScore(pubDateStr) {
  // Returns 1-10 score based on how recent the article is
  if (!pubDateStr) return 5;
  const pub = new Date(pubDateStr);
  const now = new Date();
  const diffHours = (now - pub) / (1000 * 60 * 60);
  
  if (diffHours < 6)   return 10;
  if (diffHours < 24)  return 9;
  if (diffHours < 48)  return 8;
  if (diffHours < 72)  return 7;
  if (diffHours < 120) return 6;
  if (diffHours < 168) return 5; // 1 week
  if (diffHours < 336) return 4;
  if (diffHours < 720) return 3;
  return 2;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Fetch Google News RSS ─────────────────────────────────────────────────────
async function fetchGoogleNews(query, topN, daysBack) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;
  
  chat(`📰 Fetching Google News RSS: "${query}"...`);
  
  let xml;
  try {
    xml = await fetchUrl(url);
  } catch (err) {
    chat(`⚠️  Fetch failed: ${err.message}`);
    return [];
  }

  let parsed;
  try {
    parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
  } catch (err) {
    chat(`⚠️  XML parse failed: ${err.message}`);
    return [];
  }

  const items = parsed?.rss?.channel?.item;
  if (!items) {
    chat(`⚠️  No articles found in RSS feed`);
    return [];
  }

  const rawItems = Array.isArray(items) ? items : [items];
  chat(`✅ Found ${rawItems.length} articles`);

  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const articles = rawItems
    .map(item => {
      const title    = stripHtml(item.title || '');
      const link     = item.link || '';
      const pubDate  = item.pubDate || '';
      const source   = item.source?._ || item.source || '';
      const sourceUrl = item.source?.$?.url || '';
      const desc     = stripHtml(item.description || '');
      const pub      = new Date(pubDate);
      
      // Extract the actual article title from description (it includes a link)
      // Description format: <a href="direct_url">Title</a>&nbsp;&nbsp;<font>Source</font>
      const directUrlMatch = (item.description || '').match(/href="([^"]+)"/);
      const directUrl = directUrlMatch ? directUrlMatch[1] : link;

      return {
        title,
        url: directUrl || link,
        googleUrl: link,
        source,
        sourceUrl,
        pubDate,
        pubTimestamp: pub.getTime(),
        description: desc.replace(title, '').replace(source, '').trim(),
        recencyScore: recencyScore(pubDate),
        isRecent: pub >= cutoffDate,
      };
    })
    .filter(a => a.title && a.url)
    .sort((a, b) => b.recencyScore - a.recencyScore || b.pubTimestamp - a.pubTimestamp)
    .slice(0, topN);

  return articles;
}

// ── Build report ──────────────────────────────────────────────────────────────
function buildReport(query, articles) {
  const date = new Date().toISOString().split('T')[0];
  let report = `## GOOGLE NEWS SCOUT REPORT — ${query}\nDate: ${date}\nArticles: ${articles.length}\n\n### Top Articles\n\n`;

  for (const a of articles) {
    const age = a.pubDate ? `Published: ${a.pubDate}` : '';
    report += `---\nTitle: ${a.title}\nSource: ${a.source || 'Unknown'}\n${age}\nRecency Score: ${a.recencyScore}/10\nURL: ${a.url}\n\n`;
  }

  report += `\n### SOURCE URLS (for idea-generator)\n`;
  for (const a of articles) {
    report += `- ${a.title} — ${a.source || 'Unknown'}\n  URL: ${a.url}\n`;
  }

  return report;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const slug   = slugify(QUERY);
  const runId  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 23) + 'Z';
  const runDir = path.join(OUT_DIR, slug, 'runs', runId);
  fs.mkdirSync(runDir, { recursive: true });

  chat(`\n📰 Google News Scout: "${QUERY}"`);
  chat(`   Output: ${runDir}\n`);

  const articles = await fetchGoogleNews(QUERY, TOP_N, DAYS_BACK);

  if (!articles.length) {
    console.error('❌ No articles found.');
    process.exit(1);
  }

  chat(`\n🏆 Top ${articles.length} articles by recency:`);
  for (const a of articles) {
    chat(`  ${a.recencyScore}/10 | ${a.source} | ${a.title.slice(0, 70)}`);
  }

  // Save outputs
  fs.writeFileSync(path.join(runDir, 'articles.json'), JSON.stringify(articles, null, 2));

  const report = buildReport(QUERY, articles);
  fs.writeFileSync(path.join(runDir, 'report.md'), report);

  // chat.md
  const chatMd = articles.map(a =>
    `### ${a.title}\n- Source: ${a.source} | Recency: ${a.recencyScore}/10\n- URL: ${a.url}\n`
  ).join('\n');
  fs.writeFileSync(path.join(runDir, 'chat.md'), chatMd);

  chat(`\n✅ Google News Scout complete! → ${path.join(runDir, 'report.md')}`);

  // Stdout for coordinator
  console.log(`\n## Google News Scout Results: "${QUERY}"\n`);
  for (const a of articles) {
    console.log(`📰 ${a.title}`);
    console.log(`   Source: ${a.source} | Recency: ${a.recencyScore}/10`);
    console.log(`   URL: ${a.url}`);
    console.log('');
  }
}

run().catch(err => {
  console.error('❌ Google News Scout error:', err.message);
  process.exit(1);
});
