const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema(
    {
        option_id: { type: Number, required: true },
        text: { type: String, required: true },
        votesCount: { type: Number, default: 0 },
    },
    { _id: false }
);

const ReferendumSchema = new mongoose.Schema(
  {
    referendum_id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    status: { type: String, default: '' },
    options: {
      type: [OptionSchema],
      validate: {
        validator: (v) => v.length >= 2,
        message: 'At least two options are required.',
      },
    },
    hasEverOpened: { type: Boolean, default: false },
    openedAt: Date,
    closedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('referendums', ReferendumSchema);
