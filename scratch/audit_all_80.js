const fs = require('fs');
const path = require('path');

const summary = require('./verification_summary.json');
const products = require('../server/seed/medicinesData.json');
const clientImagesDir = path.join(__dirname, '../client/public/images');

console.log(`Auditing ${summary.verified.length} verified items...`);

let failedAuditCount = 0;
const auditedVerified = [];
const auditedUnverified = [];

summary.verified.forEach(item => {
  const filePath = path.join(clientImagesDir, item.imageFilename);
  const exists = fs.existsSync(filePath);
  const stats = exists ? fs.statSync(filePath) : null;

  // Check if stock photo or suspicious domain
  const srcLower = (item.imageSource || '').toLowerCase();
  const isGenericStock = srcLower.includes('unsplash') || 
                         srcLower.includes('shutterstock') || 
                         srcLower.includes('freepik') || 
                         srcLower.includes('getty') || 
                         srcLower.includes('depositphotos') || 
                         srcLower.includes('dreamstime') || 
                         srcLower.includes('123rf') || 
                         item.imageFilename.endsWith('.svg');

  if (!exists || !stats || stats.size < 5000 || isGenericStock) {
    failedAuditCount++;
    auditedUnverified.push({
      index: item.index,
      name: item.name,
      manufacturer: item.manufacturer,
      strength: item.strength,
      packSize: item.packSize,
      currentImage: '/images/fallback_medicine.svg',
      reason: !exists ? 'Image file missing from client/public/images' :
              stats.size < 5000 ? 'Image file corrupted or too small (<5KB)' :
              'Image source identified as generic stock/SVG photography.'
    });
  } else {
    auditedVerified.push(item);
  }
});

console.log(`Audit complete:`);
console.log(`  Audited Verified   : ${auditedVerified.length}`);
console.log(`  Audited Unverified : ${auditedUnverified.length}`);

// Save final audit report
const finalAudit = {
  verifiedCount: auditedVerified.length,
  unverifiedCount: auditedUnverified.length,
  verified: auditedVerified,
  unverified: auditedUnverified
};

fs.writeFileSync(path.join(__dirname, 'final_verification_report.json'), JSON.stringify(finalAudit, null, 2));
