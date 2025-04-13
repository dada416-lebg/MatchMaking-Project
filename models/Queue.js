const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  pseudo: {
    type: String,
    required: true
  },
  joinTime: {
    type: Date,
    default: Date.now
  },
  leaveTime: {
    type: Date
  },
  ip: String,
  port: Number,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Queue', queueSchema); 