const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Project title is required'] },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
