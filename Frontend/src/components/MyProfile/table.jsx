import React, { useState, useEffect } from "react";
import { Table, Input, Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployees } from "../../features/employeesDetails/employeesSlice";
import { fetchallAdmin } from "../../features/auth/authSlice";

const EmployeeTable = ({ columns }) => {
  const dispatch = useDispatch();

  const { list = [], loading = false } = useSelector((state) => ({
    list: state.auth?.list?.length
      ? state.auth.list
      : state.employeeDetails?.list || [],
    loading: state.auth?.loading || state.employeeDetails?.loading || false,
  }));

  const [searchText, setSearchText] = useState("");

  const role =
    useSelector((state) => state.adminSlice?.role) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role) ||
    localStorage.getItem("role");

  // Fetch employees or admins depending on role
  useEffect(() => {
    if (role === "superadmin") {
      dispatch(fetchallAdmin());
    } else {
      dispatch(fetchAllEmployees());
    }
  }, [dispatch, role]);

  // Upload Excel (stubbed, backend integration needed)
  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      console.log("Excel Data:", rows);
      message.success("Excel parsed successfully (connect backend to save)");
    };
    reader.readAsBinaryString(file);
    return false; // prevent auto-upload
  };

  // Download Excel Template (only headers, no data)
  const handleDownload = () => {
    // Common headers for template
    const headers = [["id", "name", "email", "address", "department", "role"]];

    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, "employee_template.xlsx");
  };

  // Search filter
  const filteredData = list.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div style={{ padding: "20px" }}>
      {/* Search */}
      <Input.Search
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 300 }}
        allowClear
      />

      {/* Download Template */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          style={{ marginLeft: 10 }}
        >
          Download Excel Template
        </Button>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </div>
  );
};

export default EmployeeTable;