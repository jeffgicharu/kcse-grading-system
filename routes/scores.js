const express = require('express');
const {
  addScore,
  addMultipleScores,
  getAllScores,
  getScoresByIndexNumber,
  updateScore,
  deleteScore,
} = require('../controllers/scoreController');

const router = express.Router();

// Route to add a new score
router.post('/addScore', addScore);

// Route to add multiple scores
router.post('/addMultipleScores',addMultipleScores)

// Route to get all scores
router.get('/getAllScores', getAllScores);

// Route to get scores for a specific student by index number
router.get('/getStudentScores', getScoresByIndexNumber);

// Route to update a score for a specific student and subject
router.put('/updateStudentScore', updateScore);

// Route to delete a score for a specific student and subject
router.delete('/deleteScore', deleteScore);

module.exports = router;
