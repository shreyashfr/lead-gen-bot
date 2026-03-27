const axios = require('axios');

async function scrape(params, count) {
  const { role = 'marketing', location = 'USA', industry = '', titles = '' } = params;
  const config = require('../config/sessions.json');

  // Build proxy agent
  const proxyUrl = `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.server.replace('http://', '')}`;
  
  try {
    // LinkedIn Voyager API endpoint for job search
    const searchQuery = encodeURIComponent(`${role} ${location}`);
    const voyagerUrl = `https://www.linkedin.com/voyager/api/graphql?action=execute&variables=(start:0,count:${count},origin:JOB_SEARCH_PAGE_QUERY_PILLS,query:(keywords:${searchQuery}))`;

    const response = await axios.get(voyagerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': `li_at=${config.linkedin.li_at}; JSESSIONID=${config.linkedin.JSESSIONID}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.linkedin.com/jobs/search/'
      },
      httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
      httpsAgent: new (require('https').Agent)({ proxy: proxyUrl }),
      timeout: 30000
    });

    const jobData = response.data?.data?.jobSearch?.jobSearchResultsMetadata?.jobSearchResults || [];

    const formattedLeads = jobData.slice(0, count).map(job => {
      const jobId = job.jobPostingId || '';
      const title = job.title || '';
      const companyName = job.companyName || '';
      const jobLocation = job.location || '';
      const jobUrl = `https://www.linkedin.com/jobs/view/${jobId}`;

      return {
        source: 'LinkedIn',
        name: `${title} @ ${companyName}`,
        title: title,
        company: companyName,
        location: jobLocation,
        email: `hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com`, // placeholder
        url: jobUrl,
        hiringFor: role,
        jobId: jobId
      };
    });

    return formattedLeads;
  } catch (error) {
    console.error('LinkedIn Voyager API error:', error.message);
    return [];
  }
}

module.exports = { scrape };