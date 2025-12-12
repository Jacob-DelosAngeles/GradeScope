const calculationLogic = (exercises, longExams, quizzes, project) => {
    const longExamsAvg = longExams.reduce((a, b) => a + b, 0) / longExams.length;
    const preFinalGrade = (exercises * 0.20) + (longExamsAvg * 0.60) + (quizzes * 0.05) + (project * 0.15);
    const noLongExamBelow60 = longExams.every(score => score >= 60);
    const isExempt = preFinalGrade >= 77 && noLongExamBelow60;

    let requiredFinalExamScore = null;
    if (!isExempt) {
        requiredFinalExamScore = (75 - (preFinalGrade * 0.70)) / 0.30;
    }

    return { preFinalGrade, isExempt, requiredFinalExamScore };
};

// Test Cases
const cases = [
    {
        name: "Case 1: Exempt (All high)",
        inputs: { exercises: 90, longExams: [80, 85, 90], quizzes: 90, project: 90 },
        expected: { exempt: true }
    },
    {
        name: "Case 2: Not Exempt (Low Pre-Final)",
        inputs: { exercises: 60, longExams: [60, 60, 60], quizzes: 60, project: 60 },
        expected: { exempt: false }
    },
    {
        name: "Case 3: Not Exempt (High Average but one low exam)",
        inputs: { exercises: 90, longExams: [90, 50, 95], quizzes: 90, project: 90 }, // Avg: 78.3, PreFinal > 77, but one 50
        expected: { exempt: false }
    }
];

cases.forEach(c => {
    const { exercises, longExams, quizzes, project } = c.inputs;
    const result = calculationLogic(exercises, longExams, quizzes, project);
    console.log(`Running ${c.name}`);
    console.log(`Inputs:`, c.inputs);
    console.log(`Result:`, result);

    if (result.isExempt !== c.expected.exempt) {
        console.error(`FAILED: Expected exempt=${c.expected.exempt}, got ${result.isExempt}`);
    } else {
        console.log(`PASSED`);
    }
    console.log('---');
});
