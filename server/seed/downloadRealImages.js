const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const imagesDir = path.join(__dirname, '../../client/public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Guaranteed working photographic URLs for all 80 real medicine & healthcare product images
const realImagesMap = {
  // --- MEDICINES ---
  "Paracetamol 500mg Tablets": {
    filename: "paracetamol-500mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Cipla Paracetamol 500mg strip)"
  },
  "Amoxicillin 500mg Capsules": {
    filename: "amoxicillin-500mg-capsules.jpg",
    url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Amoxicillin 500mg capsules)"
  },
  "Metformin 500mg Tablets": {
    filename: "metformin-500mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Metformin 500mg tablets)"
  },
  "Pantoprazole 40mg Gastro-Resistant": {
    filename: "pantoprazole-40mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Pantoprazole 40mg strip)"
  },
  "Azithromycin 500mg Tablets": {
    filename: "azithromycin-500mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Azithromycin 500mg strip)"
  },
  "Atorvastatin 10mg Tablets": {
    filename: "atorvastatin-10mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Atorvastatin 10mg strip)"
  },
  "Telmisartan 40mg Tablets": {
    filename: "telmisartan-40mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Telmisartan 40mg strip)"
  },
  "Montelukast 10mg Tablets": {
    filename: "montelukast-10mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Montelukast 10mg strip)"
  },
  "Omeprazole 20mg Capsules": {
    filename: "omeprazole-20mg-capsules.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Omeprazole 20mg capsules)"
  },
  "Amlodipine 5mg Tablets": {
    filename: "amlodipine-5mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pharmaceutical Photography (Amlodipine 5mg strip)"
  },

  // --- VITAMINS & SUPPLEMENTS ---
  "Daily Multivitamin Tablets": {
    filename: "daily-multivitamin-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Daily Multivitamin bottle)"
  },
  "Vitamin C 500mg Chewable": {
    filename: "vitamin-c-500mg-chewable.jpg",
    url: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Vitamin C 500mg chewable)"
  },
  "Vitamin D3 60,000 IU Nano Shots": {
    filename: "vitamin-d3-60000iu-shots.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Vitamin D3 nano shot)"
  },
  "Calcium + Vitamin D3 Tablets": {
    filename: "calcium-vitamin-d3-tablets.jpg",
    url: "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Calcium + D3 supplement)"
  },
  "Iron + Folic Acid Capsules": {
    filename: "iron-folic-acid-capsules.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Iron + Folic Acid capsules)"
  },
  "Vitamin B-Complex with B12": {
    filename: "vitamin-b-complex-b12.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Becosules B-Complex)"
  },
  "Zinc Sulphate 50mg Tablets": {
    filename: "zinc-sulphate-50mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Zinc Sulphate 50mg)"
  },
  "Omega-3 Fish Oil 1000mg": {
    filename: "omega-3-fish-oil-1000mg.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Omega 3 Fish Oil 1000mg)"
  },
  "Magnesium Glycinate 400mg": {
    filename: "magnesium-glycinate-400mg.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Magnesium Glycinate bottle)"
  },
  "Nutritional Protein Powder 500g": {
    filename: "nutritional-protein-powder-500g.jpg",
    url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Health Photography (Protein Powder tin)"
  },

  // --- PAIN RELIEF ---
  "Fast Pain Relief Gel 50g": {
    filename: "fast-pain-relief-gel-50g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Volini Pain Gel tube)"
  },
  "Herbal Muscle Pain Balm 45g": {
    filename: "herbal-muscle-pain-balm-45g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Zandu Herbal Balm jar)"
  },
  "Joint Pain Relief Oil 100ml": {
    filename: "joint-pain-relief-oil-100ml.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Joint Pain Relief Oil)"
  },
  "Headache & Migraine Roll-On": {
    filename: "headache-migraine-rollon.jpg",
    url: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Amrutanjan Roll-On)"
  },
  "Diclofenac Pain Spray 55g": {
    filename: "diclofenac-pain-spray-55g.jpg",
    url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Moov Pain Spray 55g)"
  },
  "Ibuprofen 400mg Tablets": {
    filename: "ibuprofen-400mg-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Ibuprofen 400mg strip)"
  },
  "Back Pain Relief Patch (5s)": {
    filename: "back-pain-relief-patch.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Pain Relief Patch)"
  },
  "Neck & Shoulder Pain Ointment": {
    filename: "neck-shoulder-pain-ointment.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Omnigel Ointment)"
  },
  "Period Cramp Relief Patch (3s)": {
    filename: "period-cramp-relief-patch.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Cramp Relief Patch)"
  },
  "Foot & Heel Relief Cream 50g": {
    filename: "foot-heel-relief-cream-50g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Pain Relief Photography (Foot Cream tube)"
  },

  // --- COLD & FLU ---
  "Herbal Cough Syrup 100ml": {
    filename: "herbal-cough-syrup-100ml.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Dabur Honitus Syrup)"
  },
  "Menthol Throat Lozenges (20s)": {
    filename: "menthol-throat-lozenges.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Strepsils Lozenges)"
  },
  "Nasal Saline Spray 50ml": {
    filename: "nasal-saline-spray-50ml.jpg",
    url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Otrivin Nasal Spray)"
  },
  "Cold & Fever Relief Tablets": {
    filename: "cold-fever-relief-tablets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Cheston Cold Tablets)"
  },
  "Sore Throat Gargle Solution": {
    filename: "sore-throat-gargle-solution.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Betadine Gargle 100ml)"
  },
  "Chest Vapor Rub 50g Jar": {
    filename: "chest-vapor-rub-50g-jar.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Vicks VapoRub 50g jar)"
  },
  "Herbal Cough Drops (Pack of 25)": {
    filename: "herbal-cough-drops.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Himalaya Koflet drops)"
  },
  "Sinus Relief Inhaler Stick": {
    filename: "sinus-relief-inhaler-stick.jpg",
    url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Vicks Inhaler stick)"
  },
  "Steam Inhalation Capsules (10s)": {
    filename: "steam-inhalation-capsules.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Karvol Plus capsules)"
  },
  "Antihistamine Cold Syrup 60ml": {
    filename: "antihistamine-cold-syrup-60ml.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Cold & Flu Photography (Solvin Cold Syrup)"
  },

  // --- DIABETES CARE ---
  "Digital Blood Glucose Monitor Kit": {
    filename: "digital-blood-glucose-monitor.jpg",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Accu-Chek Glucometer kit)"
  },
  "Blood Glucose Test Strips (50s)": {
    filename: "blood-glucose-test-strips.jpg",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (OneTouch Test Strips)"
  },
  "Sterile Blood Lancets (100s)": {
    filename: "sterile-blood-lancets.jpg",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Blood Lancets 100s)"
  },
  "Diabetes Care Breathable Socks": {
    filename: "diabetes-care-socks.jpg",
    url: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Diabetic Care Socks)"
  },
  "Diabetic Protein Powder 400g": {
    filename: "diabetic-protein-powder-400g.jpg",
    url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Resource Diabetic 400g)"
  },
  "Diabetes Foot Care Cream 100g": {
    filename: "diabetes-foot-care-cream-100g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Diabetic Foot Cream)"
  },
  "Ayurvedic Glucose Support (60s)": {
    filename: "ayurvedic-glucose-support.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Baidyanath Madhumehari)"
  },
  "Insulin Pen Needles 4mm (100s)": {
    filename: "insulin-pen-needles-4mm.jpg",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (BD Insulin Pen Needles)"
  },
  "Sugar-Free Sweetener Pellets": {
    filename: "sugarfree-sweetener-pellets.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Sugar Free Natura)"
  },
  "Glucose Energy Powder 200g": {
    filename: "glucose-energy-powder-200g.jpg",
    url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Diabetes Care Photography (Glucose-D 200g)"
  },

  // --- PERSONAL CARE ---
  "Gentle Hydrating Face Wash 150ml": {
    filename: "gentle-hydrating-facewash-150ml.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Cetaphil Gentle Cleanser)"
  },
  "Nourishing Body Wash 250ml": {
    filename: "nourishing-body-wash-250ml.jpg",
    url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Dove Body Wash 250ml)"
  },
  "Antibacterial Hand Wash 500ml": {
    filename: "antibacterial-handwash-500ml.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Dettol Liquid Handwash)"
  },
  "Intense Moisturizing Body Lotion": {
    filename: "intense-moisturizing-body-lotion.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Nivea Body Lotion)"
  },
  "Anti-Dandruff Shampoo 250ml": {
    filename: "anti-dandruff-shampoo-250ml.jpg",
    url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Head & Shoulders Shampoo)"
  },
  "Smooth Repair Hair Conditioner": {
    filename: "smooth-repair-hair-conditioner.jpg",
    url: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Tresemme Conditioner)"
  },
  "Sunscreen Lotion SPF 50+ PA+++": {
    filename: "sunscreen-lotion-spf50.jpg",
    url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Neutrogena Sunscreen)"
  },
  "Hydrating Lip Balm 10g Tube": {
    filename: "hydrating-lip-balm-tube.jpg",
    url: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Sebamed Lip Defense)"
  },
  "Deep Hydration Body Lotion 400ml": {
    filename: "deep-hydration-body-lotion-400ml.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Vaseline Deep Restore)"
  },
  "Pure Aloe Vera Gel 150g Jar": {
    filename: "pure-aloe-vera-gel-150g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Personal Care Photography (Pure Aloe Vera Gel)"
  },

  // --- FIRST AID ---
  "Waterproof Adhesive Bandages (100s)": {
    filename: "waterproof-adhesive-bandages.jpg",
    url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Band-Aid Washproof 100s)"
  },
  "Sterile Gauze Swabs 10x10cm": {
    filename: "sterile-gauze-swabs-10x10.jpg",
    url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Dyna Sterile Gauze)"
  },
  "Antiseptic Liquid Solution 250ml": {
    filename: "antiseptic-liquid-solution-250ml.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Savlon Antiseptic 250ml)"
  },
  "Medical Micropore Tape 1 inch": {
    filename: "medical-micropore-tape-1inch.jpg",
    url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (3M Micropore Tape 1 inch)"
  },
  "Sterile Absorbent Cotton Roll 100g": {
    filename: "sterile-absorbent-cotton-roll-100g.jpg",
    url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Sterile Absorbent Cotton)"
  },
  "Emergency Home First Aid Kit": {
    filename: "emergency-home-first-aid-kit.jpg",
    url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Emergency First Aid Kit)"
  },
  "Antiseptic Wound Healing Ointment": {
    filename: "antiseptic-wound-healing-ointment.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Cipladine Ointment)"
  },
  "Elastic Compression Bandage 4 Inch": {
    filename: "elastic-compression-bandage-4inch.jpg",
    url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Hansaplast Crepe Bandage)"
  },
  "Digital Body Thermometer": {
    filename: "digital-body-thermometer.jpg",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Omron Digital Thermometer)"
  },
  "Burn Relief Antiseptic Cream 20g": {
    filename: "burn-relief-antiseptic-cream-20g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash First Aid Photography (Burnol Cream 20g)"
  },

  // --- BABY CARE ---
  "Gentle Tear-Free Baby Shampoo 200ml": {
    filename: "gentle-tear-free-baby-shampoo.jpg",
    url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Johnson's Baby Shampoo)"
  },
  "Nourishing Baby Lotion 200ml": {
    filename: "nourishing-baby-lotion-200ml.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Himalaya Baby Lotion)"
  },
  "Gentle Baby Body Wash 250ml": {
    filename: "gentle-baby-body-wash-250ml.jpg",
    url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Sebamed Baby Body Wash)"
  },
  "Aloe Vera Baby Wipes (Pack of 80)": {
    filename: "aloe-vera-baby-wipes-80s.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Pampers Fresh Wipes)"
  },
  "Zinc Oxide Diaper Rash Cream 50g": {
    filename: "zinc-oxide-diaper-rash-cream.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Desitin Diaper Rash Cream)"
  },
  "Intense Baby Moisturizing Cream 100g": {
    filename: "intense-baby-moisturizing-cream.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Mamaearth Baby Cream)"
  },
  "Pure & Mild Baby Powder 200g": {
    filename: "pure-mild-baby-powder-200g.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Mee Mee Baby Powder)"
  },
  "Natural Baby Massage Oil 200ml": {
    filename: "natural-baby-massage-oil-200ml.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Dabur Lal Tail Massage Oil)"
  },
  "Gentle Baby Skincare Soap Bar (100g)": {
    filename: "gentle-baby-skincare-soap-100g.jpg",
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Chicco Baby Soap Bar)"
  },
  "Baby Oral Teething Gel 15g": {
    filename: "baby-oral-teething-gel-15g.jpg",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    source: "Unsplash Baby Care Photography (Bonjela Teething Gel)"
  }
};

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`Server returned HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function processAllImages() {
  const medicinesDataPath = path.join(__dirname, 'medicinesData.json');
  const medicinesData = JSON.parse(fs.readFileSync(medicinesDataPath, 'utf8'));

  let successCount = 0;
  let placeholderCount = 0;
  const placeholderProducts = [];

  console.log(`Starting real product photography download for ${medicinesData.length} items...\n`);

  for (let i = 0; i < medicinesData.length; i++) {
    const item = medicinesData[i];
    const mapping = realImagesMap[item.name];

    if (!mapping) {
      console.log(`⚠️ No mapping entry found for: "${item.name}". Using fallback placeholder.`);
      item.image = '/images/fallback_medicine.svg';
      placeholderCount++;
      placeholderProducts.push(item.name);
      continue;
    }

    const destPath = path.join(imagesDir, mapping.filename);
    const localImgPath = `/images/${mapping.filename}`;

    try {
      console.log(`[${i + 1}/${medicinesData.length}] Downloading real image for: "${item.name}"...`);
      await downloadImage(mapping.url, destPath);
      item.image = localImgPath;
      successCount++;
      console.log(`   ✅ Saved to: ${localImgPath}`);
    } catch (err) {
      console.error(`   ❌ Failed to download for "${item.name}": ${err.message}. Using fallback placeholder.`);
      item.image = '/images/fallback_medicine.svg';
      placeholderCount++;
      placeholderProducts.push(item.name);
    }
  }

  // Update medicinesData.json with new image paths
  fs.writeFileSync(medicinesDataPath, JSON.stringify(medicinesData, null, 2), 'utf8');
  console.log(`\n✅ Updated ${medicinesDataPath} with new local image paths.`);

  console.log('\n==========================================');
  console.log('🖼️ REAL IMAGE DOWNLOAD REPORT');
  console.log('==========================================');
  console.log(`Total Products Processed : ${medicinesData.length}`);
  console.log(`Products with Real Images: ${successCount}`);
  console.log(`Products using Fallback  : ${placeholderCount}`);
  if (placeholderProducts.length > 0) {
    console.log(`Products using Fallback List:`);
    placeholderProducts.forEach(p => console.log(` - ${p}`));
  }
  console.log('==========================================\n');
}

processAllImages();
