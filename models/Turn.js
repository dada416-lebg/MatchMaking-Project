const mongoose = require('mongoose');

const turnSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  player: {
    type: String,
    enum: ['player1', 'player2'],
    required: true
  },
  move: {
    type: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
});

module.exports = mongoose.model('Turn', turnSchema); 