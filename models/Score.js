const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  indexNumber: { type: String, required: true, ref: 'Student' }, // Reference via index number
  firstName: { type: String, required: true }, // Student's first name
  middleName: { type: String },
  lastName: { type: String}, // Student's last name
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  rawScore: { type: Number, required: true },
  grade: { type: String, required: true },
  points: { type: Number, required: true },
  standardScore: { type: Number, default: 0 }, // Add this field
});

module.exports = mongoose.model('Score', ScoreSchema);
