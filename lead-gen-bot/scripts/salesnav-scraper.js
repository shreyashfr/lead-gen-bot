const axios = require('axios');

/**
 * Sales Navigator Scraper - Decision Makers Edition
 * Uses LinkedIn's Sales API directly (no authentication wrapper)
 */

async function scrape(params, count) {
  const { role = 'VP Engineering', location = 'USA', industry = '', titles = '' } = params;
  const config = require('../config/sessions.json');

  // Build proxy agent
  const proxyUrl = `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.server.replace('http://', '')}`;
  
  try {
    // Use the Voyager API for people search (more reliable than Sales API)
    const searchQuery = encodeURIComponent(`${role}`);
    const voyagerUrl = `https://www.linkedin.com/voyager/api/search/cluster?q=peopleSearch&query=(origin:SALES_SEARCH_PAGE,keywords:${searchQuery},locationUnion:(seoLocation:(location:${encodeURIComponent(location)})))&decorationId=com.linkedin.voyager.deco.search.SearchClusterCollection-210&count=${count}&start=0`;

    const response = await axios.get(voyagerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': `li_at=${config.linkedin.li_at}; li_a=${config.salesnav.li_a}`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-RestLi-Protocol-Version': '2.0.0',
        'Referer': 'https://www.linkedin.com/sales/search/people',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Cache-Control': 'no-cache'
      },
      httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
      httpsAgent: new (require('https').Agent)({ proxy: proxyUrl }),
      timeout: 30000,
      validateStatus: () => true
    });

    if (response.status === 403) {
      console.error('SalesNav returned 403 - cookie may be expired or invalid');
      return [];
    }

    if (response.status !== 200) {
      console.error(`SalesNav API returned status ${response.status}`);
      return [];
    }

    // Extract people from the response
    const included = response.data?.included || [];
    const people = [];

    for (const item of included) {
      try {
        // Look for people entities
        if (item.entityUrn && item.entityUrn.includes('member')) {
          const firstName = item.firstName || '';
          const lastName = item.lastName || '';
          const headline = item.headline || '';
          const publicId = item.publicId || '';

          // Extract title and company from headline
          const headlineParts = headline.split(' at ');
          const title = headlineParts[0] || '';
          const company = headlineParts[1] || '';

          // Check if this is a decision maker
          const decisionMakerKeywords = ['VP', 'Director', 'Head', 'Chief', 'CTO', 'CFO', 'CEO', 'President', 'EVP'];
          const isDecisionMaker = decisionMakerKeywords.some(kw => title.toUpperCase().includes(kw));

          if (firstName && lastName && title && company && isDecisionMaker) {
            people.push({
              name: `${firstName} ${lastName}`,
              title: title,
              company: company,
              publicId: publicId,
              headline: headline,
              isDecisionMaker: true
            });
          }
        }
      } catch (e) {
        // Skip malformed items
      }
    }

    // Format leads - prioritize decision makers
    const formattedLeads = people.slice(0, count).map(person => ({
      source: 'SalesNav',
      name: person.name,
      title: person.title,
      company: person.company,
      location: location,
      email: `${person.name.toLowerCase().replace(/\s+/g, '.')}@${person.company.toLowerCase().replace(/\s+/g, '')}.com`,
      url: `https://www.linkedin.com/in/${person.publicId}`,
      hiringFor: role,
      isDecisionMaker: true
    }));

    return formattedLeads;

  } catch (error) {
    console.error('SalesNav scraper error:', error.message);
    return [];
  }
}

module.exports = { scrape };
