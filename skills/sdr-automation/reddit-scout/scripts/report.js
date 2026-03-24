// report.js
// Turn pipeline outputs into a deterministic report.md + chat.md

const fs = require('fs');
const path = require('path');

function escMd(s) {
  return String(s || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const STOP = new Set([
  'a','an','the','and','or','to','of','in','on','for','with','without','is','are','was','were','be','been','being',
  'i','me','my','we','our','you','your','they','their','he','she','it','this','that','these','those',
  'as','at','by','from','not','but','if','then','so','than','just','very','really','can','could','should','would',
  'because','due','got','get','getting','im','ive','dont','didnt','doesnt','cant','wont'
]);

function topTerms(texts, { minLen = 4, topK = 12 } = {}) {
  const counts = new Map();
  for (const t of texts) {
    for (const w of tokenize(t)) {
      if (w.length < minLen) continue;
      if (STOP.has(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a,b) => b[1] - a[1])
    .slice(0, topK)
    .map(([w,c]) => ({ w, c }));
}

function deriveAngles({ detailedPosts = [] }) {
  const titles = detailedPosts.map(p => p?.detail?.post?.title || p?.title || '').filter(Boolean);
  const comments = detailedPosts.flatMap(p => (p?.detail?.topComments || []).map(c => c?.body || '')).filter(Boolean);
  const terms = topTerms([...titles, ...comments], { topK: 18 });
  const top = terms.map(t => t.w);

  const has = (needle) => titles.some(x => String(x).toLowerCase().includes(needle));
  const mode = {
    jobloss: has('laid off') || has('layoff') || has('laid-off') || has('fired'),
    ai: has('ai') || has('chatgpt') || has('llm')
  };

  // Deterministic templates; fill with extracted terms.
  const pick = (i, fallback) => top[i] || fallback;
  const ideas = [];

  ideas.push({
    title: mode.jobloss ? '"I got laid off" story → what happened next (timeline + receipts)' : 'Personal story → timeline + receipts',
    hook: 'Hook with 1 line, then a 5-step timeline; end with the lesson and what you would do differently.'
  });

  ideas.push({
    title: `My ${pick(0,'role')} got automated: what I automated back (tools + workflow)`,
    hook: 'Turn it into a before/after workflow post. Include exact tool stack + steps.'
  });

  ideas.push({
    title: `Checklist: how to stay valuable when ${pick(1,'automation')} hits your team`,
    hook: 'A numbered checklist (10 items). Make it practical: skills, portfolio, outreach, proof-of-work.'
  });

  ideas.push({
    title: `Hot take: ${pick(2,'ai')} isn\'t the problem — ${pick(3,'management')} is`,
    hook: 'Contrarian framing. Back it with 2 examples from the top posts and 1 counterexample.'
  });

  ideas.push({
    title: `Debunk thread: "AI will replace ${pick(4,'developers')}" vs what\'s actually happening`,
    hook: 'Use 3 claims → 3 rebuttals. Cite specific post patterns: layoffs, hiring freezes, role shifts.'
  });

  ideas.push({
    title: `Salary/market reality: ${pick(5,'entry')} vs ${pick(6,'senior')} roles in 2026 (Reddit signals)`,
    hook: 'Summarize demand signals from comments: who is struggling, who is fine, why.'
  });

  ideas.push({
    title: `"What would you do in 30 days?" layoff recovery plan (day-by-day)`,
    hook: '30-day plan: portfolio, interview loops, networking, mental health. Include a downloadable checklist.'
  });

  ideas.push({
    title: `Mini-case study: 1 resume bullet → 1 proof project using ${pick(7,'chatgpt')}`,
    hook: 'Show how to convert a vague resume claim into a measurable project + writeup.'
  });

  ideas.push({
    title: `Community question: which tasks should *never* be delegated to AI?`,
    hook: 'Ask + give your own top 5. Encourage replies; add a poll if your platform supports it.'
  });

  ideas.push({
    title: `Template post: "I used AI to do X, got Y result, here\'s the exact prompt"`,
    hook: 'Make it reproducible: prompt, inputs, outputs, gotchas.'
  });

  ideas.push({
    title: `Data post: a quick scorecard of the top threads (ups, comments, ratio) + what it signals`,
    hook: 'Table or bullets; then 3 takeaways.'
  });

  ideas.push({
    title: `Meme angle (if relevant): ${pick(8,'reality')} vs ${pick(9,'expectation')} — job search edition`,
    hook: 'If your niche is not memes, skip memes; otherwise caption the pattern you saw in comments.'
  });

  return { terms, ideas };
}

function formatTopPosts({ cardsIndex = [], n = 15 } = {}) {
  return cardsIndex.slice(0, n).map((p, i) => {
    const cardRel = `./cards/${p.id}.png`;
    const title = escMd(p.title);
    return [
      `### ${i + 1}) ${title}`,
      `- Subreddit: r/${p.subreddit}`,
      `- Viral score: ${Math.round(p.viral_score || 0)} | Ups: ${p.ups ?? '—'} | Comments: ${p.num_comments ?? '—'} | Upvote ratio: ${typeof p.upvote_ratio === 'number' ? Math.round(p.upvote_ratio*100) + '%' : '—'}`,
      `- Link: ${p.permalink}`,
      `- Card (local): ${cardRel}`,
      '',
      `![reddit card](${cardRel})`,
      ''
    ].join('\n');
  }).join('\n');
}

function buildSendCardsPayload({ runDir, cardsIndex = [], n = 5 } = {}) {
  // For messaging channels (Telegram/WhatsApp/Discord), the agent should attach these files.
  // We write absolute paths so the message tool can use them directly.
  return cardsIndex.slice(0, n).map((p, i) => {
    const absPath = path.join(runDir, 'cards', `${p.id}.png`);
    const caption = [
      `${i + 1}) ${escMd(p.title)}`,
      `r/${p.subreddit} · score ${Math.round(p.viral_score || 0)} · ${p.ups ?? '—'} ups · ${p.num_comments ?? '—'} comments`,
      p.permalink
    ].join('\n');
    return { path: absPath, caption, permalink: p.permalink, id: p.id };
  });
}

async function generateReportAndChat({ runDir, meta, ranked, detailedPosts, cardsIndex }) {
  const { terms, ideas } = deriveAngles({ detailedPosts });

  const topPostsCount = Math.min(cardsIndex.length, meta?.config?.topN || 15);
  const sendCardsN = Math.min(parseInt(meta?.config?.sendCardsN || '5', 10) || 5, topPostsCount);

  const header = [
    `# Reddit Scout — ${escMd(meta?.niche || '')}`,
    '',
    `Run: ${escMd(meta?.runId || '')}`,
    `Started: ${escMd(meta?.startedAt || '')}`,
    `Output dir: ${runDir}`,
    '',
    `Config: topN=${meta?.config?.topN} | subLimit=${meta?.config?.subLimit} | kinds=${(meta?.config?.kinds||[]).join(',')} | time=${meta?.config?.time} | limitPerListing=${meta?.config?.limitPerListing}`,
    `Search: ${meta?.search ? escMd(meta.search) : '—'} (sort=${meta?.config?.searchSort||'top'} t=${meta?.config?.searchTime||'auto'})`,
    ''
  ].join('\n');

  const termsBlock = terms.length
    ? [
        `## Top terms (from titles + top comments)`,
        '',
        terms.map(t => `- ${t.w} (${t.c})`).join('\n'),
        ''
      ].join('\n')
    : '';

  const ideasBlock = [
    `## Viral content ideas (derived from these posts)`,
    '',
    ideas.map((x, i) => `**${i + 1}. ${escMd(x.title)}**\n- Hook: ${escMd(x.hook)}`).join('\n\n'),
    ''
  ].join('\n');

  const postsBlock = [
    `## Top posts (${topPostsCount}) + cards`,
    '',
    formatTopPosts({ cardsIndex, n: topPostsCount })
  ].join('\n');

  const reportMd = [header, termsBlock, ideasBlock, postsBlock].filter(Boolean).join('\n');

  const reportPath = path.join(runDir, 'report.md');
  const chatPath = path.join(runDir, 'chat.md');
  const sendCardsPath = path.join(runDir, 'send_cards.json');

  fs.writeFileSync(reportPath, reportMd);
  fs.writeFileSync(chatPath, reportMd);

  const sendCards = buildSendCardsPayload({ runDir, cardsIndex, n: sendCardsN });
  fs.writeFileSync(sendCardsPath, JSON.stringify({ n: sendCardsN, cards: sendCards }, null, 2));

  return { reportPath, chatPath, sendCardsPath, chatMarkdown: reportMd };
}

module.exports = { generateReportAndChat };
