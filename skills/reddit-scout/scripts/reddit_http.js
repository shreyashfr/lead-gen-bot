// reddit_http.js
// Polite JSON fetch: user-agent, gap, timeout, basic retry.

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function jget(url, {
  userAgent = 'openclaw-reddit-scout/0.1 (skill; contact: local)',
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
      const res = await fetch(url, {
        signal: ctrl.signal,
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
