// score.js
// Viral scoring heuristic using fields available in Reddit JSON.

function ageHours(createdUtc) {
  if (!createdUtc) return 9999;
  const ageSec = (Date.now() / 1000) - createdUtc;
  return Math.max(ageSec / 3600, 0.01);
}

function viralScore(post, sourceKind) {
  const hrs = ageHours(post.created_utc);
  const ups = post.ups || post.score || 0;
  const com = post.num_comments || 0;
  const ratio = (typeof post.upvote_ratio === 'number') ? post.upvote_ratio : 0.9;

  // velocity proxies
  const vUps = ups / Math.pow(hrs, 1.1);
  const vCom = com / Math.pow(hrs, 1.2);

  const ratioBoost = 0.5 + ratio; // 0.5..1.5
  const discussionBoost = 1 + Math.log10(1 + com);

  let sourceBoost = 1.0;
  if (sourceKind === 'rising') sourceBoost = 1.25;
  if (sourceKind === 'hot') sourceBoost = 1.10;
  if (sourceKind === 'top:day') sourceBoost = 1.15;
  if (sourceKind === 'top:week') sourceBoost = 1.05;
  if (sourceKind === 'top:month') sourceBoost = 1.00;
  if (String(sourceKind).startsWith('search:')) sourceBoost = 1.12;

  const penalty = (post.stickied ? 0.7 : 1.0) * (post.locked ? 0.85 : 1.0);

  return (vUps * 0.7 + vCom * 1.1) * ratioBoost * discussionBoost * sourceBoost * penalty;
}

module.exports = { viralScore };
