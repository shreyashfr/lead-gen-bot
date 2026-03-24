// media.js
// Extract + download post media (image or thumbnail) for card rendering.

const fs = require('fs');
const path = require('path');

function pickMediaUrl(post) {
  // post: normalized listing item OR detail.post; may contain media oembed.
  const hint = post.post_hint || '';

  // 0) Gallery posts: listing/detail often has url like https://www.reddit.com/gallery/<id>
  // Actual images are in media_metadata; handled separately via pickGalleryMediaUrl().

  // 1) Direct image posts
  if (hint === 'image' && typeof post.url === 'string') {
    return { type: 'image', url: post.url };
  }

  // 2) Rich video (YouTube etc.) -> thumbnail
  const oembedThumb = post.media?.oembed?.thumbnail_url;
  if ((hint.startsWith('rich:video') || hint === 'link' || hint === 'rich:video') && typeof oembedThumb === 'string') {
    return { type: 'thumbnail', url: oembedThumb };
  }

  // 3) Reddit hosted video -> try thumbnail if it looks like a URL
  if ((hint === 'hosted:video' || hint === 'video') && typeof post.thumbnail === 'string' && post.thumbnail.startsWith('http')) {
    return { type: 'thumbnail', url: post.thumbnail };
  }

  // 4) Fallback: any http thumbnail
  if (typeof post.thumbnail === 'string' && post.thumbnail.startsWith('http')) {
    return { type: 'thumbnail', url: post.thumbnail };
  }

  return null;
}

async function download(url, outPath, { userAgent = 'openclaw-reddit-scout/0.1 (skill; contact: local)', timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'image/*,*/*;q=0.8'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for media ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    return { outPath, bytes: buf.length, contentType: res.headers.get('content-type') || null };
  } finally {
    clearTimeout(t);
  }
}

function extFromContentType(ct) {
  if (!ct) return null;
  const s = ct.toLowerCase();
  if (s.includes('image/png')) return 'png';
  if (s.includes('image/webp')) return 'webp';
  if (s.includes('image/jpeg') || s.includes('image/jpg')) return 'jpg';
  if (s.includes('image/gif')) return 'gif';
  return null;
}

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\.([a-z0-9]{3,4})$/i);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

function pickGalleryMediaUrl(post) {
  // Works when detail post includes media_metadata/gallery_data.
  if (!post) return null;
  const isGallery = !!post.is_gallery || (typeof post.url === 'string' && post.url.includes('/gallery/'));
  if (!isGallery) return null;

  const items = post.gallery_data?.items;
  const meta = post.media_metadata;
  if (!items || !Array.isArray(items) || !meta) return null;

  // Pick first item.
  const first = items[0];
  const mediaId = first?.media_id;
  const m = mediaId ? meta[mediaId] : null;
  const s = m?.s;
  const url = s?.u || s?.gif || s?.mp4;
  if (typeof url === 'string') {
    return { type: 'gallery', url: url.replace(/&amp;/g, '&') };
  }
  return null;
}

async function downloadPostMedia(post, { mediaDir, id, userAgent }) {
  const galleryPick = pickGalleryMediaUrl(post);
  const pick = galleryPick || pickMediaUrl(post);
  if (!pick) return null;

  // choose extension
  const guessedExt = extFromUrl(pick.url) || 'img';
  let outPath = path.join(mediaDir, `${id}.${guessedExt}`);

  // download
  const res = await download(pick.url, outPath, { userAgent });

  // if we used a dummy extension, fix it
  const properExt = extFromContentType(res.contentType);
  if (properExt && !outPath.toLowerCase().endsWith('.' + properExt)) {
    const fixed = path.join(mediaDir, `${id}.${properExt}`);
    try {
      fs.renameSync(outPath, fixed);
      outPath = fixed;
    } catch {
      // ignore; keep original
    }
  }

  return { type: pick.type, url: pick.url, path: outPath, contentType: res.contentType, bytes: res.bytes };
}

module.exports = { pickMediaUrl, pickGalleryMediaUrl, downloadPostMedia };
