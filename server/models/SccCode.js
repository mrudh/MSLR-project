const mongoose = require('mongoose');

const SccCodeSchema = new mongoose.Schema({
  scc: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true, 
    trim: true 
  }, 
  used: { type: Boolean, default: false },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('sccCode', SccCodeSchema);
