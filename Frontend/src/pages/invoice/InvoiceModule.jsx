import React, { useState } from "react";
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
} from "@mui/material";

// ======================================================================
// MAIN COMPONENT
// ======================================================================
const InvoiceModule = () => {
  const [screen, setScreen] = useState("list"); // list | create | view
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      vendor: "ABC Pvt Ltd",
      amount: 11800,
      status: "Approved",
      dueDate: "2025-12-05",
      history: [
        { action: "Created", date: "2025-11-27 10:30 AM" },
        { action: "Submitted for Approval", date: "2025-11-27 10:45 AM" },
        { action: "Approved", date: "2025-11-27 12:00 PM" },
      ],
    },
  ]);

  // Create screen states
  const [items, setItems] = useState([{ description: "", qty: 1, rate: 0 }]);
  const [vendor, setVendor] = useState("");
  const [gst, setGst] = useState(18);
  const [tds, setTds] = useState(1);

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const gstAmount = (subtotal * gst) / 100;
  const tdsAmount = (subtotal * tds) / 100;
  const total = subtotal + gstAmount - tdsAmount;

  // =========================== PDF & REMINDERS ===========================
  const [openReminder, setOpenReminder] = useState(false);
  const [reminderInvoice, setReminderInvoice] = useState(null);

  // PDF DOWNLOAD (Simple & works everywhere)
  const handlePdfDownload = (invoice) => {
    const html = `
      <html>
        <head><title>Invoice ${invoice.id}</title></head>
        <body>
          <h1>Invoice #${invoice.id}</h1>
          <p><b>Vendor:</b> ${invoice.vendor}</p>
          <p><b>Amount:</b> ₹${invoice.amount}</p>
          <p><b>Status:</b> ${invoice.status}</p>
        </body>
      </html>
    `;

    const newWindow = window.open("", "_blank");
    newWindow.document.write(html);
    newWindow.print();
  };

  const handleSendReminder = () => {
    alert(`Payment reminder sent for Invoice #${reminderInvoice.id}`);
    setOpenReminder(false);
  };

  // ======================================================================
  // CREATE INVOICE
  // ======================================================================
  const handleCreateInvoice = () => {
    const newInvoice = {
      id: invoices.length + 1,
      vendor,
      amount: total,
      status: "Submitted",
      dueDate: "2025-12-10",
      history: [
        { action: "Created", date: new Date().toLocaleString() },
        { action: "Submitted for Approval", date: new Date().toLocaleString() },
      ],
      details: {
        items,
        gst,
        tds,
        subtotal,
        gstAmount,
        tdsAmount,
        total,
      },
    };
    setInvoices([...invoices, newInvoice]);
    setScreen("list");
  };

  // ======================================================================
  // APPROVE / REJECT
  // ======================================================================
  const handleApprove = () => {
    const updated = invoices.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            status: "Approved",
            history: [
              ...inv.history,
              { action: "Approved", date: new Date().toLocaleString() },
            ],
          }
        : inv
    );
    setInvoices(updated);
    setScreen("list");
  };

  const handleReject = () => {
    const updated = invoices.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            status: "Rejected",
            history: [
              ...inv.history,
              { action: "Rejected", date: new Date().toLocaleString() },
            ],
          }
        : inv
    );
    setInvoices(updated);
    setScreen("list");
  };

  // ======================================================================
  // SCREENS
  // ======================================================================

  // ------------------------ CREATE SCREEN ---------------------------
  const CreateInvoiceScreen = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Invoice
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Vendor Name"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </Grid>

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Description"
                value={item.description}
                onChange={(e) => {
                  const copy = [...items];
                  copy[index].description = e.target.value;
                  setItems(copy);
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                type="number"
                label="Qty"
                value={item.qty}
                onChange={(e) => {
                  const copy = [...items];
                  copy[index].qty = Number(e.target.value);
                  setItems(copy);
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                type="number"
                label="Rate"
                value={item.rate}
                onChange={(e) => {
                  const copy = [...items];
                  copy[index].rate = Number(e.target.value);
                  setItems(copy);
                }}
              />
            </Grid>
          </React.Fragment>
        ))}

        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={() =>
              setItems([...items, { description: "", qty: 1, rate: 0 }])
            }
          >
            + Add Item
          </Button>
        </Grid>

        <Grid item xs={4}>
          <TextField
            fullWidth
            type="number"
            label="GST %"
            value={gst}
            onChange={(e) => setGst(Number(e.target.value))}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            fullWidth
            type="number"
            label="TDS %"
            value={tds}
            onChange={(e) => setTds(Number(e.target.value))}
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography>Subtotal: ₹{subtotal}</Typography>
          <Typography>GST: ₹{gstAmount}</Typography>
          <Typography>TDS: -₹{tdsAmount}</Typography>
          <Typography variant="h6">Total: ₹{total}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={handleCreateInvoice}>
            Submit for Approval
          </Button>
          <Button sx={{ ml: 2 }} onClick={() => setScreen("list")}>
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  // ------------------------ LIST SCREEN ---------------------------
  const InvoiceListScreen = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">Invoices</Typography>

      

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice ID</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.id}</TableCell>
              <TableCell>{inv.vendor}</TableCell>
              <TableCell>₹{inv.amount}</TableCell>
              <TableCell>
                <Chip
                  label={inv.status}
                  color={
                    inv.status === "Approved"
                      ? "success"
                      : inv.status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                />
              </TableCell>
              <TableCell>{inv.dueDate}</TableCell>

              <TableCell>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedInvoice(inv);
                    setScreen("view");
                  }}
                >
                  View
                </Button>

                <Button size="small" onClick={() => handlePdfDownload(inv)}>
                  PDF
                </Button>

                <Button
                  size="small"
                  onClick={() => {
                    setReminderInvoice(inv);
                    setOpenReminder(true);
                  }}
                >
                  Reminder
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  // ------------------------ VIEW SCREEN ---------------------------
  const ViewInvoiceScreen = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">Invoice #{selectedInvoice.id}</Typography>

      <Typography sx={{ mt: 2 }}>
        Vendor: <b>{selectedInvoice.vendor}</b>
      </Typography>
      <Typography>Amount: ₹{selectedInvoice.amount}</Typography>
      <Typography>Status: {selectedInvoice.status}</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Approval History</Typography>
      {selectedInvoice.history.map((h, idx) => (
        <Typography key={idx}>
          • {h.action} — {h.date}
        </Typography>
      ))}

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" color="success" onClick={handleApprove}>
        Approve
      </Button>

      <Button
        variant="contained"
        color="error"
        sx={{ ml: 2 }}
        onClick={handleReject}
      >
        Reject
      </Button>

      <Button sx={{ ml: 2 }} onClick={() => setScreen("list")}>
        Back
      </Button>
    </Paper>
  );

  // ======================================================================
  // REMINDER POPUP
  // ======================================================================
  const ReminderDialog = () => (
    <Dialog open={openReminder} onClose={() => setOpenReminder(false)}>
      <DialogTitle>Send Payment Reminder</DialogTitle>
      <DialogContent>
        <Typography>
          Send reminder for Invoice #{reminderInvoice?.id} to{" "}
          <b>{reminderInvoice?.vendor}</b>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenReminder(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSendReminder}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ======================================================================
  // RETURN FINAL UI
  // ======================================================================
  return (
    <Box sx={{ p: 4 }}>
      {screen === "list" && <InvoiceListScreen />}
      {screen === "create" && <CreateInvoiceScreen />}
      {screen === "view" && <ViewInvoiceScreen />}
      {ReminderDialog()}
    </Box>
  );
};

export default InvoiceModule;
