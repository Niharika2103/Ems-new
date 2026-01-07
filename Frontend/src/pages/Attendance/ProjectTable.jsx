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
  Button
} from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from "@ant-design/icons";
import {
  fetchProjectAssignments,
  ProjectFinish
} from "../../features/Project/projectsSlice";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ProjectTable = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const { assignments, loading, error } = useSelector((state) => state.project);

  const [searchText, setSearchText] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  useEffect(() => {
    dispatch(fetchProjectAssignments());
  }, [dispatch]);

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
    },
    {
      title: "Description",
      dataIndex: "projectDescription",
      key: "projectDescription",
      ellipsis: true,
      render: (desc) => <Text type="secondary">{desc || "—"}</Text>,
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
    },
    {
      title: (
        <span>
          <CalendarOutlined /> Assigned At
        </span>
      ),
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (text) => <Text>{new Date(text).toLocaleString()}</Text>,
    },

    // ✅ STATUS COLUMN (FINAL SAFE FIX)
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const isCompleted = record.status === "COMPLETED";

        const projectId = record.id || record.projectId; // 🔥 FINAL FIX

        return (
          <Button
            type={isCompleted ? "default" : "primary"}
            size="small"
            icon={isCompleted ? <CheckCircleOutlined /> : <SyncOutlined spin />}
            disabled={isCompleted}
            onClick={() => {
              if (!projectId) {
                console.error("Missing projectId:", record);
                return;
              }
              dispatch(ProjectFinish(projectId));
            }}
          >
            {isCompleted ? "Completed" : "In Progress"}
          </Button>
        );
      }
    }
  ];

  if (loading)
    return (
      <div style={{ height: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
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

  return (
    <div style={{ minHeight: "100vh", padding: screens.xs ? "16px" : "40px", display: "flex", justifyContent: "center" }}>
      <Card style={{ width: "100%", maxWidth: "1200px", borderRadius: "16px" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <Title level={3}>Project Assignments</Title>
          <Text type="secondary">Overview of employee allocations and project roles</Text>
        </div>

        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
          <Input.Search
            placeholder="Search by employee name, role, project, description, or date..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: screens.xs ? "100%" : "500px" }}
            allowClear
            size="large"
          />
        </div>

        <Table
          dataSource={filteredAssignments.map(item => ({
            ...item,
            key: item.projectId // ✅ SAFE KEY
          }))}
          columns={columns}
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  );
};

export default ProjectTable;
