/**
 * LinkedIn Lead Scraper
 * 
 * Two modes:
 * 1. Company-first (recommended): --company "Stripe" --role "VP Engineering"
 * 2. Keyword search (fallback): --role "AI startup CEO" --location "USA"
 * 
 * Primary: Voyager API (company-first search)
 * Fallback: Serper (Google site:linkedin.com/in/)
 * 
 * Updated: 2026-04-01
 */

const fs = require('fs');
const path = require('path');

// ── Config ───────────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, '../config/sessions.json');
let LI_AT = null;
let SERPER_KEY = null;

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Config not found:', CONFIG_PATH);
    return false;
  }
  
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  LI_AT = config.linkedin?.li_at;
  SERPER_KEY = config.serper?.apiKey || process.env.SERPER_API_KEY;
  
  return !!LI_AT;
}

// ── Voyager API Helpers ──────────────────────────────────────────────────────
let CACHED_JSESSIONID = null;

async function getJSessionId() {
  if (CACHED_JSESSIONID) return CACHED_JSESSIONID;
  
  console.log('🔑 Fetching JSESSIONID...');
  
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
    console.log('✅ Got JSESSIONID');
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

// ── Company-First Search (Primary) ──────────────────────────────────────────
async function findCompanyId(companyName, preferTech = true) {
  console.log(`🔍 Searching for company: ${companyName}`);
  
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
    else if (nameLower.startsWith(searchLower + ' ')) score += 70; // "Notion Labs"
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
    
    // Location in US (SF, NYC, etc) - slight boost for well-known tech hubs
    if (industry.includes('san francisco') || industry.includes('california') || 
        industry.includes('new york') || industry.includes('seattle')) {
      score += 5;
    }
    
    // Penalize generic names that are likely not the main company
    if (nameLower.includes('partner') || nameLower.includes('capital') || 
        nameLower.includes('consulting') || nameLower.includes('agency')) {
      score -= 30;
    }
    
    candidates.push({
      id: urnMatch[1],
      name: name,
      industry: item.primarySubtitle?.text || '',
      url: item.navigationUrl,
      score: score
    });
  }
  
  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);
  
  if (candidates.length > 0) {
    const best = candidates[0];
    console.log(`✅ Found company: ${best.name} (ID: ${best.id})`);
    console.log(`   Industry: ${best.industry}`);
    return { id: best.id, name: best.name };
  }
  
  return null;
}

async function getCompanyEmployees(companyId, companyName, role, count) {
  console.log(`👥 Fetching employees from ${companyName}${role ? ` with role: ${role}` : ''}...`);
  
  const keywords = encodeURIComponent(role || 'Manager Director VP Head CEO CTO');
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
    
    const { role: title, company: headlineCompany } = parseHeadline(headline);
    
    leads.push({
      source: 'LinkedIn',
      name: name,
      title: title,
      company: companyName, // Verified company
      location: location,
      email: generateEmail(name, companyName),
      url: `https://www.linkedin.com/in/${publicId}`,
      isDecisionMaker: isDecisionMaker(title),
      seniority: detectSeniority(title),
    });
    
    if (leads.length >= count) break;
  }
  
  return leads;
}

// ── Keyword Search (Voyager) ─────────────────────────────────────────────────
async function voyagerKeywordSearch(query, count) {
  console.log(`🔍 Voyager keyword search: ${query}`);
  
  const keywords = encodeURIComponent(query);
  const url = `https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:GLOBAL_SEARCH_HEADER,query:(keywords:${keywords},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0`;
  
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
    
    const { role: title, company } = parseHeadline(headline);
    
    leads.push({
      source: 'LinkedIn',
      name: name,
      title: title,
      company: company,
      location: location,
      email: generateEmail(name, company),
      url: `https://www.linkedin.com/in/${publicId}`,
      isDecisionMaker: isDecisionMaker(title),
      seniority: detectSeniority(title),
    });
    
    if (leads.length >= count) break;
  }
  
  console.log(`✅ Voyager returned ${leads.length} leads`);
  return leads;
}

