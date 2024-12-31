const Result = require('../models/Result');
const Score = require('../models/Score');
const Student = require('../models/Student');
const GradingRule = require('../models/GradingRule');

// Calculate Performance Index using best 7 subjects' standard scores
const calculatePerformanceIndex = (selectedSubjects) => {
  const best7 = selectedSubjects.slice(0, 7);
  return Number(best7.reduce((sum, subject) => sum + subject.standardScore, 0).toFixed(3));
};

// Calculate and save results for a student
const calculateResult = async (req, res) => {
  try {
    const { indexNumber } = req.body;

    // Ensure the student exists
    const student = await Student.findOne({ indexNumber });
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Retrieve all scores for the student
    const scores = await Score.find({ indexNumber });
    if (scores.length < 7) {
      return res.status(400).json({ error: 'Student does not have enough scores to calculate results.' });
    }

    // Retrieve the active grading rule
    const gradingRule = await GradingRule.findOne({ isActive: true });
    if (!gradingRule) {
      return res.status(400).json({ error: 'No active grading rule found.' });
    }

    const selectedSubjects = [];
    const usedSubjectCodes = new Set();

    // Group I (Compulsory subjects)
    const compulsorySubjects = scores.filter(score => 
      student.registeredSubjects.some(sub => 
        sub.subjectCode === score.subjectCode && sub.group === 'I'));
    selectedSubjects.push(...compulsorySubjects);
    compulsorySubjects.forEach(sub => usedSubjectCodes.add(sub.subjectCode));

    // Group II (Best 2 sciences)
    const sciences = scores.filter(score => 
      student.registeredSubjects.some(sub => 
        sub.subjectCode === score.subjectCode && sub.group === 'II'))
      .sort((a, b) => {
        if (b.standardScore !== a.standardScore) {
          return b.standardScore - a.standardScore;
        }
        return b.points - a.points;
      });
    selectedSubjects.push(...sciences.slice(0, 2));
    sciences.slice(0, 2).forEach(sub => usedSubjectCodes.add(sub.subjectCode));

    // Group III (Best humanity)
    const humanities = scores.filter(score => 
      student.registeredSubjects.some(sub => 
        sub.subjectCode === score.subjectCode && sub.group === 'III'))
      .sort((a, b) => {
        if (b.standardScore !== a.standardScore) {
          return b.standardScore - a.standardScore;
        }
        return b.points - a.points;
      });
    if (humanities.length > 0) {
      selectedSubjects.push(humanities[0]);
      usedSubjectCodes.add(humanities[0].subjectCode);
    }

    // Best remaining subject (if needed to reach 7)
    if (selectedSubjects.length < 7) {
      const remainingSubjects = scores
        .filter(score => !usedSubjectCodes.has(score.subjectCode))
        .sort((a, b) => {
          if (b.standardScore !== a.standardScore) {
            return b.standardScore - a.standardScore;
          }
          return b.points - a.points;
        });
      
      const neededSubjects = remainingSubjects.slice(0, 7 - selectedSubjects.length);
      selectedSubjects.push(...neededSubjects);
      neededSubjects.forEach(sub => usedSubjectCodes.add(sub.subjectCode));
    }

    // Ensure exactly 7 subjects are selected
    if (selectedSubjects.length !== 7) {
      throw new Error(`Invalid number of subjects selected: ${selectedSubjects.length}. Expected 7.`);
    }

    // Calculate the Aggregate Points (AGP) from best 7
    const aggregatePoints = selectedSubjects
      .slice(0, 7)
      .reduce((sum, subject) => sum + subject.points, 0);

    // Determine the Mean Grade
    let meanGrade = 'E';
    const gradeTable = [
      { range: [81, 84], grade: 'A' },
      { range: [74, 80], grade: 'A-' },
      { range: [67, 73], grade: 'B+' },
      { range: [60, 66], grade: 'B' },
      { range: [53, 59], grade: 'B-' },
      { range: [46, 52], grade: 'C+' },
      { range: [39, 45], grade: 'C' },
      { range: [32, 38], grade: 'C-' },
      { range: [25, 31], grade: 'D+' },
      { range: [18, 24], grade: 'D' },
      { range: [11, 17], grade: 'D-' },
      { range: [7, 10], grade: 'E' },
    ];

    for (let { range, grade } of gradeTable) {
      if (aggregatePoints >= range[0] && aggregatePoints <= range[1]) {
        meanGrade = grade;
        break;
      }
    }

    // Calculate Performance Index from best 7
    const performanceIndex = calculatePerformanceIndex(selectedSubjects);

    // Save the result
    const result = await Result.findOneAndUpdate(
      { indexNumber },
      {
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          numberOfSubjects: scores.length,
          aggregatePoints,
          meanGrade,
          performanceIndex,
          selectedSubjects: selectedSubjects.slice(0, 7),
      },
      { new: true, upsert: true } // creates new doc if none exists, returns updated doc
  );

    await result.save();

    res.status(201).json({ message: 'Result calculated successfully!', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the result for a student
const getResult = async (req, res) => {
  try {
    const { indexNumber } = req.body;
    const result = await Result.findOne({ indexNumber });
    if (!result) {
      return res.status(404).json({ error: 'Result not found.' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get results for all students
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find();
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No results found.' });
    }
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  calculateResult,
  getAllResults,
  getResult,
};