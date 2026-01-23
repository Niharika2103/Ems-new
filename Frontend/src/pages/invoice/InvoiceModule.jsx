import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TablePagination,
} from "@mui/material";

import {
  getAllInvoicesApi,
  getInvoiceByIdApi,
  updateInvoiceStatusApi,
  generateInvoicePdfApi,
  sendInvoiceReminderApi
} from "../../api/authApi";

const InvoiceModule = () => {
  const [screen, setScreen] = useState("list"); // list | view
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Reminder popup
  const [openReminder, setOpenReminder] = useState(false);

  // Pagination
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);


  /* ======================================================
      1. LOAD ALL INVOICES ON PAGE LOAD
  ====================================================== */
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await getAllInvoicesApi();
      setInvoices(res.data);
    } catch (error) {
      console.error("Fetch invoices error:", error);
    }
  };

  /* ======================================================
      2. OPEN VIEW SCREEN
  ====================================================== */
  const handleView = async (invoice) => {
    try {
      const res = await getInvoiceByIdApi(invoice.id);
      setSelectedInvoice(res.data);
      setScreen("view");
    } catch (err) {
      console.error("View invoice error:", err);
    }
  };

  /* ======================================================
      3. APPROVE INVOICE
  ====================================================== */
  const handleApprove = async () => {
    try {
      await updateInvoiceStatusApi(selectedInvoice.id, "approved", "ADMIN");
      loadInvoices();
      setScreen("list");
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  /* ======================================================
      4. REJECT INVOICE
  ====================================================== */
  const handleReject = async () => {
    try {
      await updateInvoiceStatusApi(selectedInvoice.id, "rejected", "ADMIN");
      loadInvoices();
      setScreen("list");
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  /* ======================================================
      5. DOWNLOAD INVOICE PDF
  ====================================================== */
  const handleDownloadPdf = (invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank");
    } else {
      // Regenerate if missing
      generateInvoicePdfApi(invoice.id).then((res) => {
        window.open(res.data.pdf_url, "_blank");
      });
    }
  };

  /* ======================================================
      6. SEND PAYMENT REMINDER
  ====================================================== */
  const handleSendReminder = async () => {
    try {
      await sendInvoiceReminderApi(selectedInvoice.id);
      alert("Reminder sent!");
      setOpenReminder(false);
    } catch (err) {
      console.error("Reminder error:", err);
    }
  };
  const paginatedInvoices = invoices.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);


  /* ======================================================
      LIST SCREEN
  ====================================================== */
  const InvoiceListScreen = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Invoices
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice No.</TableCell>
            <TableCell>Freelancer</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Invoice Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedInvoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invoice_number}</TableCell>
              <TableCell>{inv.freelancer_name}</TableCell>
              <TableCell>₹{inv.net_payable}</TableCell>
              <TableCell>
                <Chip
                  label={inv.status}
                  color={
                    inv.status === "approved"
                      ? "success"
                      : inv.status === "rejected"
                      ? "error"
                      : inv.status === "paid"
                      ? "primary"
                      : "warning"
                  }
                />
              </TableCell>

              <TableCell>{inv.invoice_date}</TableCell>
              <TableCell>{inv.due_date}</TableCell>

              <TableCell>

                <Button size="small" onClick={() => handleView(inv)}>
                  View
                </Button>

                <Button size="small" onClick={() => handleDownloadPdf(inv)}>
                  PDF
                </Button>

                <Button size="small" onClick={() => { 
                  setSelectedInvoice(inv); 
                  setOpenReminder(true); 
                }}>
                  Reminder
                </Button>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
  component="div"
  count={invoices.length}
  page={page}
  onPageChange={(e, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }}
  rowsPerPageOptions={[5, 10, 25]}
/>

    </Paper>
  );

  /* ======================================================
      VIEW SCREEN
  ====================================================== */
  const ViewInvoiceScreen = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">
        Invoice: {selectedInvoice.invoice_number}
      </Typography>

      <Typography sx={{ mt: 2 }}>
        <b>Freelancer:</b> {selectedInvoice.freelancer_name}
      </Typography>
      <Typography>
        <b>Email:</b> {selectedInvoice.freelancer_email}
      </Typography>
      <Typography>
        <b>Net Payable:</b> ₹{selectedInvoice.net_payable}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Actions</Typography>

      <Button
        variant="contained"
        color="success"
        sx={{ mt: 2 }}
        onClick={handleApprove}
      >
        Approve
      </Button>

      <Button
        variant="contained"
        color="error"
        sx={{ mt: 2, ml: 2 }}
        onClick={handleReject}
      >
        Reject
      </Button>

      <Button sx={{ mt: 2, ml: 2 }} onClick={() => setScreen("list")}>
        Back
      </Button>
    </Paper>
  );

  /* ======================================================
      REMINDER POPUP
  ====================================================== */
  const ReminderDialog = () => (
    <Dialog open={openReminder} onClose={() => setOpenReminder(false)}>
      <DialogTitle>Send Payment Reminder</DialogTitle>
      <DialogContent>
        <Typography>
          Send reminder for invoice <b>{selectedInvoice?.invoice_number}</b>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenReminder(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSendReminder}>
          Send Reminder
        </Button>
      </DialogActions>
0    </Dialog>
  );

  /* ======================================================
      RENDER
  ====================================================== */
  return (
    <Box sx={{ p: 4 }}>
      {screen === "list" && <InvoiceListScreen />}
      {screen === "view" && <ViewInvoiceScreen />}
      {ReminderDialog()}
    </Box>
  );
};

export default InvoiceModule;