// ── Serper Company Search (Decision Makers) ─────────────────────────────────
async function serperSearchCompany(company, role, count) {
  // Ensure config is loaded
  if (!SERPER_KEY) loadConfig();
  
  if (!SERPER_KEY) {
    console.log('⚠️ No Serper API key, skipping fallback');
    return [];
  }
  
  // Build query to find decision makers at this company
  // Serper/Google works best when company is the anchor and titles are broad
  const dmTitles = role || 'CEO OR CTO OR CFO OR COO OR "VP" OR "Vice President" OR Director OR "Head of" OR Founder OR President';
  const query = `"${company}" (${dmTitles}) site:linkedin.com/in/`;
  
  console.log(`🔍 Serper company search: ${company}`);
  
  const resp = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: Math.min(count * 2, 20),
    }),
  });
  
  if (!resp.ok) {
    console.error(`❌ Serper returned ${resp.status}`);
    return [];
  }
  
  const data = await resp.json();
  const leads = [];
  
  for (const result of data.organic || []) {
    const url = result.link || '';
    if (!url.includes('linkedin.com/in/')) continue;
    
    const publicId = url.match(/linkedin\.com\/in\/([^/?]+)/)?.[1];
    if (!publicId) continue;
    
    // Parse title: "Name - Title - Company | LinkedIn"
    const title = (result.title || '').replace(/\s*[|·•]\s*LinkedIn.*$/i, '').trim();
    const snippet = result.snippet || '';
    const { name, role: parsedRole, company: parsedCompany } = parseSerperTitle(title);
    
    if (!name) continue;
    
    // Verify this person is at the target company (check title and snippet)
    const combinedText = `${title} ${snippet}`.toLowerCase();
    const companyLower = company.toLowerCase();
    const isAtCompany = combinedText.includes(companyLower);
    
    // Skip if doesn't seem to be at the target company
    if (!isAtCompany) continue;
    
    leads.push({
      source: 'Serper',
      name: name,
      title: parsedRole,
      company: company, // Use verified company name
      location: '',
      email: generateEmail(name, company),
      url: `https://www.linkedin.com/in/${publicId}`,
      isDecisionMaker: isDecisionMaker(parsedRole),
      seniority: detectSeniority(parsedRole),
    });
    
    if (leads.length >= count) break;
  }
  
  console.log(`✅ Serper returned ${leads.length} leads at ${company}`);
  return leads;
}

// ── Serper Fallback (Generic) ────────────────────────────────────────────────
async function serperSearch(query, count) {
  if (!SERPER_KEY) {
    console.log('⚠️ No Serper API key, skipping fallback');
    return [];
  }
  
  console.log(`🔍 Serper fallback: ${query}`);
  
  const resp = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: `${query} site:linkedin.com/in/`,
      num: Math.min(count * 2, 20),
    }),
  });
  
  if (!resp.ok) {
    console.error(`❌ Serper returned ${resp.status}`);
    return [];
  }
  
  const data = await resp.json();
  const leads = [];
  
  for (const result of data.organic || []) {
    const url = result.link || '';
    if (!url.includes('linkedin.com/in/')) continue;
    
    const publicId = url.match(/linkedin\.com\/in\/([^/?]+)/)?.[1];
    if (!publicId) continue;
    
    // Parse title: "Name - Title - Company | LinkedIn"
    const title = (result.title || '').replace(/\s*[|·•]\s*LinkedIn.*$/i, '').trim();
    const { name, role, company } = parseSerperTitle(title);
    
    if (!name) continue;
    
    leads.push({
      source: 'Serper',
      name: name,
      title: role,
      company: company,
      location: '',
      email: generateEmail(name, company),
      url: `https://www.linkedin.com/in/${publicId}`,
      isDecisionMaker: isDecisionMaker(role),
      seniority: detectSeniority(role),
    });
    
    if (leads.length >= count) break;
  }
  
  console.log(`✅ Serper returned ${leads.length} leads`);
  return leads;
}

function parseSerperTitle(title) {
  // Format: "Name - Title - Company" or "Name - Title"
  const parts = title.split(/\s+-\s+/);
  
  let name = parts[0]?.trim() || '';
  let role = '';
  let company = '';
  
  // Clean name
  if (name.includes('|')) {
    name = name.split('|')[0].trim();
  }
  
  if (parts.length >= 3) {
    role = parts[1]?.trim() || '';
    company = parts[2]?.trim() || '';
  } else if (parts.length === 2) {
    role = parts[1]?.trim() || '';
  }
  
  // Clean role and company
  role = cleanRole(role);
  company = cleanCompany(company);
  
  return { name, role, company };
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
  if (dashMatch && !looksLikeKeywords(dashMatch[2])) {
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
  const dashMatch = role.match(/^(.+?)\s+-\s+[A-Z][a-zA-Z0-9\s]*$/);
  if (dashMatch && dashMatch[1].length > 5) role = dashMatch[1].trim();
  if (role.length > 50) role = role.substring(0, 50).replace(/\s+\S*$/, '');
  return role;
}

function cleanCompany(company) {
  if (!company) return '';
  company = company.replace(/\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?)?\s*$/i, '').trim();
  company = company.replace(/[,;:\s]+$/, '').trim();
  company = company.replace(/\s+(with|specializing|focusing|expertise).*$/i, '').trim();
  if (company.length > 40) {
    const cutPoint = company.search(/\s+(with|specializing|focusing|expertise|\||·|•|-)/i);
    if (cutPoint > 0) company = company.substring(0, cutPoint).trim();
    else company = company.substring(0, 40).replace(/\s+\S*$/, '');
  }
  return company;
}

