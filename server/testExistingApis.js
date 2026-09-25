const testExisting = async () => {
  try {
    const res1 = await fetch('http://localhost:5000/api/test');
    const data1 = await res1.json();
    console.log('GET /api/test Status:', res1.status, 'Data:', data1);

    const res2 = await fetch('http://localhost:5000/api/medicines');
    const data2 = await res2.json();
    console.log('GET /api/medicines Status:', res2.status, 'Count:', data2.count);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testExisting();
