const testSignup = async () => {
  try {
    console.log('--- TEST 1: Creating new user "Kanishka" ---');
    const res1 = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kanishka',
        email: 'kanishka@example.com',
        password: 'password123'
      })
    });
    const status1 = res1.status;
    const data1 = await res1.json();
    console.log('HTTP Status:', status1);
    console.log('Response JSON:', JSON.stringify(data1, null, 2));

    console.log('\n--- TEST 2: Attempting duplicate signup with same email ---');
    const res2 = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kanishka Duplicate',
        email: 'kanishka@example.com',
        password: 'password123'
      })
    });
    const status2 = res2.status;
    const data2 = await res2.json();
    console.log('HTTP Status:', status2);
    console.log('Response JSON:', JSON.stringify(data2, null, 2));

  } catch (err) {
    console.error('Test Failed:', err.message);
  }
};

testSignup();
