const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const { validatePrescriptionContent } = require('./prescriptionValidator');

/**
 * Extracts prescription fields from raw OCR text cleanly using regex patterns.
 * Never invents or guesses missing information. Returns "Not detected" if missing.
 */
function parsePrescriptionFields(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      hospitalName: 'Not detected',
      doctorName: 'Not detected',
      doctorRegistrationNumber: 'Not detected',
      patientName: 'Not detected',
      prescriptionDate: 'Not detected',
      medicines: []
    };
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let hospitalName = 'Not detected';
  let doctorName = 'Not detected';
  let doctorRegistrationNumber = 'Not detected';
  let patientName = 'Not detected';
  let prescriptionDate = 'Not detected';
  const medicines = [];

  // Hospital / Clinic Regex Match
  const hospitalRegex = /(?:hospital|clinic|medical center|health care|healthcare|nursing home|dispensary)\b/i;
  for (const line of lines) {
    if (hospitalRegex.test(line)) {
      hospitalName = line.replace(/^(hospital|clinic|center|name)\s*[:\-]\s*/i, '').trim();
      break;
    }
  }

  // Doctor Name Regex Match
  const docRegex = /(?:dr\.?|doctor)\s+([a-z\.\s]+)/i;
  const docLineRegex = /(?:doctor|physician)\s*[:\-]\s*([a-z\.\s]+)/i;
  for (const line of lines) {
    const match = line.match(docRegex) || line.match(docLineRegex);
    if (match && match[1]) {
      doctorName = 'Dr. ' + match[1].replace(/^dr\.?\s*/i, '').trim();
      break;
    }
  }

  // Doctor Registration Number Match
  const regRegex = /(?:reg|registration|lic|license)\s*(?:no|num|#)?\s*[:\.]?\s*([a-z0-9\/\-]+)/i;
  for (const line of lines) {
    const match = line.match(regRegex);
    if (match && match[1]) {
      doctorRegistrationNumber = match[1].trim();
      break;
    }
  }

  // Patient Name Match
  const patientRegex = /(?:patient|patient name|pt|name)\s*[:\-]\s*([a-z\.\s]+)/i;
  for (const line of lines) {
    const match = line.match(patientRegex);
    if (match && match[1] && !docRegex.test(line)) {
      patientName = match[1].trim();
      break;
    }
  }

  // Date Match
  const dateRegex = /(?:date)\s*[:\-]\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\w+\s+\d{1,2},\s*\d{4})/i;
  const standaloneDateRegex = /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex) || line.match(standaloneDateRegex);
    if (match && match[1]) {
      prescriptionDate = match[1].trim();
      break;
    }
  }

  // Parse Medicine items (Lines with strength like 500mg, 40mg, 10mg, or Rx prefix)
  const strengthRegex = /(\b\d+\s*(?:mg|g|mcg|ml|iu)\b)/i;
  const dosageRegex = /(1\s*tablet|2\s*tablets|once\s*daily|twice\s*daily|b\.i\.d|t\.i\.d|q\.d|after\s*food|before\s*food|every\s*\d+\s*hours)/i;

  for (const line of lines) {
    if (strengthRegex.test(line) || /^rx\b/i.test(line) || /tablet|capsule|syrup|injection/i.test(line)) {
      const strengthMatch = line.match(strengthRegex);
      const dosageMatch = line.match(dosageRegex);

      // Clean medicine name
      let medName = line
        .replace(/^rx[:\.]?\s*/i, '')
        .replace(strengthRegex, '')
        .replace(dosageRegex, '')
        .replace(/qty\s*[:\-]?\s*\d+/i, '')
        .replace(/[\-:\s]+/g, ' ')
        .trim();

      if (medName.length > 2) {
        medicines.push({
          name: medName,
          strength: strengthMatch ? strengthMatch[1] : 'Not specified',
          dosage: dosageMatch ? dosageMatch[1] : 'As directed by physician',
          quantity: line.match(/qty\s*[:\-]?\s*(\d+)/i)?.[1] || 'Standard Pack'
        });
      }
    }
  }

  return {
    hospitalName,
    doctorName,
    doctorRegistrationNumber,
    patientName,
    prescriptionDate,
    medicines
  };
}

/**
 * Main OCR Extraction Function for Prescription Files (Images & PDFs)
 */
