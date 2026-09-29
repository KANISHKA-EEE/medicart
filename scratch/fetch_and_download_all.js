const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const products = require('../server/seed/medicinesData.json');

const candidatesDir = path.join(__dirname, 'candidates');
if (!fs.existsSync(candidatesDir)) {
  fs.mkdirSync(candidatesDir, { recursive: true });
}

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

async function processProduct(p, index) {
  const query = `${p.manufacturer} ${p.name} packaging product`;
  const productDir = path.join(candidatesDir, `product_${index + 1}`);
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }

  try {
    const candidateUrls = await searchBingImages(query);
    const legitimateUrls = candidateUrls.filter(u => {
      const lower = u.toLowerCase();
      return !lower.includes('unsplash') && 
             !lower.includes('shutterstock') && 
             !lower.includes('freepik') && 
             !lower.includes('getty') && 
             !lower.includes('depositphotos') && 
             !lower.includes('dreamstime') && 
             !lower.includes('123rf') && 
             !lower.includes('stock');
    });

    const meta = {
      id: index + 1,
      name: p.name,
      manufacturer: p.manufacturer,
      category: p.category,
      dosageForm: p.dosageForm,
      packSize: p.packSize,
      query: query,
      downloadedCandidates: []
    };

    let downloadedCount = 0;
    for (let i = 0; i < Math.min(5, legitimateUrls.length); i++) {
      const url = legitimateUrls[i];
      try {
        const buf = await fetchUrlBuffer(url);
        if (buf.length < 3000) continue; // skip tiny or invalid images
        
        let ext = '.jpg';
        if (url.endsWith('.png')) ext = '.png';
        if (url.endsWith('.webp')) ext = '.webp';

        const filename = `candidate_${i + 1}${ext}`;
        const filePath = path.join(productDir, filename);
        fs.writeFileSync(filePath, buf);
        
        meta.downloadedCandidates.push({
          index: i + 1,
          filename: filename,
          url: url,
          sizeBytes: buf.length
        });
        downloadedCount++;
      } catch (err) {
        // failed download
      }
    }

    fs.writeFileSync(path.join(productDir, 'meta.json'), JSON.stringify(meta, null, 2));
    console.log(`[${index + 1}/80] Completed "${p.name}": downloaded ${downloadedCount} candidate images.`);
  } catch (err) {
    console.error(`[${index + 1}/80] Error: ${err.message}`);
  }
}

async function runInBatches() {
  const BATCH_SIZE = 5;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((p, idx) => processProduct(p, i + idx)));
  }
  console.log('✅ ALL 80 PRODUCTS FETCHED & SAVED TO SCRATCH CANDIDATES.');
}

runInBatches();
