import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Spin,
  Alert,
  Typography,
  Card,
  Tag,
  Grid,
  Input,
} from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { fetchProjectAssignments } from "../../features/Project/projectsSlice";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ProjectTable = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const { assignments, loading, error } = useSelector((state) => state.project);

  // Add state for search functionality
  const [searchText, setSearchText] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  useEffect(() => {
    dispatch(fetchProjectAssignments());
  }, [dispatch]);

  // Filter assignments based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = assignments.filter(item =>
        item.employeeName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.role?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.projectDescription?.toLowerCase().includes(searchText.toLowerCase()) ||
        new Date(item.assignedAt).toLocaleString().toLowerCase().includes(searchText.toLowerCase()) ||
        item.projectName?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAssignments(filtered);
    } else {
      setFilteredAssignments(assignments);
    }
  }, [assignments, searchText]);

  // Columns configuration (adjust based on screen size)
  const columns = [
    {
      title: (
        <span>
          <ProjectOutlined /> Project
        </span>
      ),
      dataIndex: "projectName",
      key: "projectName",
      render: (text) => <Text strong>{text}</Text>,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Description",
      dataIndex: "projectDescription",
      key: "projectDescription",
      ellipsis: true,
      render: (desc) => <Text type="secondary">{desc || "—"}</Text>,
      responsive: ["md", "lg"],
    },
    {
      title: (
        <span>
          <UserOutlined /> Employee
        </span>
      ),
      dataIndex: "employeeName",
      key: "employeeName",
      render: (name) => <Tag color="blue">{name}</Tag>,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: (
        <span>
          <TeamOutlined /> Role
        </span>
      ),
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="purple">{role}</Tag>,
      responsive: ["sm", "md", "lg"],
    },
    {
      title: (
        <span>
          <CalendarOutlined /> Assigned At
        </span>
      ),
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (text) => (
        <Text>{new Date(text).toLocaleString()}</Text>
      ),
      responsive: ["md", "lg"],
    },
  ];

  if (loading)
    return (
      <div
        style={{
          height: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Loading Project Assignments..." />
      </div>
    );

  if (error)
    return (
      <Alert
        message="Error Loading Projects"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );

  // Handle empty search results
  if (!loading && searchText && filteredAssignments.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: screens.xs ? "16px" : "40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "1200px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{
            padding: screens.xs ? "16px" : "32px",
          }}
        >
          <div
            style={{
              marginBottom: screens.xs ? 16 : 24,
              textAlign: "center",
            }}
          >
            <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
              Project Assignments
            </Title>
            <Text type="secondary">
              Overview of employee allocations and project roles
            </Text>
          </div>

          {/* Search Input - CENTERED */}
          <div style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'center'  // Changed to center
          }}>
            <Input.Search
              placeholder="Search by name, role, description, or date..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: screens.xs ? '100%' : '500px',  // Slightly wider for center alignment
                maxWidth: '100%'
              }}
              allowClear
            />
          </div>

          <Alert
            message="No results found"
            description={`No assignments match your search for "${searchText}"`}
            type="info"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: screens.xs ? "16px" : "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "1200px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{
          padding: screens.xs ? "16px" : "32px",
        }}
      >
        <div
          style={{
            marginBottom: screens.xs ? 16 : 24,
            textAlign: "center",
          }}
        >
          <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
            Project Assignments
          </Title>
          <Text type="secondary">
            Overview of employee allocations and project roles
          </Text>
        </div>

        {/* Search Input - CENTERED */}
        <div style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'center'  // Changed to center
        }}>
          <Input.Search
            placeholder="Search by employee name, role, project, description, or date..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: screens.xs ? '100%' : '500px',  // Slightly wider for center alignment
              maxWidth: '100%'
            }}
            allowClear
            size="large"  // Optional: makes it more prominent in the center
          />
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <Table
            dataSource={filteredAssignments.map((item) => ({
              ...item,
              key: item.projectId + item.employeeId,
            }))}
            columns={columns}
            bordered={false}
            pagination={{
              pageSize: 6,
              responsive: true,
              showSizeChanger: false,
            }}
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              minWidth: screens.xs ? "600px" : "auto",
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProjectTable;