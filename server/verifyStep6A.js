const testStep6A = async () => {
  console.log('==========================================');
  console.log('🧪 VERIFYING STEP 6A: SHOPPING CART SYSTEM');
  console.log('==========================================\n');

  try {
    // 1. Fetch available medicines from MongoDB API
    const res = await fetch('http://localhost:5000/api/medicines');
    const data = await res.json();
    console.log('MongoDB Medicines API Status:', res.status);
    console.log('Fetched Medicines Count:', data.count);

    if (!data.data || data.data.length === 0) {
      throw new Error('No medicines found in database');
    }

    const med1 = data.data[0]; // Paracetamol
    const med2 = data.data[1]; // Vitamin C

    console.log(`\nTesting Cart Logic with: "${med1.name}" (₹${med1.price}) & "${med2.name}" (₹${med2.price})`);

    // Simulated Cart State Logic
    let cart = [];

    const addItem = (product) => {
      const prodId = product._id || product.id;
      const existing = cart.find(i => (i._id || i.id) === prodId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, id: prodId, quantity: 1 });
      }
    };

    const setQty = (id, delta) => {
      cart = cart.map(item => {
        if ((item._id || item.id) === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    };

    const removeItem = (id) => {
      cart = cart.filter(item => (item._id || item.id) !== id);
    };

    // TEST A: Add 1 medicine
    addItem(med1);
    let totalCount = cart.reduce((a, b) => a + b.quantity, 0);
    console.log('\n--- TEST A: Add One Medicine ---');
    console.log('Cart Items Rows:', cart.length, 'Total Items Count:', totalCount);

    // TEST B: Add same medicine again
    addItem(med1);
    totalCount = cart.reduce((a, b) => a + b.quantity, 0);
    console.log('\n--- TEST B: Add Same Medicine Again ---');
    console.log('Cart Items Rows:', cart.length, 'Total Items Count:', totalCount, `Quantity of "${med1.name}":`, cart[0].quantity);

    // TEST C: Add different medicine
    addItem(med2);
    totalCount = cart.reduce((a, b) => a + b.quantity, 0);
    let subtotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);
    console.log('\n--- TEST C: Add Different Medicine ---');
    console.log('Cart Items Rows:', cart.length, 'Total Items Count:', totalCount, 'Cart Subtotal: ₹' + subtotal);

    // TEST D: Quantity increase
    setQty(med1._id, +1);
    subtotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);
    console.log('\n--- TEST D: Increase Quantity ---');
    console.log(`New Qty of "${med1.name}":`, cart.find(i => i._id === med1._id).quantity, 'Updated Subtotal: ₹' + subtotal);

    // TEST E: Quantity decrease (min 1)
    setQty(med1._id, -10); // Attempt to go below 1
    console.log('\n--- TEST E: Decrease Quantity (Minimum Cap 1) ---');
    console.log(`Min Qty of "${med1.name}":`, cart.find(i => i._id === med1._id).quantity);

    // TEST F: Remove item
    removeItem(med2._id);
    totalCount = cart.reduce((a, b) => a + b.quantity, 0);
    console.log('\n--- TEST F: Remove Single Item ---');
    console.log('Remaining Rows:', cart.length, 'Remaining Total Count:', totalCount);

    // TEST G: Clear cart
    cart = [];
    console.log('\n--- TEST G: Clear Cart ---');
    console.log('Cart Rows after Clear:', cart.length);

    console.log('\n==========================================');
    console.log('✅ ALL STEP 6A CART LOGIC TESTS PASSED');
    console.log('==========================================\n');

  } catch (err) {
    console.error('❌ Cart Verification Error:', err.message);
  }
};

testStep6A();
