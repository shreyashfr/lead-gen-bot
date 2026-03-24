// pipeline.js
// End-to-end: subreddit discovery -> listings -> score -> topN detail -> render cards.
// Usage:
//   node pipeline.js --niche "Video games" --out "C:/Users/.../workspace/reddit-scout" --topN 12 --subLimit 10 --gapMs 1200

const fs = require('fs');
const path = require('path');

const { jget } = require('./reddit_http');
const { viralScore } = require('./score');
const { renderCards } = require('./render_cards');
const { downloadPostMedia, pickGalleryMediaUrl } = require('./media');
const { ensureAvatar } = require('./avatars');
const { tokenize, buildKeywordSet, isRelevantSubreddit, postContainsKeywords, postTitleMatchesKeywords, postMatchesConceptAnd, postMatchesAllConcepts, containsAnyWordBoundary, isBlockedSub } = require('./relevance');
const { CONCEPTS, nicheImpliesJoblossAi } = require('./concepts');
const { generateReportAndChat } = require('./report');

function arg(name, def = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  return process.argv[idx + 1] ?? def;
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

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

async function subredditSearch(keyword, opts) {
  const url = `https://old.reddit.com/subreddits/search.json?q=${encodeURIComponent(keyword)}`;
  const j = await jget(url, opts);
  const children = j?.data?.children || [];
  return children.map(c => ({
    name: c?.data?.display_name,
    title: c?.data?.title,
    subscribers: c?.data?.subscribers ?? 0,
    over18: !!c?.data?.over18,
    url: c?.data?.url ? `https://www.reddit.com${c.data.url}` : null
  })).filter(x => x.name);
}

async function fetchListing(sub, kind, url, opts, mustIncludeWords, conceptAnd, titleMustWords) {
  const j = await jget(url, opts);
  const children = j?.data?.children || [];
  return children
    .map(normalizePost)
    .filter(p => !isBlockedSub(p.subreddit))
    .filter(p => postTitleMatchesKeywords(p, titleMustWords))   // title-first: primary signal
    .filter(p => postContainsKeywords(p, mustIncludeWords))      // body: secondary confirm
    .filter(p => postMatchesConceptAnd(p, conceptAnd))
    .map(p => ({
      ...p,
      listing: kind,
      viral_score: viralScore(p, kind)
    }));
}

async function fetchPostDetail(permalink, opts) {
  const url = permalink.endsWith('/') ? `${permalink}.json` : `${permalink}/.json`;
  const j = await jget(url, opts);
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
      thumbnail: post.thumbnail || null,
      // keep extra fields for media extraction (gallery, preview)
      is_gallery: !!post.is_gallery,
      gallery_data: post.gallery_data || null,
      media_metadata: post.media_metadata || null,
      preview: post.preview || null,
      media: post.media || null
    } : null,
    topComments
  };
}

