const http = require('http');

async function main() {
  console.log('--- STARTING STEP 6C COMPREHENSIVE VERIFICATION ---\n');

  // 1. First get a valid medicine from GET /api/medicines
  const medicinesRes = await fetch('http://localhost:5000/api/medicines');
  const medicinesData = await medicinesRes.json();
  if (!medicinesData.success || !medicinesData.data.length) {
    console.error('❌ Failed to fetch medicines from server');
    process.exit(1);
  }
  const medicine = medicinesData.data[0];
  console.log(`Found Medicine: ${medicine.name} (ID: ${medicine._id}, Stock: ${medicine.stock}, Price: ₹${medicine.price})`);

  // 2. Login User 1 (Kanishka)
  const loginRes1 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kanishka@example.com', password: 'password123' })
  });
  const loginData1 = await loginRes1.json();
  const tokenUser1 = loginData1.token;
  console.log(`User 1 Logged In: ${loginData1.user.email} (Token Length: ${tokenUser1?.length})`);

  // 3. Login User 2 (Siva)
  const loginRes2 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'siva@example.com', password: 'password123' })
  });
  const loginData2 = await loginRes2.json();
  const tokenUser2 = loginData2.token;
  console.log(`User 2 Logged In: ${loginData2.user.email} (Token Length: ${tokenUser2?.length})`);

  const shippingAddress = {
    fullName: "Kanishka Roy",
    phone: "9876543210",
    email: "kanishka@example.com",
    addressLine1: "123 Healthcare Ave",
    addressLine2: "Suite 4B",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001"
  };

  console.log('\n--- EXECUTING TEST SUITE ---');

  // Test A: No token
  const resA = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ medicine: medicine._id, quantity: 1 }], shippingAddress })
  });
  console.log(`Test A (No token): Status ${resA.status} (Expected: 401) ${resA.status === 401 ? '✅ PASS' : '❌ FAIL'}`);

  // Test B: Invalid token
  const resB = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid_token_xyz'
    },
    body: JSON.stringify({ items: [{ medicine: medicine._id, quantity: 1 }], shippingAddress })
  });
  console.log(`Test B (Invalid token): Status ${resB.status} (Expected: 401) ${resB.status === 401 ? '✅ PASS' : '❌ FAIL'}`);

  // Test D: Empty items
  const resD = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({ items: [], shippingAddress })
  });
  console.log(`Test D (Empty items): Status ${resD.status} (Expected: 400) ${resD.status === 400 ? '✅ PASS' : '❌ FAIL'}`);

  // Test E: Invalid medicine ID format
  const resE = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({ items: [{ medicine: 'invalid-id-format', quantity: 1 }], shippingAddress })
  });
  console.log(`Test E (Invalid medicine ID): Status ${resE.status} (Expected: 400) ${resE.status === 400 ? '✅ PASS' : '❌ FAIL'}`);

  // Test F: Non-existent medicine ID
  const resF = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({ items: [{ medicine: '507f1f77bcf86cd799439011', quantity: 1 }], shippingAddress })
  });
  console.log(`Test F (Non-existent medicine): Status ${resF.status} (Expected: 404) ${resF.status === 404 ? '✅ PASS' : '❌ FAIL'}`);

  // Test G: Quantity greater than stock
  const resG = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({ items: [{ medicine: medicine._id, quantity: medicine.stock + 500 }], shippingAddress })
  });
  console.log(`Test G (Quantity > stock): Status ${resG.status} (Expected: 400) ${resG.status === 400 ? '✅ PASS' : '❌ FAIL'}`);

  // Test C & L & M: Valid token + valid medicine order creation & server pricing verification
  // Sending fake frontend pricing to ensure backend ignores it!
  const resC = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({ 
      items: [{ medicine: medicine._id, quantity: 2, price: 1, itemTotal: 2 }], // Fake frontend price: 1
      pricing: { subtotal: 2, total: 2 }, // Fake totals
      shippingAddress 
    })
  });
  const dataC = await resC.json();
  const createdOrder = dataC.data?.order;
  const expectedSubtotal = medicine.price * 2;
  
  console.log(`Test C (Create Order): Status ${resC.status} (Expected: 201) ${resC.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test L (Server Calculated Pricing): Total ₹${createdOrder?.pricing?.total} (Expected: ₹${expectedSubtotal}) ${createdOrder?.pricing?.total === expectedSubtotal ? '✅ PASS' : '❌ FAIL'}`);
  
  const hasPasswordOrSecret = JSON.stringify(dataC).includes('password') || JSON.stringify(dataC).includes('JWT_SECRET');
  console.log(`Test M (No Sensitive Info in Order): ${!hasPasswordOrSecret ? '✅ PASS' : '❌ FAIL'}`);

  // Test H: Get User 1 Orders
  const resH = await fetch('http://localhost:5000/api/orders', {
    headers: { 'Authorization': `Bearer ${tokenUser1}` }
  });
  const dataH = await resH.json();
  console.log(`Test H (Get User Orders): Status ${resH.status}, Found ${dataH.data?.length} orders ${resH.status === 200 && dataH.data?.length > 0 ? '✅ PASS' : '❌ FAIL'}`);

  // Test I: Get Single User Order (Owner)
  const resI = await fetch(`http://localhost:5000/api/orders/${createdOrder._id}`, {
    headers: { 'Authorization': `Bearer ${tokenUser1}` }
  });
  const dataI = await resI.json();
  console.log(`Test I (Get Single Order - Owner): Status ${resI.status} ${resI.status === 200 && dataI.data._id === createdOrder._id ? '✅ PASS' : '❌ FAIL'}`);

  // Test J: Access another user's order (User 2 attempting to view User 1's order)
  const resJ = await fetch(`http://localhost:5000/api/orders/${createdOrder._id}`, {
    headers: { 'Authorization': `Bearer ${tokenUser2}` }
  });
  console.log(`Test J (Access Other User Order): Status ${resJ.status} (Expected: 403) ${resJ.status === 403 ? '✅ PASS' : '❌ FAIL'}`);

  // Test K: Non-existent order ID
  const resK = await fetch('http://localhost:5000/api/orders/507f1f77bcf86cd799439011', {
    headers: { 'Authorization': `Bearer ${tokenUser1}` }
  });
  console.log(`Test K (Non-existent Order ID): Status ${resK.status} (Expected: 404) ${resK.status === 404 ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n--- ALL VERIFICATION TESTS COMPLETED ---');
}

main().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
