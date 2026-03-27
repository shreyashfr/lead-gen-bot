const axios = require('axios');
const config = require('../config/sessions.json');

async function scrape(params, count) {
  const { role = 'marketing', location = 'USA', industry = '', titles = '' } = params;
  const searchQuery = `${industry} ${role} jobs ${location} site:wellfound.com`.trim();
  const serperKey = config.serper.apiKey;

  if (!serperKey || serperKey === 'your_serper_api_key_here') {
    console.error('Serper API key not configured');
    return [];
  }

  try {
    const response = await axios.post('https://google.serper.dev/search', {
      q: searchQuery,
      num: count * 2 // Get more to filter
    }, {
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json'
      },
      proxy: {
        protocol: 'http',
        host: config.proxy.server.split('://')[1].split(':')[0],
        port: parseInt(config.proxy.server.split(':').pop()),
        auth: {
          username: config.proxy.username,
          password: config.proxy.password
        }
      },
      timeout: 30000
    });

    const results = response.data.organic.slice(0, count);
    const leads = [];

    for (const result of results) {
      // Simulate parsing Wellfound results (actual would need to fetch page)
      leads.push({
        source: 'Wellfound',
        name: `VP ${role} @ ${result.title}`,
        title: `VP ${role}`,
        company: result.title,
        location: location,
        email: `${role.toLowerCase()}@${result.title.toLowerCase().replace(/\s+/g, '')}.com`, // placeholder
        url: result.link,
        hiringFor: role
      });
    }

    return leads;
  } catch (error) {
    console.error('Wellfound Serper scrape error:', error.message);
    return [];
  }
}

module.exports = { scrape };