async function main() {
  const niche = arg('niche');
  const outRoot = arg('out');
  if (!niche || !outRoot) {
    console.error('Missing --niche and/or --out');
    process.exit(2);
  }

  // Default: return >10 posts unless the user overrides.
  const topN = parseInt(arg('topN', '15'), 10);
  const subLimit = parseInt(arg('subLimit', '10'), 10);
  const gapMs = parseInt(arg('gapMs', '1200'), 10);
  const limitPerListing = parseInt(arg('limitPerListing', '25'), 10);

  const minSubscribers = parseInt(arg('minSubscribers', '0'), 10);
  const subAllowlistRaw = arg('subAllowlist', '') || '';
  const subAllowlist = subAllowlistRaw
    ? new Set(subAllowlistRaw.split(',').map(s => s.trim()).filter(Boolean).map(s => s.toLowerCase()))
    : null;

  // Controls
  // --time: day|week|month|all (default all)
  // --kinds: comma list of top,hot,rising (default top,hot,rising)
  const time = (arg('time', 'all') || 'all').toLowerCase();
  const kindsRaw = (arg('kinds', 'top,hot,rising') || 'top,hot,rising');
  const kinds = new Set(kindsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));

  // Global search endpoint
  // By default we auto-search using the niche meaning (tokenized & joined with +).
  const searchAuto = String(arg('searchAuto', '1')) !== '0';
  const searchRaw = arg('search', '') || '';
  const search = (searchRaw || (searchAuto ? niche : '')).trim();
  const searchSort = (arg('searchSort', 'top') || 'top').toLowerCase();
  const searchTime = (arg('searchTime', '') || '').toLowerCase();

  const keywordsRaw = arg('keywords', '') || '';
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [niche];

  const mustIncludeRaw = arg('mustInclude', '') || '';
  let mustInclude = mustIncludeRaw
    ? mustIncludeRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Tech/domain terms that are important even if short (2-3 chars)
  const TECH_EXCEPTIONS = new Set(['rag','ai','ml','io','qa','llm','gpt','nlp','cv','sr','cr','db','etl','api','sql','dto','cli','jwt','grpc','http','json','xml','html','css','pdf','xls','csv','vpc','ecs','k8s','ci','cd','ar','vr','mr','xr','iot','5g','tp','sla','rto','rpo','qos','tcp','udp','dns','cdn','sso','mfa','dlt','nft','web3','p2p','l1','l2','dapp','defi','agg','vault','numb','num']);
  
  // Default: if user didn't specify mustInclude, use niche tokens (>=4 chars OR tech exceptions) so we don't drift to unrelated subs.
  if (mustInclude.length === 0) {
    const toks = tokenize(niche).filter(w => w.length >= 4 || TECH_EXCEPTIONS.has(w.toLowerCase()));
    mustInclude = toks.length ? toks : [];
  }

  const mustIncludeWords = mustInclude.map(s => s.toLowerCase());

  // Title-first filter: most specific tokens from the niche (>=3 chars OR tech exceptions, not generic stop words).
  // Posts whose TITLE doesn't mention any of these are almost never relevant.
  // Minimum 3 chars to preserve short but specific tech terms (LLM, GPT, RAG, AI, etc.)
  const TITLE_STOP = new Set(['usage','using','about','their','these','those','with','from','that','this','have','data','and','for','the','of','in','on','a','an','is','are']);
  const titleMustWords = mustInclude
    .map(s => s.toLowerCase())
    .filter(w => (w.length >= 3 || TECH_EXCEPTIONS.has(w)) && !TITLE_STOP.has(w));

  const keywordSet = buildKeywordSet({ niche, keywords, mustInclude });

  // Concept AND filters (auto): for niches like "job loss because of AI"
  const wantsJoblossAi = nicheImpliesJoblossAi(niche);
  const conceptAnd = wantsJoblossAi
    ? [CONCEPTS.jobloss, CONCEPTS.ai]
    : null;

  // If concept gating is active and the user didn't explicitly request mustInclude,
  // don't ALSO require literal niche tokens like "because" / "laid".
  if (conceptAnd && mustIncludeRaw.trim() === '') {
    mustIncludeWords.length = 0;
  }

  // Meme mode: if the niche is memes and user didn't specify mustInclude,
  // don't require the literal word "meme" in every title/selftext.
  const wantsMemes = keywordSet.has('meme') || keywordSet.has('memes');
  if (wantsMemes && mustIncludeRaw.trim() === '') {
    // disable keyword gating for posts; subreddit-level filters will handle relevance
    mustIncludeWords.length = 0;
  }

  // If user didn't specify a subreddit allowlist and this is meme mode,
  // prefer big meme subreddits.
  const defaultMemeSubs = new Set([
    'memes','dankmemes','me_irl','wholesomememes','meme','memeconomy',
    'prequelmemes','historymemes','lotrmemes','animemes',
    'programmerhumor','minecraftmemes','relationshipmemes'
  ]);

  const defaultJoblossAiSubs = new Set([
    'jobs','layoffs','jobsearchhacks','careerguidance','career_advice','recruitinghell',
    'cscareerquestions','antiwork','work','technology','futurology','artificial','singularity'
  ]);

  const effectiveAllowlist = subAllowlist
    || (wantsMemes ? defaultMemeSubs : null)
    || (wantsJoblossAi ? defaultJoblossAiSubs : null);


  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const nicheSlug = slugify(niche);
  const runDir = path.join(outRoot, nicheSlug, 'runs', runId);
  fs.mkdirSync(runDir, { recursive: true });

  // Ensure sharp available in run dir for renderer (install once per skill runtime env).
  // In this repo, renderer requires sharp from node resolution.

  const opts = {
    gapMs,
    log: true,
    userAgent: 'openclaw-reddit-scout/0.1 (skill; contact: local)'
  };

  const sendCardsN = parseInt(arg('sendCardsN', '5'), 10);

  const meta = {
    niche,
    nicheSlug,
    runId,
    startedAt: new Date().toISOString(),
    keywords,
    mustInclude,
    search: search || null,
    subAllowlist: effectiveAllowlist ? Array.from(effectiveAllowlist) : null,
    config: { topN, subLimit, gapMs, limitPerListing, time, kinds: Array.from(kinds), searchSort, searchTime: searchTime || null, minSubscribers, sendCardsN }
  };
  fs.writeFileSync(path.join(runDir, 'run_meta.json'), JSON.stringify(meta, null, 2));

  // 1) Discover subreddits (unless user provided an explicit allowlist)
  let subreddits = [];

  if (subAllowlist) {
    // If user explicitly gave subAllowlist, use it directly (no discovery dependency).
    subreddits = Array.from(subAllowlist).map(n => {
      const name = String(n).trim();
      return {
        name,
        title: name,
        subscribers: 0,
        over18: false,
        url: `https://www.reddit.com/r/${encodeURIComponent(name)}/`,
        discoveredBy: ['--subAllowlist']
      };
    }).slice(0, subLimit);
  } else {
    const subMap = new Map();
    for (const kw of keywords) {
      let subs = [];
      try { subs = await subredditSearch(kw, opts); } catch (e) { console.error('subsearch fail', kw, e.message); }
      for (const s of subs) {
        if (s.over18) continue;
        const key = s.name.toLowerCase();
        const prev = subMap.get(key);
        if (!prev || (s.subscribers || 0) > (prev.subscribers || 0)) {
          subMap.set(key, { ...s, discoveredBy: uniq([...(prev?.discoveredBy||[]), kw]) });
        } else {
          prev.discoveredBy = uniq([...(prev.discoveredBy||[]), kw]);
        }
      }
    }

    subreddits = Array.from(subMap.values())
      .filter(s => !minSubscribers || (s.subscribers || 0) >= minSubscribers)
      .filter(s => {
        if (effectiveAllowlist) return effectiveAllowlist.has(String(s.name||'').toLowerCase());
        return isRelevantSubreddit(s, keywordSet);
      })
      .sort((a,b) => (b.subscribers||0) - (a.subscribers||0))
      .slice(0, subLimit);
  }

  fs.writeFileSync(path.join(runDir, 'subreddits.json'), JSON.stringify(subreddits, null, 2));

  // 2) Fetch listings
  const all = [];
  for (const s of subreddits) {
    const sub = s.name;
    const base = `https://www.reddit.com/r/${encodeURIComponent(sub)}`;
    const endpoints = [];

    if (kinds.has('top')) {
      const times = (time === 'all') ? ['day','week','month'] : [time];
      for (const t of times) {
        if (!['day','week','month'].includes(t)) continue;
        endpoints.push([`top:${t}`, `${base}/top.json?t=${t}&limit=${limitPerListing}`]);
      }
    }

    if (kinds.has('hot')) endpoints.push(['hot', `${base}/hot.json?limit=${limitPerListing}`]);
    if (kinds.has('rising')) endpoints.push(['rising', `${base}/rising.json?limit=${limitPerListing}`]);
    for (const [kind, url] of endpoints) {
      try {
        const posts = await fetchListing(sub, kind, url, opts, mustIncludeWords, conceptAnd, titleMustWords);
        all.push(...posts);
      } catch (e) {
        console.error('listing fail', sub, kind, e.message);
      }
    }
  }

  // 2b) Optional global search (adds candidates outside discovered subreddits)
  if (search) {
    // Build a good sentence-like query with + joins (user request)
    const terms = String(search).split(/\s+/).filter(Boolean);
    const q = terms.map(encodeURIComponent).join('+');
    // map --time to search t= param when possible
    const tMap = { day: 'day', week: 'week', month: 'month' };
    const t = searchTime || tMap[time] || 'all';
    const url = `https://www.reddit.com/search.json?q=${q}&sort=${encodeURIComponent(searchSort)}&t=${encodeURIComponent(t)}&limit=${limitPerListing}`;
    try {
      const j = await jget(url, opts);
      const children = j?.data?.children || [];
      const posts = children
        .map(normalizePost)
        .filter(p => !isBlockedSub(p.subreddit))
        .filter(p => postTitleMatchesKeywords(p, titleMustWords))
        .filter(p => postContainsKeywords(p, mustIncludeWords))
        .filter(p => postMatchesConceptAnd(p, conceptAnd))
        .map(p => ({ ...p, listing: `search:${searchSort}:${t}`, viral_score: viralScore(p, `search:${searchSort}`) }));
      all.push(...posts);
    } catch (e) {
      console.error('search fail', e.message);
    }
  }

  // 3) Dedupe
  const postMap = new Map();
  for (const p of all) {
    if (!p.id) continue;
    const prev = postMap.get(p.id);
    if (!prev || (p.viral_score || 0) > (prev.viral_score || 0)) postMap.set(p.id, p);
  }

  const ranked = Array.from(postMap.values())
    .filter(p => !p.over_18)
    .sort((a,b) => (b.viral_score||0) - (a.viral_score||0));

  fs.writeFileSync(path.join(runDir, 'posts_ranked.json'), JSON.stringify(ranked.slice(0, 200), null, 2));

  // 4) Detail fetch for topN — fall back to base post data if detail fetch fails
  const top = ranked.slice(0, topN);
  const detailed = [];
  for (const p of top) {
    if (!p.permalink) {
      detailed.push({ ...p, detail: null });
      continue;
    }
    try {
      const det = await fetchPostDetail(p.permalink, opts);
      detailed.push({ ...p, detail: det });
    } catch (e) {
      console.error('detail fail', p.permalink, e.message);
      // Still include the post — just without comments/selftext detail
      detailed.push({ ...p, detail: null });
    }
  }

  fs.writeFileSync(path.join(runDir, 'top_posts_detailed.json'), JSON.stringify(detailed, null, 2));

  // 5) Download media (best-effort) for top posts
  const mediaDir = path.join(runDir, 'media');
  fs.mkdirSync(mediaDir, { recursive: true });

  // 5b) Avatars (best-effort)
  const avatarsDir = path.join(runDir, 'avatars');
  fs.mkdirSync(avatarsDir, { recursive: true });
  const avatarCachePath = path.join(outRoot, '_cache', 'avatars.json');
  for (const item of detailed) {
    // Try listing-normalized fields first (often has better thumbnails), then detail.post.
    const base = item;
    const det = item.detail?.post || null;
    const pid = (det?.id || base.id);

    // Media
    try {
      let media = await downloadPostMedia(base, { mediaDir, id: pid, userAgent: opts.userAgent });
      if (!media && det) media = await downloadPostMedia(det, { mediaDir, id: pid, userAgent: opts.userAgent });
      if (media) item.media_extracted = media;
    } catch {
      item.media_extracted = item.media_extracted || null;
    }

    // Avatar
    const author = det?.author || base.author;
    if (author) {
      try {
        const av = await ensureAvatar(author, { runAvatarsDir: avatarsDir, cachePath: avatarCachePath, opts });
        if (av) item.author_avatar = av;
      } catch {
        // ignore
      }
    }
  }
  fs.writeFileSync(path.join(runDir, 'top_posts_detailed.json'), JSON.stringify(detailed, null, 2));

  // 6) Render cards (will include media if available)
  const cardsDir = path.join(runDir, 'cards');
  const index = await renderCards({ detailedPosts: detailed, outDir: cardsDir });

  // 7) Generate report + deterministic chat markdown
  const report = await generateReportAndChat({ runDir, meta, ranked, detailedPosts: detailed, cardsIndex: index });

  console.log('Done. Run dir:', runDir);
  console.log('Cards:', index.length);
  console.log('Report:', report.reportPath);
  console.log('Chat:', report.chatPath);

  const printChat = String(arg('printChat', '1')) !== '0';
  if (printChat) {
    console.log('\n===== CHAT_OUTPUT (markdown) =====\n');
    console.log(report.chatMarkdown);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
