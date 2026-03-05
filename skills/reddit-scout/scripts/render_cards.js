// render_cards.js
// Render Reddit-style post cards to PNG using SVG -> PNG via sharp.

const fs = require('fs');
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch {
  throw new Error('Missing dependency: sharp. Install in the run folder (or package) with: npm i sharp');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function compactNumber(n) {
  const x = Number(n || 0);
  const abs = Math.abs(x);
  if (abs < 1000) return String(Math.round(x));
  if (abs < 1_000_000) return `${(x / 1000).toFixed(abs < 10_000 ? 1 : 0).replace(/\.0$/, '')}k`;
  if (abs < 1_000_000_000) return `${(x / 1_000_000).toFixed(abs < 10_000_000 ? 1 : 0).replace(/\.0$/, '')}M`;
  return `${(x / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
}

function wrapText(text, maxCharsPerLine, maxLines = Infinity) {
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
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*$/, '') + '…';
  }
  return lines;
}

function timeAgo(utc) {
  const ms = Date.now() - (utc * 1000);
  const h = Math.max(1, Math.round(ms / 3.6e6));
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

async function fileToDataUri(pth, { width, height, fit = 'cover', format = 'jpeg', quality = 78 } = {}) {
  if (!pth) return null;
  try {
    let img = sharp(pth).resize(width, height, { fit });
    if (format === 'png') img = img.png({ compressionLevel: 9 });
    else if (format === 'webp') img = img.webp({ quality });
    else img = img.jpeg({ quality, mozjpeg: true });
    const buf = await img.toBuffer();
    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function makeSvg(post, { mediaData, avatarData } = {}) {
  const p = post.detail?.post || post;

  const W = 1200;
  const P = 44;
  const headerH = 96; // slightly taller header so title never collides with subreddit/username

  // Title/body need hard caps to avoid oversized cards & text spill.
  // Clamp with ellipsis so output is consistent run-to-run.
  const titleLines = wrapText(p.title, 54, 4);
  const titleH = titleLines.length * 46;

  const snippet = (p.selftext || '').trim().replace(/\s+/g, ' ');
  const snippetLines = snippet ? wrapText(snippet, 70, 6) : [];
  const snippetH = snippetLines.length ? (snippetLines.length * 34 + 14) : 0;

  // Media block (if downloaded)
  const mediaPath = post.media_extracted?.path || null;
  const mediaH = mediaData ? 420 : 0;

  const footerH = 78;
  const H = P + headerH + titleH + (mediaH ? (mediaH + 18) : 0) + snippetH + footerH + P;

  // Modern Reddit-ish light mode palette
  const bg = '#ffffff';
  const card = '#ffffff';
  const border = '#e5e7eb';
  const muted = '#6b7280';
  const text = '#111827';
  const accent = '#ff4500';
  const link = '#1d4ed8';
  const pillBg = '#f3f4f6';

  const ups = p.ups ?? post.ups ?? 0;
  const upsShort = compactNumber(ups);
  const com = p.num_comments ?? post.num_comments ?? 0;
  const ratio = (typeof p.upvote_ratio === 'number') ? p.upvote_ratio : null;
  const sub = p.subreddit || post.subreddit;
  const author = p.author || post.author;
  const ago = timeAgo(p.created_utc || post.created_utc);
  const viral = Math.round(post.viral_score || 0);

  const X0 = P + 96;

  const titleTspans = titleLines.map((ln, i) =>
    `<tspan x=\"${X0}\" dy=\"${i === 0 ? 0 : 46}\">${esc(ln)}</tspan>`
  ).join('');

  const snippetTspans = snippetLines.map((ln, i) =>
    `<tspan x=\"${P + 96}\" dy=\"${i === 0 ? 0 : 34}\">${esc(ln)}</tspan>`
  ).join('');

  const mediaBlock = mediaData ? `
    <g transform=\"translate(${P + 96}, ${P + headerH + titleH + 10})\">
      <rect x=\"0\" y=\"0\" rx=\"16\" ry=\"16\" width=\"${W - (P + 96) - P}\" height=\"${mediaH}\" fill=\"#0d141d\" stroke=\"${border}\" stroke-width=\"2\"/>
      <clipPath id=\"clip_${esc(p.id)}\"><rect x=\"0\" y=\"0\" rx=\"16\" ry=\"16\" width=\"${W - (P + 96) - P}\" height=\"${mediaH}\"/></clipPath>
      <image href=\"${mediaData}\" x=\"0\" y=\"0\" width=\"${W - (P + 96) - P}\" height=\"${mediaH}\" preserveAspectRatio=\"xMidYMid slice\" clip-path=\"url(#clip_${esc(p.id)})\"/>
    </g>
  ` : '';

  const snippetY = P + headerH + titleH + (mediaH ? (mediaH + 34) : 34) + (mediaH ? 18 : 0);
  const snippetBlock = snippetLines.length ? `
    <text x=\"${P + 96}\" y=\"${snippetY}\" fill=\"${text}\" font-size=\"26\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\" >
      ${snippetTspans}
    </text>
  ` : '';

  const ratioStr = (ratio === null) ? '—' : `${Math.round(ratio * 100)}%`;

  const AVX = X0;
  const AVY = P + 32;
  const AVS = 44;

  // Dummy avatar (reddit-ish): light gray circle with subtle border
  const dummyAvatar = `
    <circle cx=\"${AVX + AVS/2}\" cy=\"${AVY + AVS/2}\" r=\"${AVS/2}\" fill=\"${pillBg}\" stroke=\"${border}\" stroke-width=\"2\"/>
    <text x=\"${AVX + AVS/2}\" y=\"${AVY + AVS/2 + 7}\" text-anchor=\"middle\" fill=\"${muted}\" font-size=\"18\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">u/</text>
  `;

  const avatarBlock = avatarData ? `
    <g>
      <clipPath id=\"av_${esc(p.id)}\"><circle cx=\"${AVX + AVS/2}\" cy=\"${AVY + AVS/2}\" r=\"${AVS/2}\"/></clipPath>
      <circle cx=\"${AVX + AVS/2}\" cy=\"${AVY + AVS/2}\" r=\"${AVS/2}\" fill=\"${pillBg}\" stroke=\"${border}\" stroke-width=\"2\"/>
      <image href=\"${avatarData}\" x=\"${AVX}\" y=\"${AVY}\" width=\"${AVS}\" height=\"${AVS}\" preserveAspectRatio=\"xMidYMid slice\" clip-path=\"url(#av_${esc(p.id)})\"/>
    </g>
  ` : dummyAvatar;

  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${W}\" height=\"${H}\">
    <rect width=\"100%\" height=\"100%\" fill=\"${bg}\"/>
    <rect x=\"${P}\" y=\"${P}\" rx=\"16\" ry=\"16\" width=\"${W - 2 * P}\" height=\"${H - 2 * P}\" fill=\"${card}\" stroke=\"${border}\" stroke-width=\"2\"/>

    <!-- vote column -->
    <text x=\"${P + 40}\" y=\"${P + 62}\" fill=\"${muted}\" font-size=\"28\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">▲</text>
    <text x=\"${P + 34}\" y=\"${P + 110}\" fill=\"${text}\" font-weight=\"700\" font-size=\"26\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">${esc(upsShort)}</text>
    <text x=\"${P + 40}\" y=\"${P + 144}\" fill=\"${muted}\" font-size=\"14\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">ups</text>

    <line x1=\"${P + 88}\" y1=\"${P + 20}\" x2=\"${P + 88}\" y2=\"${H - P - 20}\" stroke=\"${border}\"/>

    <!-- header (avatar + subreddit + author + time) -->
    ${avatarBlock}

    <text x=\"${X0 + 58}\" y=\"${P + 54}\" fill=\"${text}\" font-size=\"18\" font-weight=\"700\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">r/${esc(sub)}</text>
    <text x=\"${X0 + 58}\" y=\"${P + 78}\" fill=\"${muted}\" font-size=\"15\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">u/${esc(author)} · ${esc(ago)} · (${esc(p.domain || post.domain || '')})</text>

    <!-- title -->
    <text x=\"${X0}\" y=\"${P + headerH + 18}\" fill=\"${text}\" font-weight=\"800\" font-size=\"34\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">${titleTspans}</text>

    ${mediaBlock}

    ${snippetBlock}

    <!-- footer actions -->
    <text x=\"${X0}\" y=\"${H - P - 22}\" fill=\"${muted}\" font-size=\"15\" font-family=\"Segoe UI, Roboto, Helvetica, Arial\">💬 ${com} Comments   ·   Share   ·   Save</text>
  </svg>`;
}

async function renderCards({ detailedPosts, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });
  const index = [];
  for (const post of detailedPosts) {
    const p = post.detail?.post || post;

    // Prepare media as a resized JPEG data URI (keeps SVG small)
    const mediaPath = post.media_extracted?.path || null;
    const mediaData = await fileToDataUri(mediaPath, { width: 1020, height: 420, format: 'jpeg', quality: 78 });

    const avatarPath = post.author_avatar?.path || null;
    const avatarData = await fileToDataUri(avatarPath, { width: 96, height: 96, format: 'png' });

    const svg = makeSvg(post, { mediaData, avatarData });
    const outPath = path.join(outDir, `${p.id}.png`);
    await sharp(Buffer.from(svg)).png({ quality: 92 }).toFile(outPath);

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
      media: post.media_extracted ? { type: post.media_extracted.type, url: post.media_extracted.url, path: post.media_extracted.path } : null
    });
  }
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  return index;
}

module.exports = { renderCards };
