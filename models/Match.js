const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  player1: {
    id: String,
    pseudo: String,
    score: {
      type: Number,
      default: 0
    }
  },
  player2: {
    id: String,
    pseudo: String,
    score: {
      type: Number,
      default: 0
    }
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  isFinished: {
    type: Boolean,
    default: false
  },
  winner: {
    type: String,
    enum: ['player1', 'player2', 'draw', null],
    default: null
  },
  disconnect: {
    type: Boolean,
    default: false
  },
  disconnectedPlayer: String
});

module.exports = mongoose.model('Match', matchSchema); 