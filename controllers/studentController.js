const Student = require('../models/Student');

// Add a new student
const addStudent = async (req, res) => {
  try {
    const { indexNumber, firstName, middleName, lastName, gender, dateOfBirth, school, registrationYear, registeredSubjects } = req.body;

    // Check if the student already exists
    const existingStudent = await Student.findOne({ indexNumber });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this index number already exists.' });
    }

    // Create a new student
    const student = new Student({
      indexNumber,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      school,
      registrationYear,
      registeredSubjects,
    });

    // Save to the database
    await student.save();
    res.status(201).json({ message: 'Student added successfully!', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add students in batches
const addStudentsInBatch = async (req, res) => {
  try {
    const students = req.body;

    // Validate input is an array
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of students.' });
    }

    // Validate each student
    const validationErrors = [];
    const validStudents = [];

    for (const student of students) {
      const { indexNumber, firstName, gender, dateOfBirth, school, registrationYear, registeredSubjects } = student;

      // Check for required fields
      if (!indexNumber || !firstName || !gender || !dateOfBirth || !school || !registrationYear || !registeredSubjects) {
        validationErrors.push({
          indexNumber,
          error: 'Missing required fields.',
        });
        continue;
      }

      // Check for duplicates in the database
      const existingStudent = await Student.findOne({ indexNumber });
      if (existingStudent) {
        validationErrors.push({
          indexNumber,
          error: 'Student with this index number already exists.',
        });
        continue;
      }

      // Add valid student to the list
      validStudents.push(student);
    }

    // If no valid students, return validation errors
    if (validStudents.length === 0) {
      return res.status(400).json({
        message: 'No students were added.',
        validationErrors,
      });
    }

    // Save all valid students in batch
    await Student.insertMany(validStudents);

    res.status(201).json({
      message: `${validStudents.length} students added successfully!`,
      validationErrors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a student by index number
const getStudentByIndexNumber = async (req, res) => {
  try {
    const { indexNumber } = req.body;
    const student = await Student.findOne({ indexNumber });

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a student by index number using the body
const updateStudent = async (req, res) => {
  try {
    const { indexNumber, ...updatedData } = req.body;

    // Ensure the indexNumber is provided
    if (!indexNumber) {
      return res.status(400).json({ error: 'Index number is required in the request body.' });
    }

    // Find and update the student
    const student = await Student.findOneAndUpdate({ indexNumber }, updatedData, { new: true });

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(200).json({ message: 'Student updated successfully!', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete a student by index number
const deleteStudent = async (req, res) => {
  try {
    const { indexNumber } = req.body;

    const student = await Student.findOneAndDelete({ indexNumber });

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(200).json({ message: 'Student deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addStudent,
  getStudents,
  getStudentByIndexNumber,
  updateStudent,
  deleteStudent,
  addStudentsInBatch
};
