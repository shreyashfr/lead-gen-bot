/**
 * Test script for API-based scrapers (LinkedIn Jobs + SalesNav)
 * Run: node test-api-scrapers.js
 */

const linkedinJobs = require('./scripts/linkedin-jobs');
const salesNav = require('./scripts/salesnav-scraper');

async function runTests() {
  console.log('🚀 Testing API-based scrapers...\n');

  const testParams = {
    role: 'marketing',
    location: 'USA',
    industry: 'tech',
    titles: 'VP Marketing,Head of Growth,CMO'
  };
  const count = 5;

  // Test LinkedIn Jobs Voyager API
  console.log('📊 Testing LinkedIn Jobs Voyager API...');
  try {
    const linkedinResults = await linkedinJobs.scrape(testParams, count);
    console.log(`✅ LinkedIn Jobs: ${linkedinResults.length} leads returned`);
    console.log(JSON.stringify(linkedinResults.slice(0, 2), null, 2));
  } catch (error) {
    console.error(`❌ LinkedIn Jobs error: ${error.message}`);
  }

  console.log('\n---\n');

  // Test SalesNav API
  console.log('📊 Testing SalesNav API...');
  try {
    const salesNavResults = await salesNav.scrape(testParams, count);
    console.log(`✅ SalesNav: ${salesNavResults.length} leads returned`);
    console.log(JSON.stringify(salesNavResults.slice(0, 2), null, 2));
  } catch (error) {
    console.error(`❌ SalesNav error: ${error.message}`);
  }

  console.log('\n✨ Testing complete!');
}

runTests();
