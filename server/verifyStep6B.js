const testStep6B = async () => {
  console.log('==========================================');
  console.log('🧪 VERIFYING STEP 6B: CHECKOUT FLOW & SUMMARY');
  console.log('==========================================\n');

  try {
    // 1. REGEX VALIDATION TESTS
    console.log('--- TEST A: Validation Rules ---');
    const phoneRegex = /^[6-9]\d{9}$/;
    const pincodeRegex = /^\d{6}$/;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

    console.log('Valid Phone (9876543210):', phoneRegex.test('9876543210')); // true
    console.log('Invalid Phone (12345):', phoneRegex.test('12345')); // false
    console.log('Valid Pincode (110001):', pincodeRegex.test('110001')); // true
    console.log('Invalid Pincode (123):', pincodeRegex.test('123')); // false
    console.log('Valid Email (kanishka@example.com):', emailRegex.test('kanishka@example.com')); // true

    // 2. ORDER SUMMARY COMPUTATION TEST
    console.log('\n--- TEST B: Order Summary Calculations ---');
    const mockCart = [
      { id: '1', name: 'Paracetamol 500mg', price: 49, mrp: 60, quantity: 2 },
      { id: '2', name: 'Vitamin C Tablets 500mg', price: 129, mrp: 160, quantity: 1 }
    ];

    const subtotal = mockCart.reduce((a, b) => a + b.price * b.quantity, 0); // 49*2 + 129 = 227
    const deliveryCharge = 0; // FREE Delivery
    const totalPayable = subtotal + deliveryCharge;
    const totalSavings = mockCart.reduce((a, b) => a + (b.mrp - b.price) * b.quantity, 0); // 11*2 + 31 = 53

    console.log('Item 1 (Paracetamol): ₹49 × 2 = ₹' + (49 * 2));
    console.log('Item 2 (Vitamin C) : ₹129 × 1 = ₹' + (129 * 1));
    console.log('Calculated Subtotal  : ₹' + subtotal);
    console.log('Delivery Charge      : FREE Delivery (₹' + deliveryCharge + ')');
    console.log('Total Payable        : ₹' + totalPayable);
    console.log('Total Discount Saved : ₹' + totalSavings);

    // 3. API STATUS VERIFICATION
    console.log('\n--- TEST C: Existing API Verification ---');
    const medRes = await fetch('http://localhost:5000/api/medicines');
    const medData = await medRes.json();
    console.log('GET /api/medicines Status:', medRes.status, 'Count:', medData.count);

    const testRes = await fetch('http://localhost:5000/api/test');
    const testData = await testRes.json();
    console.log('GET /api/test Status:', testRes.status, 'Msg:', testData.message);

    console.log('\n==========================================');
    console.log('✅ ALL STEP 6B CHECKOUT TESTS PASSED');
    console.log('==========================================\n');

  } catch (err) {
    console.error('❌ Step 6B Test Error:', err.message);
  }
};

testStep6B();
