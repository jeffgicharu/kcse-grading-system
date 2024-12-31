const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  indexNumber: { type: String, required: true, ref: 'Student' }, // Reference via index number
  firstName: { type: String, required: true }, // Student's first name
  middleName: { type: String },
  lastName: { type: String}, // Student's last name
  numberOfSubjects: { type: Number, required: true }, // Total number of subjects taken
  aggregatePoints: { type: Number, required: true },
  meanGrade: { type: String, required: true },
  performanceIndex: { type: Number, default: 0 },
  selectedSubjects: [ // Best 7 subjects included in the computation
    {
      subjectCode: { type: String, required: true },
      subjectName: { type: String, required: true },
      rawScore: { type: Number, required: true },
      grade: { type: String, required: true },
      points: { type: Number, required: true },
      standardScore: { type: Number, required: true }
    },
  ],
});

module.exports = mongoose.model('Result', ResultSchema);
