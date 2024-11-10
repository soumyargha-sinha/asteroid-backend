const mongoose = require('mongoose');

const dateSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Date', dateSchema);
