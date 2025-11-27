import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Tag,
  Input,
  Space,
  Card,
  Button,
  message,
} from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";

// IMPORT CORRECT APIS
import {
  getAdminJobPostsApi,
  updateJobStatusApi,
} from "../../api/authApi";

const PublishedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Load all job posts
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await getAdminJobPostsApi();
      const jobList = res?.data?.jobs || [];

      const formatted = jobList.map((job) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.company || "N/A",
        location: job.location,
        salary: job.salary_range,
        type: job.employment_type,
        department: job.department,
        experience: job.experience_level,
        postedOn: job.posted_date,
        status: job.status,
      }));

      setJobs(formatted);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      message.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  // Update status API
  const updateStatus = async (jobId, newStatus) => {
    try {
      await updateJobStatusApi(jobId, newStatus);

      message.success(`Job status updated to ${newStatus}`);

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    }
  };

  // Search Filter
  const filteredJobs = useMemo(() => {
    const searchLower = search.toLowerCase();
    return jobs.filter((job) =>
      Object.values(job).some((v) =>
        String(v).toLowerCase().includes(searchLower)
      )
    );
  }, [search, jobs]);

  // Table Columns
  const columns = [
    { title: "Job Title", dataIndex: "title", key: "title" },
    { title: "Company", dataIndex: "company", key: "company" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Job Type", dataIndex: "type", key: "type" },
    { title: "Experience", dataIndex: "experience", key: "experience" },
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
      render: (status) => (
        <Tag
          color={
            status === "PUBLISHED"
              ? "green"
              : status === "UNPUBLISHED"
              ? "orange"
              : status === "DRAFT"
              ? "blue"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const { status } = record;

        return (
          <Space>
            {/* Publish */}
            {status !== "PUBLISHED" && (
              <Button
                type="primary"
                onClick={() => updateStatus(record.id, "PUBLISHED")}
              >
                Publish
              </Button>
            )}

            {/* Unpublish */}
            {status === "PUBLISHED" && (
              <Button
                onClick={() => updateStatus(record.id, "UNPUBLISHED")}
              >
                Unpublish
              </Button>
            )}

            {/* Archive */}
            {status !== "ARCHIVED" && (
              <Button
                danger
                onClick={() => updateStatus(record.id, "ARCHIVED")}
              >
                Archive
              </Button>
            )}

            {/* Delete local only */}
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                setJobs((prev) => prev.filter((j) => j.id !== record.id))
              }
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 30, background: "#f5f7fa", minHeight: "100vh" }}>
      <h1>All Job Posts</h1>

      <Card style={{ marginBottom: 20, padding: 20 }}>
        <Input
          placeholder="Search jobs..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 350 }}
        />
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default PublishedJobs;
