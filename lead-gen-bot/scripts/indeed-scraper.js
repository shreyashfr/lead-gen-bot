const puppeteer = require('puppeteer');

async function scrape(params, count) {
  const { role = 'marketing', location = 'USA', industry = '', titles = '' } = params;
  const config = require('../config/sessions.json');
  const proxyServer = config.proxy.server;
  const proxyAuth = config.proxy.username ? `${config.proxy.username}:${config.proxy.password}@` : '';

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${proxyServer}`,
      ...(proxyAuth ? [`--proxy-auth=${proxyAuth}`] : []),
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  try {
    const searchQuery = `${role} ${industry} jobs ${location}`;
    await page.goto(`https://www.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${location}`, { waitUntil: 'networkidle2' });

    // Wait for jobs to load
    await page.waitForSelector('.job_seen_beacon', { timeout: 10000 });

    const leads = await page.evaluate(() => {
      const jobCards = Array.from(document.querySelectorAll('.job_seen_beacon'));
      return jobCards.slice(0, count).map(card => {
        const title = card.querySelector('h2 a[aria-label]')?.innerText || '';
        const company = card.querySelector('.companyName')?.innerText || '';
        const locationText = card.querySelector('.companyLocation')?.innerText || '';
        const url = card.querySelector('h2 a')?.href || '';
        
        return {
          title,
          company,
          location: locationText,
          url
        };
      }).filter(lead => lead.title && lead.company);
    });

    const formattedLeads = leads.map(lead => ({
      source: 'Indeed',
      name: `${lead.title} @ ${lead.company}`,
      title: lead.title,
      company: lead.company,
      location: lead.location,
      email: `hr@${lead.company.toLowerCase().replace(/\s+/g, '')}.com`, // placeholder
      url: lead.url,
      hiringFor: role
    }));

    await browser.close();
    return formattedLeads.slice(0, count);
  } catch (error) {
    console.error('Indeed scrape error:', error.message);
    await browser.close();
    return [];
  }
}

module.exports = { scrape };