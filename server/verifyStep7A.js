const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

async function verifyStep7ABackend() {
  console.log('--- STARTING STEP 7A BACKEND VERIFICATION ---');

  await mongoose.connect(MONGO_URI);
  console.log('1. Connected to MongoDB.');

  // Set up ephemeral express app for testing
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

    try {
      // Find normal user & admin user
      const normalUser = await User.findOne({ role: 'user' });
      const adminUser = await User.findOne({ role: 'admin' });

      if (!normalUser) throw new Error('No normal user found in MongoDB for testing');
      if (!adminUser) throw new Error('No admin user found in MongoDB for testing');

      const normalToken = jwt.sign({ userId: normalUser._id, role: normalUser.role }, JWT_SECRET, { expiresIn: '1h' });
      const adminToken = jwt.sign({ userId: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '1h' });

      // Test A: No token -> 401
      const resA = await fetch(`${baseUrl}/api/admin/dashboard`);
      console.log(`Test A (No token): Status ${resA.status} (Expected 401)`);
      if (resA.status !== 401) throw new Error('Test A failed');

      // Test B: Invalid token -> 401
      const resB = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: 'Bearer invalid_token_xyz' }
      });
      console.log(`Test B (Invalid token): Status ${resB.status} (Expected 401)`);
      if (resB.status !== 401) throw new Error('Test B failed');

      // Test C: Normal user token -> 403
      const resC = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${normalToken}` }
      });
      const dataC = await resC.json();
      console.log(`Test C (Normal user token): Status ${resC.status}, Message: "${dataC.message}" (Expected 403)`);
      if (resC.status !== 403 || dataC.success !== false) throw new Error('Test C failed');

      // Test D: Admin token -> 200
      const resD = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const dataD = await resD.json();
      console.log(`Test D (Admin token): Status ${resD.status}, Success: ${dataD.success} (Expected 200)`);
      if (resD.status !== 200 || !dataD.success) throw new Error('Test D failed');

      // Test E: Verify statistics structure and DB counts
      const expectedUsers = await User.countDocuments();
      const expectedMedicines = await Medicine.countDocuments();
      const expectedOrders = await Order.countDocuments();

      console.log('Received Stats:', JSON.stringify(dataD.data, null, 2));
      console.log(`Expected DB Counts -> Users: ${expectedUsers}, Medicines: ${expectedMedicines}, Orders: ${expectedOrders}`);

      if (dataD.data.totalUsers !== expectedUsers) throw new Error('User count mismatch');
      if (dataD.data.totalMedicines !== expectedMedicines) throw new Error('Medicine count mismatch');
      if (dataD.data.totalOrders !== expectedOrders) throw new Error('Order count mismatch');

      console.log('✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ VERIFICATION ERROR:', err.message);
    } finally {
      server.close();
      await mongoose.disconnect();
    }
  });
}

verifyStep7ABackend();
