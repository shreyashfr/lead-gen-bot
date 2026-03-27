const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(params, count) {
  const { role = 'marketing', location = 'USA', industry = '', titles = '' } = params;
  const searchQuery = `${role} ${industry} jobs ${location}`.trim();
  
  try {
    const response = await axios.get(`https://www.dice.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${location}`, {
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
    
    // Parse job listings (simplified - actual selectors needed for Dice)
    $('.job-card').slice(0, count).each((i, el) => {
      const company = $(el).find('.company-name').text().trim() || 'Unknown Company';
      const title = $(el).find('.job-title').text().trim();
      const locationText = $(el).find('.job-location').text().trim();
      const url = $(el).attr('href') ? 'https://www.dice.com' + $(el).attr('href') : '';
      
      if (company && title) {
        leads.push({
          source: 'Dice',
          name: `${title} @ ${company}`,
          title: title,
          company: company,
          location: locationText,
          email: `hr@${company.toLowerCase().replace(/\s+/g, '')}.com`, // placeholder
          url: url,
          hiringFor: role
        });
      }
    });
    
    return leads.slice(0, count);
  } catch (error) {
    console.error('Dice scrape error:', error.message);
    return [];
  }
}

module.exports = { scrape };