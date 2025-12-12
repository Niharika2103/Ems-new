// /src/pages/AssignProbation.jsx
import React, { useState,useEffect  } from "react";
import { XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createProbation } from "../../features/Salarystructure/salaryStructureSlice";


const monthsOptions = Array.from({ length: 13 }, (_, i) => i); // 0..12

// helper
const addMonthsToDate = (dateStr, months) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + Number(months));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

const AssignProbation = ({ employee = {},modalTitle="Assign Probation", onClose = () => {}, onAssigned = () => {} }) => {
  const joiningDate = employee?.dateOfJoining || employee?.joiningDate || employee?.date_of_joining || "";

  const [duration, setDuration] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [reportingManager, setReportingManager] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // NEW: track touched fields
  const [touched, setTouched] = useState({});
const dispatch = useDispatch();
  const { creating, createError, created } = useSelector((s) => s.salaryInfo);


  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // VALIDATION FUNCTION ===============================
  const validate = () => {
    const errs = {};

    // Check employee
    if (!employee?.id && !employee?.usermasterid && !employee?.employeeId) {
      errs.employee = "No employee selected";
    }

    // Start date required
    // if (!startDate) {
    //   errs.startDate = "Start date is required";
    // } else {
    //   const today = new Date().toISOString().split("T")[0];

    //   // Rule 1: start date cannot be in the past
    //   if (startDate < today) {
    //     errs.startDate = "Start date cannot be in the past";
    //   }

      // Rule 2: cannot exceed 1 year from today
    //   const limitDate = addMonthsToDate(today, 12);
    //   if (startDate > limitDate) {
    //     errs.startDate = "Start date cannot be more than 1 year from today";
    //   }

    //   // Rule 3: start date cannot be before joining date
    //   if (joiningDate) {
    //     const jd = joiningDate.split("T")[0];
    //     if (startDate < jd) {
    //       errs.startDate = `Start date cannot be before joining date (${jd})`;
    //     }
    //   }
    // }

    // Duration
    if (duration === "" || duration === null) {
      errs.duration = "Duration is required";
    } else if (Number(duration) < 0 || Number(duration) > 12) {
      errs.duration = "Duration must be 0–12 months";
    }

    // Reporting manager (required)
    if (!reportingManager.trim()) {
      errs.reportingManager = "Reporting Manager is required";
    }

    // Notes validation
    if (notes.length > 300) {
      errs.notes = "Notes cannot exceed 300 characters";
    }

    return errs;
  };

  // SUBMIT HANDLER ====================================
const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();
  setErrors(errs);

  if (Object.keys(errs).length) {
    setTouched({
      startDate: true,
      duration: true,
      reportingManager: true,
      notes: true,
    });
    return;
  }

  const endDate = addMonthsToDate(startDate, duration);

  const payload = {
    employee_id: employee?.id ?? null,
    startDate,
    endDate,
    // duration: Number(duration),
    reportingManager,
    notes,
    status: "active",
  };

  dispatch(createProbation(payload));
};
useEffect(() => {
  if (created) {
    toast.success("Probation assigned successfully!");  // 200 OK toaster
    onAssigned(created);
    onClose();
  }
}, [created]);



  const computedEndDate = startDate ? addMonthsToDate(startDate, duration) : "";

  return (
    <>
     <ToastContainer position="top-right" autoClose={3000} />
   
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

  {/* Row: Employee */}
  {errors.employee && (
    <div className="text-red-600 mb-2">{errors.employee}</div>
  )}

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label>Employee</label>
      <input
        type="text"
        value={employee?.fullName ?? employee?.name ?? employee?.email ?? ""}
        readOnly
        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
      />
    </div>

    <div>
      <label>Employee Email</label>
      <input
        type="text"
        value={employee?.email}
        readOnly
        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
      />
    </div>
  </div>

  {/* Row: Joining Date + Duration */}
  <div className="grid grid-cols-2 gap-4">

    <div>
      <label>Joining Date</label>
      <input
        type="text"
        value={joiningDate?.split("T")[0] || ""}
        readOnly
        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
      />
    </div>

    <div>
      <label>Probation Duration (months)</label>
      <select
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        onBlur={() => handleBlur("duration")}
        className={`w-full border rounded-lg px-3 py-2 ${
          touched.duration && errors.duration ? "border-red-500" : "border-gray-300"
        }`}
      >
        {monthsOptions.map((m) => (
          <option key={m} value={m}>
            {m} month{m !== 1 ? "s" : ""}
          </option>
        ))}
      </select>
      {touched.duration && errors.duration && (
        <p className="text-red-600 text-sm">{errors.duration}</p>
      )}
    </div>

  </div>

  {/* Row: Start Date + End Date */}
  <div className="grid grid-cols-2 gap-4">

    <div>
      <label>Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        onBlur={() => handleBlur("startDate")}
        min={joiningDate ? joiningDate.split("T")[0] : undefined}
        className={`w-full border rounded-lg px-3 py-2 ${
          touched.startDate && errors.startDate ? "border-red-500" : "border-gray-300"
        }`}
      />
      {touched.startDate && errors.startDate && (
        <p className="text-red-600 text-sm">{errors.startDate}</p>
      )}
    </div>

    <div>
      <label>End Date (calculated)</label>
      <input
        type="text"
        readOnly
        value={computedEndDate}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
      />
    </div>

  </div>

  {/* Reporting Manager */}
  <div>
    <label>Reporting Manager</label>
    <input
      type="text"
      value={reportingManager}
      onChange={(e) => setReportingManager(e.target.value)}
      onBlur={() => handleBlur("reportingManager")}
      className={`w-full border rounded-lg px-3 py-2 ${
        touched.reportingManager && errors.reportingManager ? "border-red-500" : "border-gray-300"
      }`}
      placeholder="Manager Name"
    />
    {touched.reportingManager && errors.reportingManager && (
      <p className="text-red-600 text-sm">{errors.reportingManager}</p>
    )}
  </div>

  {/* Notes */}
  <div>
    <label>Notes / Comments</label>
    <textarea
      rows={3}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={() => handleBlur("notes")}
      className={`w-full border rounded-lg px-3 py-2 ${
        touched.notes && errors.notes ? "border-red-500" : "border-gray-300"
      }`}
      placeholder="Additional notes..."
    />
    {touched.notes && errors.notes && (
      <p className="text-red-600 text-sm">{errors.notes}</p>
    )}
  </div>

  {/* Submit Errors */}
  {errors.submit && (
    <p className="text-red-600">{errors.submit}</p>
  )}

  {/* Buttons */}
  <div className="flex gap-3 mt-4">
    <button
      type="submit"
      disabled={submitting}
      className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60 hover:bg-blue-700"
    >
      {submitting ? "Assigning..." : "Assign Probation"}
    </button>
    <button
      type="button"
      onClick={onClose}
      className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
    >
      Cancel
    </button>
  </div>
</form>

      </div>
    </div>
     </>
  );
};

export default AssignProbation;
