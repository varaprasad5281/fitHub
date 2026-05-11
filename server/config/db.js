const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || '7percent',
      serverSelectionTimeoutMS: 10000, // fail fast - 10s instead of 30s default
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Check: 1) Atlas IP whitelist  2) Cluster is not paused  3) MONGODB_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;
