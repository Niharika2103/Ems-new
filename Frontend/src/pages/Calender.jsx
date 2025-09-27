import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // default calendar styles

export default function LeaveCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState([]);

  const handleApplyLeave = () => {
    if (!selectedDate || !reason) {
      alert("Please select a date and enter reason!");
      return;
    }

    const leave = {
      date: selectedDate.toDateString(),
      reason,
    };

    setLeaves([...leaves, leave]);
    setReason("");
  };

  // Check if date is already applied leave
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isLeave = leaves.find(
        (leave) => new Date(leave.date).toDateString() === date.toDateString()
      );
      return isLeave ? "bg-red-500 text-white rounded-full" : "";
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Leave Calendar</h2>

      {/* Calendar */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      {/* Selected Date */}
      <p className="mt-4 text-gray-700">
        Selected Date: <span className="font-semibold">{selectedDate.toDateString()}</span>
      </p>

      {/* Reason Input */}
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason for leave"
        className="border p-2 rounded w-full mt-3"
      />

      {/* Apply Button */}
      <button
        onClick={handleApplyLeave}
        className="bg-blue-600 text-white px-4 py-2 mt-3 rounded hover:bg-blue-700 w-full"
      >
        Apply Leave
      </button>

      {/* Show Applied Leaves */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">My Leaves</h3>
        <ul className="list-disc pl-5 space-y-1">
          {leaves.map((leave, index) => (
            <li key={index}>
              <span className="font-medium">{leave.date}</span> – {leave.reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
