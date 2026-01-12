import React, { useState, useEffect } from "react";
import { Table, Input, Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployees } from "../../features/employeesDetails/employeesSlice";
import { fetchallAdmin } from "../../features/auth/authSlice";

const EmployeeTable = ({ columns,scroll  }) => {
  const dispatch = useDispatch();

  const { list = [], loading = false } = useSelector((state) => ({
    list: state.auth?.list?.length
      ? state.auth.list
      : state.employeeDetails?.list || [],
    loading: state.auth?.loading || state.employeeDetails?.loading || false,
  }));

  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10, // default 10 rows
  });

  // const role =
  //   useSelector((state) => state.adminSlice?.role) ||
  //   useSelector((state) => state.authSlice?.role) ||
  //   useSelector((state) => state.employeeSlice?.role) ||
  //   localStorage.getItem("role");

  const activeRole =
  localStorage.getItem("active_role") || localStorage.getItem("role");

  // Fetch employees or admins depending on role
  // useEffect(() => {
  //   if (role === "superadmin") {
  //     dispatch(fetchallAdmin());
  //   } else {
  //     dispatch(fetchAllEmployees());
  //   }
  // }, [dispatch, role]);
  useEffect(() => {
  if (activeRole === "superadmin") {
    dispatch(fetchallAdmin());
  } else {
    dispatch(fetchAllEmployees());
  }
}, [dispatch, activeRole]);




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
      {/* <div style={{ marginBottom: 16 }}>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          style={{ marginLeft: 10 }}
        >
          Download Excel Template
        </Button>
      </div> */}

      {/* Data Table */}
      <Table
      size="small" 
        columns={columns.map((col) =>
          col.dataIndex === "id"
            ? {
              ...col,
              render: (_text, _record, index) =>
                (pagination.current - 1) * pagination.pageSize + (index + 1),
            }
            : col
        )}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{
          ...pagination,
          total: filteredData.length,
          showSizeChanger: true,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
        // scroll={{x: true}}
        scroll={scroll || { x: 1000 }} // Use passed scroll prop or default
        
        sticky
      />
    </div>
  );
};

export default EmployeeTable;