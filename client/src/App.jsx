import React, { useState } from 'react';
import Banner from './components/Banner';

function App() {
  // Dynamic Components State
  const [components, setComponents] = useState([
    { id: 1, name: 'Exercises', weight: 20, scores: [''] },
    { id: 2, name: 'Quizzes', weight: 5, scores: [''] },
    { id: 3, name: 'Project', weight: 15, scores: [''] },
    { id: 4, name: 'Long Exams', weight: 60, scores: [''] }
  ]);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Email State
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState(null);
  const [subErrorMsg, setSubErrorMsg] = useState('');

  // --- Component Management ---

  const addComponent = () => {
    const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
    setComponents([...components, { id: newId, name: 'New Component', weight: 0, scores: [''] }]);
  };

  const removeComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const updateComponent = (id, field, value) => {
    setComponents(components.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // --- Score Management ---

  const handleScoreChange = (componentId, index, value) => {
    setComponents(components.map(c => {
      if (c.id === componentId) {
        const newScores = [...c.scores];
        newScores[index] = value;
        return { ...c, scores: newScores };
      }
      return c;
    }));
  };

  const addScoreInput = (componentId) => {
    setComponents(components.map(c =>
      c.id === componentId ? { ...c, scores: [...c.scores, ''] } : c
    ));
  };

  const removeScoreInput = (componentId, index) => {
    setComponents(components.map(c => {
      if (c.id === componentId) {
        return { ...c, scores: c.scores.filter((_, i) => i !== index) };
      }
      return c;
    }));
  };

  // --- Config ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- Calculation ---

  const calculate = async () => {
    setError(null);
    setResult(null);

    // 1. Validate Weights Sum to 100
    const totalWeight = components.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      setError(`Weights must sum to exactly 100%. Current total: ${totalWeight}%`);
      return;
    }

    // 2. Validate Scores (at least one valid number per component? strict or loose?)
    // Let's filter out empty scores before sending, but ensure structure is valid
    const cleanComponents = components.map(c => ({
      name: c.name,
      weight: parseFloat(c.weight), // Ensure number
      scores: c.scores
    }));

    try {
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components: cleanComponents })
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

  // --- Email Results ---

  const handleSendResults = async (e) => {
    e.preventDefault();
    if (!result) {
      setSubErrorMsg("Please calculate your grade first.");
      setSubStatus('error');
      return;
    }

    setSubStatus('submitting');
    try {
      const response = await fetch(`${API_URL}/api/send-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, result })
      });
      const data = await response.json();
      if (data.success) {
        setSubStatus('success');
        setEmail('');
      } else {
        setSubErrorMsg(data.error || 'Failed to send');
        setSubStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubErrorMsg('Error: ' + err.message);
      setSubStatus('error');
    }
  };

  // --- Helper for Weight Color ---
  const totalWeight = components.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) <= 0.1;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 relative">
      <h1 className="text-4xl font-bold text-blue-600 mb-4 mt-2">GradeScoped</h1>
      <Banner />

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 space-y-6">

        {/* Components List */}
        {components.map((comp) => (
          <div key={comp.id} className="border p-4 rounded-lg bg-gray-50 relative">

            {/* Component Header: Name & Weight */}
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <input
                type="text"
                value={comp.name}
                onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                className="font-bold text-lg text-gray-700 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-1/2"
              />
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-600">Weight %:</label>
                <input
                  type="number"
                  value={comp.weight}
                  onChange={(e) => updateComponent(comp.id, 'weight', e.target.value)}
                  className="w-16 p-1 border rounded text-center font-bold text-blue-600"
                />
                <button
                  onClick={() => removeComponent(comp.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove Component"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Scores Inputs */}
            <div className="space-y-2">
              {comp.scores.map((score, idx) => (
                <div key={idx} className="flex space-x-2">
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => handleScoreChange(comp.id, idx, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    placeholder={`Score ${idx + 1}`}
                  />
                  {comp.scores.length > 1 && (
                    <button
                      onClick={() => removeScoreInput(comp.id, idx)}
                      className="text-red-500 px-2 hover:bg-red-100 rounded"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addScoreInput(comp.id)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Score
              </button>
            </div>
          </div>
        ))}

        {/* Add Component Button */}
        <button
          onClick={addComponent}
          className="w-full border-2 border-dashed border-gray-300 py-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 rounded-lg transition"
        >
          + Add Grade Component
        </button>

        {/* Total Weight Status */}
        <div className={`text-right font-bold ${isWeightValid ? 'text-green-600' : 'text-red-600'}`}>
          Total Weight: {totalWeight}% {isWeightValid ? '✅' : '❌ (Must be 100%)'}
        </div>

        <button
          onClick={calculate}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 mt-4 font-bold text-lg shadow-lg"
        >
          Calculate Grade
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mt-6 border-t-4 border-blue-500 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Grade Breakdown</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">Pre-Final Grade</p>
              <p className="text-4xl font-extrabold text-blue-900">{result.preFinalGrade}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">Required Final Exam Score</p>
              {result.requiredFinalExamScore <= 0 ? (
                <div className="text-green-600">
                  <p className="text-4xl font-extrabold">{result.requiredFinalExamScore}</p>
                  <p className="text-sm font-medium">You have already passed! 🎉</p>
                </div>
              ) : result.requiredFinalExamScore > 100 ? (
                <div className="text-red-600">
                  <p className="text-4xl font-extrabold">{result.requiredFinalExamScore}</p>
                  <p className="text-sm font-medium">Mathematically impossible to pass (Needs &gt; 100)</p>
                </div>
              ) : (
                <div className="text-yellow-600">
                  <p className="text-4xl font-extrabold">{result.requiredFinalExamScore}</p>
                  <p className="text-sm font-medium">to reach passing grade (60)</p>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-bold text-gray-700 mb-2">Detailed Breakdown:</h3>
          <ul className="space-y-1 text-sm bg-gray-50 p-4 rounded">
            {result.breakdown.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b last:border-0 pb-1 mb-1 border-gray-200">
                <span>{item.name} ({item.weight}%)</span>
                <span className="font-mono font-bold">{item.average}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email Results Section */}
      <div className="mt-12 w-full max-w-2xl bg-white p-6 rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-bold text-gray-800">Receive a Copy of Your Results</h3>
        <p className="text-gray-600 text-sm mb-4">We'll send your full grade breakdown to your inbox.</p>
        <form onSubmit={handleSendResults} className="flex flex-col space-y-3 max-w-sm mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="border p-3 rounded focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          <button
            type="submit"
            disabled={subStatus === 'submitting' || subStatus === 'success'}
            className={`py-2 px-4 rounded text-white font-bold transition ${subStatus === 'success' ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {subStatus === 'submitting' ? 'Sending...' : subStatus === 'success' ? 'Sent!' : 'Email Me Results'}
          </button>
          {subStatus === 'error' && <p className="text-red-500 text-sm">{subErrorMsg}</p>}
        </form>
      </div>

    </div>
  );
}

export default App;
