const https = require('https');
const http = require('http');

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

async function searchProductImage(query) {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
  const html = await getHtml(searchUrl);
  
  // Extract murl (media url) from Bing images JSON payload m="{...}"
  const matches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)];
  const urls = matches.map(m => m[1]);
  return urls;
}

(async () => {
  const query = "Cipla Paracetamol 500mg strip 1mg pharmeasy";
  const urls = await searchProductImage(query);
  console.log(`Found ${urls.length} candidate image URLs for query: "${query}"`);
  console.log(urls.slice(0, 5));
})();
