const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Medicine = require('../models/Medicine');
const medicinesData = require('./medicinesData.json');

// Load .env configuration from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedMedicines = async () => {
  let updatedCount = 0;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicart';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected.`);

    console.log(`Processing ${medicinesData.length} source medicine records...`);

    // Clean up old demo products with legacy non-standard categories if needed
    // or upsert all 80 items by name
    for (const item of medicinesData) {
      const medicinePayload = {
        name: item.name,
        description: item.description || `${item.name} - Quality product for ${item.category}`,
        category: item.category,
        price: item.price,
        mrp: item.mrp,
        discount: item.discount || 0,
        image: item.image || '',
        rating: item.rating || 4.5,
        stock: typeof item.stock === 'number' ? item.stock : 50,
        manufacturer: item.manufacturer || 'Kanishka Healthcare',
        dosageForm: item.dosageForm || 'General Care',
        packSize: item.packSize || item.dosageForm || 'Standard Pack',
        prescriptionRequired: item.prescriptionRequired || false
      };

      await Medicine.findOneAndUpdate(
        { name: item.name },
        medicinePayload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      updatedCount++;
    }

    // Optionally remove stale test data that doesn't match our 80 standard products
    const validNames = medicinesData.map(m => m.name);
    const deleteResult = await Medicine.deleteMany({ name: { $nin: validNames } });
    if (deleteResult.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deleteResult.deletedCount} legacy non-standard test medicines.`);
    }

    const totalInDb = await Medicine.countDocuments();
    const categoriesCount = await Medicine.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    console.log('\n==========================================');
    console.log('🌱 SEEDING SUMMARY');
    console.log('==========================================');
    console.log(`Total Source Medicines : ${medicinesData.length}`);
    console.log(`Upserted Medicines     : ${updatedCount}`);
    console.log(`Total Medicines in DB  : ${totalInDb}`);
    console.log('Category Counts:');
    categoriesCount.forEach(c => {
      console.log(` - ${c._id}: ${c.count} products`);
    });
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
