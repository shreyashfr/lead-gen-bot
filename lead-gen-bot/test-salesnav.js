/**
 * Test SalesNav scraper with HTML parsing
 */

const axios = require('axios');
const cheerio = require('cheerio');
const config = require('./config/sessions.json');

async function testSalesNav() {
  const proxyUrl = `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.server.replace('http://', '')}`;
  
  try {
    console.log('🔍 Testing Sales Navigator HTML scraping...\n');
    
    const searchQuery = encodeURIComponent('marketing');
    const salesNavUrl = `https://www.linkedin.com/sales/search/people?keywords=${searchQuery}`;

    console.log('URL:', salesNavUrl);
    console.log('Auth: li_a + li_at cookies');
    console.log('Proxy: Decodo\n');

    const response = await axios.get(salesNavUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Cookie': `li_a=${config.salesnav.li_a}; li_at=${config.linkedin.li_at}`,
        'Referer': 'https://www.linkedin.com/sales/search/people'
      },
      httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
      httpsAgent: new (require('https').Agent)({ proxy: proxyUrl }),
      timeout: 30000
    });

    console.log('✅ Page fetched, Status:', response.status);
    console.log('Page length:', response.data.length, 'bytes\n');
    
    const $ = cheerio.load(response.data);
    
    // Count entity results
    const allDivs = $('div[class*="entity"]');
    console.log('Divs with "entity":', allDivs.length);
    
    // Check for common HTML patterns
    const titles = $('[class*="title"]');
    const subtitles = $('[class*="subtitle"]');
    const companies = $('[class*="company"]');
    
    console.log('Title elements:', titles.length);
    console.log('Subtitle elements:', subtitles.length);
    console.log('Company elements:', companies.length);
    
    // Look for scripts with data
    let dataFound = false;
    $('script').each((i, elem) => {
      const script = $(elem).html() || '';
      if (script.includes('searchResults') || script.includes('entities') || script.includes('profiles')) {
        console.log(`\nScript ${i}: Contains data (${script.length} bytes)`);
        dataFound = true;
        
        // Try to extract JSON
        try {
          const jsonMatch = script.match(/{[\s\S]*?}/);
          if (jsonMatch) {
            const sample = jsonMatch[0].slice(0, 200);
            console.log('Sample:', sample);
          }
        } catch (e) {
          // Silent
        }
      }
    });
    
    if (!dataFound) {
      console.log('\n⚠️ No data found in scripts');
      console.log('Sample HTML:', response.data.slice(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSalesNav();
