const mongoose = require('mongoose');

const VoterHistorySchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'voters',
      required: true,
    },
    referendum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'referendums',
      required: true,
    },
    referendum_id: { type: Number, required: true },
    optionId: {
      type: Number,
      required: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


VoterHistorySchema.index({ voter: 1, referendum: 1 }, { unique: true });
module.exports = mongoose.model('voterHistory', VoterHistorySchema);