function looksLikeKeywords(text) {
  const keywords = ['Fintech', 'AI', 'Strategy', 'Digital', 'Transformation', 'Management', 
                    'Technology', 'Banking', 'Payments', 'MBA', 'Product', 'Development'];
  let count = 0;
  for (const kw of keywords) {
    if (text.toLowerCase().includes(kw.toLowerCase())) count++;
  }
  return count >= 2;
}

// ── Utility ──────────────────────────────────────────────────────────────────
function generateEmail(name, company) {
  if (!name || !company) return '';
  const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const cleanCompany = company.toLowerCase().replace(/[^a-z]/g, '').trim();
  if (!cleanCompany) return '';
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) return `${parts[0]}.${parts[parts.length-1]}@${cleanCompany}.com`;
  return `${cleanName.replace(/\s+/g, '.')}@${cleanCompany}.com`;
}

function isDecisionMaker(title) {
  const dmKeywords = ['VP', 'Vice President', 'Director', 'Head of', 'Chief', 'CTO', 'CFO', 'CEO', 'CMO', 'President', 'EVP', 'SVP', 'Founder', 'Partner', 'Owner'];
  return dmKeywords.some(kw => (title || '').toUpperCase().includes(kw.toUpperCase()));
}

function detectSeniority(title) {
  const t = (title || '').toUpperCase();
  if (/\b(CEO|CFO|CTO|CMO|COO|CHIEF|PRESIDENT|FOUNDER|OWNER)\b/.test(t)) return 'executive';
  if (/\b(VP|VICE PRESIDENT|EVP|SVP)\b/.test(t)) return 'vp';
  if (/\b(DIRECTOR|HEAD OF)\b/.test(t)) return 'director';
  if (/\b(PARTNER)\b/.test(t)) return 'partner';
  return 'senior';
}

// ── Main Scrape Function ─────────────────────────────────────────────────────
async function scrape(params, count = 10) {
  const { company, role = '', location = '' } = params;
  
  if (!loadConfig()) {
    return [];
  }
  
  try {
    // Mode 1: Company-first (Serper primary - best accuracy)
    if (company) {
      console.log(`\n🏢 Company-First Search`);
      console.log(`Company: ${company}`);
      console.log(`Role: ${role || '(decision makers)'}`);
      console.log(`Count: ${count}\n`);
      
      // Primary: Serper company search (more accurate than Voyager for decision makers)
      const serperLeads = await serperSearchCompany(company, role, count);
      if (serperLeads.length > 0) {
        console.log(`\n✅ Found ${serperLeads.length} leads at ${company} via Serper`);
        return serperLeads;
      }
      
      // Fallback: Voyager only if Serper returns nothing
      console.log('⚠️ Serper found no leads, trying Voyager fallback...');
      const companyInfo = await findCompanyId(company);
      
      if (companyInfo) {
        const leads = await getCompanyEmployees(companyInfo.id, companyInfo.name, role, count);
        
        if (leads.length > 0) {
          console.log(`\n✅ Found ${leads.length} leads at ${companyInfo.name} via Voyager fallback`);
          return leads;
        }
      }
      
      return [];
    }
    
    // Mode 2: Keyword search
    console.log(`\n🔍 Keyword Search`);
    console.log(`Role: ${role}`);
    console.log(`Location: ${location}`);
    console.log(`Count: ${count}\n`);
    
    const query = [role, location].filter(Boolean).join(' ');
    
    try {
      const leads = await voyagerKeywordSearch(query, count);
      if (leads.length > 0) return leads;
    } catch (e) {
      console.log(`⚠️ Voyager failed: ${e.message}`);
    }
    
    // Fallback to Serper
    return await serperSearch(query, count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

// ── Export ───────────────────────────────────────────────────────────────────
module.exports = { scrape, findCompanyId, getCompanyEmployees, voyagerKeywordSearch, serperSearch, serperSearchCompany };

// ── CLI ──────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  
  function getArg(flag, def) {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : def;
  }
  
  const company = getArg('--company', null);
  const role = getArg('--role', args[0] || 'VP Engineering');
  const location = getArg('--location', args[1] || '');
  const count = parseInt(getArg('--count', args[2] || '10'));
  
  console.log(`\n🔍 LinkedIn Lead Scraper`);
  
  scrape({ company, role, location }, count)
    .then(leads => {
      console.log('\n📋 Results:\n');
      leads.forEach((l, i) => {
        console.log(`${i+1}. ${l.name}`);
        console.log(`   Title: ${l.title}`);
        console.log(`   Company: ${l.company}`);
        if (l.location) console.log(`   Location: ${l.location}`);
        console.log(`   Seniority: ${l.seniority}`);
        console.log('');
      });
      console.log(`Total: ${leads.length}`);
    })
    .catch(e => console.error('Failed:', e.message));
}
