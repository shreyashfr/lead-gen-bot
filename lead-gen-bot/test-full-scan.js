/**
 * Full Scan Test - Simulating actual API usage
 * Tests the complete flow: register → scan → poll
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function runFullScan() {
  console.log('\n' + '='.repeat(100));
  console.log('🧪 FULL SCAN TEST - Simulating Real API Usage');
  console.log('='.repeat(100) + '\n');

  console.log('Query: Decision makers at companies hiring 20+ engineers from USA\n');

  try {
    // Step 1: Register User
    console.log('Step 1: 📝 REGISTER USER');
    console.log('─'.repeat(100));
    
    const userId = 'test_user_' + Date.now();
    
    const registerRes = await axios.post(`${API_URL}/register`, {
      userId: userId,
      product: 'Engineering Hiring',
      icp: 'Companies hiring 20+ engineers',
      titles: 'VP Engineering,Head of Engineering,Engineering Manager,CTO,Director of Engineering'
    });

    console.log(`✅ User registered: ${userId}`);
    console.log(`Response: ${JSON.stringify(registerRes.data)}\n`);

    // Step 2: Get Auth Token (if needed)
    console.log('Step 2: 🔐 GET AUTH TOKEN');
    console.log('─'.repeat(100));
    
    const loginRes = await axios.post(`${API_URL}/login`, {
      username: 'admin',
      password: 'password'
    });

    const token = loginRes.data.token;
    console.log(`✅ Auth token received\n`);

    // Step 3: Start Scan
    console.log('Step 3: 🔍 START SCAN');
    console.log('─'.repeat(100));
    
    const scanStartTime = Date.now();
    
    const scanRes = await axios.post(
      `${API_URL}/scan`,
      {
        userId: userId,
        count: 20,
        query: 'VP Engineering USA'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const scanId = scanRes.data.scanId;
    console.log(`✅ Scan started: ${scanId}`);
    console.log(`Response: ${JSON.stringify(scanRes.data)}\n`);

    // Step 4: Poll Results
    console.log('Step 4: 📊 POLL RESULTS');
    console.log('─'.repeat(100));
    
    // Wait a bit for scraping to complete
    await new Promise(r => setTimeout(r, 3000));
    
    const pollRes = await axios.get(`${API_URL}/poll/${userId}/${scanId}`);
    
    const pollTime = ((Date.now() - scanStartTime) / 1000).toFixed(2);
    
    console.log(`✅ Results polled (${pollTime}s)`);
    console.log(`Status: ${pollRes.data.status}`);
    console.log(`Leads found: ${pollRes.data.leads.length}\n`);

    // Step 5: Display Results
    console.log('Step 5: 📈 RESULTS ANALYSIS');
    console.log('─'.repeat(100) + '\n');

    if (pollRes.data.leads && pollRes.data.leads.length > 0) {
      console.log(`Total leads: ${pollRes.data.leads.length}`);
      console.log(`Expected: 20\n`);

      // Group by source
      const bySource = {};
      pollRes.data.leads.forEach(lead => {
        if (!bySource[lead.source]) {
          bySource[lead.source] = [];
        }
        bySource[lead.source].push(lead);
      });

      console.log('Leads by Source:');
      Object.entries(bySource).forEach(([source, leads]) => {
        console.log(`  ${source}: ${leads.length} leads`);
      });

      console.log('\nSample Leads:');
      pollRes.data.leads.slice(0, 5).forEach((lead, i) => {
        console.log(`\n  ${i + 1}. ${lead.name || 'Unknown'}`);
        console.log(`     Source: ${lead.source}`);
        console.log(`     Title: ${lead.title || 'N/A'}`);
        console.log(`     Company: ${lead.company || 'N/A'}`);
        console.log(`     Location: ${lead.location || 'N/A'}`);
        console.log(`     URL: ${lead.url ? '✅' : '❌'}`);
        if (lead.isDecisionMaker !== undefined) {
          console.log(`     Decision Maker: ${lead.isDecisionMaker ? '✅' : '❌'}`);
        }
      });

      console.log('\n');
    } else {
      console.log('⚠️ No leads found in results\n');
    }

    // Step 6: Check for Issues
    console.log('Step 6: 🔍 ISSUE DETECTION');
    console.log('─'.repeat(100) + '\n');

    const issues = [];

    // Check coverage
    if (pollRes.data.leads.length < 10) {
      issues.push('⚠️ Low lead count: Expected at least 10, got ' + pollRes.data.leads.length);
    }

    // Check for empty fields
    const incompleteLeads = pollRes.data.leads.filter(l => !l.title || !l.company);
    if (incompleteLeads.length > 0) {
      issues.push(`⚠️ Incomplete leads: ${incompleteLeads.length} missing title or company`);
    }

    // Check for decision makers
    const decisionMakers = pollRes.data.leads.filter(l => l.seniority === 'director' || l.seniority === 'executive');
    const dmPercent = ((decisionMakers.length / pollRes.data.leads.length) * 100).toFixed(1);
    console.log(`Decision makers: ${decisionMakers.length}/${pollRes.data.leads.length} (${dmPercent}%)`);
    console.log(`Expected: ~40% (8-10 per 20 leads)\n`);

    if (decisionMakers.length < 5) {
      issues.push('⚠️ Low decision maker ratio: Got ' + dmPercent + '%, expected ~40%');
    }

    // Check source diversity
    const sourceCount = Object.keys(bySource).length;
    console.log(`Source diversity: ${sourceCount} different sources`);
    console.log(`Expected: 5-7 sources\n`);

    if (sourceCount < 3) {
      issues.push(`⚠️ Low source diversity: Only ${sourceCount} sources, expected 5-7`);
    }

    // Summary
    console.log('\n' + '='.repeat(100));
    console.log('📋 ISSUES FOUND');
    console.log('='.repeat(100) + '\n');

    if (issues.length === 0) {
      console.log('✅ No issues detected!\n');
    } else {
      issues.forEach(issue => {
        console.log(issue);
      });
      console.log();
    }

    console.log('='.repeat(100));
    console.log('✅ FULL SCAN TEST COMPLETE');
    console.log('='.repeat(100) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Start server first, then run test
console.log('\n⏳ Waiting for server to start...\n');

setTimeout(() => {
  runFullScan();
}, 2000);
