#!/usr/bin/env node
/**
 * company-leads.js — Get leads from a specific company
 * 
 * Usage:
 *   node company-leads.js --company "Stripe" --role "VP Engineering" --topN 10 [--printChat]
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
const COMPANY = getArg('--company', null);
const ROLE = getArg('--role', '');
const TOP_N = parseInt(getArg('--topN', '10'));
const PRINT_CHAT = args.includes('--printChat');

if (!COMPANY) {
  console.error('Usage: node company-leads.js --company "Company Name" [--role "Title"] [--topN 10] [--printChat]');
  process.exit(1);
}

// ── Load config ──────────────────────────────────────────────────────────────
const SESSION_FILE = path.join(__dirname, '../session.json');
const LEADGEN_CONFIG = '/home/ubuntu/.openclaw/workspace/lead-gen-bot/config/sessions.json';

let LI_AT = null;

if (fs.existsSync(SESSION_FILE)) {
  const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  const liAtCookie = session.cookies?.find(c => c.name === 'li_at');
  if (liAtCookie) LI_AT = liAtCookie.value;
}

if (!LI_AT && fs.existsSync(LEADGEN_CONFIG)) {
  const config = JSON.parse(fs.readFileSync(LEADGEN_CONFIG, 'utf8'));
  if (config.linkedin?.li_at) LI_AT = config.linkedin.li_at;
}

if (!LI_AT) {
  console.error('❌ No li_at cookie found');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function chat(msg) { if (PRINT_CHAT) console.log(msg); }

let CACHED_JSESSIONID = null;

async function getJSessionId() {
  if (CACHED_JSESSIONID) return CACHED_JSESSIONID;
  
  chat('🔑 Fetching JSESSIONID...');
  
  const resp = await fetch('https://www.linkedin.com/feed/', {
    headers: {
      'Cookie': `li_at=${LI_AT}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    redirect: 'manual',
  });
  
  const cookies = resp.headers.get('set-cookie') || '';
  const match = cookies.match(/JSESSIONID="?(ajax:[^";]+)"?/);
  
  if (match) {
    CACHED_JSESSIONID = match[1];
    return CACHED_JSESSIONID;
  }
  
  throw new Error('NO_JSESSIONID');
}

async function voyagerRequest(url) {
  const jsessionId = await getJSessionId();
  
  const resp = await fetch(url, {
    headers: {
      'Cookie': `li_at=${LI_AT}; JSESSIONID="${jsessionId}"`,
      'csrf-token': jsessionId,
      'x-li-lang': 'en_US',
      'x-restli-protocol-version': '2.0.0',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/vnd.linkedin.normalized+json+2.1',
    },
  });
  
  if (!resp.ok) {
    throw new Error(`VOYAGER_ERROR:${resp.status}`);
  }
  
  return resp.json();
}

// ── Step 1: Find Company ID ──────────────────────────────────────────────────
async function findCompanyId(companyName, preferTech = true) {
  chat(`🔍 Searching for company: ${companyName}`);
  
  const keywords = encodeURIComponent(companyName);
  const url = `https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:GLOBAL_SEARCH_HEADER,query:(keywords:${keywords},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(COMPANIES))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0`;
  
  const data = await voyagerRequest(url);
  
  const searchLower = companyName.toLowerCase();
  const candidates = [];
  
  // Tech industry keywords (boost these companies)
  const techIndustries = ['software', 'technology', 'internet', 'saas', 'fintech', 'ai', 'cloud', 'platform'];
  
  for (const item of data.included || []) {
    if (!item.navigationUrl?.includes('/company/')) continue;
    
    const name = item.title?.text || '';
    const nameLower = name.toLowerCase();
    const industry = (item.primarySubtitle?.text || '').toLowerCase();
    const urnMatch = item.trackingUrn?.match(/company:(\d+)/);
    
    if (!urnMatch) continue;
    
    let score = 0;
    
    // Name matching
    if (nameLower === searchLower) score += 100;
    else if (nameLower.startsWith(searchLower + ' ')) score += 70;
    else if (nameLower.startsWith(searchLower)) score += 60;
    else if (nameLower.includes(searchLower)) score += 40;
    
    // Industry boost (prefer tech companies)
    if (preferTech) {
      for (const tech of techIndustries) {
        if (industry.includes(tech)) {
          score += 20;
          break;
        }
      }
    }
    
    // Location boost for tech hubs
    if (industry.includes('san francisco') || industry.includes('california') || 
        industry.includes('new york') || industry.includes('seattle')) {
      score += 5;
    }
    
    // Penalize likely non-target companies
    if (nameLower.includes('partner') || nameLower.includes('capital') || 
        nameLower.includes('consulting') || nameLower.includes('agency')) {
      score -= 30;
    }
    
    candidates.push({
      id: urnMatch[1],
      name: name,
      industry: item.primarySubtitle?.text || '',
      score: score
    });
  }
  
  candidates.sort((a, b) => b.score - a.score);
  
  if (candidates.length > 0) {
    const best = candidates[0];
    chat(`✅ Found company: ${best.name} (ID: ${best.id})`);
    chat(`   Industry: ${best.industry}`);
    return { id: best.id, name: best.name };
  }
  
  throw new Error(`Company not found: ${companyName}`);
}

// ── Step 2: Get Employees with Role Filter ───────────────────────────────────
async function getCompanyEmployees(companyId, companyName, role, count) {
  chat(`👥 Fetching employees from ${companyName}${role ? ` with role: ${role}` : ''}...`);
  
  const keywords = encodeURIComponent(role || 'Manager Director VP Head');
  const url = `https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:FACETED_SEARCH,query:(keywords:${keywords},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:currentCompany,value:List(${companyId})),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0`;
  
  const data = await voyagerRequest(url);
  
  const leads = [];
  
  for (const item of data.included || []) {
    if (!item.navigationUrl?.includes('/in/')) continue;
    
    const publicId = item.navigationUrl.match(/\/in\/([^/?]+)/)?.[1];
    if (!publicId) continue;
    
    const name = item.title?.text || '';
    const headline = item.primarySubtitle?.text || '';
    const location = item.secondarySubtitle?.text || '';
    
    if (!name) continue;
    
    // Parse headline - for company employees, headline is usually "Role @ Company"
    const { role: title, company: headlineCompany } = parseHeadline(headline);
    
    // Verify this person actually works at the target company
    const worksAtTarget = headline.toLowerCase().includes(companyName.toLowerCase()) ||
                          headlineCompany.toLowerCase().includes(companyName.toLowerCase());
    
    leads.push({
      id: publicId,
      name: name,
      title: title,
      company: companyName, // Use the verified company name
      location: location,
      headline: headline,
      worksAtTarget: worksAtTarget,
      profileUrl: `https://www.linkedin.com/in/${publicId}`,
    });
    
    if (leads.length >= count * 2) break; // Get extra for filtering
  }
  
  // Prioritize leads that definitely work at the target company
  leads.sort((a, b) => (b.worksAtTarget ? 1 : 0) - (a.worksAtTarget ? 1 : 0));
  
  return leads.slice(0, count);
}

// ── Headline Parser ──────────────────────────────────────────────────────────
function parseHeadline(headline) {
  if (!headline) return { role: '', company: '' };
  
  let role = '';
  let company = '';
  
  // Pattern: "Role @ Company" or "Role at Company"
  const atMatch = headline.match(/^(.+?)\s+(?:@|at)\s+([A-Za-z0-9][A-Za-z0-9\s&.,'-]*?)(?:\s*[|·•;]|\s*$)/i);
  if (atMatch) {
    role = cleanRole(atMatch[1]);
    company = cleanCompany(atMatch[2]);
    return { role, company };
  }
  
  // Pattern: "Role - Company"
  const dashMatch = headline.match(/^([^-]+?)\s+-\s+([A-Z][A-Za-z0-9\s&.,'-]*?)(?:\s*[|·•]|\s*$)/);
  if (dashMatch) {
    role = cleanRole(dashMatch[1]);
    company = cleanCompany(dashMatch[2]);
    return { role, company };
  }
  
  // Just take first segment as role
  const firstSegment = headline.split(/\s*[|·•;]\s*/)[0].trim();
  role = cleanRole(firstSegment);
  
  return { role, company };
}

