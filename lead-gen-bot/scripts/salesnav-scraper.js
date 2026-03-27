const axios = require('axios');

/**
 * Sales Navigator Scraper - Decision Makers Edition
 * 
 * Uses LinkedIn's undocumented but stable Sales API endpoints
 * Focuses on extracting decision makers (VP, C-level, Heads of teams)
 * 
 * Endpoints discovered:
 * - /sales-api/search: Main search endpoint
 * - /voyager/api/search: Alternative search
 * - /voyager/api/graphql: GraphQL endpoint (requires CSRF)
 */

async function scrape(params, count) {
  const { role = 'marketing', location = 'USA', industry = '', titles = '' } = params;
  const config = require('../config/sessions.json');

  // Build proxy agent
  const proxyUrl = `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.server.replace('http://', '')}`;
  
  try {
    // Primary API: Try direct Sales search endpoint
    const results = await tryPrimarySalesAPI(role, location, count, proxyUrl) ||
                    await tryFallbackSalesAPI(role, location, count, proxyUrl) ||
                    [];

    if (results.length > 0) {
      return formatLeads(results, role, count);
    }

    console.warn('⚠️ SalesNav: All API attempts failed. Using fallback.');
    
    // Fallback to LinkedIn Jobs API
    const linkedinJobs = require('./linkedin-jobs');
    const fallbackLeads = await linkedinJobs.scrape(params, count);
    
    return fallbackLeads.map(lead => ({
      ...lead,
      source: 'SalesNav (Fallback)'
    }));

  } catch (error) {
    console.error('SalesNav scraper error:', error.message);
    return [];
  }
}

/**
 * Primary: Direct Sales Navigator API
 * Endpoint: /sales-api/salesApiEntities
 */
async function tryPrimarySalesAPI(role, location, count, proxyUrl) {
  try {
    const config = require('../config/sessions.json');
    const query = encodeURIComponent(`${role} ${location}`);
    
    const endpoint = `https://www.linkedin.com/sales-api/salesApiEntities?q=${query}&count=${count}&filters=(origin:JOB_SEARCH_PAGE_QUERY_PILLS)`;

    const response = await axios.get(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Cookie': `li_at=${config.linkedin.li_at}; li_a=${config.salesnav.li_a}`,
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.linkedin.com/sales/search/people'
      },
      httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
      httpsAgent: new (require('https').Agent)({ proxy: proxyUrl }),
      timeout: 30000,
      validateStatus: () => true
    });

    if (response.status === 200 && typeof response.data === 'object') {
      return extractDecisionMakers(response.data);
    }
  } catch (error) {
    console.warn('Primary API failed:', error.message);
  }
  return null;
}

/**
 * Fallback: Voyager Search API
 * Endpoint: /voyager/api/search/hits
 */
async function tryFallbackSalesAPI(role, location, count, proxyUrl) {
  try {
    const config = require('../config/sessions.json');
    const query = encodeURIComponent(`${role} ${location}`);
    
    const endpoint = `https://www.linkedin.com/voyager/api/search/hits?keywords=${query}&count=${count}&origin=SALES_NAV_SEARCH_PAGE`;

    const response = await axios.get(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': `li_at=${config.linkedin.li_at}; li_a=${config.salesnav.li_a}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.linkedin.com/sales/search/people'
      },
      httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
      httpsAgent: new (require('https').Agent)({ proxy: proxyUrl }),
      timeout: 30000,
      validateStatus: () => true
    });

    if (response.status === 200 && typeof response.data === 'object') {
      return extractDecisionMakers(response.data);
    }
  } catch (error) {
    console.warn('Fallback API failed:', error.message);
  }
  return null;
}

/**
 * Extract decision makers (VP, C-level, Head of, Manager)
 * Filter out IC roles
 */
function extractDecisionMakers(data) {
  const profiles = [];

  // Handle different response formats
  const items = 
    data.data?.elements ||
    data.data?.people ||
    data.elements ||
    data.people ||
    data.results ||
    data.searchResults ||
    Array.isArray(data) ? data : [];

  const decisionMakerPatterns = [
    /VP|Vice President/i,
    /Chief|C-Level|C Level/i,
    /Head of|Director|Director of/i,
    /Manager|Senior Manager|Director Manager/i,
    /Executive|President/i,
    /Founder|Co-Founder/i
  ];

  return items.map(item => {
    const title = item.title || item.headline || item.occupation || '';
    const isDecisionMaker = decisionMakerPatterns.some(pattern => pattern.test(title));

    return {
      ...item,
      isDecisionMaker,
      title: title
    };
  }).filter(item => item.isDecisionMaker);
}

/**
 * Format leads into standardized structure
 */
function formatLeads(profiles, role, count) {
  return profiles.slice(0, count).map(profile => {
    const profileId = 
      profile.profileId || 
      profile.publicIdentifier ||
      profile.entityUrn?.split(':').pop() || 
      '';
    
    const name = 
      profile.displayName || 
      profile.name || 
      profile.firstName ? `${profile.firstName} ${profile.lastName}` : '';
    
    const title = profile.title || profile.headline || '';
    
    const company = 
      profile.company ||
      profile.companyName ||
      profile.currentCompany ||
      '';
    
    const location = profile.location || profile.geo || '';

    // Filter incomplete
    if (!name || !company) return null;

    return {
      source: 'SalesNav',
      name: name.trim(),
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      email: `${name.toLowerCase().split(' ').join('.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      url: profileId ? `https://www.linkedin.com/in/${profileId}` : '',
      hiringFor: role,
      profileId: profileId,
      isDecisionMaker: profile.isDecisionMaker,
      seniority: extractSeniority(profile.title)
    };
  }).filter(lead => lead !== null);
}

/**
 * Extract seniority level from title
 */
function extractSeniority(title) {
  if (!title) return 'unknown';
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('chief') || titleLower.includes('president') || titleLower.includes('founder')) {
    return 'executive';
  }
  
  if (titleLower.includes('vp') || titleLower.includes('vice president') || titleLower.includes('director')) {
    return 'director';
  }
  
  if (titleLower.includes('senior') || titleLower.includes('lead')) {
    return 'senior';
  }
  
  if (titleLower.includes('manager')) {
    return 'manager';
  }
  
  return 'individual contributor';
}

module.exports = { scrape };
