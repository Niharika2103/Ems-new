import React, { useState, useEffect } from 'react';
import {  Clock, AlertCircle, CheckCircle, Search, Filter, Download, Bell } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchNewEmployees } from "../../features/auth/adminSlice";
import EmployeeTable from "../../components/Probation/EmployeeTable";
import AssignProbation from '../../components/Probation/AssignProbation';
import { fetchassignProbation } from "../../features/Salarystructure/salaryStructureSlice";
import EmployeeDetailView from "../../components/Probation/EmployeeDetailView";
import { getProbationDashboardCountsApi } from "../../api/authApi";


const ProbationManagementSystem = () => {
  const dispatch = useDispatch();
  const { newEmpList, loading } = useSelector((state) => state.admin);
  const { list } = useSelector((state) => state.salaryInfo);
  console.log(list, "list")
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMode, setAssignMode] = useState('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewEmployee, setViewEmployee] = useState(null);      
  const [dashboardCounts, setDashboardCounts] = useState({
  active: 0,
  endingSoon: 0,
  completed: 0,
});

  useEffect(() => {
    if (activeTab === "employees") {
      dispatch(fetchNewEmployees());
    } else {
      dispatch(fetchassignProbation());
    }
  }, [activeTab, dispatch]);
  
    useEffect(() => {
      getProbationDashboardCountsApi()
        .then((res) => {
          setDashboardCounts({
            active: res.data.active,
            endingSoon: res.data.endingSoon,
            completed: res.data.completed,
          });
        })
        .catch((err) => {
          console.error("Dashboard count error", err);
        });
    }, []);




  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      extended: 'bg-purple-100 text-purple-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Active',
      pending_review: 'Pending Review',
      completed: 'Completed',
      extended: 'Extended',
      terminated: 'Terminated'
    };
    return texts[status] || status;
  };

   const filteredList = list.filter(emp => {
  const name = (emp.name || "").toLowerCase();
  const empId = (
    emp.employeeId ||
    emp.employee_id ||
    emp.user_id ||
    ""
  ).toLowerCase();

  const matchesSearch =
    name.includes(searchTerm.toLowerCase()) ||
    empId.includes(searchTerm.toLowerCase());

  const matchesFilter =
    filterStatus === "all" || emp.status === filterStatus;

  return matchesSearch && matchesFilter;
});





  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className=" rounded-lg p-6 mb-6">
          <div className=" flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Probation Management</h1>
              <p className="text-gray-600 mt-1">Track and manage employee probation periods</p>
            </div>
            <div className="flex gap-3">
              {/* <button onClick={() => setShowAssignModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <UserPlus size={18} />
                Assign Probation
              </button> */}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Active Probations</p>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="text-blue-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {dashboardCounts.active}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Ending Soon</p>
                <div className="bg-red-100 p-2 rounded-lg">
                  <Bell className="text-red-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {dashboardCounts.endingSoon}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Completed</p>
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {dashboardCounts.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-6 py-4 font-medium border-b-2 transition ${activeTab === 'employees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
              >
                New Employee List
              </button>
              <button
                onClick={() => setActiveTab('probation')}
                className={`px-6 py-4 font-medium border-b-2 transition ${activeTab === 'probation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
              >
                Probation List
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">{activeTab === 'probation' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="completed">Completed</option>
                    <option value="extended">Extended</option>
                  </select>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                <Download size={18} />
                Export
              </button>
            </div>

            <EmployeeTable
              data={filteredList}
              // onActionClick={setSelectedEmployee}
              onActionClick={(emp) => setViewEmployee(emp)}

              showAssignAction={false}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />


            {newEmpList.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No probation records found</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">All Employees</h3>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                <Download size={18} />
                Export
              </button>
            </div>

            <EmployeeTable
              data={newEmpList}
              onActionClick={(emp) => {
                setAssignMode('existing');
                setShowAssignModal(true);
                setSelectedEmployee(emp);

              }}
              showAssignAction={true}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />

          </>
        )}
        </div>
      </div>
      {showAssignModal && (
        <AssignProbation employee={selectedEmployee} modalTitle="Assign Probation" onClose={() => {
        setShowAssignModal(false);
        setSelectedEmployee(null);
      }}  />
      )}

     {viewEmployee && (
  <EmployeeDetailView
    employee={viewEmployee}
    probation={viewEmployee}
    onCloseProbation={() => setViewEmployee(null)}
  />
)}



    </div>
  );
};

export default ProbationManagementSystem;