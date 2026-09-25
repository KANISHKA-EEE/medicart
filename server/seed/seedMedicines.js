const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Medicine = require('../models/Medicine');
const medicinesData = require('./medicinesData.json');

// Load .env configuration from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedMedicines = async () => {
  let insertedCount = 0;
  let skippedCount = 0;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicart';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected.`);

    console.log(`Processing ${medicinesData.length} source medicine records...`);

    for (const item of medicinesData) {
      // Check if medicine already exists by exact name
      const existing = await Medicine.findOne({ name: item.name });

      if (existing) {
        skippedCount++;
        console.log(`[SKIPPED] "${item.name}" already exists in database.`);
      } else {
        const medicinePayload = {
          name: item.name,
          description: `${item.name} - Essential healthcare product for ${item.category}`,
          category: item.category,
          price: item.price,
          mrp: item.mrp,
          discount: item.discount || 0,
          image: item.image || '',
          rating: item.rating || 4.5,
          stock: typeof item.stock === 'number' ? item.stock : 50,
          dosageForm: item.dosageForm || '',
          packSize: item.dosageForm || '',
          prescriptionRequired: false
        };

        await Medicine.create(medicinePayload);
        insertedCount++;
        console.log(`[INSERTED] "${item.name}"`);
      }
    }

    const totalInDb = await Medicine.countDocuments();

    console.log('\n==========================================');
    console.log('🌱 SEEDING SUMMARY');
    console.log('==========================================');
    console.log(`Total Source Medicines : ${medicinesData.length}`);
    console.log(`Inserted Medicines     : ${insertedCount}`);
    console.log(`Skipped (Already Exist): ${skippedCount}`);
    console.log(`Total Medicines in DB  : ${totalInDb}`);
    console.log('==========================================\n');

  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB Connection Closed.');
    process.exit(0);
  }
};

seedMedicines();
