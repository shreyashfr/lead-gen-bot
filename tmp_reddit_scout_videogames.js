// tmp_reddit_scout_videogames.js
// One-off manual run for "video games" niche using Reddit JSON endpoints.
// Saves normalized posts + top picks to workspace/reddit-scout-manual/

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'reddit-scout-manual', 'video-games');
fs.mkdirSync(OUT_DIR, { recursive: true });

const USER_AGENT = 'openclaw-reddit-scout/0.1 (manual; contact: local)';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function jget(url, { gapMs = 1200 } = {}) {
  // polite gap to avoid rate limits
  console.log('[GET]', url);
  await sleep(gapMs);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  let res;
  try {
    res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });
  } finally {
    clearTimeout(t);
  }
  console.log('[RES]', res.status, res.statusText, url);

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${txt.slice(0, 300)}`);
  }
  return res.json();
}

function nowISO() { return new Date().toISOString(); }

function uniq(arr) {
  const s = new Set();
  const out = [];
  for (const x of arr) { if (!s.has(x)) { s.add(x); out.push(x); } }
  return out;
}

function normalizePost(child) {
  const d = child?.data || {};
  return {
    id: d.id,
    name: d.name,
    subreddit: d.subreddit,
    title: d.title,
    selftext: d.selftext || '',
    author: d.author,
    created_utc: d.created_utc,
    permalink: d.permalink ? `https://www.reddit.com${d.permalink}` : null,
    url: d.url || null,
    domain: d.domain || null,
    is_self: !!d.is_self,
    over_18: !!d.over_18,
    spoiler: !!d.spoiler,
    locked: !!d.locked,
    stickied: !!d.stickied,
    ups: d.ups ?? d.score ?? 0,
    score: d.score ?? d.ups ?? 0,
    num_comments: d.num_comments ?? 0,
    upvote_ratio: d.upvote_ratio ?? null,
    thumbnail: d.thumbnail && typeof d.thumbnail === 'string' ? d.thumbnail : null,
    media: d.media || null,
    post_hint: d.post_hint || null,
  };
}

function ageHours(createdUtc) {
  if (!createdUtc) return 9999;
  const ageSec = (Date.now()/1000) - createdUtc;
  return Math.max(ageSec/3600, 0.01);
}

function viralScore(p, sourceKind) {
  // Heuristic: reward engagement velocity + discussion + positivity.
  // Uses available JSON fields only.
  const hrs = ageHours(p.created_utc);
  const ups = p.ups || 0;
  const com = p.num_comments || 0;
  const ratio = (typeof p.upvote_ratio === 'number') ? p.upvote_ratio : 0.9;

  const vUps = ups / Math.pow(hrs, 1.1);
  const vCom = com / Math.pow(hrs, 1.2);

  const ratioBoost = 0.5 + ratio; // 0.5..1.5
  const discussionBoost = 1 + Math.log10(1 + com);

  let sourceBoost = 1.0;
  if (sourceKind === 'rising') sourceBoost = 1.25;
  if (sourceKind === 'hot') sourceBoost = 1.1;
  if (sourceKind === 'top:day') sourceBoost = 1.15;
  if (sourceKind === 'top:week') sourceBoost = 1.05;
  if (sourceKind === 'top:month') sourceBoost = 1.0;

  const base = (vUps * 0.7 + vCom * 1.1) * ratioBoost * discussionBoost * sourceBoost;

  // small penalty for stickied/locked (often announcements)
  const penalty = (p.stickied ? 0.7 : 1.0) * (p.locked ? 0.85 : 1.0);

  return base * penalty;
}

async function subredditSearch(keyword) {
  const url = `https://old.reddit.com/subreddits/search.json?q=${encodeURIComponent(keyword)}`;
  const j = await jget(url);
  const children = j?.data?.children || [];
  return children.map(c => ({
    name: c?.data?.display_name,
    title: c?.data?.title,
    subscribers: c?.data?.subscribers ?? 0,
    over18: !!c?.data?.over18,
    url: c?.data?.url ? `https://www.reddit.com${c.data.url}` : null
  })).filter(x => x.name);
}

async function fetchListing(sub, kind, url) {
  const j = await jget(url);
  const children = j?.data?.children || [];
  return children.map(normalizePost).map(p => ({
    ...p,
    listing: kind,
    viral_score: viralScore(p, kind)
  }));
}

