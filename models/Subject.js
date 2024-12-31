const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true },
  shortForm: { type: String, required: true }, // Added field for short form
  group: { type: Number, required: true },
  description: { type: String },
  gradeBoundaries: [
    {
      grade: { type: String, required: true },
      minScore: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      points: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('Subject', SubjectSchema);
