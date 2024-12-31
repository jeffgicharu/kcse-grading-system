const mongoose = require('mongoose');

const GradingRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: false }, // Field to track the active grading rule
  criteria: [
    {
      group: { type: Number, required: true },
      minSubjects: { type: Number, required: true },
      maxSubjects: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('GradingRule', GradingRuleSchema);
