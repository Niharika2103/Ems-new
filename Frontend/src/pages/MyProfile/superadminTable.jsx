import React, { useState } from "react";
import { Button, Space, Popconfirm } from "antd";
import { useDispatch } from "react-redux";
import { deleteAdmin } from "../../features/auth/adminSlice"
import { fetchallAdmin, approveAdmin } from "../../features/auth/authSlice"
import EmployeeTable from "../../components/MyProfile/table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { promoteAdminToSuperadminApi } from "../../api/authApi";


export default function SuperAadminTable() {
  const dispatch = useDispatch();
  const [loadingId, setLoadingId] = useState(null);

  // Approved by superAdmin
  const handleApproveToggle = (admin, status) => {
    setLoadingId(admin.id);

    dispatch(approveAdmin({ id: admin.id, is_approved: status }))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        dispatch(fetchallAdmin());
      })
      .catch((err) => toast.error(err.error || "Failed to update approval"))
      .finally(() => setLoadingId(null));
  };
  const handlePromoteToSuperadmin = async (admin) => {
    if (!window.confirm(`Are you sure you want to promote ${admin.name} to SuperAdmin?`)) {
      return;
    }

    try {
      await promoteAdminToSuperadminApi(admin.id);
      toast.success(`${admin.name} has been promoted to SuperAdmin!`);
      dispatch(fetchallAdmin()); // Refresh the list
    } catch (err) {
      console.error("Promotion error:", err);
      toast.error(err.response?.data?.error || "Failed to promote admin");
    }
  };
  //superAdminTable


  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Request",
      dataIndex: "registrations",
      key: "request",
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Approved", value: "Approved" },
      ],
      onFilter: (value, record) => {
        const isApproved = record.registrations?.[0]?.is_approved;
        return (isApproved ? "Approved" : "Pending") === value;
      },
      render: (_registrations, record) => {
        const isApproved = record.is_approved ?? record.registrations?.[0]?.is_approved;


        return (
          <Space>
            {isApproved ? (
              <>
                <Button
                  type="primary"
                  style={{ backgroundColor: "#4ade80", borderColor: "#4ade80" }}
                  disabled
                >
                  Approved
                </Button>
                <Button
                  type="default"
                  danger
                  loading={loadingId === record.id}
                  onClick={() => handleApproveToggle(record, false)} // 🔹 Disable toggles to false
                >
                  Rejected
                </Button>
                <Button
                  type={record.role === "superadmin" ? "default" : "primary"}
                  style={{
                    backgroundColor: record.role === "superadmin" ? "#52c41a" : "",
                    color: record.role === "superadmin" ? "white" : "",
                    borderColor: record.role === "superadmin" ? "#52c41a" : "",
                  }}
                  disabled={record.role === "superadmin"}
                  onClick={() => handlePromoteToSuperadmin(record)}
                >
                  {record.role === "superadmin" ? "Promoted to SuperAdmin" : "Promote to SuperAdmin"}
                </Button>

              </>
            ) : (
              <Button
                type="primary"
                style={{ backgroundColor: "#f87171", borderColor: "#f87171" }}
                loading={loadingId === record.id}
                onClick={() => handleApproveToggle(record, true)} // 🔹 Pending toggles to true
              >
                {loadingId === record.id ? "Approving..." : "Pending"}
              </Button>
            )}
            <Popconfirm
              title={`Are you sure to ${record.is_active ? "deactivate" : "activate"} this admin?`}
              onConfirm={() =>
                dispatch(deleteAdmin({ id: record.id, status: !record.is_active }))
                  .unwrap()
                  .then((res) => {
                    toast.success(res.message);
                    dispatch(fetchallAdmin());
                  })
                  .catch(() => toast.error("Failed to update admin status"))
              }
              okText="Yes"
              cancelText="No"
            >
              {record.is_active ? (
                <Button type="primary">
                  Active
                </Button>
              ) : (
                <Button type="default" danger>
                  Deactivate
                </Button>
              )}
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-xl font-bold mb-4">Admin List</h1>
      <EmployeeTable columns={columns} />
    </>
  );
}