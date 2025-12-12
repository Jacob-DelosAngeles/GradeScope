import React, { useState } from 'react';

function App() {
  const [exercises, setExercises] = useState('');
  const [quizzes, setQuizzes] = useState('');
  const [project, setProject] = useState('');
  const [longExams, setLongExams] = useState(['']);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleLongExamChange = (index, value) => {
    const newLongExams = [...longExams];
    newLongExams[index] = value;
    setLongExams(newLongExams);
  };

  const addLongExam = () => {
    setLongExams([...longExams, '']);
  };

  const removeLongExam = (index) => {
    const newLongExams = longExams.filter((_, i) => i !== index);
    setLongExams(newLongExams);
  };

  const calculate = async () => {
    setError(null);
    setResult(null);

    // Basic client-side validation
    if (!exercises || !quizzes || !project || longExams.some(le => le === '')) {
      setError('Please fill in all fields.');
      return;
    }

    const payload = {
      exercises: parseFloat(exercises),
      quizzes: parseFloat(quizzes),
      project: parseFloat(project),
      longExams: longExams.map(le => parseFloat(le))
    };

    try {
      const response = await fetch('http://localhost:5000/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Calculation failed');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">GradeScoped</h1>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Exercises Grade (20%)</label>
          <input
            type="number"
            value={exercises}
            onChange={(e) => setExercises(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="0-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quizzes Grade (5%)</label>
          <input
            type="number"
            value={quizzes}
            onChange={(e) => setQuizzes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="0-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Grade (15%)</label>
          <input
            type="number"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="0-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Long Exams (60%)</label>
          {longExams.map((exam, index) => (
            <div key={index} className="flex mt-2 space-x-2">
              <input
                type="number"
                value={exam}
                onChange={(e) => handleLongExamChange(index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder={`Exam ${index + 1}`}
              />
              {longExams.length > 1 && (
                <button
                  onClick={() => removeLongExam(index)}
                  className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addLongExam}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Long Exam
          </button>
        </div>

        <button
          onClick={calculate}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 mt-4"
        >
          Calculate
        </button>

        {error && (
          <div className="text-red-600 text-sm mt-2 text-center">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mt-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Results</h2>
          <div className="space-y-2">
            <p><strong>Pre-Final Grade:</strong> {result.preFinalGrade}</p>
            <p>
              <strong>Status: </strong>
              <span className={result.isExempt ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>
                {result.isExempt ? "EXEMPT from Final Exam check" : "NOT EXEMPT"}
              </span>
            </p>
            {/* Note: User requirement said "check" in my mind but text is "student is EXEMPT... if...". 
                "Application must determine exemption status... If not exempt, calculate specific score required".
                So if Exempt, required score is not needed (or 0?).
            */}
            {!result.isExempt && (
              <div className="mt-4 p-4 bg-yellow-50 rounded text-yellow-800">
                <p className="font-semibold">Required Final Exam Score:</p>
                <p className="text-3xl font-bold">{result.requiredFinalExamScore}</p>
                <p className="text-sm mt-1">to achieve a Final Grade of 60.</p>
              </div>
            )}
            {result.isExempt && (
              <div className="mt-4 p-4 bg-green-50 rounded text-green-800">
                <p>Congratulations! You are exempt from the final exam.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
