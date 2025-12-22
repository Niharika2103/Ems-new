import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPanelFeedbackApi } from "../../api/authApi";

// Read-only 10-point rating display (non-interactive)
const ReadOnlyRating10 = ({ value }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-700">Rating</label>
      <span className="text-sm font-semibold text-blue-600">{value}/10</span>
    </div>
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <div
          key={n}
          className={`py-2 text-xs sm:text-sm rounded-lg border text-center font-medium ${
            n <= value
              ? "bg-blue-100 text-blue-800 border-blue-300"
              : "bg-gray-100 text-gray-400 border-gray-200"
          }`}
        >
          {n}
        </div>
      ))}
    </div>
  </div>
);

export default function PanelFeedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { interviewData } = location.state || {};

  const [existingFeedback, setExistingFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch existing feedback on mount
  useEffect(() => {
    if (!interviewData) {
      navigate("/interviews");
      return;
    }

    const fetchExistingFeedback = async () => {
      try {
        setLoading(true);
        const response = await getPanelFeedbackApi(interviewData.interview_id);
        setExistingFeedback(response.data.feedback || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
        setError("Failed to load feedback.");
        setExistingFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingFeedback();
  }, [interviewData, navigate]);

  if (!interviewData) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  const panelMembers = interviewData?.panel_members || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Feedback</h1>
          <p className="text-gray-600">
            Candidate: <span className="font-medium">{interviewData.candidate_name}</span> •
            Round: <span className="font-medium">{interviewData.round_name || "—"}</span> •
            Interview ID: {interviewData.interview_id}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        {/* Show Submitted Feedback */}
        {existingFeedback.length > 0 ? (
          <div className="space-y-6">
            {existingFeedback.map((fb) => {
              const panelist = panelMembers.find(p => p.id === fb.panel_member);
              return (
                <div key={fb.feedback_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="font-semibold text-gray-900 text-lg mb-2">
                    {panelist?.name || `Panel Member ID: ${fb.panel_member}`}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Submitted on: {new Date(fb.created_at).toLocaleString()}
                  </div>

                  <ReadOnlyRating10 value={fb.rating} />

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 italic text-gray-800">
                      “{fb.comments}”
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.002-5.824-2.572" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">No feedback submitted yet</h3>
            <p className="text-gray-600 mt-2">
              Panel members have not provided feedback for this interview.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}