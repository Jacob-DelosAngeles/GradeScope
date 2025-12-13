const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

// Dynamic Calculation Endpoint
router.post('/calculate', async (req, res) => {
    try {
        const { components } = req.body; // Expecting array of { name, weight, scores: [] }

        // 1. Basic Validation
        if (!components || !Array.isArray(components) || components.length === 0) {
            return res.status(400).json({ error: 'Invalid input: Components array is required.' });
        }

        // 2. Weight Validation
        const totalWeight = components.reduce((sum, comp) => sum + parseFloat(comp.weight || 0), 0);
        // Allow small float error or strict? Strict 100 seems requested.
        if (Math.abs(totalWeight - 100) > 0.1) {
            return res.status(400).json({ error: `Total weight must be exactly 100%. Current: ${totalWeight}%` });
        }

        // 3. Calculation
        // Helper to calculate average of a scores array
        const getAvg = (arr) => {
            if (!arr || arr.length === 0) return 0;
            const validNums = arr.filter(n => n !== '' && !isNaN(parseFloat(n))).map(n => parseFloat(n));
            if (validNums.length === 0) return 0;
            return validNums.reduce((a, b) => a + b, 0) / validNums.length;
        };

        let preFinalGrade = 0;
        let hasFailingComponent = false;

        const processedComponents = components.map(comp => {
            const avg = getAvg(comp.scores);
            const contribution = avg * (parseFloat(comp.weight) / 100);
            preFinalGrade += contribution;

            if (avg < 60) hasFailingComponent = true;

            return {
                name: comp.name,
                weight: comp.weight,
                scores: comp.scores,
                average: parseFloat(avg.toFixed(2))
            };
        });

        // 4. Exemption Logic (Updated)
        // Exempt if Pre-Final >= 77 AND No Component Average < 60
        const isExempt = preFinalGrade >= 77 && !hasFailingComponent;

        let requiredFinalExamScore = null;
        const targetFinalGrade = 60;

        if (!isExempt) {
            // Formula: 60 = (Pre-Final * 0.70) + (Final Exam * 0.30)
            requiredFinalExamScore = (targetFinalGrade - (preFinalGrade * 0.70)) / 0.30;
        }

        const responseData = {
            preFinalGrade: parseFloat(preFinalGrade.toFixed(2)),
            isExempt,
            requiredFinalExamScore: requiredFinalExamScore !== null ? parseFloat(requiredFinalExamScore.toFixed(2)) : null,
            breakdown: processedComponents // Return full breakdown for UI
        };

        // 5. Save to DB
        const Calculation = require('../models/Calculation');
        const calculation = new Calculation({
            components: processedComponents,
            preFinalGrade,
            isExempt,
            requiredFinalExamScore
        });

        calculation.save().catch(err => console.error("DB Save Error:", err.message));

        res.json({ success: true, data: responseData });

    } catch (err) {
        console.error("Calculation Error:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});


// NEW: Save Feedback
router.post('/feedback', async (req, res) => {
    try {
        const { message, rating, contact } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const Feedback = require('../models/Feedback');
        const feedback = new Feedback({ message, rating, contact });
        await feedback.save();
        res.json({ success: true, message: 'Feedback received!' });
    } catch (err) {
        console.error("Feedback Error:", err);
        res.status(500).json({ error: 'Failed to save feedback: ' + err.message });
    }
});

// NEW: Subscribe Email
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Simple regex check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });

        const Subscriber = require('../models/Subscriber');
        // Check for duplicate
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.json({ success: true, message: 'You are already subscribed!' });
        }

        const subscriber = new Subscriber({ email });
        await subscriber.save();
        res.json({ success: true, message: 'Subscribed successfully!' });
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ success: true, message: 'You are already subscribed!' });
        }
        console.error("Subscribe Error:", err);
        res.status(500).json({ error: 'Failed to subscribe: ' + err.message });
    }
});

// NEW: Request Results via Email
router.post('/send-results', async (req, res) => {
    try {
        const { email, result } = req.body;
        if (!email || !result) return res.status(400).json({ error: 'Email and Result data required' });

        const ResultRequest = require('../models/ResultRequest');
        // Save the request
        const request = new ResultRequest({ email, resultData: result });
        await request.save();

        // Also subscribe them if not exists (optional, but good for growth)
        const Subscriber = require('../models/Subscriber');
        const existingSub = await Subscriber.findOne({ email });
        if (!existingSub) {
            await new Subscriber({ email }).save();
        }

        res.json({ success: true, message: 'Results sent to ' + email });
    } catch (err) {
        console.error("Send Results Error:", err);
        res.status(500).json({ error: 'Failed to process request: ' + err.message });
    }
});

module.exports = router;
