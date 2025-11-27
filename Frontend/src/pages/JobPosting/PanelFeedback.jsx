// Professional PanelFeedback.jsx
import React, { useState, useEffect } from "react";

// ===== Mock API =====
const fetchFeedbacks = async (candidateId) => {
  return [
    { id: 1, userId: 101, userName: "Dr. Sarah Chen", communication: 4, technical: 5, problemSolving: 4, comments: "Exceptional candidate with strong technical fundamentals and excellent communication skills.", createdAt: "2025-11-26" },
    { id: 2, userId: 102, userName: "Mr. James Wilson", communication: 3, technical: 4, problemSolving: 3, comments: "Solid technical background with room for growth in problem-solving under pressure.", createdAt: "2025-11-27" },
  ];
};

const submitFeedback = async (candidateId, payload) => {
  return { ...payload, id: Math.floor(Math.random() * 100000), createdAt: new Date().toISOString() };
};

// ===== Score Aggregation =====
const getAggregatedScores = (records) => {
  if (!records.length) return null;

  const total = {
    communication: 0,
    technical: 0,
    problemSolving: 0,
  };

  records.forEach((r) => {
    total.communication += r.communication;
    total.technical += r.technical;
    total.problemSolving += r.problemSolving;
  });

  const count = records.length;

  return {
    communication: Number((total.communication / count).toFixed(1)),
    technical: Number((total.technical / count).toFixed(1)),
    problemSolving: Number((total.problemSolving / count).toFixed(1)),
    overall: Number(((total.communication + total.technical + total.problemSolving) / (3 * count)).toFixed(1)),
    count,
  };
};

// ===== Rating Component =====
const Rating = ({ label, value, setValue }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm font-semibold text-blue-600">{value}/5</span>
    </div>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setValue(n)}
          className={`flex-1 py-3 rounded-lg border transition-all duration-200 ${
            n <= value 
              ? "bg-blue-500 text-white border-blue-500 shadow-sm" 
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          } font-medium`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
);

// ===== Score Display Component =====
const ScoreDisplay = ({ label, score, maxScore = 5 }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-lg font-bold text-gray-900">{score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// ===== Main Component =====
export default function PanelFeedback({ candidateId, userRole = "panel", userId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Feedback Form State
  const [communication, setCommunication] = useState(3);
  const [technical, setTechnical] = useState(3);
  const [problemSolving, setProblemSolving] = useState(3);
  const [comments, setComments] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchFeedbacks(candidateId);
      setRecords(data);
      setLoading(false);
    };
    load();
  }, [candidateId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!comments.trim()) {
      alert("Please provide comments before submitting feedback.");
      return;
    }

    const payload = {
      userId,
      userName: `Panel-${userId}`,
      communication,
      technical,
      problemSolving,
      comments,
    };

    setSaving(true);
    const saved = await submitFeedback(candidateId, payload);
    setRecords((prev) => [...prev, saved]);
    
    // Reset form
    setCommunication(3);
    setTechnical(3);
    setProblemSolving(3);
    setComments("");
    
    setSaving(false);
  };

  const agg = getAggregatedScores(records);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Evaluation</h1>
          <p className="text-gray-600">Candidate ID: {candidateId} • Role: {userRole}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Form - Left Side */}
          {userRole === "panel" && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Evaluation</h2>
                  <p className="text-sm text-gray-600">Rate the candidate's performance across key dimensions</p>
                </div>

                <form onSubmit={onSubmit}>
                  <Rating 
                    label="Communication Skills" 
                    value={communication} 
                    setValue={setCommunication}
                  />
                  
                  <Rating 
                    label="Technical Expertise" 
                    value={technical} 
                    setValue={setTechnical}
                  />
                  
                  <Rating 
                    label="Problem Solving" 
                    value={problemSolving} 
                    setValue={setProblemSolving}
                  />

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Comments
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows="4"
                      placeholder="Provide specific feedback on strengths, areas for improvement, and overall recommendation..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                      saving 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                  >
                    {saving ? "Submitting..." : "Submit Evaluation"}
                  </button>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    Your feedback is confidential and will only be visible to authorized recruiters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scores and Feedback - Right Side */}
          <div className={`${userRole === "panel" ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {/* Overall Score Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Assessment</h2>
              
              {!agg ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No evaluations submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{agg.overall}/5</div>
                    <p className="text-gray-600">Overall Score • Based on {agg.count} evaluation(s)</p>
                  </div>

                  {/* Individual Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScoreDisplay label="Communication" score={agg.communication} />
                    <ScoreDisplay label="Technical Skills" score={agg.technical} />
                    <ScoreDisplay label="Problem Solving" score={agg.problemSolving} />
                  </div>
                </div>
              )}
            </div>

            {/* Feedback List - Only for Recruiters */}
            {userRole === "recruiter" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Panel Feedback</h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading feedback...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No feedback submitted yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((feedback) => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{feedback.userName}</h4>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600">
                              <span>Comm: <strong>{feedback.communication}/5</strong></span>
                              <span>Tech: <strong>{feedback.technical}/5</strong></span>
                              <span>Problem: <strong>{feedback.problemSolving}/5</strong></span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                          {feedback.comments}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info for Panel Members */}
            {userRole === "panel" && records.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Your individual feedback is confidential. Only recruiters can view all evaluations.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}