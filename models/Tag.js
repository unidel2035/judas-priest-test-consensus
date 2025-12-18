const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

module.exports = mongoose.model('Tag', tagSchema);