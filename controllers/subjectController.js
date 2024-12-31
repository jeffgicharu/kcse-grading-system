const Subject = require('../models/Subject');

// Add a new subject
const addSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, shortForm, group, description, gradeBoundaries } = req.body;

    // Check if the subject already exists
    const existingSubject = await Subject.findOne({ subjectCode });
    if (existingSubject) {
      return res.status(400).json({ error: 'Subject with this code already exists.' });
    }

    // Create a new subject
    const subject = new Subject({
      subjectCode,
      subjectName,
      shortForm,
      group,
      description,
      gradeBoundaries,
    });

    // Save to the database
    await subject.save();
    res.status(201).json({ message: 'Subject added successfully!', subject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add subjects in batches
const addSubjectsInBatch = async (req, res) => {
  try {
    const subjects = req.body;

    // Validate input is an array
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of subjects.' });
    }

    // Validate each subject
    const validationErrors = [];
    const validSubjects = [];

    for (const subject of subjects) {
      const { subjectCode, subjectName, shortForm, group, description, gradeBoundaries } = subject;

      // Check for required fields
      if (!subjectCode || !subjectName || !shortForm || !group || !gradeBoundaries) {
        validationErrors.push({
          subjectCode,
          error: 'Missing required fields.',
        });
        continue;
      }

      // Check for duplicates in the database
      const existingSubject = await Subject.findOne({ subjectCode });
      if (existingSubject) {
        validationErrors.push({
          subjectCode,
          error: 'Subject with this code already exists.',
        });
        continue;
      }

      // Add valid subject to the list
      validSubjects.push(subject);
    }

    // If no valid subjects, return validation errors
    if (validSubjects.length === 0) {
      return res.status(400).json({
        message: 'No subjects were added.',
        validationErrors,
      });
    }

    // Save all valid subjects in batch
    await Subject.insertMany(validSubjects);

    res.status(201).json({
      message: `${validSubjects.length} subjects added successfully!`,
      validationErrors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a subject by code
const getSubjectByCode = async (req, res) => {
  try {
    const { subjectCode } = req.body;
    const subject = await Subject.findOne({ subjectCode });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a subject by code using the body
const updateSubject = async (req, res) => {
  try {
    const { subjectCode, ...updatedData } = req.body;

    // Ensure the subjectCode is provided
    if (!subjectCode) {
      return res.status(400).json({ error: 'Subject code is required in the request body.' });
    }

    // Find and update the subject
    const subject = await Subject.findOneAndUpdate({ subjectCode }, updatedData, { new: true });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.status(200).json({ message: 'Subject updated successfully!', subject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete a subject by code
const deleteSubject = async (req, res) => {
  try {
    const { subjectCode } = req.body;

    const subject = await Subject.findOneAndDelete({ subjectCode });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.status(200).json({ message: 'Subject deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  addSubject,
  addSubjectsInBatch,
  getSubjects,
  getSubjectByCode,
  updateSubject,
  deleteSubject,
};
