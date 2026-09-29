/**
 * Strict Technical Prescription Validator for Kanishka Pharmacy
 * 
 * Assesses whether an OCR-extracted text/document contains evidence of a medical prescription.
 * Rejects random images, selfies, scenery, medicine box packaging photos, blank images, and unrelated documents.
 * 
 * IMPORTANT SAFETY REQUIREMENT:
 * Automated checks only assess whether the uploaded document appears to be a prescription.
 * They do NOT establish authenticity or medical/legal validity.
 * Final approval requires authorized human review by the pharmacist/admin.
 */

function validatePrescriptionContent(ocrResult, catalogMedicineNames = []) {
  const rawText = ocrResult?.rawText || '';
  const cleanText = rawText.trim();
  const lowerText = cleanText.toLowerCase();

  // 1. Basic File & Text Length Check
  if (!cleanText || cleanText.length < 15 || cleanText === 'Unable to extract text automatically' || cleanText === 'File not found on disk') {
    return {
      isValidPrescription: false,
      score: 0,
      reason: 'Blank, unreadable, or insufficient text detected in image.',
      userMessage: '❌ This file does not appear to be a medical prescription. Please upload a valid prescription issued by a qualified doctor.',
      warnings: ['Document text is empty, unreadable, or contains no detectable characters.'],
      detectedCategories: [],
      disclaimer: 'Automated checks only assess whether the uploaded document appears to be a prescription. They do not establish authenticity or medical/legal validity. Final approval requires authorized human review.'
    };
  }

  // 2. Product Packaging / Box Photo Detection (False-Positive Filter)
  // Medicine packaging photos contain batch number, exp date, mrp, mfg by, storage conditions, etc., but lack doctor headers and patient info.
  const packagingKeywords = [
    'batch no', 'batch', 'b.no', 'exp date', 'expiry', 'exp.', 'mrp', 'inclusive of all taxes',
    'net qty', 'net content', 'marketed by', 'mfg by', 'manufactured by', 'mfg lic',
    'store in a cool', 'keep out of reach of children', 'for external use only', 'schedule h drug',
    'schedule h1 drug', 'schedule g drug', 'composition', 'each film coated tablet', 'each ml contains'
  ];

  let packagingMatches = 0;
  for (const kw of packagingKeywords) {
    if (lowerText.includes(kw)) packagingMatches++;
  }

  // 3. Evidence Category Scoring

  // Category A: Doctor / Practitioner Markers
  const doctorKeywords = [
    'dr.', 'dr ', 'doctor', 'physician', 'surgeon', 'consultant', 'm.d.', 'mbbs', 'md', 'ms',
    'bams', 'bhms', 'reg. no', 'reg no', 'registration', 'license no', 'lic. no', 'practitioner'
  ];
  const hasDoctorName = ocrResult?.doctorName && ocrResult.doctorName !== 'Not detected';
  const hasDoctorReg = ocrResult?.doctorRegistrationNumber && ocrResult.doctorRegistrationNumber !== 'Not detected';
  let doctorScore = 0;
  if (hasDoctorName) doctorScore += 25;
  if (hasDoctorReg) doctorScore += 25;
  for (const kw of doctorKeywords) {
    if (lowerText.includes(kw)) doctorScore += 5;
  }
  doctorScore = Math.min(doctorScore, 40);

  // Category B: Hospital / Clinic / Medical Center Markers
  const facilityKeywords = [
    'hospital', 'clinic', 'medical center', 'healthcare', 'health care', 'nursing home',
    'dispensary', 'polyclinic', 'pharmacy', 'rx', 'prescription', 'superscription', 'diagnostics'
  ];
  const hasHospital = ocrResult?.hospitalName && ocrResult.hospitalName !== 'Not detected';
  let facilityScore = hasHospital ? 25 : 0;
  for (const kw of facilityKeywords) {
    if (lowerText.includes(kw)) facilityScore += 5;
  }
  facilityScore = Math.min(facilityScore, 30);

  // Category C: Patient & Demographics Markers
  const patientKeywords = [
    'patient', 'pt.', 'pt name', 'patient name', 'age:', 'sex:', 'gender:', 'yrs', 'years', 'male', 'female', 'weight', 'bp:'
  ];
  const hasPatient = ocrResult?.patientName && ocrResult.patientName !== 'Not detected';
  let patientScore = hasPatient ? 20 : 0;
  for (const kw of patientKeywords) {
    if (lowerText.includes(kw)) patientScore += 5;
  }
  patientScore = Math.min(patientScore, 20);

  // Category D: Prescription Date
  const hasDate = ocrResult?.prescriptionDate && ocrResult.prescriptionDate !== 'Not detected';
  const dateScore = hasDate ? 15 : (/\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}\b/.test(lowerText) ? 10 : 0);

  // Category E: Medical Dosage / Directions Markers
  const dosageKeywords = [
    'tab', 'tablet', 'tablets', 'cap', 'capsule', 'capsules', 'syp', 'syrup', 'inj', 'injection',
    'mg', 'mcg', 'ml', '1-0-1', '1-0-0', '0-0-1', '1-1-1', 'od', 'bd', 'bid', 'tds', 'tid', 'qid',
    'hs', 'sos', 'stat', 'before food', 'after food', 'daily', 'once daily', 'twice daily',
    'for 5 days', 'for 7 days', 'qty'
  ];
  let dosageScore = 0;
  for (const kw of dosageKeywords) {
    if (lowerText.includes(kw)) dosageScore += 5;
  }
  dosageScore = Math.min(dosageScore, 35);

  // Category F: Prescription Terminology
  const termKeywords = [
    'diagnosis', 'advice', 'adv', 'rx', 'dispense', 'signature', 'refill', 'chief complaint', 'investigation'
  ];
  let termScore = 0;
  for (const kw of termKeywords) {
    if (lowerText.includes(kw)) termScore += 5;
  }
  termScore = Math.min(termScore, 20);

  // Category G: Catalog Medicine Match (Supporting validation only)
  let catalogScore = 0;
  const matchedCatalogMedicines = [];
  if (Array.isArray(catalogMedicineNames) && catalogMedicineNames.length > 0) {
    for (const name of catalogMedicineNames) {
      if (name && name.length > 3 && lowerText.includes(name.toLowerCase())) {
        catalogScore += 15;
        matchedCatalogMedicines.push(name);
      }
    }
  }
  catalogScore = Math.min(catalogScore, 30);

  // Calculate Total Evidence Score
  const totalScore = doctorScore + facilityScore + patientScore + dateScore + dosageScore + termScore + catalogScore;

  // Track detected categories
  const detectedCategories = [];
  if (doctorScore > 0) detectedCategories.push('Doctor/Practitioner Info');
  if (facilityScore > 0) detectedCategories.push('Hospital/Clinic Header');
  if (patientScore > 0) detectedCategories.push('Patient Information');
  if (dateScore > 0) detectedCategories.push('Prescription Date');
  if (dosageScore > 0) detectedCategories.push('Medicines & Dosage Instructions');
  if (termScore > 0) detectedCategories.push('Medical Terminology');
  if (catalogScore > 0) detectedCategories.push('Catalog Medicine Matches');

  // Warnings list for admin review
  const warnings = [];
  if (!hasDoctorName) warnings.push('Doctor name not detected');
  if (!hasDoctorReg) warnings.push('Doctor registration number not detected');
  if (!hasHospital) warnings.push('Hospital/Clinic name not detected');
  if (!hasPatient) warnings.push('Patient name not detected');
  if (!hasDate) warnings.push('Prescription date not detected');
  if (ocrResult?.medicines?.length === 0 && dosageScore === 0) warnings.push('No dosage instructions or medicine items detected');

  // Packaging Photo Override: If packaging markers are high and NO doctor/patient info exists
  if (packagingMatches >= 3 && doctorScore === 0 && patientScore === 0 && !lowerText.includes('rx')) {
    return {
      isValidPrescription: false,
      score: totalScore,
      reason: 'Image appears to be medicine box/packaging photo, not a medical prescription.',
      userMessage: '❌ This file does not appear to be a medical prescription. Please upload a valid prescription issued by a qualified doctor.',
      warnings: ['Detected medicine product packaging photo instead of a prescription document.'],
      detectedCategories,
      disclaimer: 'Automated checks only assess whether the uploaded document appears to be a prescription. They do not establish authenticity or medical/legal validity. Final approval requires authorized human review.'
    };
  }

  // VALIDATION RULE:
  // Must have evidence in at least TWO distinct prescription categories AND total score >= 25
  const distinctCategoriesCount = detectedCategories.length;
  const isValid = distinctCategoriesCount >= 2 && totalScore >= 25;

  if (isValid) {
    return {
      isValidPrescription: true,
      score: totalScore,
      reason: 'Prescription document detected with sufficient evidence.',
      userMessage: '✓ Prescription document detected. Your prescription will be reviewed by our pharmacist/admin before the order is processed.',
      warnings,
      detectedCategories,
      matchedCatalogMedicines,
      disclaimer: 'Automated checks only assess whether the uploaded document appears to be a prescription. They do not establish authenticity or medical/legal validity. Final approval requires authorized human review.'
    };
  } else {
    return {
      isValidPrescription: false,
      score: totalScore,
      reason: 'Insufficient medical prescription evidence found in document.',
      userMessage: '❌ This file does not appear to be a medical prescription. Please upload a valid prescription issued by a qualified doctor.',
      warnings: [...warnings, 'Document lacks essential medical prescription structure and details.'],
      detectedCategories,
      disclaimer: 'Automated checks only assess whether the uploaded document appears to be a prescription. They do not establish authenticity or medical/legal validity. Final approval requires authorized human review.'
    };
  }
}

module.exports = {
  validatePrescriptionContent
};
