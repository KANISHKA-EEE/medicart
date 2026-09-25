const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const verifyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicart');
    const user = await User.findOne({ email: 'kanishka@example.com' });

    console.log('\n==========================================');
    console.log('🔍 MONGODB USER DOCUMENT VERIFICATION');
    console.log('==========================================');
    if (user) {
      console.log('ID             :', user._id);
      console.log('Name           :', user.name);
      console.log('Email          :', user.email);
      console.log('Role           :', user.role);
      console.log('Hashed Password:', user.password);
      console.log('Is Password Hashed?:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
      console.log('Plaintext Password Stored?:', user.password === 'password123' ? 'YES (FAIL)' : 'NO (SECURE)');
    } else {
      console.log('User not found!');
    }
    console.log('==========================================\n');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

verifyUser();
