const Score = require("../models/Score");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

// Add a new score
const addScore = async (req, res) => {
  try {
    const { indexNumber, subjectCode, rawScore } = req.body;

    // Ensure the student exists
    const student = await Student.findOne({ indexNumber });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Ensure the subject exists
    const subject = await Subject.findOne({ subjectCode });
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    // Check if the student is registered for the subject
    const isRegistered = student.registeredSubjects.some(
      (sub) => sub.subjectCode === subjectCode
    );
    if (!isRegistered) {
      return res.status(400).json({
        error: `Student with index number ${indexNumber} is not registered for the subject ${subjectCode} (${subject.subjectName}).`,
      });
    }

    // Check if the score for the subject already exists
    const existingScore = await Score.findOne({ indexNumber, subjectCode });
    if (existingScore) {
      return res
        .status(400)
        .json({ error: "Score for this subject already exists." });
    }

    // Determine the grade and points based on the grade boundaries
    let grade = "E";
    let points = 1;
    for (let boundary of subject.gradeBoundaries) {
      if (rawScore >= boundary.minScore && rawScore <= boundary.maxScore) {
        grade = boundary.grade;
        points = boundary.points;
        break;
      }
    }

    // Calculate the max score for the subject
    const currentMaxScore = await Score.aggregate([
      { $match: { subjectCode } },
      { $group: { _id: null, maxScore: { $max: "$rawScore" } } },
    ]);

    const maxScore =
      currentMaxScore.length > 0 ? currentMaxScore[0].maxScore : rawScore;

    // Check if the new score becomes the new max score
    if (rawScore > maxScore) {
      // Update all standard scores for the subject
      const allScores = await Score.find({ subjectCode });
      const updatedScores = allScores.map((score) => ({
        updateOne: {
          filter: { _id: score._id },
          update: {
            $set: {
              standardScore: score.points + (score.rawScore / rawScore) * 0.445,
            },
          },
        },
      }));
      await Score.bulkWrite(updatedScores);
    }

    // Calculate the standard score for the new entry
    const standardScore = points + (rawScore / maxScore) * 0.445;

    // Create a new score
    const score = new Score({
      indexNumber,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      subjectCode,
      subjectName: subject.subjectName,
      rawScore,
      grade,
      points,
      standardScore,
    });

    await score.save();
    res.status(201).json({ message: "Score added successfully!", score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMultipleScores = async (req, res) => {
  try {
    const scores = req.body; // Expecting an array of scores

    // Validate input
    if (!Array.isArray(scores) || scores.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be a non-empty array of scores." });
    }

    const results = [];
    const errors = [];

    for (const scoreData of scores) {
      const { indexNumber, subjectCode, rawScore } = scoreData;

      try {
        // Ensure the student exists
        const student = await Student.findOne({ indexNumber });
        if (!student) {
          throw new Error(`Student with index number ${indexNumber} not found.`);
        }

        // Ensure the subject exists
        const subject = await Subject.findOne({ subjectCode });
        if (!subject) {
          throw new Error(`Subject with code ${subjectCode} not found.`);
        }

        // Check if the student is registered for the subject
        const isRegistered = student.registeredSubjects.some(
          (sub) => sub.subjectCode === subjectCode
        );
        if (!isRegistered) {
          throw new Error(
            `Student with index number ${indexNumber} is not registered for the subject ${subjectCode} (${subject.subjectName}).`
          );
        }

        // Check if the score for the subject already exists
        const existingScore = await Score.findOne({ indexNumber, subjectCode });
        if (existingScore) {
          throw new Error(
            `Score for subject ${subjectCode} already exists for student ${indexNumber}.`
          );
        }

        // Determine the grade and points based on the grade boundaries
        let grade = "E";
        let points = 1;
        for (let boundary of subject.gradeBoundaries) {
          if (rawScore >= boundary.minScore && rawScore <= boundary.maxScore) {
            grade = boundary.grade;
            points = boundary.points;
            break;
          }
        }

        // Calculate the max score for the subject
        const currentMaxScore = await Score.aggregate([
          { $match: { subjectCode } },
          { $group: { _id: null, maxScore: { $max: "$rawScore" } } },
        ]);

        const maxScore =
          currentMaxScore.length > 0 ? currentMaxScore[0].maxScore : rawScore;

        // Check if the new score becomes the new max score
        if (rawScore > maxScore) {
          // Update all standard scores for the subject
          const allScores = await Score.find({ subjectCode });
          const updatedScores = allScores.map((score) => ({
            updateOne: {
              filter: { _id: score._id },
              update: {
                $set: {
                  standardScore:
                    score.points + (score.rawScore / rawScore) * 0.445,
                },
              },
            },
          }));
          await Score.bulkWrite(updatedScores);
        }

        // Calculate the standard score for the new entry
        const standardScore = points + (rawScore / maxScore) * 0.445;

        // Create a new score
        const score = new Score({
          indexNumber,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          subjectCode,
          subjectName: subject.subjectName,
          rawScore,
          grade,
          points,
          standardScore,
        });

        await score.save();
        results.push({ message: "Score added successfully!", score });
      } catch (err) {
        errors.push({ indexNumber, subjectCode, error: err.message });
      }
    }

    res.status(201).json({
      message: `${results.length} scores added successfully!`,
      results,
      errors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all scores
const getAllScores = async (req, res) => {
  try {
    const scores = await Score.find();
    res.status(200).json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a score for a student using the body
const updateScore = async (req, res) => {
  try {
    const { indexNumber, subjectCode, rawScore } = req.body;

    // Validate required fields
    if (!indexNumber || !subjectCode || rawScore === undefined) {
      return res.status(400).json({
        error: "indexNumber, subjectCode, and rawScore are required in the request body.",
      });
    }

    // Ensure the student exists
    const student = await Student.findOne({ indexNumber });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Ensure the subject exists
    const subject = await Subject.findOne({ subjectCode });
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    // Check if the student is registered for the subject
    const isRegistered = student.registeredSubjects.some(
      (sub) => sub.subjectCode === subjectCode
    );
    if (!isRegistered) {
      return res.status(400).json({
        error: `Student with index number ${indexNumber} is not registered for the subject ${subjectCode} (${subject.subjectName}).`,
      });
    }

    // Determine the grade and points based on the updated raw score
    let grade = "E";
    let points = 1;
    for (let boundary of subject.gradeBoundaries) {
      if (rawScore >= boundary.minScore && rawScore <= boundary.maxScore) {
        grade = boundary.grade;
        points = boundary.points;
        break;
      }
    }

    // Calculate the current max score
    const currentMaxScore = await Score.aggregate([
      { $match: { subjectCode } },
      { $group: { _id: null, maxScore: { $max: "$rawScore" } } },
    ]);

    const maxScore =
      currentMaxScore.length > 0 ? currentMaxScore[0].maxScore : rawScore;

    // Check if the updated score becomes the new max score
    if (rawScore > maxScore) {
      const allScores = await Score.find({ subjectCode });
      const updatedScores = allScores.map((score) => ({
        updateOne: {
          filter: { _id: score._id },
          update: {
            $set: {
              standardScore: score.points + (score.rawScore / rawScore) * 0.445,
            },
          },
        },
      }));
      await Score.bulkWrite(updatedScores);
    }

    // Calculate the standard score for the updated entry
    const standardScore = points + (rawScore / maxScore) * 0.445;

    // Update the score
    const updatedScore = await Score.findOneAndUpdate(
      { indexNumber, subjectCode },
      { rawScore, grade, points, standardScore },
      { new: true }
    );

    if (!updatedScore) {
      return res.status(404).json({ error: "Score not found." });
    }

    res
      .status(200)
      .json({ message: "Score updated successfully!", updatedScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get scores for a student by index number
const getScoresByIndexNumber = async (req, res) => {
  try {
    const { indexNumber } = req.body;

    // Fetch scores for the student
    const scores = await Score.find({ indexNumber });

    if (!scores.length) {
      return res
        .status(404)
        .json({ error: "No scores found for this student." });
    }

    res.status(200).json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a score for a student
const deleteScore = async (req, res) => {
  try {
    const { indexNumber, subjectCode } = req.body;

    // Delete the score
    const score = await Score.findOneAndDelete({ indexNumber, subjectCode });

    if (!score) {
      return res.status(404).json({ error: "Score not found." });
    }

    res.status(200).json({ message: "Score deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addScore,
  addMultipleScores,
  getAllScores,
  getScoresByIndexNumber,
  updateScore,
  deleteScore,
};
