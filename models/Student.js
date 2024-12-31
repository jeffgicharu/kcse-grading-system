const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  indexNumber: { type: String, required: true, unique: true }, // Unique identifier for students
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String },
  gender: { type: String, required: true, enum: ['Male', 'Female'] },
  dateOfBirth: { type: Date, required: true },
  school: { type: String, required: true }, // Name of the school
  registrationYear: { type: Number, required: true },
  registeredSubjects: [
    {
      subjectCode: { type: String, required: true },
      subjectName: { type: String, required: true },
      group: { type: Number, required: true },
    },
  ],
  numberOfSubjects: { // Dynamically calculated field
    type: Number,
    default: function () {
      return this.registeredSubjects.length;
    },
  },
});

module.exports = mongoose.model('Student', StudentSchema);
