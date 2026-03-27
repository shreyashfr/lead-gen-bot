/**
 * Test All 7 Sources - Comprehensive Test Suite
 * Tests each scraper with the new methods
 */

const fs = require('fs');
const config = require('./config/sessions.json');

const scrapers = {
  linkedin: require('./scripts/linkedin-jobs'),
  salesnav: require('./scripts/salesnav-scraper'),
  dice: require('./scripts/dice-scraper'),
  yc: require('./scripts/yc-scraper'),
  glassdoor: require('./scripts/glassdoor-scraper'),
  indeed: require('./scripts/indeed-scraper'),
  wellfound: require('./scripts/wellfound-serper')
};

const testParams = {
  role: 'marketing',
  location: 'USA',
  industry: 'technology',
  titles: 'VP Marketing,Head of Marketing,CMO'
};

const testCount = 5; // 5 per source for testing

async function testAllSources() {
  console.log('\n' + '='.repeat(100));
  console.log('🧪 TESTING ALL 7 SOURCES - Comprehensive Test');
  console.log('='.repeat(100) + '\n');

  console.log(`Query: ${testParams.role} in ${testParams.location}`);
  console.log(`Count per source: ${testCount}`);
  console.log(`Parallel execution: YES\n`);

  const results = {};
  const startTime = Date.now();

  // Run all scrapers in parallel
  const promises = Object.entries(scrapers).map(async ([name, scraper]) => {
    const sourceStart = Date.now();
    
    try {
      console.log(`📡 ${name.padEnd(12)} - Running...`);
      
      const leads = await scraper.scrape(testParams, testCount);
      
      const sourceTime = ((Date.now() - sourceStart) / 1000).toFixed(2);
      
      results[name] = {
        status: 'success',
        count: leads.length,
        time: sourceTime,
        leads: leads.slice(0, 2), // Store first 2 for display
        sample: leads[0] || null
      };
      
      console.log(`✅ ${name.padEnd(12)} - ${leads.length} leads in ${sourceTime}s`);
      
    } catch (error) {
      const sourceTime = ((Date.now() - sourceStart) / 1000).toFixed(2);
      results[name] = {
        status: 'error',
        error: error.message,
        time: sourceTime
      };
      
      console.log(`❌ ${name.padEnd(12)} - Error: ${error.message.slice(0, 50)}`);
    }
  });

  await Promise.all(promises);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  // Display detailed results
  console.log('\n' + '='.repeat(100));
  console.log('📊 DETAILED RESULTS');
  console.log('='.repeat(100) + '\n');

  let totalLeads = 0;
  let successCount = 0;
  let failCount = 0;

  Object.entries(results).forEach(([name, result]) => {
    console.log(`\n🔍 ${name.toUpperCase()}`);
    console.log('─'.repeat(80));
    
    if (result.status === 'success') {
      successCount++;
      totalLeads += result.count;
      
      console.log(`Status:       ✅ SUCCESS`);
      console.log(`Leads found:  ${result.count}/${testCount}`);
      console.log(`Time:         ${result.time}s`);
      
      if (result.sample) {
        console.log(`\nSample Lead:`);
        console.log(`  Name:      ${result.sample.name || 'N/A'}`);
        console.log(`  Title:     ${result.sample.title || 'N/A'}`);
        console.log(`  Company:   ${result.sample.company || 'N/A'}`);
        console.log(`  Location:  ${result.sample.location || 'N/A'}`);
        console.log(`  URL:       ${result.sample.url ? '✅ Available' : '❌ N/A'}`);
      }
    } else {
      failCount++;
      console.log(`Status:       ❌ FAILED`);
      console.log(`Error:        ${result.error}`);
      console.log(`Time:         ${result.time}s`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(100));
  console.log('📈 SUMMARY');
  console.log('='.repeat(100) + '\n');

  console.log(`Sources Tested:      7`);
  console.log(`Successful:          ${successCount}/7 ✅`);
  console.log(`Failed:              ${failCount}/7 ❌`);
  console.log(`Total Leads:         ${totalLeads}`);
  console.log(`Total Time:          ${totalTime}s`);
  console.log(`Average per source:  ${(totalTime / 7).toFixed(2)}s\n`);

  // Method breakdown
  console.log('Method Breakdown:');
  console.log('  API-based:         LinkedIn Jobs, SalesNav, WellFound (3)');
  console.log('  HTML parsing:      YC, Dice (2)');
  console.log('  Browser-based:     Indeed, Glassdoor (2)');
  console.log('  Total:             7 sources\n');

  // Save results
  saveResults(results, totalTime, totalLeads);

  console.log('✅ Test complete!\n');
}

function saveResults(results, totalTime, totalLeads) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSources: 7,
      successful: Object.values(results).filter(r => r.status === 'success').length,
      failed: Object.values(results).filter(r => r.status === 'error').length,
      totalLeads: totalLeads,
      totalTime: totalTime,
      averageTime: (totalTime / 7).toFixed(2)
    },
    results: results,
    query: {
      role: 'marketing',
      location: 'USA'
    }
  };

  fs.writeFileSync(
    'test-results-all-sources.json',
    JSON.stringify(report, null, 2)
  );

  console.log('📄 Results saved to: test-results-all-sources.json\n');
}

// Run tests
testAllSources().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
