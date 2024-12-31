const express = require('express');
const { calculateResult,getAllResults, getResult } = require('../controllers/resultController');

const router = express.Router();

// Route to calculate and save results for a student
router.post('/calculateResults', calculateResult);

// Route to get the result for a student
router.get('/getStudentResult', getResult);

// Route to get the result for all students
router.get('/getAllResults',getAllResults);

module.exports = router;
