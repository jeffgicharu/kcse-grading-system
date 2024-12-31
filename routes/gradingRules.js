const express = require('express');
const {
  addGradingRule,
  getGradingRules,
  updateGradingRule,
  deleteGradingRule,
  setActiveGradingRule
} = require('../controllers/gradingRuleController');

const router = express.Router();

// Route to add a new grading rule
router.post('/addGradingRule', addGradingRule);

// Route to get all grading rules
router.get('/getAllGradingRules', getGradingRules);

// Route to update a grading rule
router.put('/updateGradingRule', updateGradingRule);

// Route to delete a grading rule
router.delete('/deleteGradingRule', deleteGradingRule);

// Route to set an active grading rule
router.patch('/setActiveGradingRule', setActiveGradingRule);

module.exports = router;
