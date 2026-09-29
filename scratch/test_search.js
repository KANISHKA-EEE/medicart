const https = require('https');

async function searchDDGImages(query) {
  return new Promise((resolve, reject) => {
    // DDG requires vqd token first
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    https.get(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const match = body.match(/vqd=([\d-]+)/) || body.match(/vqd="([\d-]+)"/) || body.match(/vqd='([\d-]+)'/);
        if (!match) {
          return resolve([]);
        }
        const vqd = match[1];
        const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
        https.get(imgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://duckduckgo.com/'
          }
        }, (res2) => {
          let body2 = '';
          res2.on('data', chunk => body2 += chunk);
          res2.on('end', () => {
            try {
              const json = JSON.parse(body2);
              resolve(json.results || []);
            } catch (e) {
              resolve([]);
            }
          });
        }).on('error', () => resolve([]));
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  const results = await searchDDGImages('Cipla Paracetamol 500mg strip 1mg');
  console.log('Results count:', results.length);
  if (results.length > 0) {
    console.log('First result image:', results[0].image);
    console.log('First result title:', results[0].title);
    console.log('First result source:', results[0].url);
  }
})();
