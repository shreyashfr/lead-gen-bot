const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(params, count) {
  const { role = 'marketing', location = 'USA', industry = '', titles = '' } = params;
  const searchQuery = `${industry} ${role} jobs`.trim();
  
  try {
    // YC doesn't have a direct job API; scrape YC job board or companies
    // For demo, fetch from YC companies or simulate
    const response = await axios.get('https://www.ycombinator.com/companies?category=marketing', {
      proxy: {
        protocol: 'http',
        host: 'proxy-10003.useragent.decodo.com',
        port: 10003,
        auth: {
          username: 'decodo_username',
          password: 'decodo_password'
        }
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const leads = [];
    
    // Parse company/job listings (simplified - actual parsing needed)
    $('a[href*="/companies/"]').slice(0, count).each((i, el) => {
      const name = $(el).text().trim();
      const url = 'https://www.ycombinator.com' + $(el).attr('href');
      if (name && url) {
        leads.push({
          source: 'YC',
          name: `VP ${role} @ ${name} (YC Startup)`,
          title: `VP ${role}`,
          company: name,
          location: location,
          email: `${role.toLowerCase()}@${name.toLowerCase()}.com`, // placeholder
          url: url,
          hiringFor: role
        });
      }
    });
    
    return leads.slice(0, count);
  } catch (error) {
    console.error('YC scrape error:', error.message);
    return [];
  }
}

module.exports = { scrape };