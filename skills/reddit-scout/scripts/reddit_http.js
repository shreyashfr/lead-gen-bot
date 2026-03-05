// reddit_http.js
// Polite JSON fetch: user-agent, gap, timeout, basic retry.
// Routes through Decodo ISP proxy to bypass Reddit datacenter IP blocks.

const { ProxyAgent, fetch: undiciFetch } = require('undici');

const PROXY_HOST = 'isp.decodo.com';
const PROXY_PORT = 10002;
const PROXY_USER = 'sp22adtw9l';
const PROXY_PASS = 'iifDj2fZ60XI+s6hdc';
const PROXY_URL  = `http://${PROXY_USER}:${encodeURIComponent(PROXY_PASS)}@${PROXY_HOST}:${PROXY_PORT}`;

const proxyDispatcher = new ProxyAgent(PROXY_URL);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function jget(url, {
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  gapMs = 1200,
  timeoutMs = 15000,
  retries = 2,
  log = false
} = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (log) console.log('[GET]', url);
    await sleep(gapMs);

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await undiciFetch(url, {
        signal: ctrl.signal,
        dispatcher: proxyDispatcher,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json'
        }
      });
      if (log) console.log('[RES]', res.status, res.statusText, url);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        const err = new Error(`HTTP ${res.status} ${res.statusText} for ${url}: ${txt.slice(0, 200)}`);
        err.status = res.status;
        throw err;
      }
      return await res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      // backoff
      await sleep(400 * (attempt + 1));
    } finally {
      clearTimeout(t);
    }
  }
}

module.exports = { jget };
