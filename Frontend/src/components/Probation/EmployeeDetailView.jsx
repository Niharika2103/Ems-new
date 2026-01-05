import React from "react";
import { Clock, CheckCircle, XCircle, Bell } from 'lucide-react';

import { calculateDurationMonths, formatDate } from "../../utils/probationUtils";

//  const EmployeeDetailView = ({ employee = {}, probation = {}, onCloseProbation }) => (
        const EmployeeDetailView = ({
        employee = {},
        probation = {},
        onCloseProbation,
        onExtend,
        onTerminate
      }) => (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Probation Details</h2>
          <button onClick={onCloseProbation} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Employee Email</p>
              <p className="font-semibold text-lg">{employee.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Employee Name</p>
              <p className="font-semibold text-lg">{employee.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold text-lg">{employee.department}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold text-lg">{employee.designation}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Probation Timeline</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Start Date</p>
                <p className="font-semibold">{formatDate(probation.startdate)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">End Date</p>
                <p className="font-semibold">{formatDate(probation.enddate)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Duration</p>
                <p className="font-semibold">{calculateDurationMonths(probation.startdate, probation.enddate)} months</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                {/* <span className="font-semibold">{employee.progress}%</span> */}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${employee.progress}%` }}></div>
              </div>
              {/* <p className="text-sm text-gray-600 mt-2">{employee.daysRemaining} days remaining</p> */}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
            <div className="grid grid-cols-2 gap-3">
            
              {/* <button className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                <Clock size={18} />
                Extend Period
              </button> */}
              <button
                onClick={() => onExtend()}
                disabled={probation.status !== "active"}
                className={`py-2 rounded-lg flex items-center justify-center gap-2
                  ${probation.status !== "active"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
              >
                <Clock size={18} />
                Extend Period
              </button>


              {/* <button className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                <XCircle size={18} />
                Terminate
              </button> */}
              <button
              onClick={() => onTerminate()}
              disabled={probation.status !== "active"}
              className={`py-2 rounded-lg flex items-center justify-center gap-2
                ${probation.status !== "active"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
                }`}
            >
              <XCircle size={18} />
              Terminate
            </button>


            </div>
          </div>
        </div>
      </div>
    </div>
  );

export default EmployeeDetailView;
