const GradingRule = require('../models/GradingRule');

// Validate criteria
const validateCriteria = (criteria) => {
  const validGroups = [1, 2, 3, 4, 5]; // Define valid groups
  for (let { group, minSubjects, maxSubjects } of criteria) {
    if (!validGroups.includes(group)) {
      return `Invalid group ${group}. Valid groups are ${validGroups.join(', ')}.`;
    }
    if (minSubjects < 0 || maxSubjects < minSubjects) {
      return `Invalid minSubjects (${minSubjects}) or maxSubjects (${maxSubjects}).`;
    }
  }
  return null;
};


// Add a new grading rule
const addGradingRule = async (req, res) => {
  try {
    const { ruleName, description, criteria } = req.body;

    // Validate criteria
    const validationError = validateCriteria(criteria);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check if the rule already exists
    const existingRule = await GradingRule.findOne({ ruleName });
    if (existingRule) {
      return res.status(400).json({ error: 'Grading rule with this name already exists.' });
    }

    // Create a new grading rule
    const gradingRule = new GradingRule({
      ruleName,
      description,
      criteria,
    });

    await gradingRule.save();
    res.status(201).json({ message: 'Grading rule added successfully!', gradingRule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Set an active grading rule
const setActiveGradingRule = async (req, res) => {
  try {
    const { ruleId } = req.body;

    // Ensure the rule exists
    const rule = await GradingRule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ error: 'Grading rule not found.' });
    }

    // Mark all rules as inactive
    await GradingRule.updateMany({}, { $set: { isActive: false } });

    // Set the selected rule as active
    rule.isActive = true;
    await rule.save();

    res.status(200).json({ message: 'Grading rule set as active.', rule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all grading rules
const getGradingRules = async (req, res) => {
  try {
    const gradingRules = await GradingRule.find();
    res.status(200).json(gradingRules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a grading rule
const updateGradingRule = async (req, res) => {
  try {
    const { ruleId,...updatedData } = req.body;

    if(!ruleId){
      return res.status(400).json({ error: 'Rule Id is required in the request body.' });
    }

    // Update the grading rule
    const gradingRule = await GradingRule.findByIdAndUpdate(ruleId, updatedData, { new: true });

    if (!gradingRule) {
      return res.status(404).json({ error: 'Grading rule not found.' });
    }

    res.status(200).json({ message: 'Grading rule updated successfully!', gradingRule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a grading rule
const deleteGradingRule = async (req, res) => {
  try {
    const { ruleId } = req.body;

    const gradingRule = await GradingRule.findByIdAndDelete(ruleId);

    if (!gradingRule) {
      return res.status(404).json({ error: 'Grading rule not found.' });
    }

    res.status(200).json({ message: 'Grading rule deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addGradingRule,
  getGradingRules,
  updateGradingRule,
  deleteGradingRule,
  setActiveGradingRule
};
