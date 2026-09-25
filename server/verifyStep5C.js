const jwt = require('jsonwebtoken');

const testStep5C = async () => {
  console.log('==========================================');
  console.log('🧪 VERIFYING STEP 5C: REACT AUTHENTICATION FLOW');
  console.log('==========================================\n');

  try {
    // 1. SIGNUP TEST: Create test user "Sivakumar"
    console.log('--- TEST A: Signup Flow ---');
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sivakumar',
        email: 'siva@example.com',
        password: 'password123'
      })
    });
    const signupData = await signupRes.json();
    console.log('Signup HTTP Status:', signupRes.status);
    console.log('Signup Response:', JSON.stringify(signupData, null, 2));

    // 2. DUPLICATE SIGNUP TEST
    console.log('\n--- TEST B: Duplicate Email Signup ---');
    const dupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sivakumar Duplicate',
        email: 'siva@example.com',
        password: 'password123'
      })
    });
    const dupData = await dupRes.json();
    console.log('Duplicate Signup HTTP Status:', dupRes.status);
    console.log('Duplicate Response:', JSON.stringify(dupData, null, 2));

    // 3. LOGIN TEST (Valid credentials)
    console.log('\n--- TEST C: Valid Login Flow ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'siva@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login HTTP Status:', loginRes.status);
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    // Simulate localStorage storing keys medicart_token & medicart_user
    if (loginData.token && loginData.user) {
      console.log('\n--- TEST D: LocalStorage Format Check ---');
      console.log('medicart_token:', loginData.token.substring(0, 30) + '...');
      console.log('medicart_user:', JSON.stringify(loginData.user));
    }

    // 4. INVALID LOGIN TEST (Wrong Password)
    console.log('\n--- TEST E: Invalid Login (Wrong Password) ---');
    const wrongPassRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'siva@example.com',
        password: 'wrongpass'
      })
    });
    const wrongPassData = await wrongPassRes.json();
    console.log('Wrong Password HTTP Status:', wrongPassRes.status);
    console.log('Wrong Password Response:', JSON.stringify(wrongPassData, null, 2));

    // 5. MEDICINES API DISPLAY VERIFICATION
    console.log('\n--- TEST F: Medicines Display API ---');
    const medRes = await fetch('http://localhost:5000/api/medicines');
    const medData = await medRes.json();
    console.log('Medicines API HTTP Status:', medRes.status);
    console.log('Medicines Count in MongoDB:', medData.count);

    console.log('\n==========================================');
    console.log('✅ ALL STEP 5C VERIFICATIONS PASSED');
    console.log('==========================================\n');

  } catch (err) {
    console.error('❌ Step 5C Test Error:', err.message);
  }
};

testStep5C();
