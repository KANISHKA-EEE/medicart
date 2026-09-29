const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const brandQueries = [
  /* 1 */ "Paracip 500 Cipla Paracetamol 500mg strip 1mg pharmeasy",
  /* 2 */ "Novamox 500 Sun Pharma Amoxicillin 500mg capsule 1mg pharmeasy",
  /* 3 */ "Glycomet 500 USV Metformin 500mg tablet 1mg pharmeasy",
  /* 4 */ "Pan 40 Alkem Pantoprazole 40mg tablet 1mg pharmeasy",
  /* 5 */ "Azithral 500 Zydus Azithromycin 500mg tablet 1mg pharmeasy",
  /* 6 */ "Atorva 10 Lupin Atorvastatin 10mg tablet 1mg pharmeasy",
  /* 7 */ "Telma 40 Glenmark Telmisartan 40mg tablet 1mg pharmeasy",
  /* 8 */ "Montair 10 Mankind Montelukast 10mg tablet 1mg pharmeasy",
  /* 9 */ "Omez 20 Dr Reddys Omeprazole 20mg capsule 1mg pharmeasy",
  /* 10 */ "Stamlo 5 Torrent Amlodipine 5mg tablet 1mg pharmeasy",

  /* 11 */ "HealthVit Daily Multivitamin 60 tablets 1mg pharmeasy",
  /* 12 */ "Limcee Vitamin C 500mg chewable tablet 1mg pharmeasy",
  /* 13 */ "Calcirol 60000 IU Cadila Vitamin D3 nano shot 5ml 1mg pharmeasy",
  /* 14 */ "Shelcal 500 Sun Pharma Calcium Vitamin D3 tablet 1mg pharmeasy",
  /* 15 */ "Dexorange capsules Franco Indian 30s 1mg pharmeasy",
  /* 16 */ "Becosules Z capsules Pfizer B-Complex B12 strip 1mg pharmeasy",
  /* 17 */ "Zinconia 50mg tablet Apex Zinc Sulphate 1mg pharmeasy",
  /* 18 */ "WOW Life Science Omega 3 Fish Oil 1000mg 60 softgels 1mg pharmeasy",
  /* 19 */ "Carbamide Forte Magnesium Glycinate 400mg 60 tablets 1mg pharmeasy",
  /* 20 */ "Protinex Original Nutritional Protein Powder 500g jar 1mg pharmeasy",

  /* 21 */ "Volini Pain Relief Gel 50g tube 1mg pharmeasy",
  /* 22 */ "Zandu Balm 45g jar pain relief 1mg pharmeasy",
  /* 23 */ "Orthovita joint pain relief oil 100ml 1mg pharmeasy",
  /* 24 */ "Amrutanjan Roll On Faster Relaxation headache 10ml 1mg pharmeasy",
  /* 25 */ "Moov Express Pain Relief Spray 55g 1mg pharmeasy",
  /* 26 */ "Brufen 400 Abbott Ibuprofen 400mg tablet 1mg pharmeasy",
  /* 27 */ "Salonpas Pain Relief Patch box of 5 1mg pharmeasy",
  /* 28 */ "Omnigel Pain Relief Ointment 30g Cipla 1mg pharmeasy",
  /* 29 */ "Pee Safe Period Cramp Relief Patch 3s 1mg pharmeasy",
  /* 30 */ "Dr Scholls foot relief cream 50g 1mg pharmeasy",

  /* 31 */ "Dabur Honitus Herbal Cough Syrup 100ml 1mg pharmeasy",
  /* 32 */ "Strepsils Menthol Lozenges pack of 20 1mg pharmeasy",
  /* 33 */ "Otrivin Saline Nasal Spray 50ml 1mg pharmeasy",
  /* 34 */ "Cheston Cold Tablet Cipla strip of 10 1mg pharmeasy",
  /* 35 */ "Betadine 2% Mint Gargle 100ml Win Medicare 1mg pharmeasy",
  /* 36 */ "Vicks VapoRub 50g Jar 1mg pharmeasy",
  /* 37 */ "Himalaya Koflet Lozenges cough drops 25s 1mg pharmeasy",
  /* 38 */ "Vicks Inhaler Stick sinus relief 1mg pharmeasy",
  /* 39 */ "Karvol Plus Inhalant Capsules 10s 1mg pharmeasy",
  /* 40 */ "Solvin Cold Syrup 60ml Ipca 1mg pharmeasy",

  /* 41 */ "Accu-Chek Active Blood Glucose Monitor Kit 1mg pharmeasy",
  /* 42 */ "OneTouch Select Plus Test Strips 50s 1mg pharmeasy",
  /* 43 */ "Dr Morepen Lancets 100s box 1mg pharmeasy",
  /* 44 */ "Dr Foot Diabetic Socks pair 1mg pharmeasy",
  /* 45 */ "Nestle Resource Diabetic Protein Powder 400g 1mg pharmeasy",
  /* 46 */ "Footcare Pharma Diabetes foot care cream 100g 1mg pharmeasy",
  /* 47 */ "Baidyanath Madhumehari Ayurvedic Glucose Support 60s 1mg pharmeasy",
  /* 48 */ "BD Micro-Fine Ultra Pen Needles 4mm 100s 1mg pharmeasy",
  /* 49 */ "Sugar Free Natura Pellets 100s dispenser 1mg pharmeasy",
  /* 50 */ "Dabur Glucose-D Energy Powder 200g 1mg pharmeasy",

  /* 51 */ "Cetaphil Gentle Skin Cleanser Face Wash 150ml 1mg pharmeasy",
  /* 52 */ "Dove Deeply Nourishing Body Wash 250ml 1mg pharmeasy",
  /* 53 */ "Dettol Liquid Handwash Pump 500ml 1mg pharmeasy",
  /* 54 */ "Nivea Body Lotion 200ml bottle 1mg pharmeasy",
  /* 55 */ "Head & Shoulders Anti-Dandruff Shampoo 250ml 1mg pharmeasy",
  /* 56 */ "Tresemme Keratin Smooth Hair Conditioner 200ml 1mg pharmeasy",
  /* 57 */ "Neutrogena Ultra Sheer Dry-Touch Sunblock SPF 50+ 100ml 1mg pharmeasy",
  /* 58 */ "Sebamed Lip Defense Lip Balm 10g tube 1mg pharmeasy",
  /* 59 */ "Vaseline Intensive Care Body Lotion 400ml 1mg pharmeasy",
  /* 60 */ "UrbanBotanics Pure Aloe Vera Gel 150g jar 1mg pharmeasy",

  /* 61 */ "Band-Aid Waterproof Bandages Johnson & Johnson 100s 1mg pharmeasy",
  /* 62 */ "Dyna Gauze Sterile Gauze Swabs 10x10cm 10s 1mg pharmeasy",
  /* 63 */ "Savlon Antiseptic Liquid 250ml bottle 1mg pharmeasy",
  /* 64 */ "3M Micropore Surgical Tape 1 inch roll 1mg pharmeasy",
  /* 65 */ "Absorbent Cotton Wool Roll 100g 1mg pharmeasy",
  /* 66 */ "Emergency Home First Aid Kit Box 50 piece 1mg pharmeasy",
  /* 67 */ "Cipladine Ointment 30g Cipla antiseptic 1mg pharmeasy",
  /* 68 */ "Hansaplast Cotton Crepe Bandage 4 Inch roll 1mg pharmeasy",
  /* 69 */ "Omron Digital Thermometer MC-246 1mg pharmeasy",
  /* 70 */ "Burnol Cream 20g Morepen burn relief 1mg pharmeasy",

  /* 71 */ "Johnson's Baby Shampoo 200ml 1mg pharmeasy",
  /* 72 */ "Himalaya Baby Lotion 200ml 1mg pharmeasy",
  /* 73 */ "Sebamed Baby Wash Extra Soft 250ml 1mg pharmeasy",
  /* 74 */ "Pampers Baby Wipes Aloe Vera 80s 1mg pharmeasy",
  /* 75 */ "Desitin Diaper Rash Cream 50g tube 1mg pharmeasy",
  /* 76 */ "Mamaearth Daily Moisturizing Baby Lotion 100g 1mg pharmeasy",
  /* 77 */ "Mee Mee Baby Powder 200g bottle 1mg pharmeasy",
  /* 78 */ "Dabur Lal Tail 200ml bottle baby massage oil 1mg pharmeasy",
  /* 79 */ "Chicco Baby Moments Soap Bar 100g 1mg pharmeasy",
  /* 80 */ "Bonjela Teething Gel 15g tube 1mg pharmeasy"
];