async function processPrescriptionOcr(filePath, mimetype) {
  let rawText = '';
  let confidence = 'Not available';

  try {
    if (!fs.existsSync(filePath)) {
      const emptyPayload = {
        hospitalName: 'Not detected',
        doctorName: 'Not detected',
        doctorRegistrationNumber: 'Not detected',
        patientName: 'Not detected',
        prescriptionDate: 'Not detected',
        medicines: [],
        rawText: 'File not found on disk',
        confidence: 'Not available',
        extractedAt: new Date()
      };
      emptyPayload.validation = validatePrescriptionContent(emptyPayload, []);
      return emptyPayload;
    }

    const isPdf = mimetype === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // PDF Processing using pdf-parse (supports both v1 function export and v2 PDFParse class export)
      const dataBuffer = fs.readFileSync(filePath);
      let pdfText = '';
      try {
        if (typeof pdfParse === 'function') {
          const pdfData = await pdfParse(dataBuffer);
          pdfText = pdfData?.text || '';
        } else if (pdfParse && pdfParse.PDFParse) {
          const parser = new pdfParse.PDFParse({ data: dataBuffer });
          const pdfData = await parser.getText();
          pdfText = pdfData?.text || '';
          if (typeof parser.destroy === 'function') {
            try { await parser.destroy(); } catch (_) {}
          }
        } else if (pdfParse && pdfParse.default && typeof pdfParse.default === 'function') {
          const pdfData = await pdfParse.default(dataBuffer);
          pdfText = pdfData?.text || '';
        }
      } catch (pdfErr) {
        console.warn('PDF Parse Warning:', pdfErr.message);
      }

      if (pdfText && pdfText.trim().length > 10) {
        rawText = pdfText.trim();
        confidence = 'PDF Text Extracted';
      } else {
        rawText = 'Unable to extract text automatically';
        confidence = 'Not available';
      }
    } else {
      // Image Processing using Tesseract.js
      try {
        const result = await Tesseract.recognize(filePath, 'eng', {
          logger: () => {} // Silent logging
        });

        if (result && result.data) {
          rawText = result.data.text || '';
          if (typeof result.data.confidence === 'number' && !isNaN(result.data.confidence)) {
            confidence = `${Math.round(result.data.confidence)}%`;
          } else {
            confidence = 'High (Local OCR)';
          }
        }
      } catch (imgErr) {
        console.warn('Tesseract OCR Image Read Warning:', imgErr.message);
        rawText = 'Unable to extract text automatically';
        confidence = 'Not available';
      }
    }

    // Parse extracted text fields
    const parsedFields = parsePrescriptionFields(rawText);

    // Fetch catalog medicine names if connected to DB
    let catalogMedicineNames = [];
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const meds = await Medicine.find({}, 'name').lean();
        catalogMedicineNames = meds.map(m => m.name);
      }
    } catch (dbErr) {
      // Non-blocking catalog fetch fallback
    }

    const ocrPayload = {
      hospitalName: parsedFields.hospitalName,
      doctorName: parsedFields.doctorName,
      doctorRegistrationNumber: parsedFields.doctorRegistrationNumber,
      patientName: parsedFields.patientName,
      prescriptionDate: parsedFields.prescriptionDate,
      medicines: parsedFields.medicines,
      rawText: rawText || 'Unable to extract text automatically',
      confidence: confidence || 'Not available',
      extractedAt: new Date()
    };

    // Run strict technical prescription validation
    const validation = validatePrescriptionContent(ocrPayload, catalogMedicineNames);
    ocrPayload.validation = validation;

    return ocrPayload;

  } catch (error) {
    console.error('OCR Extraction Error:', error.message);
    const fallbackPayload = {
      hospitalName: 'Not detected',
      doctorName: 'Not detected',
      doctorRegistrationNumber: 'Not detected',
      patientName: 'Not detected',
      prescriptionDate: 'Not detected',
      medicines: [],
      rawText: 'Unable to extract text automatically',
      confidence: 'Not available',
      extractedAt: new Date()
    };
    fallbackPayload.validation = validatePrescriptionContent(fallbackPayload, []);
    return fallbackPayload;
  }
}

module.exports = {
  processPrescriptionOcr,
  parsePrescriptionFields
};
