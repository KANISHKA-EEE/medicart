const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public/images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const medicinesData = require('../server/seed/medicinesData.json');

// Category accent colors & product types
const categoryStyles = {
  'Medicines': { primary: '#087EA4', secondary: '#E0F2FE', text: '#0369A1', type: 'box' },
  'Vitamins & Supplements': { primary: '#16A34A', secondary: '#DCFCE7', text: '#15803D', type: 'jar' },
  'Pain Relief': { primary: '#EA580C', secondary: '#FFEDD5', text: '#C2410C', type: 'tube' },
  'Cold & Flu': { primary: '#0284C7', secondary: '#E0F2FE', text: '#0369A1', type: 'syrup' },
  'Diabetes Care': { primary: '#7C3AED', secondary: '#F3E8FF', text: '#6D28D9', type: 'device' },
  'Personal Care': { primary: '#DB2777', secondary: '#FCE7F3', text: '#BE185D', type: 'lotion' },
  'First Aid': { primary: '#DC2626', secondary: '#FEE2E2', text: '#B91C1C', type: 'firstaid' },
  'Baby Care': { primary: '#0D9488', secondary: '#CCFBF1', text: '#0F766E', type: 'baby' }
};

function generateSvgForProduct(item, index) {
  const cat = item.category || 'Medicines';
  const style = categoryStyles[cat] || categoryStyles['Medicines'];
  const name = item.name || `Medicine #${index + 1}`;
  const manufacturer = item.manufacturer || 'Kanishka Pharmacy';
  const dosageForm = item.dosageForm || 'Standard Pack';
  const rx = item.prescriptionRequired ? 'PRESCRIPTION REQUIRED' : 'OVER THE COUNTER';

  // Truncate name for SVG text readability
  const shortName = name.length > 26 ? name.substring(0, 24) + '...' : name;

  // Determine packaging graphic type based on dosage form / category
  let type = style.type;
  if (/capsule|tablet|strip/i.test(dosageForm)) type = 'box';
  else if (/syrup|liquid|drop/i.test(dosageForm)) type = 'syrup';
  else if (/cream|ointment|gel|tube/i.test(dosageForm)) type = 'tube';
  else if (/powder|sachet|supplement|vitamin|multivitamin/i.test(name)) type = 'jar';

  let illustrationSvg = '';

  if (type === 'box') {
    // Realistic Medicine Box & Blister Pack
    illustrationSvg = `
      <!-- Medicine Box -->
      <rect x="90" y="60" width="220" height="260" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
      <!-- Top Brand Header Bar -->
      <path d="M90 72 Q90 60 102 60 L298 60 Q310 60 310 72 L310 120 L90 120 Z" fill="${style.primary}"/>
      <text x="200" y="95" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">KANISHKA PHARMACY</text>
      
      <!-- Rx Warning Badge on Box -->
      <rect x="105" y="132" width="190" height="20" rx="4" fill="${style.secondary}"/>
      <text x="200" y="146" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="${style.text}" text-anchor="middle">${rx}</text>
      
      <!-- Product Title on Box -->
      <text x="200" y="180" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#1F2937" text-anchor="middle">${shortName}</text>
      <text x="200" y="200" font-family="Arial, sans-serif" font-weight="600" font-size="11" fill="#64748B" text-anchor="middle">${dosageForm}</text>
      
      <!-- Blister Strip / Pill Graphic -->
      <rect x="120" y="220" width="160" height="75" rx="8" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2"/>
      <circle cx="150" cy="245" r="14" fill="${style.primary}" opacity="0.9"/>
      <circle cx="200" cy="245" r="14" fill="${style.primary}" opacity="0.9"/>
      <circle cx="250" cy="245" r="14" fill="${style.primary}" opacity="0.9"/>
      <circle cx="150" cy="275" r="14" fill="${style.primary}" opacity="0.9"/>
      <circle cx="200" cy="275" r="14" fill="${style.primary}" opacity="0.9"/>
      <circle cx="250" cy="275" r="14" fill="${style.primary}" opacity="0.9"/>
      
      <!-- Manufacturer Footer -->
      <text x="200" y="308" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">${manufacturer}</text>
    `;
  } else if (type === 'syrup' || type === 'lotion') {
    // Realistic Medicine Bottle / Syrup
    illustrationSvg = `
      <!-- Bottle Cap -->
      <rect x="160" y="45" width="80" height="35" rx="6" fill="${style.primary}"/>
      <rect x="155" y="75" width="90" height="15" rx="3" fill="#E2E8F0"/>
      
      <!-- Bottle Body -->
      <path d="M140 100 Q140 90 155 90 L245 90 Q260 90 260 100 L270 310 Q270 330 250 330 L150 330 Q130 330 130 310 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
      
      <!-- Liquid Level Graduation Line -->
      <rect x="135" y="160" width="130" height="160" rx="8" fill="${style.secondary}" opacity="0.6"/>
      
      <!-- Bottle Label -->
      <rect x="145" y="130" width="110" height="150" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="145" y="130" width="110" height="30" rx="0" fill="${style.primary}"/>
      <text x="200" y="150" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#FFFFFF" text-anchor="middle">KANISHKA CARE</text>
      
      <text x="200" y="185" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#1F2937" text-anchor="middle">${shortName}</text>
      <text x="200" y="205" font-family="Arial, sans-serif" font-size="10" fill="#64748B" text-anchor="middle">${dosageForm}</text>
      
      <rect x="155" y="225" width="90" height="18" rx="4" fill="${style.secondary}"/>
      <text x="200" y="237" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="${style.text}" text-anchor="middle">${rx}</text>
      
      <text x="200" y="265" font-family="Arial, sans-serif" font-size="9" fill="#94A3B8" text-anchor="middle">Net Vol: 100ml / 200ml</text>
    `;
  } else if (type === 'tube') {
    // Medicated Ointment / Cream Tube
    illustrationSvg = `
      <!-- Tube Cap -->
      <polygon points="175,50 225,50 215,85 185,85" fill="${style.primary}"/>
      
      <!-- Tube Body -->
      <path d="M185 85 L215 85 L260 290 Q265 310 240 310 L160 310 Q135 310 140 290 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
      
      <!-- Tube Label -->
      <path d="M165 140 L235 140 L248 260 L152 260 Z" fill="${style.secondary}" stroke="${style.primary}" stroke-width="1.5"/>
      <text x="200" y="170" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="${style.text}" text-anchor="middle">MEDICATED OINTMENT</text>
      <text x="200" y="195" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#1F2937" text-anchor="middle">${shortName}</text>
      <text x="200" y="215" font-family="Arial, sans-serif" font-size="10" fill="#64748B" text-anchor="middle">${dosageForm}</text>
      <text x="200" y="240" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="${style.primary}" text-anchor="middle">Fast Relief Formula</text>
      
      <!-- Crimped End Seal -->
      <line x1="150" y1="305" x2="250" y2="305" stroke="#94A3B8" stroke-width="6" stroke-dasharray="4,4"/>
    `;
  } else if (type === 'jar') {
    // Vitamin Jar / Supplement Container
    illustrationSvg = `
      <!-- Screw Lid -->
      <rect x="140" y="45" width="120" height="40" rx="8" fill="#1F2937"/>
      <line x1="140" y1="65" x2="260" y2="65" stroke="#475569" stroke-width="2"/>
      
      <!-- Jar Body -->
      <rect x="130" y="85" width="140" height="230" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
      
      <!-- Premium Seal / Gold Trim -->
      <rect x="130" y="105" width="140" height="15" fill="${style.primary}"/>
      
      <!-- Jar Label -->
      <rect x="135" y="130" width="130" height="160" rx="8" fill="${style.secondary}"/>
      <text x="200" y="155" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="${style.text}" text-anchor="middle">VITAMINS & CARE</text>
      
      <text x="200" y="190" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#1F2937" text-anchor="middle">${shortName}</text>
      <text x="200" y="210" font-family="Arial, sans-serif" font-weight="600" font-size="10" fill="#64748B" text-anchor="middle">${dosageForm}</text>
      
      <!-- Checkmark Graphic -->
      <circle cx="200" cy="245" r="16" fill="${style.primary}"/>
      <path d="M192 245 L198 251 L209 238" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="200" y="278" font-family="Arial, sans-serif" font-size="9" fill="#475569" text-anchor="middle">100% Quality Guaranteed</text>
    `;
  } else if (type === 'device' || type === 'firstaid') {
    // Medical Device / First Aid Kit Box
    illustrationSvg = `
      <!-- Device Outer Frame -->
      <rect x="100" y="60" width="200" height="260" rx="20" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
      
      <!-- Top Red Cross / Device Emblem -->
      <rect x="175" y="80" width="50" height="50" rx="10" fill="${style.primary}"/>
      <path d="M200 90 L200 120 M185 105 L215 105" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Device Screen / Banner -->
      <rect x="120" y="145" width="160" height="70" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
      <text x="200" y="175" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#1F2937" text-anchor="middle">${shortName}</text>
      <text x="200" y="198" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="${style.primary}" text-anchor="middle">${dosageForm}</text>
      
      <!-- Control Buttons -->
      <circle cx="150" cy="255" r="14" fill="#E2E8F0"/>
      <circle cx="200" cy="255" r="18" fill="${style.primary}"/>
      <circle cx="250" cy="255" r="14" fill="#E2E8F0"/>
      
      <text x="200" y="300" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Certified Medical Device</text>
    `;
  } else {
    // Baby Care / Gentle Product Bottle
    illustrationSvg = `
      <!-- Bottle Top -->
      <ellipse cx="200" cy="65" rx="35" ry="15" fill="${style.primary}"/>
      <rect x="175" y="65" width="50" height="30" fill="${style.primary}"/>
      
      <!-- Main Container Body -->
      <rect x="130" y="95" width="140" height="220" rx="28" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))"/>
      
      <!-- Gentle Soft Wave Pattern -->
      <path d="M130 180 Q200 160 270 180 L270 290 Q270 315 245 315 L155 315 Q130 315 130 290 Z" fill="${style.secondary}"/>
      
      <!-- Soft Label -->
      <text x="200" y="140" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="${style.primary}" text-anchor="middle">GENTLE BABY CARE</text>
      <text x="200" y="210" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#1F2937" text-anchor="middle">${shortName}</text>
      <text x="200" y="235" font-family="Arial, sans-serif" font-weight="600" font-size="11" fill="#64748B" text-anchor="middle">${dosageForm}</text>
      <text x="200" y="265" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="${style.text}" text-anchor="middle">Dermatologist Tested • Hypoallergenic</text>
    `;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380" width="100%" height="100%">
    <!-- Professional Clean Light Pharmacy Backdrop -->
    <rect width="400" height="380" fill="#F8FAFC" rx="12"/>
    <circle cx="200" cy="190" r="150" fill="#FFFFFF" opacity="0.8"/>
    
    ${illustrationSvg}
  </svg>`;

  return svgContent;
}

console.log('Generating 80 realistic pharmacy product SVG image assets...');

medicinesData.forEach((item, index) => {
  const fileName = `med_${index + 1}.svg`;
  const filePath = path.join(outputDir, fileName);
  const svg = generateSvgForProduct(item, index);
  fs.writeFileSync(filePath, svg);
});

// Also create fallback medicine image
const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380" width="100%" height="100%">
  <rect width="400" height="380" fill="#F8FAFC" rx="12"/>
  <rect x="100" y="60" width="200" height="260" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3"/>
  <path d="M100 76 Q100 60 116 60 L284 60 Q300 60 300 76 L300 120 L100 120 Z" fill="#087EA4"/>
  <text x="200" y="98" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#FFFFFF" text-anchor="middle">KANISHKA PHARMACY</text>
  <circle cx="200" cy="200" r="35" fill="#E0F2FE"/>
  <text x="200" y="210" font-family="Arial, sans-serif" font-weight="bold" font-size="30" fill="#087EA4" text-anchor="middle">💊</text>
  <text x="200" y="270" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#1F2937" text-anchor="middle">Genuine Medicine</text>
  <text x="200" y="295" font-family="Arial, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">Verified Quality Guarantee</text>
</svg>`;

fs.writeFileSync(path.join(outputDir, 'fallback_medicine.svg'), fallbackSvg);

console.log('✅ Successfully generated 80 product images + fallback_medicine.svg in client/public/images/');