async function fetchPostDetail(permalink) {
  // permalink like https://www.reddit.com/r/X/comments/ID/slug/
  const url = permalink.endsWith('/') ? `${permalink}.json` : `${permalink}/.json`;
  const j = await jget(url);
  // j is [postListing, commentListing]
  const post = j?.[0]?.data?.children?.[0]?.data;
  const comments = (j?.[1]?.data?.children || []).map(c => c?.data).filter(Boolean);
  const topComments = comments
    .filter(c => typeof c.body === 'string')
    .sort((a,b) => (b.ups||0) - (a.ups||0))
    .slice(0, 3)
    .map(c => ({ author: c.author, ups: c.ups, body: c.body }));
  return {
    post: post ? {
      id: post.id,
      title: post.title,
      selftext: post.selftext || '',
      author: post.author,
      subreddit: post.subreddit,
      created_utc: post.created_utc,
      ups: post.ups,
      num_comments: post.num_comments,
      upvote_ratio: post.upvote_ratio,
      permalink: `https://www.reddit.com${post.permalink}`,
      url: post.url,
      is_self: !!post.is_self,
      post_hint: post.post_hint || null,
      thumbnail: post.thumbnail || null
    } : null,
    topComments
  };
}

async function main() {
  const run = {
    niche: 'video games',
    startedAt: nowISO(),
    keywords: [
      // reduced set for a quick manual run
      'video games', 'gaming', 'indie games', 'pc gaming', 'nintendo', 'playstation'
    ],
    notes: 'Manual run. Keywords are pre-expanded (LLM-free).'
  };

  fs.writeFileSync(path.join(OUT_DIR, 'run_meta.json'), JSON.stringify(run, null, 2));

  // 1) Discover subreddits per keyword
  const subMap = new Map();
  for (const kw of run.keywords) {
    const subs = await subredditSearch(kw).catch(e => {
      console.error('subredditSearch failed for', kw, e.message);
      return [];
    });
    for (const s of subs) {
      const key = s.name.toLowerCase();
      const prev = subMap.get(key);
      if (!prev || (s.subscribers || 0) > (prev.subscribers || 0)) {
        subMap.set(key, { ...s, discoveredBy: uniq([...(prev?.discoveredBy||[]), kw]) });
      } else {
        prev.discoveredBy = uniq([...(prev.discoveredBy||[]), kw]);
      }
    }
  }

  let subreddits = Array.from(subMap.values())
    .filter(s => !s.over18)
    .sort((a,b) => (b.subscribers||0) - (a.subscribers||0))
    .slice(0, 10); // cap for quick manual run (polite)

  fs.writeFileSync(path.join(OUT_DIR, 'subreddits.json'), JSON.stringify(subreddits, null, 2));

  // 2) Fetch posts from each subreddit (top/day week month, hot, rising)
  const all = [];
  for (const s of subreddits) {
    const sub = s.name;
    const base = `https://www.reddit.com/r/${encodeURIComponent(sub)}`;
    const endpoints = [
      ['top:day', `${base}/top.json?t=day&limit=25`],
      ['top:week', `${base}/top.json?t=week&limit=25`],
      ['top:month', `${base}/top.json?t=month&limit=25`],
      ['hot', `${base}/hot.json?limit=25`],
      ['rising', `${base}/rising.json?limit=25`]
    ];
    for (const [kind, url] of endpoints) {
      try {
        const posts = await fetchListing(sub, kind, url);
        for (const p of posts) all.push(p);
      } catch (e) {
        console.error('fetchListing failed', sub, kind, e.message);
      }
    }
  }

  // 3) Dedupe posts by id (keep max viral_score)
  const postMap = new Map();
  for (const p of all) {
    if (!p.id) continue;
    const prev = postMap.get(p.id);
    if (!prev || (p.viral_score || 0) > (prev.viral_score || 0)) postMap.set(p.id, p);
  }

  const posts = Array.from(postMap.values())
    .filter(p => !p.over_18)
    .sort((a,b) => (b.viral_score||0) - (a.viral_score||0));

  fs.writeFileSync(path.join(OUT_DIR, 'posts_ranked.json'), JSON.stringify(posts.slice(0, 200), null, 2));

  // 4) Fetch detailed JSON for top N
  const topN = 12;
  const top = posts.slice(0, topN);
  const detailed = [];
  for (const p of top) {
    if (!p.permalink) continue;
    try {
      const det = await fetchPostDetail(p.permalink);
      detailed.push({ ...p, detail: det });
    } catch (e) {
      console.error('fetchPostDetail failed', p.permalink, e.message);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'top_posts_detailed.json'), JSON.stringify(detailed, null, 2));

  console.log('Done. Output at:', OUT_DIR);
  console.log('Top posts:', detailed.length);
}

main().catch(e => { console.error(e); process.exit(1); });
