/**
 * Network Inspector for SalesNav
 * Uses Puppeteer to observe actual API calls made by SalesNav
 * (Running without proxy for testing)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('../config/sessions.json');

async function inspectSalesNavNetwork() {
  console.log('🔍 Launching browser to inspect SalesNav API calls...\n');

  let browser;
  const apiCalls = [];
  const xhrCalls = [];

  try {
    // Launch browser WITHOUT proxy (for testing)
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Intercept XHR/Fetch requests (API calls)
    await page.on('response', async (response) => {
      const url = response.url();
      
      if (url.includes('linkedin.com') && (url.includes('/api') || url.includes('/graphql'))) {
        try {
          const text = await response.text();
          xhrCalls.push({
            url: url,
            status: response.status(),
            method: response.request().method(),
            headers: response.request().headers(),
            contentType: response.headers()['content-type'],
            sampleBody: text.substring(0, 300)
          });
          
          console.log(`📡 ${response.request().method().padEnd(6)} ${response.status()} ${url.split('/api')[1]?.substring(0, 80) || url.split('/').pop()?.substring(0, 80)}`);
        } catch (e) {
          // Skip if can't read body
        }
      }
    });

    // Set cookies
    await page.setCookie(
      {
        name: 'li_at',
        value: config.linkedin.li_at,
        domain: '.linkedin.com'
      },
      {
        name: 'li_a',
        value: config.salesnav.li_a,
        domain: '.linkedin.com'
      }
    );

    console.log('✅ Browser launched with SalesNav cookies\n');
    console.log('🌐 Navigating to SalesNav search page...\n');

    // Navigate
    try {
      await page.goto('https://www.linkedin.com/sales/search/people', {
        waitUntil: 'networkidle2',
        timeout: 90000
      });
      console.log('✅ Page loaded\n');
    } catch (e) {
      console.log(`⚠️ Page load timeout (might be normal): ${e.message}\n`);
    }

    await new Promise(r => setTimeout(r, 3000));

    // Try search
    console.log('🔎 Attempting search...\n');
    
    try {
      // Look for search elements
      const searchElements = await page.$$('[placeholder*="search"], [placeholder*="Search"], input[type="text"]');
      
      if (searchElements.length > 0) {
        console.log(`Found ${searchElements.length} potential search inputs\n`);
        
        // Try to click and type in first one
        await searchElements[0].click();
        await page.keyboard.type('VP Marketing', { delay: 50 });
        console.log('✅ Typed search query\n');
        
        // Wait and search
        await new Promise(r => setTimeout(r, 500));
        await page.keyboard.press('Enter');
        console.log('✅ Pressed Enter\n');
        
        // Wait for results
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.log('⚠️ No search input found\n');
      }
    } catch (e) {
      console.log(`⚠️ Search error: ${e.message}\n`);
    }

    console.log('\n' + '='.repeat(120));
    console.log('📊 CAPTURED API CALLS');
    console.log('='.repeat(120) + '\n');

    if (xhrCalls.length === 0) {
      console.log('❌ No API calls captured');
      console.log('\nThis might be due to:');
      console.log('1. Cookies expired or invalid');
      console.log('2. LinkedIn blocking the request');
      console.log('3. Page not fully loaded');
    } else {
      // Group by endpoint
      const byEndpoint = {};
      xhrCalls.forEach(call => {
        const url = new URL(call.url);
        const endpoint = url.pathname;
        if (!byEndpoint[endpoint]) {
          byEndpoint[endpoint] = [];
        }
        byEndpoint[endpoint].push(call);
      });

      // Display
      Object.entries(byEndpoint).forEach(([endpoint, calls]) => {
        console.log(`\n🔗 ENDPOINT: ${endpoint}`);
        console.log(`   Status: ${calls[0].status}`);
        console.log(`   Method: ${calls[0].method}`);
        console.log(`   Calls: ${calls.length}`);
        console.log(`   Content-Type: ${calls[0].contentType}`);
        
        if (calls[0].sampleBody) {
          console.log(`   Response Sample: ${calls[0].sampleBody.substring(0, 100)}...`);
        }
      });
    }

    // Save full report
    const report = {
      timestamp: new Date().toISOString(),
      totalCalls: xhrCalls.length,
      calls: xhrCalls,
      instructions: 'Use the endpoints and headers from above to build the API scraper'
    };

    fs.writeFileSync(
      '/home/ubuntu/.openclaw/workspace/lead-gen-bot/salesnav-network-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log(`\n\n✅ Captured ${xhrCalls.length} API calls`);
    console.log('✅ Report saved to: salesnav-network-report.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ Browser closed');
    }
  }
}

inspectSalesNavNetwork();
