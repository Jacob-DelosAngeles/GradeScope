const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    name: String,
    weight: Number,
    scores: [Number],
    average: Number
});

const calculationSchema = new mongoose.Schema({
    components: [componentSchema],
    preFinalGrade: {
        type: Number,
        required: true
    },
    isExempt: {
        type: Boolean,
        default: false
    },
    requiredFinalExamScore: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Calculation', calculationSchema);
