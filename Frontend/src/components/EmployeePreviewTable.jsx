import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import { Delete, Edit, Save } from "@mui/icons-material";

// Helper to safely show value from Excel cell objects
const safeValue = (val) => {
  if (!val) return "";
  if (typeof val === "object") {
    return val.text || val.result || val.richText?.map(rt => rt.text).join("") || "";
  }
  return String(val);
};

export default function EmployeePreviewTable({
  open,
  onClose,
  preview,
  rowErrors,
  editIndex,
  editRow,
  handleEdit,
  handleSave,
  handleChangeRow,
  handleDelete,
  handleAddEmployees,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Preview Employees</DialogTitle>
      <DialogContent>
        {preview.length === 0 ? (
          <Typography>No employees to preview</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Date of Joining</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>EmployementType</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.map((emp, index) => {
                const errorObj =
                  rowErrors.find((e) => e.index === index)?.errors || {};
                return (
                  <TableRow key={index}>
                    {editIndex === index ? (
                      <>
                        <TableCell>
                          <TextField
                            value={editRow.fullName || ""}
                            onChange={(e) =>
                              handleChangeRow("fullName", e.target.value)
                            }
                            error={!!errorObj.fullName}
                            helperText={errorObj.fullName}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editRow.email || ""}
                            onChange={(e) =>
                              handleChangeRow("email", e.target.value)
                            }
                            error={!!errorObj.email}
                            helperText={errorObj.email}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editRow.phone || ""}
                            onChange={(e) =>
                              handleChangeRow("phone", e.target.value)
                            }
                            error={!!errorObj.phone}
                            helperText={errorObj.phone}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editRow.address || ""}
                            onChange={(e) =>
                              handleChangeRow("address", e.target.value)
                            }
                            error={!!errorObj.address}
                            helperText={errorObj.address}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={editRow.dateOfJoining || ""}
                            onChange={(e) =>
                              handleChangeRow("dateOfJoining", e.target.value)
                            }
                            error={!!errorObj.dateOfJoining}
                            helperText={errorObj.dateOfJoining}
                            inputProps={{ max: new Date().toISOString().split("T")[0] }}

                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editRow.department || ""}
                            onChange={(e) =>
                              handleChangeRow("department", e.target.value)
                            }
                            error={!!errorObj.department}
                            helperText={errorObj.department}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editRow.designation || ""}
                            onChange={(e) => handleChangeRow("designation", e.target.value)}
                            error={!!errorObj.designation}
                            helperText={errorObj.designation}
                          />
                        </TableCell>

                        {/*  EMPLOYMENT TYPE */}
                        <TableCell>
                          <TextField
                            value={editRow.employmentType || ""}
                            onChange={(e) => handleChangeRow("employmentType", e.target.value)}
                            error={!!errorObj.employmentType}
                            helperText={errorObj.employmentType}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <IconButton onClick={() => handleSave(index)}>
                            <Save />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{safeValue(emp.fullName)}</TableCell>
                        <TableCell>{safeValue(emp.email)}</TableCell>
                        <TableCell>{safeValue(emp.phone)}</TableCell>
                        <TableCell>{safeValue(emp.address)}</TableCell>
                        <TableCell>{safeValue(emp.dateOfJoining)}</TableCell>
                        <TableCell>{safeValue(emp.department)}</TableCell>
                        <TableCell>{safeValue(emp.designation)}</TableCell>
                        <TableCell>{safeValue(emp.employmentType)}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEdit(index, emp)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(index)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handleAddEmployees}
          color="primary"
          variant="contained"
        >
          Insert All
        </Button>
      </DialogActions>
    </Dialog>
  );
}
