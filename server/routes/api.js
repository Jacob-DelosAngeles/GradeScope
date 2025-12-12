const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

router.post('/calculate', async (req, res) => {
    try {
        const { exercises, longExams, quizzes, project } = req.body;

        // Validation
        if (typeof exercises !== 'number' || !Array.isArray(longExams) || typeof quizzes !== 'number' || typeof project !== 'number') {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Calculate Average of Long Exams
        const longExamsAvg = longExams.reduce((a, b) => a + b, 0) / longExams.length;

        // Calculate Pre-Final Grade
        // Exercises (20%), Long Exams (60%), Quizzes/Assignments (5%), Project (15%)
        const preFinalGrade = (exercises * 0.20) + (longExamsAvg * 0.60) + (quizzes * 0.05) + (project * 0.15);

        // Determine Exemption
        // Exempt if Pre-Final >= 77 AND No Long Exam < 60
        const noLongExamBelow60 = longExams.every(score => score >= 60);
        const isExempt = preFinalGrade >= 77 && noLongExamBelow60;

        let requiredFinalExamScore = null;
        const targetFinalGrade = 75; // Passing Grade

        if (!isExempt) {
            // Final Grade = (Pre-Final * 0.70) + (Final Exam * 0.30)
            // 75 = (Pre-Final * 0.70) + (Final Exam * 0.30)
            // (75 - (Pre-Final * 0.70)) / 0.30 = Final Exam
            requiredFinalExamScore = (targetFinalGrade - (preFinalGrade * 0.70)) / 0.30;

            // If the result is negative or they already passed virtually (e.g. prefinal is very high but they failed a condition?), 
            // technically formula applies. But if prefinal is e.g. 90 but 1 exam < 60, isExempt is false.
            // Then required score might be low. We just return the calculated value.
        }

        // Save to DB (Optional based on requirements, but user asked for Schema so implication is to save or just use structure)
        // We will save it for "Calculation MongoDB schema" requirement context.
        const calculation = new Calculation({
            exercises,
            longExams,
            quizzes,
            project,
            preFinalGrade,
            isExempt,
            requiredFinalExamScore
        });

        await calculation.save();

        res.json({
            success: true,
            data: {
                preFinalGrade: parseFloat(preFinalGrade.toFixed(2)),
                isExempt,
                requiredFinalExamScore: requiredFinalExamScore !== null ? parseFloat(requiredFinalExamScore.toFixed(2)) : null,
                breakdown: {
                    exercises: exercises,
                    longExamsAvg: parseFloat(longExamsAvg.toFixed(2)),
                    quizzes: quizzes,
                    project: project
                }
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
