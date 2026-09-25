const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const User = require('./models/User');
const Medicine = require('./models/Medicine');
const medicineRoutes = require('./routes/medicineRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicart';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

async function verifyStep7BBackend() {
  console.log('--- STARTING STEP 7B BACKEND VERIFICATION ---');

  await mongoose.connect(MONGO_URI);
  console.log('1. Connected to MongoDB.');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`2. Test server listening on port ${port}`);

    let createdMedicineId = null;

    try {
      const normalUser = await User.findOne({ role: 'user' });
      const adminUser = await User.findOne({ role: 'admin' });

      if (!normalUser) throw new Error('No normal user found in DB');
      if (!adminUser) throw new Error('No admin user found in DB');

      const normalToken = jwt.sign({ userId: normalUser._id, role: normalUser.role }, JWT_SECRET, { expiresIn: '1h' });
      const adminToken = jwt.sign({ userId: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '1h' });

      const testPayload = {
        name: 'Test Antigravity Remedy',
        category: 'General Health',
        price: 99,
        mrp: 150,
        discount: 34,
        stock: 50,
        rating: 4.8,
        description: 'Temporary medicine for step 7b security test',
        dosageForm: 'Tablet',
        packSize: '10 Tablets',
        prescriptionRequired: false
      };

      // Test J: Public GET medicines -> 200
      const resJ = await fetch(`${baseUrl}/api/medicines`);
      console.log(`Test J (Public GET medicines): Status ${resJ.status} (Expected 200)`);
      if (resJ.status !== 200) throw new Error('Test J failed');

      // Test A: No token POST medicine -> 401
      const resA = await fetch(`${baseUrl}/api/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      console.log(`Test A (No token POST): Status ${resA.status} (Expected 401)`);
      if (resA.status !== 401) throw new Error('Test A failed');

      // Test B: Normal user POST medicine -> 403
      const resB = await fetch(`${baseUrl}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${normalToken}`
        },
        body: JSON.stringify(testPayload)
      });
      console.log(`Test B (Normal user POST): Status ${resB.status} (Expected 403)`);
      if (resB.status !== 403) throw new Error('Test B failed');

      // Test C: Admin POST medicine -> 201
      const resC = await fetch(`${baseUrl}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(testPayload)
      });
      const dataC = await resC.json();
      console.log(`Test C (Admin POST): Status ${resC.status}, Created ID: ${dataC.data?._id} (Expected 201)`);
      if (resC.status !== 201 || !dataC.data?._id) throw new Error('Test C failed');
      createdMedicineId = dataC.data._id;

      // Test D: No token PUT -> 401
      const resD = await fetch(`${baseUrl}/api/medicines/${createdMedicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 105 })
      });
      console.log(`Test D (No token PUT): Status ${resD.status} (Expected 401)`);
      if (resD.status !== 401) throw new Error('Test D failed');

      // Test E: Normal user PUT -> 403
      const resE = await fetch(`${baseUrl}/api/medicines/${createdMedicineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${normalToken}`
        },
        body: JSON.stringify({ price: 105 })
      });
      console.log(`Test E (Normal user PUT): Status ${resE.status} (Expected 403)`);
      if (resE.status !== 403) throw new Error('Test E failed');

      // Test F: Admin PUT -> 200
      const resF = await fetch(`${baseUrl}/api/medicines/${createdMedicineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ price: 105, name: 'Test Antigravity Remedy Updated' })
      });
      const dataF = await resF.json();
      console.log(`Test F (Admin PUT): Status ${resF.status}, Updated Name: ${dataF.data?.name}, Price: ${dataF.data?.price} (Expected 200)`);
      if (resF.status !== 200 || dataF.data?.price !== 105) throw new Error('Test F failed');

      // Test G: No token DELETE -> 401
      const resG = await fetch(`${baseUrl}/api/medicines/${createdMedicineId}`, {
        method: 'DELETE'
      });
      console.log(`Test G (No token DELETE): Status ${resG.status} (Expected 401)`);
      if (resG.status !== 401) throw new Error('Test G failed');

      // Test H: Normal user DELETE -> 403
      const resH = await fetch(`${baseUrl}/api/medicines/${createdMedicineId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${normalToken}` }
      });
      console.log(`Test H (Normal user DELETE): Status ${resH.status} (Expected 403)`);
      if (resH.status !== 403) throw new Error('Test H failed');

      // Test I: Admin DELETE -> 200
      const resI = await fetch(`${baseUrl}/api/medicines/${createdMedicineId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const dataI = await resI.json();
      console.log(`Test I (Admin DELETE): Status ${resI.status}, Message: "${dataI.message}" (Expected 200)`);
      if (resI.status !== 200) throw new Error('Test I failed');

      // Verify deletion from DB
      const checkDoc = await Medicine.findById(createdMedicineId);
      if (checkDoc) throw new Error('Medicine doc still present in DB after deletion!');
      console.log('✅ Temporary test medicine cleanly deleted from MongoDB database.');

      console.log('✅ ALL BACKEND STEP 7B TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ STEP 7B VERIFICATION ERROR:', err.message);
      if (createdMedicineId) {
        await Medicine.findByIdAndDelete(createdMedicineId);
        console.log('Cleaned up test medicine on error.');
      }
    } finally {
      server.close();
      await mongoose.disconnect();
    }
  });
}

verifyStep7BBackend();