function cleanRole(role) {
  if (!role) return '';
  role = role.replace(/\s*[@]\s*$/, '').trim();
  role = role.replace(/\s*,?\s*ex[-–].*$/i, '').trim();
  const commaMatch = role.match(/^(.+?(?:CEO|CTO|CFO|COO|Founder|President|VP|Director|Head|Lead|Manager|Engineer)[^,]*),\s+[A-Z]/i);
  if (commaMatch) role = commaMatch[1].trim();
  if (role.length > 50) role = role.substring(0, 50).replace(/\s+\S*$/, '');
  return role;
}

function cleanCompany(company) {
  if (!company) return '';
  company = company.replace(/\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?)?\s*$/i, '').trim();
  company = company.replace(/[,;:\s]+$/, '').trim();
  company = company.replace(/\s+(with|specializing|focusing|expertise).*$/i, '').trim();
  if (company.length > 40) company = company.substring(0, 40).replace(/\s+\S*$/, '');
  return company;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  chat(`\n🏢 Company Leads Search`);
  chat(`Company: ${COMPANY}`);
  chat(`Role filter: ${ROLE || '(decision makers)'}`);
  chat(`Target: ${TOP_N} leads\n`);
  
  try {
    // Step 1: Find company
    const company = await findCompanyId(COMPANY);
    
    // Step 2: Get employees
    const leads = await getCompanyEmployees(company.id, company.name, ROLE, TOP_N);
    
    chat(`\n✅ Found ${leads.length} leads at ${company.name}\n`);
    
    // Output
    console.log(`\n## Leads at ${company.name}\n`);
    
    for (let i = 0; i < leads.length; i++) {
      const l = leads[i];
      console.log(`${i + 1}. ${l.name}`);
      console.log(`   Title: ${l.title}`);
      console.log(`   Company: ${l.company}`);
      if (l.location) console.log(`   Location: ${l.location}`);
      console.log(`   Profile: ${l.profileUrl}`);
      console.log('');
    }
    
    // Return for programmatic use
    return leads;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { findCompanyId, getCompanyEmployees };

// Run if called directly
if (require.main === module) {
  run();
}
