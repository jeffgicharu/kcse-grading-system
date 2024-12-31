const express = require('express');
const {
  addSubject,
  addSubjectsInBatch,
  getSubjects,
  getSubjectByCode,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

const router = express.Router();

// Route to add a new subject
router.post('/addSingleSubject', addSubject);

// Route to add Multiple Subjects
router.post('/addMultipleSubjects',addSubjectsInBatch);

// Route to get all subjects
router.get('/getAllSubjects', getSubjects);

// Route to get a single subject by code
router.get('/getSingleSubject', getSubjectByCode);

// Route to update a subject by code
router.put('/updateSubject', updateSubject);

// Route to delete a subject by code
router.delete('/:subjectCode', deleteSubject);

module.exports = router;
