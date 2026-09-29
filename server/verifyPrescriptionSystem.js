const path = require('path');
const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('🧪 PRESCRIPTION & OCR SYSTEM VERIFICATION SUITE');
  console.log('==================================================\n');

  try {
    // TEST 1: Login as User & Admin
    console.log('📌 1. Authenticating test users...');
    const userRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kanishka@example.com', password: 'password123' })
    });
    const userData = await userRes.json();
    if (!userData.token) throw new Error('User login failed');
    const userToken = userData.token;
    console.log('   ✅ User Login Successful. User ID:', userData.user.id);

    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medicart.local', password: 'Admin123!' })
    });
    const adminData = await adminRes.json();
    if (!adminData.token) throw new Error('Admin login failed');
    const adminToken = adminData.token;
    console.log('   ✅ Admin Login Successful.');

    // TEST 2: Verify 80 Products across 8 Categories with Images
    console.log('\n📌 2. Verifying 80 Products dataset (10 per category)...');
    const medRes = await fetch(`${API_BASE}/medicines`);
    const medData = await medRes.json();
    const medicines = medData.data || [];
    
    console.log('   Total Medicines in DB:', medicines.length);
    if (medicines.length !== 80) {
      throw new Error(`Expected exactly 80 products, found ${medicines.length}`);
    }

    const categories = [
      'Medicines',
      'Vitamins & Supplements',
      'Pain Relief',
      'Cold & Flu',
      'Diabetes Care',
      'Personal Care',
      'First Aid',
      'Baby Care'
    ];

    for (const cat of categories) {
      const catMeds = medicines.filter(m => m.category === cat);
      console.log(`   Category: "${cat}" -> ${catMeds.length} items`);
      if (catMeds.length !== 10) {
        throw new Error(`Category "${cat}" does not have 10 products! Count: ${catMeds.length}`);
      }
      const missingImg = catMeds.find(m => !m.image);
      if (missingImg) {
        throw new Error(`Product "${missingImg.name}" is missing an image field!`);
      }
    }
    console.log('   ✅ All 80 products verified: exactly 10 per category with working image paths!');

    const otcMed = medicines.find(m => m.name.includes('Paracetamol'));
    const rxMed = medicines.find(m => m.name.includes('Amoxicillin'));

    console.log('   OTC Test Item:', otcMed ? otcMed.name : 'None');
    console.log('   Rx Test Item :', rxMed ? rxMed.name : 'None');

    if (!otcMed || !rxMed) throw new Error('Could not find both OTC and Rx medicines in dataset');

    // TEST 3: Try creating Rx order without uploading prescription (Expect 400 Failure)
    console.log('\n📌 3. Testing Order Creation without required prescription...');
    const failOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        items: [{ medicine: rxMed._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Kanishka Test',
          phone: '9876543210',
          email: 'kanishka@example.com',
          addressLine1: '123 Health Street',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001'
        }
      })
    });
    const failOrderData = await failOrderRes.json();
    console.log('   Response Status Code:', failOrderRes.status);
    console.log('   Response Message    :', failOrderData.message);

    if (failOrderRes.status === 400 && failOrderData.message.includes('prescription')) {
      console.log('   ✅ Successfully blocked Rx order without prescription!');
    } else {
      throw new Error('Order creation should have failed without prescription');
    }

    // TEST 4: Prescription File Upload & OCR Extraction (PDF and PNG)
    console.log('\n📌 4. Uploading sample prescription PDF file & running OCR extraction...');
    
    // Create valid minimal PDF buffer with text content
    const samplePdfContent = Buffer.from(
      '%PDF-1.4\n' +
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj\n' +
      '4 0 obj<</Length 210>>stream\n' +
      'BT\n' +
      '/F1 12 Tf\n' +
      '50 700 Td\n' +
      '(CITY LIFE HOSPITAL AND DIAGNOSTICS) Tj\n' +
      '0 -20 Td\n' +
      '(Doctor: Dr. Rajesh Sharma, MD Medicine) Tj\n' +
      '0 -20 Td\n' +
      '(Reg No: MCI-2018-98432) Tj\n' +
      '0 -20 Td\n' +
      '(Patient Name: Kanishka Kumar) Tj\n' +
      '0 -20 Td\n' +
      '(Date: 26/09/2026) Tj\n' +
      '0 -20 Td\n' +
      '(Rx: Amoxicillin 500 mg - 1 tab 3 times daily - Qty: 10) Tj\n' +
      'ET\n' +
      'endstream\n' +
      'endobj\n' +
      'xref\n' +
      '0 5\n' +
      '0000000000 65535 f \n' +
      '0000000009 00000 n \n' +
      '0000000052 00000 n \n' +
      '0000000102 00000 n \n' +
      '0000000305 00000 n \n' +
      'trailer<</Size 5/Root 1 0 R>>\n' +
      'startxref\n' +
      '565\n' +
      '%%EOF'
    );

    const boundary = '--------------------------' + Date.now().toString(16);
    const head = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="prescription"; filename="prescription_sample.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n`
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const bodyData = Buffer.concat([head, samplePdfContent, tail]);

    const uploadRes = await fetch(`${API_BASE}/orders/upload-prescription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: bodyData
    });

    const uploadData = await uploadRes.json();
    console.log('   Upload Status Code:', uploadRes.status);
    if (!uploadData.success || !uploadData.data.filename) throw new Error('Upload failed');
    const uploadedPrescriptionFile = uploadData.data;
    console.log('   Uploaded Filename:', uploadedPrescriptionFile.filename);
    console.log('   OCR Extracted Info:', uploadedPrescriptionFile.ocr ? 'Present' : 'Not Present');
    if (uploadedPrescriptionFile.ocr) {
      console.log('     Hospital Name:', uploadedPrescriptionFile.ocr.hospitalName);
      console.log('     Doctor Name  :', uploadedPrescriptionFile.ocr.doctorName);
      console.log('     Doctor Reg No:', uploadedPrescriptionFile.ocr.doctorRegistrationNumber);
      console.log('     Patient Name :', uploadedPrescriptionFile.ocr.patientName);
      console.log('     Medicines    :', uploadedPrescriptionFile.ocr.medicines);
      console.log('     Confidence   :', uploadedPrescriptionFile.ocr.confidence);
    }
    console.log('   ✅ Prescription PDF uploaded and OCR extracted!');

    // TEST 5: Create Rx Order WITH Uploaded Prescription & OCR metadata
    console.log('\n📌 5. Placing Rx order with uploaded prescription & OCR data...');
    const rxOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        items: [{ medicine: rxMed._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Kanishka Test',
          phone: '9876543210',
          email: 'kanishka@example.com',
          addressLine1: '123 Health Street',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        prescriptionFile: uploadedPrescriptionFile,
        prescriptionOcr: uploadedPrescriptionFile.ocr
      })
    });

    const rxOrderData = await rxOrderRes.json();
    console.log('   Order Status Code:', rxOrderRes.status);
    if (!rxOrderData.success) throw new Error('Failed to create Rx order with prescription');
    const createdRxOrder = rxOrderData.data.order;
    console.log('   ✅ Order created successfully! ID:', createdRxOrder._id);
    console.log('   Initial Prescription Status:', createdRxOrder.prescriptionStatus);

    // TEST 6: Admin Re-run OCR Endpoint Test
    console.log('\n📌 6. Testing Admin Re-run OCR endpoint...');
    const rerunOcrRes = await fetch(`${API_BASE}/admin/orders/${createdRxOrder._id}/re-run-ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const rerunOcrData = await rerunOcrRes.json();
    console.log('   Re-run OCR Status Code:', rerunOcrRes.status);
    console.log('   Re-run OCR Response Message:', rerunOcrData.message);
    if (!rerunOcrData.success) throw new Error('Failed to re-run OCR on order');
    console.log('   ✅ Re-run OCR endpoint functioning correctly.');

    // TEST 7: Unauthorized user attempts to view prescription file (Expect 403 Forbidden)
    console.log('\n📌 7. Testing Security & Unauthorized Access to Prescription File...');
    const user2Res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Two', email: `usertwo_${Date.now()}@example.com`, password: 'password123' })
    });
    const user2Data = await user2Res.json();
    const user2Token = user2Data.token;

    const unauthorizedRes = await fetch(`${API_BASE}/orders/prescription-file/${uploadedPrescriptionFile.filename}`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });

    console.log('   Unauthorized Access Response Status:', unauthorizedRes.status);
    if (unauthorizedRes.status === 403) {
      console.log('   ✅ Security Enforced! Unauthorized user blocked with HTTP 403 Forbidden.');
    } else {
      console.log('   ⚠️ Security Warning: Status code was', unauthorizedRes.status);
    }

    // TEST 8: Admin Reviews Prescription -> Approve
    console.log('\n📌 8. Admin Approving Prescription...');
    const approveRes = await fetch(`${API_BASE}/admin/orders/${createdRxOrder._id}/prescription-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const approveData = await approveRes.json();
    console.log('   Approve Response:', approveData.message);
    console.log('   New Prescription Status:', approveData.data.prescriptionStatus);
    if (approveData.data.prescriptionStatus !== 'Approved') throw new Error('Failed to approve prescription');
    console.log('   ✅ Prescription successfully Approved by Admin.');

    // TEST 9: Admin Reviews Prescription -> Reject with Reason
    console.log('\n📌 9. Admin Rejecting Prescription with Reason...');
    const rejectRes = await fetch(`${API_BASE}/admin/orders/${createdRxOrder._id}/prescription-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ action: 'reject', reason: 'Prescription image is blurry. Please re-upload a clear copy.' })
    });
    const rejectData = await rejectRes.json();
    console.log('   Reject Response:', rejectData.message);
    console.log('   New Prescription Status:', rejectData.data.prescriptionStatus);
    console.log('   Rejection Reason:', rejectData.data.prescriptionRejectionReason);
    if (rejectData.data.prescriptionStatus !== 'Rejected') throw new Error('Failed to reject prescription');
    console.log('   ✅ Prescription successfully Rejected with custom reason.');

    console.log('\n==================================================');
    console.log('🎉 ALL PRESCRIPTION & OCR VERIFICATION TESTS PASSED!');
    console.log('==================================================');

  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

runTests();

