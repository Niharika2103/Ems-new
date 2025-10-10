import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Spin, Alert } from "antd";
import { fetchProjectAssignments } from "../../features/Project/projectsSlice";

const ProjectTable = () => {
  const dispatch = useDispatch();
  const { assignments, loading, error } = useSelector((state) => state.project); 
 
  

 
  useEffect(() => {
   
    dispatch(fetchProjectAssignments());
  }, [dispatch]);

  // Define columns for Ant Design Table
  const columns = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
    },
    {
      title: "Description",
      dataIndex: "projectDescription",
      key: "projectDescription",
    },
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Assigned At",
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  if (loading) return <Spin tip="Loading..." style={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Project Assignments</h1>
      
      <Table
        dataSource={assignments.map((item) => ({ ...item, key: item.projectId + item.employeeId }))}
        columns={columns}
        bordered
      />
    </div>
  );
};

export default ProjectTable;
