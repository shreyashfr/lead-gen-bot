const axios = require('axios');

async function scrape(params, count) {
  const { role = 'VP Engineering', location = 'USA', industry = '', titles = '' } = params;
  const config = require('../config/sessions.json');

  // Build proxy agent
  const proxyUrl = `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.server.replace('http://', '')}`;
  
  try {
    // Build Voyager API URL - using correct endpoint
    const searchQuery = encodeURIComponent(`${role}`);
    const voyagerUrl = `https://www.linkedin.com/voyager/api/voyagerJobsDashJobCards?decorationId=com.linkedin.voyager.dash.deco.jobs.search.JobSearchCardsCollection-220&count=${count}&q=jobSearch&query=(origin:JOB_SEARCH_PAGE_OTHER_ENTRY,keywords:${searchQuery},locationUnion:(seoLocation:(location:${encodeURIComponent(location)})),spellCorrectionEnabled:true)&start=0`;

    const response = await axios.get(voyagerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': `li_at=${config.linkedin.li_at}; JSESSIONID=${config.linkedin.JSESSIONID}`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-RestLi-Protocol-Version': '2.0.0',
        'Referer': 'https://www.linkedin.com/jobs/search/',
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
      console.error('LinkedIn returned 403 - cookie may be expired or invalid');
      return [];
    }

    if (response.status !== 200) {
      console.error(`LinkedIn API returned status ${response.status}`);
      return [];
    }

    // Extract jobs from the response
    const included = response.data?.included || [];
    const jobs = [];

    for (const item of included) {
      try {
        if (item.entityUrn && item.entityUrn.includes('fsd_jobPostingCard')) {
          const jobTitle = item.jobPostingTitle?.text || item.title?.text || '';
          const companyName = item.companyName?.text || item.primaryDescription?.text || '';
          const jobId = item.jobPostingUrn?.split(':').pop() || '';
          const jobLocation = item.secondaryDescription?.text || '';

          if (jobId && jobTitle && companyName) {
            jobs.push({
              jobId,
              title: jobTitle,
              company: companyName,
              location: jobLocation
            });
          }
        }
      } catch (e) {
        // Skip malformed items
      }
    }

    // Format leads
    const formattedLeads = jobs.slice(0, count).map(job => ({
      source: 'LinkedIn',
      name: `${job.title} @ ${job.company}`,
      title: job.title,
      company: job.company,
      location: job.location,
      email: `hr@${job.company.toLowerCase().replace(/\s+/g, '')}.com`,
      url: `https://www.linkedin.com/jobs/view/${job.jobId}`,
      hiringFor: role,
      jobId: job.jobId
    }));

    return formattedLeads;

  } catch (error) {
    console.error('LinkedIn Voyager API error:', error.message);
    return [];
  }
}

module.exports = { scrape };
