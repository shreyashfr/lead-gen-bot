// render_cards.js
// Render Reddit-style post cards to PNG using SVG -> PNG via sharp.
// Input: top_posts_detailed.json
// Output: cards/*.png and index.json

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = __dirname;
const IN_PATH = path.join(ROOT, 'top_posts_detailed.json');
const OUT_DIR = path.join(ROOT, 'cards');
fs.mkdirSync(OUT_DIR, { recursive: true });

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? line + ' ' + w : w;
    if (next.length > maxCharsPerLine) {
      if (line) lines.push(line);
      line = w;
      if (lines.length >= maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  let clipped = lines;
  if (lines.length === maxLines && words.join(' ').length > clipped.join(' ').length) {
    clipped[maxLines - 1] = clipped[maxLines - 1].replace(/\s*$/, '') + '…';
  }
  return clipped;
}

function timeAgo(utc) {
  const ms = Date.now() - (utc * 1000);
  const h = Math.max(1, Math.round(ms / 3.6e6));
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function makeSvg(post) {
  const p = post.detail?.post || post;

  const W = 1200;
  const P = 44;
  const headerH = 86;
  const titleLines = wrapText(p.title, 54, 3);
  const titleH = titleLines.length * 46;

  const snippet = (p.selftext || '').trim().replace(/\s+/g, ' ');
  const snippetLines = snippet ? wrapText(snippet, 70, 3) : [];
  const snippetH = snippetLines.length ? (snippetLines.length * 34 + 14) : 0;

  const footerH = 78;
  const H = P + headerH + titleH + snippetH + footerH + P;

  const bg = '#0b0f14';
  const card = '#111822';
  const border = '#243242';
  const muted = '#8aa0b5';
  const text = '#e8f0f8';
  const accent = '#ff4500';

  const ups = p.ups ?? post.ups ?? 0;
  const com = p.num_comments ?? post.num_comments ?? 0;
  const ratio = (typeof p.upvote_ratio === 'number') ? p.upvote_ratio : null;
  const sub = p.subreddit || post.subreddit;
  const author = p.author || post.author;
  const ago = timeAgo(p.created_utc || post.created_utc);
  const viral = Math.round(post.viral_score || 0);

  let y = P;

  // SVG text blocks
  const titleTspans = titleLines.map((ln, i) =>
    `<tspan x="${P + 96}" dy="${i === 0 ? 0 : 46}">${esc(ln)}</tspan>`
  ).join('');

  const snippetTspans = snippetLines.map((ln, i) =>
    `<tspan x="${P + 96}" dy="${i === 0 ? 0 : 34}">${esc(ln)}</tspan>`
  ).join('');

  const snippetBlock = snippetLines.length ? `
    <text x="${P + 96}" y="${y + headerH + titleH + 34}" fill="#cfe0f2" font-size="26" font-family="Inter, Segoe UI, Roboto, Arial" >
      ${snippetTspans}
    </text>
  ` : '';

  const ratioStr = (ratio === null) ? '—' : `${Math.round(ratio * 100)}%`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="${bg}"/>

    <rect x="${P}" y="${P}" rx="22" ry="22" width="${W - 2 * P}" height="${H - 2 * P}" fill="${card}" stroke="${border}" stroke-width="2"/>

    <!-- upvote column -->
    <text x="${P + 44}" y="${y + 62}" fill="${accent}" font-size="34" font-family="Inter, Segoe UI, Roboto, Arial">▲</text>
    <text x="${P + 44}" y="${y + 112}" fill="${text}" font-weight="700" font-size="36" font-family="Inter, Segoe UI, Roboto, Arial">${esc(ups)}</text>
    <text x="${P + 38}" y="${y + 146}" fill="${muted}" font-size="18" font-family="Inter, Segoe UI, Roboto, Arial">ups</text>

    <line x1="${P + 88}" y1="${P + 26}" x2="${P + 88}" y2="${H - P - 26}" stroke="${border}" stroke-dasharray="6 6"/>

    <!-- header -->
    <text x="${P + 96}" y="${y + 54}" fill="${muted}" font-size="22" font-family="Inter, Segoe UI, Roboto, Arial">
      <tspan>posted in </tspan><tspan fill="#bcd0e4" font-weight="700">r/${esc(sub)}</tspan>
      <tspan> · u/${esc(author)} · ${esc(ago)}</tspan>
    </text>

    <!-- title -->
    <text x="${P + 96}" y="${y + headerH + 12}" fill="${text}" font-weight="800" font-size="40" font-family="Inter, Segoe UI, Roboto, Arial">
      ${titleTspans}
    </text>

    ${snippetBlock}

    <!-- footer badges -->
    <g transform="translate(${P + 96}, ${H - P - 48})">
      <rect x="0" y="0" rx="999" ry="999" width="260" height="44" fill="none" stroke="${border}" stroke-width="2"/>
      <circle cx="20" cy="22" r="8" fill="${accent}"/>
      <text x="36" y="29" fill="${muted}" font-size="20" font-family="Inter, Segoe UI, Roboto, Arial">Viral score: ${viral}</text>

      <rect x="280" y="0" rx="999" ry="999" width="220" height="44" fill="none" stroke="${border}" stroke-width="2"/>
      <text x="304" y="29" fill="${muted}" font-size="20" font-family="Inter, Segoe UI, Roboto, Arial">💬 ${com} comments</text>

      <rect x="520" y="0" rx="999" ry="999" width="220" height="44" fill="none" stroke="${border}" stroke-width="2"/>
      <text x="544" y="29" fill="${muted}" font-size="20" font-family="Inter, Segoe UI, Roboto, Arial">ratio: ${ratioStr}</text>

      <rect x="760" y="0" rx="999" ry="999" width="220" height="44" fill="none" stroke="${border}" stroke-width="2"/>
      <text x="784" y="29" fill="${muted}" font-size="20" font-family="Inter, Segoe UI, Roboto, Arial">src: ${esc(post.listing)}</text>
    </g>
  </svg>`;

  return { svg, width: W, height: H };
}

async function main() {
  const data = JSON.parse(fs.readFileSync(IN_PATH, 'utf8'));
  const top = data.slice(0, 12);

  const index = [];
  for (const post of top) {
    const p = post.detail?.post || post;
    const { svg, width, height } = makeSvg(post);
    const outPath = path.join(OUT_DIR, `${p.id}.png`);

    await sharp(Buffer.from(svg))
      .png({ quality: 92 })
      .toFile(outPath);

    index.push({
      id: p.id,
      subreddit: p.subreddit,
      title: p.title,
      ups: p.ups,
      num_comments: p.num_comments,
      upvote_ratio: p.upvote_ratio,
      viral_score: post.viral_score,
      listing: post.listing,
      permalink: p.permalink,
      image: outPath,
      width,
      height
    });
  }

  fs.writeFileSync(path.join(ROOT, 'cards', 'index.json'), JSON.stringify(index, null, 2));
  console.log('Rendered', index.length, 'cards to', OUT_DIR);
}

main().catch(err => { console.error(err); process.exit(1); });
