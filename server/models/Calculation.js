const mongoose = require('mongoose');

const CalculationSchema = new mongoose.Schema({
    exercises: { type: Number, required: true },
    longExams: [{ type: Number, required: true }],
    quizzes: { type: Number, required: true },
    project: { type: Number, required: true },
    preFinalGrade: { type: Number, required: true },
    isExempt: { type: Boolean, required: true },
    requiredFinalExamScore: { type: Number, default: null }, // Null if exempt
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Calculation', CalculationSchema);
