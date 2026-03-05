// relevance.js

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const STOP = new Set(['and','or','the','for','with','without','to','of','in','on','a','an','is','are','business','shop','store','because','due','loss','take','taking','make','making']);

function buildKeywordSet({ niche, keywords = [], mustInclude = [] }) {
  const toks = new Set();
  const add = (w) => {
    if (!w) return;
    if (w.length < 4) return; // avoid broad matches
    if (STOP.has(w)) return;
    toks.add(w);
  };
  for (const w of tokenize(niche)) add(w);
  for (const k of keywords) for (const w of tokenize(k)) add(w);
  for (const k of mustInclude) for (const w of tokenize(k)) add(w);
  return toks;
}

function isRelevantSubreddit(sub, keywordSet) {
  // Filter out huge generic subs unless they clearly match.
  // Exception: if the niche is memes, allow meme-heavy generic subs.
  const wantsMemes = keywordSet.has('meme') || keywordSet.has('memes');
  const genericBlock = wantsMemes
    ? new Set(['pics','aww','news','videos','todayilearned','mildlyinteresting'])
    : new Set(['pics','funny','aww','memes','news','videos','askreddit','todayilearned','mildlyinteresting']);
  const name = String(sub?.name || '').toLowerCase();
  if (genericBlock.has(name)) return false;

  const hay = `${sub?.name || ''} ${sub?.title || ''}`.toLowerCase();
  let hits = 0;
  for (const w of keywordSet) {
    if (hay.includes(w)) hits++;
    if (hits >= 1) return true;
  }
  return false;
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsAnyWordBoundary(hay, terms) {
  const text = String(hay || '').toLowerCase();
  for (const t of terms || []) {
    if (!t) continue;
    const tt = String(t).toLowerCase();
    // If phrase has spaces, do simple includes (word boundaries across spaces are messy)
    if (tt.includes(' ')) {
      if (text.includes(tt)) return true;
      continue;
    }
    const re = new RegExp(`\\b${escapeRe(tt)}\\b`, 'i');
    if (re.test(text)) return true;
  }
  return false;
}

function postContainsKeywords(post, mustIncludeWords) {
  if (!mustIncludeWords || mustIncludeWords.length === 0) return true;
  const hay = `${post?.title || ''} ${post?.selftext || ''}`;
  return containsAnyWordBoundary(hay, mustIncludeWords);
}

function postMatchesConceptAnd(post, conceptGroups) {
  if (!conceptGroups || conceptGroups.length === 0) return true;

  // Prefer early context to avoid accidental matches deep in long posts.
  const title = String(post?.title || '');
  const body = String(post?.selftext || '');
  const windowed = (title + ' ' + body).slice(0, 600);

  return conceptGroups.every(group => containsAnyWordBoundary(windowed, group));
}

module.exports = { tokenize, buildKeywordSet, isRelevantSubreddit, postContainsKeywords, postMatchesConceptAnd, containsAnyWordBoundary };
