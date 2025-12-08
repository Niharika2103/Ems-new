import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addPanelFeedbackApi, getPanelFeedbackApi } from "../../api/authApi";

const Rating10 = ({ value, setValue }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-700">Rating</label>
      <span className="text-sm font-semibold text-blue-600">{value}/10</span>
    </div>
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setValue(n)}
          className={`py-2 text-xs sm:text-sm rounded-lg border transition-all ${
            n <= value
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } font-medium`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
);

export default function PanelFeedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { interviewData } = location.state || {};

  const [feedbackForms, setFeedbackForms] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Fetch existing feedback on mount
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
      } catch (error) {
        console.error("Failed to fetch existing feedback:", error);
        setExistingFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingFeedback();
  }, [interviewData, navigate]);

  const panelMembers = interviewData?.panel_members || [];

  // ✅ Get IDs of panel members who already submitted (from DB)
  const submittedPanelIds = existingFeedback.map(fb => fb.panel_member);

  // ✅ Get IDs of panel members who have a form (frontend only)
  const usedPanelIds = feedbackForms.map(form => form.panelMemberId);

  // ✅ Available = all panelists minus (submitted + in-form)
  const availablePanelists = panelMembers.filter(
    pm => !submittedPanelIds.includes(pm.id) && !usedPanelIds.includes(pm.id)
  );

  const handleAddFeedback = () => {
    if (availablePanelists.length === 0) return;

    const nextPanelist = availablePanelists[0];
    setFeedbackForms(prev => [
      ...prev,
      {
        id: Date.now(),
        panelMemberId: nextPanelist.id,
        panelMemberName: nextPanelist.name,
        rating: 5,
        comments: "",
      }
    ]);
  };

  const updateForm = (formId, field, value) => {
    setFeedbackForms(prev =>
      prev.map(form =>
        form.id === formId ? { ...form, [field]: value } : form
      )
    );
  };

  const removeForm = (formId) => {
    setFeedbackForms(prev => prev.filter(form => form.id !== formId));
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      // ✅ Send panel_member as ID (matches your backend)
      await addPanelFeedbackApi(interviewData.interview_id, {
        panel_member: form.panelMemberId,
        rating: form.rating,
        comments: form.comments,
      });

      setSuccessMessage(`Feedback submitted for ${form.panelMemberName}!`);

      // ✅ Refresh existing feedback after submit
      const response = await getPanelFeedbackApi(interviewData.interview_id);
      setExistingFeedback(response.data.feedback || []);

      // Remove the form
      setFeedbackForms(prev => prev.filter(f => f.id !== form.id));

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!interviewData) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

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

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-center">
            {successMessage}
          </div>
        )}

        {/* Show Already Submitted Feedback */}
        {existingFeedback.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Submitted Feedback</h3>
            <div className="space-y-3">
              {existingFeedback.map((fb) => {
                const panelist = panelMembers.find(p => p.id === fb.panel_member);
                return (
                  <div key={fb.feedback_id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">
                      {panelist?.name || `Panel ID: ${fb.panel_member}`}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Rating: {fb.rating}/10 • {new Date(fb.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-2 text-gray-800 italic">“{fb.comments}”</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Feedback Button */}
        <div className="mb-8 text-center">
          <button
            onClick={handleAddFeedback}
            disabled={availablePanelists.length === 0}
            className={`px-6 py-3 font-medium rounded-lg focus:ring-2 focus:ring-offset-2 ${
              availablePanelists.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            + Add Feedback for Panel Member
          </button>
          <p className="text-sm text-gray-600 mt-2">
            {availablePanelists.length} of {panelMembers.length} panel member(s) left
          </p>
        </div>

        {/* New Feedback Forms */}
        <div className="space-y-6">
          {feedbackForms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Feedback for: <span className="text-blue-600">{form.panelMemberName}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => removeForm(form.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panel Member
                </label>
                <input
                  type="text"
                  value={form.panelMemberName}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                />
              </div>

              <Rating10
                value={form.rating}
                setValue={(val) => updateForm(form.id, "rating", val)}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  value={form.comments}
                  onChange={(e) => updateForm(form.id, "comments", e.target.value)}
                  placeholder="Enter your feedback..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => removeForm(form.id)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(form)}
                  disabled={submitting || !form.comments.trim()}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                    submitting
                      ? "bg-gray-400"
                      : form.comments.trim()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {feedbackForms.length === 0 && availablePanelists.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-green-500 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">All feedback collected!</h3>
            <p className="text-gray-600 mt-2">
              All {panelMembers.length} panel member(s) have submitted feedback.
            </p>
            <button
              onClick={() => navigate("/interviews")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Interviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}