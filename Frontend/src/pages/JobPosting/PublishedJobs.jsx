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
import { getPublishedJobPostsApi } from "../../api/authApi";

const PublishedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await getPublishedJobPostsApi();
      const jobList = res?.data?.jobs || [];

      // Format job object
      const formatted = jobList.map((job) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.company || "N/A",
        location: job.location,
        salary: job.salary_range,
        type: job.employment_type,
        department: job.department,
        postedOn: job.posted_on,
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
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },

    // ✅ ACTION BUTTONS
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const { status } = record;

        const handlePublish = () => {
          message.success("Job Published");
          setJobs((prev) =>
            prev.map((job) =>
              job.id === record.id ? { ...job, status: "PUBLISHED" } : job
            )
          );
        };

        const handleUnpublish = () => {
          message.warning("Job Unpublished");
          setJobs((prev) =>
            prev.map((job) =>
              job.id === record.id ? { ...job, status: "UNPUBLISHED" } : job
            )
          );
        };

        const handleArchive = () => {
          message.error("Job Archived");
          setJobs((prev) =>
            prev.map((job) =>
              job.id === record.id ? { ...job, status: "ARCHIVED" } : job
            )
          );
        };

        return (
          <Space>

            {/* Publish Button (visible for UNPUBLISHED + ARCHIVED) */}
            {(status === "UNPUBLISHED" || status === "ARCHIVED") && (
              <Button type="primary" onClick={handlePublish}>
                Publish
              </Button>
            )}

            {/* Unpublish Button (visible only for PUBLISHED) */}
            {status === "PUBLISHED" && (
              <Button onClick={handleUnpublish}>
                Unpublish
              </Button>
            )}

            {/* Archive Button (hidden if already archived) */}
            {status !== "ARCHIVED" && (
              <Button danger onClick={handleArchive}>
                Archive
              </Button>
            )}

            {/* Delete button (optional) */}
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
      <h1>Published Job Posts</h1>

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
