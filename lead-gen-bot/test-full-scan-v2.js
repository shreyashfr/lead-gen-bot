/**
 * Full Scan Test V2 - Using actual scripts directly
 * Simulates the /scan endpoint without needing a running server
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(100));
console.log('🧪 FULL SCAN TEST V2 - Direct Script Execution');
console.log('='.repeat(100) + '\n');

console.log('Query: Decision makers at companies hiring 20+ engineers from USA');
console.log('Expected: VPs, CTOs, Engineering Directors, Heads of Engineering\n');

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

async function runScan() {
  const params = {
    role: 'VP Engineering',
    location: 'USA',
    industry: 'Technology',
    titles: 'VP Engineering,CTO,Head of Engineering,Engineering Director,Chief Technology Officer'
  };

  const count = 20;
  const startTime = Date.now();
  const leads = [];
  const results = {};

  console.log('Step 1: 🚀 RUNNING SCRAPERS IN PARALLEL');
  console.log('─'.repeat(100) + '\n');

  // Run all scrapers in parallel
  const promises = Object.entries(scrapers).map(async ([name, scraper]) => {
    const sourceStart = Date.now();
    
    try {
      console.log(`  ⏳ ${name.padEnd(12)} - Running...`);
      
      const sourceLeads = await scraper.scrape(params, count);
      const sourceTime = ((Date.now() - sourceStart) / 1000).toFixed(2);
      
      if (sourceLeads && sourceLeads.length > 0) {
        leads.push(...sourceLeads);
        results[name] = {
          status: '✅',
          count: sourceLeads.length,
          time: sourceTime,
          sample: sourceLeads[0]
        };
        console.log(`  ✅ ${name.padEnd(12)} - ${sourceLeads.length} leads in ${sourceTime}s`);
      } else {
        results[name] = {
          status: '⚠️',
          count: 0,
          time: sourceTime,
          reason: 'No leads returned'
        };
        console.log(`  ⚠️  ${name.padEnd(12)} - No leads in ${sourceTime}s`);
      }
    } catch (error) {
      const sourceTime = ((Date.now() - sourceStart) / 1000).toFixed(2);
      results[name] = {
        status: '❌',
        time: sourceTime,
        error: error.message.slice(0, 50)
      };
      console.log(`  ❌ ${name.padEnd(12)} - Error: ${error.message.slice(0, 40)}`);
    }
  });

  await Promise.all(promises);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ All scrapers completed in ${totalTime}s\n`);

  // Limit to requested count
  const finalLeads = leads.slice(0, count);

  console.log('Step 2: 📊 RESULTS SUMMARY');
  console.log('─'.repeat(100) + '\n');

  console.log(`Total leads found: ${finalLeads.length}/${count}`);
  console.log(`Time taken: ${totalTime}s`);
  console.log(`Expected: 20 leads in 20-25s\n`);

  // Analysis by source
  console.log('Results by Source:');
  Object.entries(results).forEach(([name, result]) => {
    const status = result.status;
    const count = result.count || 0;
    const time = result.time;
    console.log(`  ${status} ${name.padEnd(12)} - ${String(count).padStart(2)} leads (${time}s)`);
  });

  console.log();

  // Decision maker analysis
  console.log('Step 3: 🎯 DECISION MAKER ANALYSIS');
  console.log('─'.repeat(100) + '\n');

  const decisionMakers = finalLeads.filter(l => 
    l.isDecisionMaker || l.seniority === 'executive' || l.seniority === 'director'
  );

  const dmPercent = finalLeads.length > 0 
    ? ((decisionMakers.length / finalLeads.length) * 100).toFixed(1)
    : 0;

  console.log(`Decision makers: ${decisionMakers.length}/${finalLeads.length} (${dmPercent}%)`);
  console.log(`Expected: ~40% (8 per 20 leads)\n`);

  // Seniority breakdown
  const bySeniority = {};
  finalLeads.forEach(l => {
    const senior = l.seniority || 'unknown';
    if (!bySeniority[senior]) bySeniority[senior] = 0;
    bySeniority[senior]++;
  });

  console.log('Seniority Breakdown:');
  Object.entries(bySeniority).forEach(([level, count]) => {
    console.log(`  ${level.padEnd(15)} - ${count}`);
  });

  console.log();

  // Source diversity
  console.log('Step 4: 🔄 SOURCE DIVERSITY');
  console.log('─'.repeat(100) + '\n');

  const bySource = {};
  finalLeads.forEach(l => {
    if (!bySource[l.source]) bySource[l.source] = 0;
    bySource[l.source]++;
  });

  const sourceCount = Object.keys(bySource).length;
  console.log(`Sources represented: ${sourceCount}`);
  console.log(`Expected: 5-7 sources\n`);

  console.log('Leads by Source:');
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`  ${source.padEnd(15)} - ${count} leads`);
  });

  console.log();

  // Sample leads
  console.log('Step 5: 📋 SAMPLE LEADS');
  console.log('─'.repeat(100) + '\n');

  finalLeads.slice(0, 5).forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.name || 'Unknown'}`);
    console.log(`   Source: ${lead.source}`);
    console.log(`   Title: ${lead.title || 'N/A'}`);
    console.log(`   Company: ${lead.company || 'N/A'}`);
    console.log(`   Location: ${lead.location || 'N/A'}`);
    console.log(`   Seniority: ${lead.seniority || 'N/A'}\n`);
  });

  // Issue detection
  console.log('Step 6: 🔍 ISSUE DETECTION');
  console.log('─'.repeat(100) + '\n');

  const issues = [];

  // Check coverage
  if (finalLeads.length === 0) {
    issues.push('❌ CRITICAL: No leads found at all');
  } else if (finalLeads.length < 10) {
    issues.push(`⚠️  Low coverage: Got ${finalLeads.length} leads, expected 20`);
  }

  // Check config
  if (!config.linkedin || !config.linkedin.li_at || config.linkedin.li_at.includes('...')) {
    issues.push('⚠️  CONFIG: LinkedIn li_at cookie not configured');
  }
  if (!config.salesnav || !config.salesnav.li_a || config.salesnav.li_a.includes('...')) {
    issues.push('⚠️  CONFIG: SalesNav li_a cookie not configured');
  }
  if (!config.proxy || !config.proxy.username || config.proxy.username.includes('your')) {
    issues.push('⚠️  CONFIG: Proxy credentials not configured');
  }

  // Check decision makers
  if (dmPercent < 20) {
    issues.push(`⚠️  LOW QUALITY: Only ${dmPercent}% are decision makers, expected ~40%`);
  }

  // Check for empty fields
  const incomplete = finalLeads.filter(l => !l.title || !l.company).length;
  if (incomplete > finalLeads.length * 0.3) {
    issues.push(`⚠️  DATA QUALITY: ${incomplete} leads missing title/company`);
  }

  // Check source diversity
  if (sourceCount < 3) {
    issues.push(`⚠️  SOURCE DIVERSITY: Only ${sourceCount} sources, expected 5-7`);
  }

  if (issues.length === 0) {
    console.log('✅ NO MAJOR ISSUES DETECTED\n');
  } else {
    console.log('Issues Found:\n');
    issues.forEach(issue => {
      console.log(`${issue}`);
    });
    console.log();
  }

  // Final summary
  console.log('='.repeat(100));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(100) + '\n');

  console.log(`Leads Returned:        ${finalLeads.length}/20`);
  console.log(`Decision Makers:       ${decisionMakers.length} (${dmPercent}%)`);
  console.log(`Sources Active:        ${sourceCount}/7`);
  console.log(`Execution Time:        ${totalTime}s`);
  console.log(`Status:                ${finalLeads.length > 15 ? '✅ GOOD' : finalLeads.length > 10 ? '⚠️  OK' : '❌ POOR'}\n`);

  console.log('='.repeat(100));
  console.log();
}

runScan().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
