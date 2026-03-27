/**
 * Test Sales Navigator API with Decision Maker Filtering
 */

const axios = require('axios');
const config = require('./config/sessions.json');

async function testSalesNavAPI() {
  console.log('🧪 Testing Sales Navigator API - Decision Makers\n');
  console.log('='.repeat(80) + '\n');

  const proxyUrl = `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.server.replace('http://', '')}`;

  // Test parameters
  const testCases = [
    { role: 'VP Marketing', location: 'USA' },
    { role: 'CMO Chief Marketing Officer', location: 'San Francisco' },
    { role: 'Head of Engineering', location: 'New York' }
  ];

  for (const params of testCases) {
    console.log(`📊 Testing: ${params.role} in ${params.location}\n`);

    try {
      // Try Primary API
      console.log('🔍 Attempting Primary API (/sales-api/salesApiEntities)...');
      
      const query = encodeURIComponent(`${params.role} ${params.location}`);
      const url = `https://www.linkedin.com/sales-api/salesApiEntities?q=${query}&count=10&filters=(origin:JOB_SEARCH_PAGE_QUERY_PILLS)`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Cookie': `li_at=${config.linkedin.li_at}; li_a=${config.salesnav.li_a}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://www.linkedin.com/sales/search/people'
        },
        httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
        httpsAgent: new (require('https').Agent)({ proxy: proxyUrl }),
        timeout: 30000,
        validateStatus: () => true
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200 && typeof response.data === 'object') {
        const profiles = response.data?.data?.elements || [];
        console.log(`   ✅ Success! Found ${profiles.length} profiles\n`);

        // Extract decision makers
        const decisionMakers = filterDecisionMakers(profiles);
        console.log(`   📈 Decision Makers: ${decisionMakers.length}/${profiles.length}\n`);

        // Display sample
        decisionMakers.slice(0, 3).forEach((profile, i) => {
          console.log(`   ${i + 1}. ${profile.displayName || profile.name || 'Unknown'}`);
          console.log(`      Title: ${profile.title || profile.headline || 'N/A'}`);
          console.log(`      Company: ${profile.company || profile.companyName || 'N/A'}`);
          console.log();
        });
      } else if (response.status === 401) {
        console.log('   ❌ Unauthorized (401) - Cookies may be expired');
      } else if (response.status === 403) {
        console.log('   ❌ Forbidden (403) - Access denied');
      } else {
        console.log(`   ⚠️ Status ${response.status} - Unexpected response`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n' + '-'.repeat(80) + '\n');
  }

  console.log('\n📋 Testing Complete!\n');
  console.log('Next steps:');
  console.log('1. Verify cookies in config/sessions.json are valid');
  console.log('2. Check proxy connection (Decodo credentials)');
  console.log('3. Run full scraper: node scripts/salesnav-scraper.js');
}

/**
 * Filter profiles for decision makers
 */
function filterDecisionMakers(profiles) {
  const decisionMakerPatterns = [
    /VP|Vice President/i,
    /Chief|C-Level|CEO|CTO|CMO|CFO/i,
    /Head of|Director|VP of/i,
    /Executive|President/i,
    /Founder|Co-Founder/i
  ];

  return profiles.filter(profile => {
    const title = profile.title || profile.headline || '';
    return decisionMakerPatterns.some(pattern => pattern.test(title));
  });
}

testSalesNavAPI();
