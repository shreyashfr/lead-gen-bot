#!/usr/bin/env node
/**
 * youtube-scout — yt-dlp-based viral YouTube research pipeline
 * Searches YouTube for a query, scores by views, fetches transcripts (best-effort).
 * Mirrors reddit-scout / twitter-scout output shape for coordinator integration.
 *
 * Usage:
 *   node pipeline.js --query "AI careers 2026" --out /path/to/output --topN 8 [--printChat]
 */

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
const QUERY      = getArg('--query', null);
const OUT_DIR    = getArg('--out', path.join(process.cwd(), 'youtube-scout'));
const TOP_N      = parseInt(getArg('--topN', '8'));
const SEARCH_N   = parseInt(getArg('--searchN', '20'));
const PRINT_CHAT = args.includes('--printChat');
const YTDLP      = process.env.YTDLP_BIN || '/home/ubuntu/yt-dlp';

if (!QUERY) {
  console.error('Usage: node pipeline.js --query "topic" [--out dir] [--topN 8] [--printChat]');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function chat(msg) { if (PRINT_CHAT) console.log(msg); }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function viralScore(viewCount) {
  if (!viewCount || viewCount <= 0) return 1;
  return parseFloat(Math.min(10, Math.max(1, Math.log10(viewCount))).toFixed(1));
}

function runYtDlp(ytArgs, opts = {}) {
  const result = spawnSync(YTDLP, ytArgs, {
    encoding: 'utf8',
    timeout: opts.timeout || 60000,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

// ── Step 1: Search YouTube ────────────────────────────────────────────────────
function searchYouTube(query, count) {
  chat(`🔍 Searching YouTube: "${query}" (top ${count})...`);

  const result = runYtDlp([
    `ytsearch${count}:${query}`,
    '--dump-json',
    '--no-download',
    '--flat-playlist',
    '--no-warnings',
    '--quiet',
  ], { timeout: 90000 });

  if (!result.stdout) {
    chat(`⚠️  yt-dlp search returned no output: ${result.stderr.slice(0, 200)}`);
    return [];
  }

  const videos = [];
  for (const line of result.stdout.trim().split('\n').filter(Boolean)) {
    try {
      const v = JSON.parse(line);
      if (!v.id) continue;
      videos.push({
        id:           v.id,
        title:        v.title || '(no title)',
        url:          v.webpage_url || `https://www.youtube.com/watch?v=${v.id}`,
        channel:      v.channel || v.uploader || 'Unknown',
        viewCount:    v.view_count || 0,
        likeCount:    v.like_count || 0,
        commentCount: v.comment_count || 0,
        duration:     v.duration || 0,
        uploadDate:   v.upload_date || '',
        description:  (v.description || '').slice(0, 600),
        thumbnailUrl: v.thumbnail || '',
      });
    } catch (_) {}
  }

  chat(`✅ Found ${videos.length} videos`);
  return videos;
}

// ── Step 2: Get full video details (description etc.) ─────────────────────────
function getVideoDetails(videoId) {
  const result = runYtDlp([
    `https://www.youtube.com/watch?v=${videoId}`,
    '--dump-json',
    '--no-download',
    '--no-warnings',
    '--quiet',
  ], { timeout: 30000 });

  if (!result.stdout) return null;
  try {
    return JSON.parse(result.stdout.trim().split('\n')[0]);
  } catch (_) { return null; }
}

// ── Step 3: Try transcript (best-effort via youtubei.js) ──────────────────────
async function fetchTranscript(videoId) {
  try {
    // Suppress youtubei.js internal logs
    const origWarn = console.warn;
    const origError = console.error;
    console.warn = () => {};
    const { Innertube } = require('youtubei.js');
    const yt = await Innertube.create({ generate_session_locally: true });
    const info = await yt.getInfo(videoId);
    const t = await info.getTranscript();
    const segs = t?.transcript?.content?.body?.initial_segments || [];
    console.warn = origWarn;
    console.error = origError;
    if (!segs.length) return null;
    return segs
      .map(s => s.snippet?.runs?.map(r => r.text).join('') || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
  } catch (_) {
    return null;
  }
}

// ── Step 4: Rank by views ─────────────────────────────────────────────────────
function rankVideos(videos, topN) {
  return videos
    .map(v => ({ ...v, viralScore: viralScore(v.viewCount) }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, topN);
}

// ── Step 5: Build report ──────────────────────────────────────────────────────
function buildReport(query, videos) {
  const date = new Date().toISOString().split('T')[0];
  let report = `## YOUTUBE SCOUT REPORT — ${query}\nDate: ${date}\nVideos analysed: ${videos.length}\n\n### Top Viral Videos\n\n`;

  for (const v of videos) {
    const views = v.viewCount.toLocaleString();
    const dur = v.duration ? `${Math.floor(v.duration / 60)}m${v.duration % 60}s` : 'N/A';
    const uploaded = v.uploadDate
      ? `${v.uploadDate.slice(0,4)}-${v.uploadDate.slice(4,6)}-${v.uploadDate.slice(6,8)}`
      : 'N/A';

    report += `---\nTitle: ${v.title}\nChannel: ${v.channel}\n`;
    report += `Views: ${views} | Likes: ${v.likeCount || 'N/A'} | Duration: ${dur}\n`;
    report += `Uploaded: ${uploaded} | Viral Score: ${v.viralScore}/10\n`;
    report += `URL: ${v.url}\n`;

    if (v.transcript) {
      report += `Transcript excerpt: "${v.transcript.slice(0, 500)}..."\n`;
    } else if (v.description) {
      report += `Description: "${v.description.slice(0, 400)}"\n`;
    }
    report += '\n';
  }

  report += `\n### SOURCE URLS (for idea-generator)\n`;
  for (const v of videos) {
    const kViews = (v.viewCount / 1000).toFixed(0);
    report += `- ${v.title} (${kViews}K views)\n  URL: ${v.url}\n`;
  }

  return report;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const slug  = slugify(QUERY);
  const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 23) + 'Z';
  const runDir = path.join(OUT_DIR, slug, 'runs', runId);
  fs.mkdirSync(runDir, { recursive: true });

  chat(`\n🎬 YouTube Scout: "${QUERY}"`);
  chat(`   Output: ${runDir}\n`);

  // Search
  const allVideos = searchYouTube(QUERY, SEARCH_N);
  if (!allVideos.length) {
    console.error('❌ No videos found.');
    process.exit(1);
  }

  // Rank
  const topVideos = rankVideos(allVideos, TOP_N);
  chat(`\n📊 Top ${topVideos.length} videos:`);
  for (const v of topVideos) {
    chat(`  ${v.viralScore}/10 | ${(v.viewCount/1000).toFixed(0)}K | ${v.title.slice(0,60)}`);
  }

  // Enrich descriptions (get full description if short)
  chat(`\n📋 Enriching video details...`);
  for (const v of topVideos) {
    if (v.description.length < 100) {
      const details = getVideoDetails(v.id);
      if (details?.description) {
        v.description = details.description.slice(0, 600);
      }
    }
  }

  // Transcripts (best-effort)
  chat(`\n📜 Attempting transcripts...`);
  let transcriptCount = 0;
  for (const v of topVideos) {
    v.transcript = await fetchTranscript(v.id);
    if (v.transcript) {
      transcriptCount++;
      chat(`  ✅ ${v.id}: got transcript`);
    } else {
      chat(`  ⚠️  ${v.id}: using description fallback`);
    }
  }
  chat(`   Transcripts: ${transcriptCount}/${topVideos.length} (rest use description)`);

  // Save
  fs.writeFileSync(path.join(runDir, 'posts_ranked.json'), JSON.stringify(topVideos, null, 2));

  const report = buildReport(QUERY, topVideos);
  fs.writeFileSync(path.join(runDir, 'report.md'), report);

  // chat.md — condensed for coordinator
  const chatMd = topVideos.map(v => {
    const context = v.transcript
      ? `Transcript: "${v.transcript.slice(0, 300)}..."`
      : `Description: "${v.description.slice(0, 300)}"`;
    return `### ${v.title}\n- Views: ${v.viewCount.toLocaleString()} | Score: ${v.viralScore}/10\n- Channel: ${v.channel}\n- URL: ${v.url}\n- ${context}\n`;
  }).join('\n');
  fs.writeFileSync(path.join(runDir, 'chat.md'), chatMd);

  chat(`\n✅ YouTube Scout complete! → ${path.join(runDir, 'report.md')}`);
  chat(`--- COORDINATOR SUMMARY ---`);

  // Stdout for coordinator
  console.log(`\n## YouTube Scout Results: "${QUERY}"\n`);
  for (const v of topVideos) {
    console.log(`📹 ${v.title}`);
    console.log(`   Channel: ${v.channel} | Views: ${(v.viewCount/1000).toFixed(0)}K | Score: ${v.viralScore}/10`);
    console.log(`   URL: ${v.url}`);
    const context = v.transcript || v.description;
    if (context) console.log(`   Context: "${context.slice(0, 200)}..."`);
    console.log('');
  }
}

run().catch(err => {
  console.error('❌ YouTube Scout error:', err.message);
  process.exit(1);
});
