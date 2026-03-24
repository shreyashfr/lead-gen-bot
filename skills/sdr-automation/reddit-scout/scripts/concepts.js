// concepts.js
// Simple concept dictionaries for AND filtering.

const CONCEPTS = {
  jobloss: [
    'laid off','layoff','laid-off','fired','terminated','termination','redundancy','redundant',
    'severance','restructuring','job loss','lost my job','let go','downsized'
  ],
  ai: [
    'ai','a.i.','artificial intelligence','automation','automated','llm','large language model',
    'chatgpt','gpt','copilot','bot'
  ]
};

function nicheImpliesJoblossAi(niche) {
  const s = String(niche || '').toLowerCase();
  const hasJob = /(layoff|laid off|job loss|lost my job|fired|termination|redundan|severance|let go)/.test(s);
  const hasAi = /(\bai\b|a\.i\.|artificial intelligence|automation|llm|chatgpt|gpt|copilot|bot)/.test(s);
  return hasJob && hasAi;
}

module.exports = { CONCEPTS, nicheImpliesJoblossAi };
