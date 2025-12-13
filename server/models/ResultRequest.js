const mongoose = require('mongoose');

const resultRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    resultData: {
        type: Object, // Stores the full JSON result
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String, // 'pending', 'sent'
        default: 'pending'
    }
});

module.exports = mongoose.model('ResultRequest', resultRequestSchema);
