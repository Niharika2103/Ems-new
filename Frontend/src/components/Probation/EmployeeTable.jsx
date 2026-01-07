import React from "react";
import {
  calculateDurationMonths,
  calculateDaysLeft,
  formatDate,
} from "../../utils/probationUtils";

const EmployeeTable = ({
  data,
  onActionClick,
  onGenerateLetter, 
  showAssignAction = false,
  getStatusColor,
  getStatusText,
  assignedEmployeeEmails = new Set(), // ✅ REQUIRED
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left py-3 px-4 font-semibold text-gray-700">
            Employee Email
          </th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">
            Name
          </th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">
            Department
          </th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">
            Position
          </th>

          {!showAssignAction && (
            <>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Start Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                End Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Duration
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Days Left
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Status
              </th>
            </>
          )}

          <th className="text-left py-3 px-4 font-semibold text-gray-700">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => {
          const daysLeft = calculateDaysLeft(item.enddate);

          // ✅ EMAIL BASED CHECK (SAFE)
          const email = item.email?.toLowerCase();
          const isAssigned =
            showAssignAction && assignedEmployeeEmails.has(email);

          return (
            <tr
              key={email}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-3 px-4 font-medium text-gray-900">
                {item.email}
              </td>
              <td className="py-3 px-4 text-gray-800">{item.name}</td>
              <td className="py-3 px-4 text-gray-600">
                {item.department}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {item.designation}
              </td>

              {!showAssignAction && (
                <>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(item.startdate)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(item.enddate)}
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    {calculateDurationMonths(
                      item.startdate,
                      item.enddate
                    )}{" "}
                    months
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        daysLeft <= 7
                          ? "text-red-600"
                          : daysLeft <= 30
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {daysLeft} days
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                </>
              )}

              <td className="py-3 px-4">
                <button
                  disabled={isAssigned}
                  onClick={() => {
                    if (!isAssigned) onActionClick(item);
                  }}
                  className={`font-medium text-sm ${
                    isAssigned
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  {showAssignAction
                    ? isAssigned
                      ? "Probation Assigned"
                      : "Assign Probation"
                    : "View Details"}
                </button>

                              {/* ✅ new button */}
  {!showAssignAction && item.status === "completed" && (
    <button
      onClick={() => onGenerateLetter(item)}

      className="text-green-600 hover:text-green-800 font-medium text-sm"
    >
      Generate Confirmation Letter
    </button>
  )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default EmployeeTable;
