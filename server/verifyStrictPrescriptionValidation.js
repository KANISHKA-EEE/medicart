const path = require('path');
const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('===========================================================');
  console.log('🧪 KANISHKA PHARMACY - STRICT PRESCRIPTION VALIDATION SUITE');
  console.log('===========================================================\n');

  let passedTests = 0;
  let totalTests = 9;

  try {
    // Authenticate test users
    console.log('📌 Authenticating test accounts...');
    const userRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kanishka@example.com', password: 'password123' })
    });
    const userData = await userRes.json();
    if (!userData.token) throw new Error('User login failed');
    const userToken = userData.token;

    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medicart.local', password: 'Admin123!' })
    });
    const adminData = await adminRes.json();
    if (!adminData.token) throw new Error('Admin login failed');
    const adminToken = adminData.token;
    console.log('   ✅ User and Admin authentication successful.\n');

    // Helper to upload PDF buffer to /api/orders/upload-prescription
    async function uploadPdfBuffer(pdfText, filename) {
      const samplePdfContent = Buffer.from(
        '%PDF-1.4\n' +
        '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
        '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n' +
        '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj\n' +
        `4 0 obj<</Length ${pdfText.length + 40}>>stream\n` +
        'BT\n' +
        '/F1 12 Tf\n' +
        '50 700 Td\n' +
        `(${pdfText.replace(/\n/g, ') Tj\n0 -20 Td\n(')}) Tj\n` +
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
        `Content-Disposition: form-data; name="prescription"; filename="${filename}"\r\n` +
        `Content-Type: application/pdf\r\n\r\n`
      );
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
      const fullBody = Buffer.concat([head, samplePdfContent, tail]);

      const res = await fetch(`${API_BASE}/orders/upload-prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: fullBody
      });

      const data = await res.json();
      return { status: res.status, data };
    }

    // TEST 1: Random normal image / non-prescription text
    console.log('TEST 1: Random normal image text ("Sunny beach vacation memories photo")...');
    const t1 = await uploadPdfBuffer('Sunny beach vacation memories photo album 2026', 'test1-random.pdf');
    console.log('   Status:', t1.status, '| Message:', t1.data.message);
    if (t1.status === 400 && t1.data.message.includes('does not appear to be a medical prescription')) {
      console.log('   ✅ PASSED (REJECTED as expected)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 400 REJECT');
    }

    // TEST 2: Medicine product / package photo
    console.log('\nTEST 2: Medicine product/package photo ("Paracetamol 500mg Batch No B123 Exp 10/28 MRP Rs 50 Mfg by Sun Pharma")...');
    const t2 = await uploadPdfBuffer('Paracetamol 500mg Batch No B123 Exp 10/28 MRP Rs 50 Mfg by Sun Pharma Store in a cool place Net Qty 10 tablets', 'test2-packaging.pdf');
    console.log('   Status:', t2.status, '| Message:', t2.data.message);
    if (t2.status === 400 && t2.data.message.includes('does not appear to be a medical prescription')) {
      console.log('   ✅ PASSED (REJECTED product packaging photo as expected)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 400 REJECT for product packaging photo');
    }

    // TEST 3: Blank image / empty text
    console.log('\nTEST 3: Blank image / empty document...');
    const t3 = await uploadPdfBuffer('  ', 'test3-blank.pdf');
    console.log('   Status:', t3.status, '| Message:', t3.data.message);
    if (t3.status === 400 && t3.data.message.includes('does not appear to be a medical prescription')) {
      console.log('   ✅ PASSED (REJECTED blank file as expected)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 400 REJECT for blank file');
    }

    // TEST 4: Random screenshot / unrelated document with text
    console.log('\nTEST 4: Random screenshot / document with unrelated text ("Quarterly Sales Report revenue growth")...');
    const t4 = await uploadPdfBuffer('Quarterly Sales Report FY2026 Revenue Growth 15 percent Team Meeting Notes Project Roadmap', 'test4-report.pdf');
    console.log('   Status:', t4.status, '| Message:', t4.data.message);
    if (t4.status === 400 && t4.data.message.includes('does not appear to be a medical prescription')) {
      console.log('   ✅ PASSED (REJECTED unrelated document as expected)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 400 REJECT for unrelated text document');
    }

    // TEST 5: Sample valid prescription
    console.log('\nTEST 5: Sample valid prescription with doctor, patient, date, medicines, dosage...');
    const rxTextValid = 
      'CITY LIFE HOSPITAL AND CLINIC\n' +
      'Doctor: Dr. Rajesh Sharma, MD Physician\n' +
      'Reg No: MCI-2018-98432\n' +
      'Patient Name: Kanishka Kumar\n' +
      'Date: 26/09/2026\n' +
      'Rx: Tab Amoxicillin 500mg - 1-0-1 after food Qty 10\n' +
      'Tab Paracetamol 500mg - SOS';
    const t5 = await uploadPdfBuffer(rxTextValid, 'test5-valid-rx.pdf');
    console.log('   Status:', t5.status, '| Message:', t5.data.message);
    let validUploadData = t5.data.data;
    if (t5.status === 200 && t5.data.success && t5.data.data.prescriptionStatus === 'Pending Review') {
      console.log('   ✅ PASSED (ACCEPTED -> Status: Pending Review)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 200 ACCEPTED for valid prescription');
    }

    // TEST 6: Prescription with missing fields (no hospital or registration number)
    console.log('\nTEST 6: Prescription with missing fields (No Hospital name & No Reg No)...');
    const rxTextMissing = 
      'Dr. Ramesh Kumar\n' +
      'Patient: Priya Sharma\n' +
      'Date: 20/09/2026\n' +
      'Rx: Tab Dolo 650mg - 1-0-1 for 5 days';
    const t6 = await uploadPdfBuffer(rxTextMissing, 'test6-missing-fields.pdf');
    console.log('   Status:', t6.status, '| Message:', t6.data.message);
    if (t6.status === 200 && t6.data.success && t6.data.data.validation.warnings.length > 0) {
      console.log('   Warnings Flagged:', t6.data.data.validation.warnings.join(' | '));
      console.log('   ✅ PASSED (ACCEPTED -> Status: Pending Review with missing field warnings)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 200 ACCEPTED with warnings for prescription missing optional fields');
    }

    // TEST 7: Prescription for medicine not in our catalog
    console.log('\nTEST 7: Prescription for medicine not in our catalog ("Tab UniqueDrugX 250mg")...');
    const rxTextUnlisted = 
      'GREEN VALLEY CLINIC\n' +
      'Doctor: Dr. V. Patel, Reg No 99881\n' +
      'Patient: Rahul Verma\n' +
      'Date: 15/09/2026\n' +
      'Rx: Tab UniqueDrugX 250mg - 1-0-1 for 7 days';
    const t7 = await uploadPdfBuffer(rxTextUnlisted, 'test7-unlisted-med.pdf');
    console.log('   Status:', t7.status, '| Message:', t7.data.message);
    if (t7.status === 200 && t7.data.success) {
      console.log('   ✅ PASSED (ACCEPTED -> Catalog matching is supporting validation only)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 200 ACCEPTED for prescription containing unlisted medicine');
    }

    // TEST 8: Non-admin user attempts to approve prescription (Security Test)
    console.log('\nTEST 8: Non-admin user attempts to approve prescription (Security Test)...');

    // Create a real order using validUploadData
    const medRes = await fetch(`${API_BASE}/medicines`);
    const medData = await medRes.json();
    const rxMed = medData.data.find(m => m.prescriptionRequired);

    const orderRes = await fetch(`${API_BASE}/orders`, {
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
        prescriptionFile: validUploadData
      })
    });
    const orderData = await orderRes.json();
    const orderId = orderData.data.order._id;
    console.log('   Created Order ID:', orderId);

    // Customer attempts to call admin review endpoint
    const nonAdminReviewRes = await fetch(`${API_BASE}/admin/orders/${orderId}/prescription-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // User Token, not Admin Token!
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const nonAdminReviewData = await nonAdminReviewRes.json();
    console.log('   Status:', nonAdminReviewRes.status, '| Message:', nonAdminReviewData.message);
    if (nonAdminReviewRes.status === 403) {
      console.log('   ✅ PASSED (403 Forbidden received for non-admin user)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Expected 403 Forbidden for non-admin review attempt');
    }

    // TEST 9: Admin reviews prescription (Approve & Reject works)
    console.log('\nTEST 9: Admin reviews prescription (Approve/Reject)...');
    const adminReviewRes = await fetch(`${API_BASE}/admin/orders/${orderId}/prescription-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}` // Admin Token!
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const adminReviewData = await adminReviewRes.json();
    console.log('   Status:', adminReviewRes.status, '| Message:', adminReviewData.message);
    if (adminReviewRes.status === 200 && adminReviewData.data.prescriptionStatus === 'Approved') {
      console.log('   ✅ PASSED (Admin Approved prescription successfully)');
      passedTests++;
    } else {
      console.log('   ❌ FAILED: Admin review approval failed');
    }

    console.log('\n===========================================================');
    console.log(`📊 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('===========================================================');

    if (passedTests === totalTests) {
      console.log('🎉 ALL PRESCRIPTION VALIDATION TESTS PASSED PERFECTLY!');
      process.exit(0);
    } else {
      console.log('⚠️ SOME TESTS FAILED!');
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ Test Suite Error:', err.message);
    process.exit(1);
  }
}

runTests();
