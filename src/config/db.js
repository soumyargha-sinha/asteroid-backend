const mongoose = require('mongoose');
const config = require('./config');
mongoose.set('debug', config.MONGO_DEBUG || true);

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

module.exports = connectDB;
