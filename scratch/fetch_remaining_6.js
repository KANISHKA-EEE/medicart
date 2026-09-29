const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const itemsToFix = [
  { index: 24, query: "Amrutanjan Roll On Faster Relaxation 10ml 1mg pharmeasy indiamart amazon" },
  { index: 27, query: "Salonpas Pain Relief Patch 5s 1mg pharmeasy indiamart amazon" },
  { index: 30, query: "Dr Scholls Foot Cream 50g 1mg pharmeasy indiamart amazon" },
  { index: 32, query: "Strepsils Menthol Lozenges 20s 1mg pharmeasy indiamart amazon" },
  { index: 55, query: "Head & Shoulders Anti-Dandruff Shampoo 250ml 1mg pharmeasy indiamart amazon" },
  { index: 63, query: "Savlon Antiseptic Liquid 250ml 1mg pharmeasy indiamart amazon" }
];

function getHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(8000, () => { req.destroy(); resolve(''); });
  });
}

async function searchBingImages(query) {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
  const html = await getHtml(searchUrl);
  const matches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)];
  return matches.map(m => m[1]);
}

function fetchUrlBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrlBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

(async () => {
  for (const item of itemsToFix) {
    const productDir = path.join(__dirname, 'candidates', `product_${item.index}`);
    const urls = await searchBingImages(item.query);
    console.log(`Product #${item.index} candidates found: ${urls.length}`);
    const metaPath = path.join(productDir, 'meta.json');
    let meta = { downloadedCandidates: [] };
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    }
    
    let added = 0;
    for (let i = 0; i < Math.min(10, urls.length); i++) {
      const url = urls[i];
      try {
        const buf = await fetchUrlBuffer(url);
        if (buf.length < 5000) continue;
        const filename = `extra_candidate_${i+1}.jpg`;
        fs.writeFileSync(path.join(productDir, filename), buf);
        meta.downloadedCandidates.unshift({
          index: 99 + i,
          filename: filename,
          url: url,
          sizeBytes: buf.length
        });
        added++;
      } catch (err) {}
    }
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log(`Added ${added} extra candidates for Product #${item.index}`);
  }
})();
