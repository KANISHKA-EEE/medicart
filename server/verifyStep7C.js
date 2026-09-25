const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Order = require('./models/Order');
const medicineRoutes = require('./routes/medicineRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicart';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

async function verifyStep7CBackend() {
  console.log('--- STARTING STEP 7C BACKEND VERIFICATION ---');

  await mongoose.connect(MONGO_URI);
  console.log('1. Connected to MongoDB.');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`2. Test server listening on port ${port}`);

    let createdOrder = null;

    try {
      const normalUser = await User.findOne({ role: 'user' });
      const adminUser = await User.findOne({ role: 'admin' });
      const sampleMedicine = await Medicine.findOne();

      if (!normalUser) throw new Error('No normal user found in DB');
      if (!adminUser) throw new Error('No admin user found in DB');
      if (!sampleMedicine) throw new Error('No medicine found in DB');

      const normalToken = jwt.sign({ userId: normalUser._id, role: normalUser.role }, JWT_SECRET, { expiresIn: '1h' });
      const adminToken = jwt.sign({ userId: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '1h' });

      // Create a test order for normal user to verify admin operations
      const orderPayload = {
        items: [
          {
            medicine: sampleMedicine._id.toString(),
            quantity: 2
          }
        ],
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '9876543210',
          email: normalUser.email,
          addressLine1: '123 Test Street',
          city: 'Testville',
          state: 'Test State',
          pincode: '500001'
        }
      };

      const resCreate = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${normalToken}`
        },
        body: JSON.stringify(orderPayload)
      });

      const dataCreate = await resCreate.json();
      if (resCreate.status !== 201 || !dataCreate.data?.order?._id) {
        throw new Error('Failed to create test order');
      }

      createdOrder = dataCreate.data.order;
      const orderId = createdOrder._id;
      console.log(`3. Created test order ID: ${orderId} (Status: ${createdOrder.status})`);

      // Test 1: Security - No token GET /api/admin/orders -> 401
      const res1 = await fetch(`${baseUrl}/api/admin/orders`);
      console.log(`Test 1 (No token GET /api/admin/orders): Status ${res1.status} (Expected 401)`);
      if (res1.status !== 401) throw new Error('Test 1 failed');

      // Test 2: Security - Normal user GET /api/admin/orders -> 403
      const res2 = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${normalToken}` }
      });
      console.log(`Test 2 (Normal user GET /api/admin/orders): Status ${res2.status} (Expected 403)`);
      if (res2.status !== 403) throw new Error('Test 2 failed');

      // Test 3: Security - Normal user PUT /api/admin/orders/:id/status -> 403
      const res3 = await fetch(`${baseUrl}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${normalToken}`
        },
        body: JSON.stringify({ status: 'Shipped' })
      });
      console.log(`Test 3 (Normal user PUT /api/admin/orders/:id/status): Status ${res3.status} (Expected 403)`);
      if (res3.status !== 403) throw new Error('Test 3 failed');

      // Test 4: Admin GET /api/admin/orders -> 200 (returns list)
      const res4 = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data4 = await res4.json();
      console.log(`Test 4 (Admin GET /api/admin/orders): Status ${res4.status}, Orders count: ${data4.count} (Expected 200)`);
      if (res4.status !== 200 || !Array.isArray(data4.data)) throw new Error('Test 4 failed');

      // Test 5: Admin GET /api/admin/orders/:id -> 200
      const res5 = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data5 = await res5.json();
      console.log(`Test 5 (Admin GET /api/admin/orders/:id): Status ${res5.status}, Customer email: ${data5.data?.user?.email} (Expected 200)`);
      if (res5.status !== 200 || data5.data?._id !== orderId) throw new Error('Test 5 failed');

      // Test 6: Admin PUT /api/admin/orders/:id/status with invalid status -> 400
      const res6 = await fetch(`${baseUrl}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'InvalidStatusXYZ' })
      });
      console.log(`Test 6 (Admin PUT invalid status): Status ${res6.status} (Expected 400)`);
      if (res6.status !== 400) throw new Error('Test 6 failed');

      // Test 7: Admin PUT /api/admin/orders/:id/status with valid status ("Shipped") -> 200
      const res7 = await fetch(`${baseUrl}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Shipped' })
      });
      const data7 = await res7.json();
      console.log(`Test 7 (Admin PUT status "Shipped"): Status ${res7.status}, New status: "${data7.data?.status}" (Expected 200)`);
      if (res7.status !== 200 || data7.data?.status !== 'Shipped') throw new Error('Test 7 failed');

      // Test 8: Admin Dashboard Statistics recent orders check
      const res8 = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data8 = await res8.json();
      console.log(`Test 8 (Admin Dashboard stats with recent orders): Status ${res8.status}, Recent orders length: ${data8.data?.recentOrders?.length}`);
      if (res8.status !== 200 || !Array.isArray(data8.data?.recentOrders)) throw new Error('Test 8 failed');

      // Cleanup test order
      await Order.findByIdAndDelete(orderId);
      console.log('✅ Temporary test order cleaned up from MongoDB.');

      console.log('✅ ALL BACKEND STEP 7C TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ STEP 7C VERIFICATION ERROR:', err.message);
      if (createdOrder?._id) {
        await Order.findByIdAndDelete(createdOrder._id);
        console.log('Cleaned up test order on error.');
      }
    } finally {
      server.close();
      await mongoose.disconnect();
    }
  });
}

verifyStep7CBackend();
