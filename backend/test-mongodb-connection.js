const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    console.error('\nPossible causes:');
    console.error('1. No internet connection');
    console.error('2. MongoDB Atlas cluster is paused or deleted');
    console.error('3. IP address not whitelisted in MongoDB Atlas');
    console.error('4. Firewall blocking MongoDB port (27017)');
    console.error('5. Network blocking MongoDB SRV records');
    console.error('\nTo fix:');
    console.error('- Check internet connection');
    console.error('- Log into https://cloud.mongodb.com');
    console.error('- Verify cluster is running');
    console.error('- Add your IP to Network Access whitelist (or use 0.0.0.0/0 for testing)');
    process.exit(1);
  }
}

testConnection();
