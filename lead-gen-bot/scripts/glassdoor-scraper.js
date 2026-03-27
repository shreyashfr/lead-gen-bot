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
  
  // Set Glassdoor cookies
  if (config.glassdoor.cookies) {
    await page.setCookie(...config.glassdoor.cookies);
  }

  try {
    const searchQuery = `${role} ${industry} jobs ${location}`;
    await page.goto(`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(searchQuery)}&locT=C&locId=${location === 'USA' ? '1' : ''}&jobType=all`, { waitUntil: 'networkidle2' });

    // Wait for jobs to load
    await page.waitForSelector('.jobContainer', { timeout: 10000 });

    const leads = await page.evaluate(() => {
      const jobCards = Array.from(document.querySelectorAll('.jobContainer'));
      return jobCards.slice(0, count).map(card => {
        const title = card.querySelector('a.e1j1x3770[data-test="job-title"]')?.innerText || '';
        const company = card.querySelector('.css-17n8dbb.e1tk4kwz3')?.innerText || '';
        const locationText = card.querySelector('.css-56kyx5.e1tk4kwz2')?.innerText || '';
        const url = card.querySelector('a')?.href || '';
        
        return {
          title,
          company,
          location: locationText,
          url: 'https://www.glassdoor.com' + url
        };
      }).filter(lead => lead.title && lead.company);
    });

    const formattedLeads = leads.map(lead => ({
      source: 'Glassdoor',
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
    console.error('Glassdoor scrape error:', error.message);
    await browser.close();
    return [];
  }
}

module.exports = { scrape };