const products = require('../server/seed/medicinesData.json');
const candidatesDir = path.join(__dirname, 'candidates');

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

async function processProduct(index) {
  const p = products[index];
  const query = brandQueries[index];
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
      brandQuery: query,
      downloadedCandidates: []
    };

    let downloadedCount = 0;
    for (let i = 0; i < Math.min(5, legitimateUrls.length); i++) {
      const url = legitimateUrls[i];
      try {
        const buf = await fetchUrlBuffer(url);
        if (buf.length < 3000) continue;
        
        let ext = '.jpg';
        if (url.endsWith('.png')) ext = '.png';
        if (url.endsWith('.webp')) ext = '.webp';

        const filename = `brand_candidate_${i + 1}${ext}`;
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
        // ignore individual download failure
      }
    }

    fs.writeFileSync(path.join(productDir, 'meta.json'), JSON.stringify(meta, null, 2));
    console.log(`[${index + 1}/80] Saved brand query "${p.name}": ${downloadedCount} candidate images.`);
  } catch (err) {
    console.error(`[${index + 1}/80] Error: ${err.message}`);
  }
}

async function runInBatches() {
  const BATCH_SIZE = 5;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = Array.from({ length: Math.min(BATCH_SIZE, products.length - i) }, (_, idx) => i + idx);
    await Promise.all(batch.map(idx => processProduct(idx)));
  }
  console.log('✅ ALL EXACT BRAND CANDIDATES FETCHED.');
}

runInBatches();
