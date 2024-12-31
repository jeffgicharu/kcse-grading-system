const express = require('express');
const {
  addStudent,
  addStudentsInBatch,
  getStudents,
  getStudentByIndexNumber,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const router = express.Router();

// Route to add a new student
router.post('/addSingleStudent', addStudent);

// Route to add Multiple Students
router.post('/addMultipleStudents',addStudentsInBatch)

// Route to get all students
router.get('/getAllStudents', getStudents);

// Route to get a single student by index number
router.get('/getSingleStudent', getStudentByIndexNumber);

// Route to update a student by index number
router.put('/updateStudent', updateStudent);

// Route to delete a student by index number
router.delete('/deleteStudent', deleteStudent);

module.exports = router;
