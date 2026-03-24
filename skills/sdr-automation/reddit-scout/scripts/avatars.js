// avatars.js
// Fetch and cache Reddit user avatars via /user/<name>/about.json

const fs = require('fs');
const path = require('path');
const { jget } = require('./reddit_http');

function safeUser(u) {
  return String(u || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
}

function loadCache(cachePath) {
  try { return JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch { return { users: {} }; }
}

function saveCache(cachePath, cache) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function pickAvatarUrl(aboutJson) {
  const d = aboutJson?.data || {};
  // Prefer snoovatar if present; else icon_img.
  const url = (d.snoovatar_img && String(d.snoovatar_img)) || (d.icon_img && String(d.icon_img)) || '';
  if (!url) return null;
  return url.replace(/&amp;/g, '&');
}

async function download(url, outPath, { userAgent, timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': userAgent || 'openclaw-reddit-scout/0.1 (skill; contact: local)',
        'Accept': 'image/*,*/*;q=0.8'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} avatar ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    return buf.length;
  } finally {
    clearTimeout(t);
  }
}

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\.([a-z0-9]{3,4})$/i);
    return m ? m[1].toLowerCase() : 'jpg';
  } catch {
    return 'jpg';
  }
}

async function ensureAvatar(username, {
  runAvatarsDir,
  cachePath,
  opts
} = {}) {
  const user = safeUser(username);
  if (!user) return null;

  const cache = loadCache(cachePath);
  const cached = cache.users[user];
  if (cached && cached.path && fs.existsSync(cached.path)) return cached;

  let about;
  try {
    const url = `https://www.reddit.com/user/${encodeURIComponent(user)}/about.json`;
    about = await jget(url, { ...opts, log: false });
  } catch {
    return null;
  }

  const avatarUrl = pickAvatarUrl(about);
  if (!avatarUrl) return null;

  const ext = extFromUrl(avatarUrl);
  const outPath = path.join(runAvatarsDir, `${user}.${ext}`);
  try {
    await download(avatarUrl, outPath, { userAgent: opts?.userAgent });
  } catch {
    return null;
  }

  const record = { user, url: avatarUrl, path: outPath, fetchedAt: new Date().toISOString() };
  cache.users[user] = record;
  saveCache(cachePath, cache);
  return record;
}

module.exports = { ensureAvatar };
