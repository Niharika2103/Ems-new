import React, { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Input,
  Space,
  Card,
  Button,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const PublishedJobs = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      location: "Hyderabad",
      salary: "12 - 18 LPA",
      type: "Full-time",
      department: "Engineering",
      postedOn: "2025-01-10",
      status: "Published",
    },
    {
      id: 2,
      title: "HR Executive",
      company: "Amazon",
      location: "Bangalore",
      salary: "6 - 10 LPA",
      type: "Full-time",
      department: "Human Resources",
      postedOn: "2025-01-08",
      status: "Published",
    },
    {
      id: 3,
      title: "Sales Manager",
      company: "Microsoft",
      location: "Mumbai",
      salary: "10 - 15 LPA",
      type: "Full-time",
      department: "Sales",
      postedOn: "2025-01-06",
      status: "Draft",
    },
  ]);

  // Single search bar state
  const [search, setSearch] = useState("");

  // Single search filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchLower = search.toLowerCase();
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower) ||
        job.type.toLowerCase().includes(searchLower) ||
        job.salary.toLowerCase().includes(searchLower) ||
        job.status.toLowerCase().includes(searchLower)
      );
    });
  }, [search, jobs]);

  // Table columns
  const columns = [
    { title: "Job Title", dataIndex: "title", key: "title" },
    { title: "Company", dataIndex: "company", key: "company" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Job Type", dataIndex: "type", key: "type" },
    { title: "Salary", dataIndex: "salary", key: "salary" },

    {
      title: "Posted On",
      dataIndex: "postedOn",
      key: "postedOn",
      render: (date) => new Date(date).toLocaleDateString(),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Published"
            ? "green"
            : status === "Draft"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} />
          <Button icon={<EditOutlined />} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              setJobs((prev) => prev.filter((job) => job.id !== record.id))
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 30, background: "#f5f7fa", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 20 }}>Published Job Posts</h1>

      {/* 🔍 Single Search Bar */}
      <Card style={{ marginBottom: 20, padding: 20 }}>
        <Input
          placeholder="Search in all jobs..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 350 }}
        />
      </Card>

      {/* 📊 AntD Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default PublishedJobs;
