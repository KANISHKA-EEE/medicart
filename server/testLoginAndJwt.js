const jwt = require('jsonwebtoken');

const runTests = async () => {
  console.log('==========================================');
  console.log('🧪 TESTING STEP 5B: LOGIN & JWT API');
  console.log('==========================================\n');

  try {
    // TEST 1: Correct email + correct password
    console.log('--- TEST 1: Correct email + correct password ---');
    const res1 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kanishka@example.com',
        password: 'password123'
      })
    });
    const data1 = await res1.json();
    console.log('Status Code:', res1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));

    // Decode and verify JWT payload
    if (data1.token) {
      const decoded = jwt.decode(data1.token);
      console.log('\n--- JWT Token Verification ---');
      console.log('Decoded Token Payload:', decoded);
      console.log('Has userId?:', !!decoded.userId);
      console.log('Has role?:', !!decoded.role);
      console.log('Has exp (Expiration)?:', !!decoded.exp, `(Expires in ${Math.round((decoded.exp - decoded.iat) / 86400)} days)`);
      console.log('Contains Password?:', decoded.password ? 'YES (FAIL)' : 'NO (SECURE)');
      console.log('Exposes JWT_SECRET?:', JSON.stringify(decoded).includes('medicart_jwt_secret') ? 'YES (FAIL)' : 'NO (SECURE)');
    }

    // TEST 2: Correct email + wrong password
    console.log('\n--- TEST 2: Correct email + wrong password ---');
    const res2 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kanishka@example.com',
        password: 'wrongpassword'
      })
    });
    const data2 = await res2.json();
    console.log('Status Code:', res2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));

    // TEST 3: Non-existing email
    console.log('\n--- TEST 3: Non-existing email ---');
    const res3 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@example.com',
        password: 'password123'
      })
    });
    const data3 = await res3.json();
    console.log('Status Code:', res3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));

    // TEST 4: Missing email/password
    console.log('\n--- TEST 4: Missing fields ---');
    const res4 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kanishka@example.com'
      })
    });
    const data4 = await res4.json();
    console.log('Status Code:', res4.status);
    console.log('Response:', JSON.stringify(data4, null, 2));

    // TEST 5: Verify existing routes
    console.log('\n--- TEST 5: Verify existing routes ---');
    const resTest = await fetch('http://localhost:5000/api/test');
    const dataTest = await resTest.json();
    console.log('GET /api/test Status:', resTest.status, 'Msg:', dataTest.message);

    const resMed = await fetch('http://localhost:5000/api/medicines');
    const dataMed = await resMed.json();
    console.log('GET /api/medicines Status:', resMed.status, 'Count:', dataMed.count);

    console.log('\n==========================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('==========================================\n');

  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
};

runTests();
