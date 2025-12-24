import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const EmailTemplateEditor = () => {
  /* 🔥 API BASE FROM ENV — NO LOCALHOST HARD CODING */
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/admin";

  const [templates, setTemplates] = useState([]);
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  const categories = [
    "onboarding",
    "payslip",
    "wishes",
    "announcement",
    "remainder",
    "other",
  ];

  const languages = ["en", "es", "fr", "de", "hi"];
  const languageNames = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    hi: "Hindi",
  };

  const variableList = [
    { key: "employee_name", label: "Employee Name" },
    { key: "employee_id", label: "Employee ID" },
    { key: "company_name", label: "Company Name" },
    { key: "department", label: "Department" },
    { key: "position", label: "Position" },
    { key: "manager_name", label: "Manager Name" },
    { key: "occasion", label: "Occasion" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
    { key: "probation_start_date", label: "Probation Start Date" },
    { key: "probation_end_date", label: "Probation End Date" },
  ];

  /* ------------------------------
      LOAD TEMPLATES
  ------------------------------- */
  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/email-templates`);
      const data = await res.json();

      const mapped = data.map((t) => ({
        id: t.id,
        name: t.template_name,
        category: t.category,
        subject: t.subject,
        body: t.body_html,
        language: t.language || "en",
        isActive: t.status === "active",
        variables: t.variables || [],
        createdDate: t.created_at?.split("T")[0] || "",
      }));

      setTemplates(mapped);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  /* ------------------------------
      FORM HANDLING
  ------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    category: "onboarding",
    subject: "",
    body: "",
    language: "en",
    isActive: true,
  });

  const handleOpenDialog = (template = null) => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        subject: template.subject,
        body: template.body,
        language: template.language,
        isActive: template.isActive,
      });
      setEditTemplate(template);
    } else {
      setFormData({
        name: "",
        category: "onboarding",
        subject: "",
        body: "",
        language: "en",
        isActive: true,
      });
      setEditTemplate(null);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => setShowDialog(false);

  /* ------------------------------
      CREATE / UPDATE TEMPLATE
  ------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const regex = /{([^}]+)}/g;
    let variables = [];
    let match;

    const combined = formData.subject + " " + formData.body;
    while ((match = regex.exec(combined)) !== null) {
      variables.push(match[1]);
    }

    const payload = {
      template_name: formData.name,
      category: formData.category,
      subject: formData.subject,
      body_html: formData.body,
      language: formData.language,
      status: formData.isActive,
      variables,
    };

    const url = editTemplate
      ? `${API_BASE}/email-templates/${editTemplate.id}`
      : `${API_BASE}/email-templates/create`;

    const method = editTemplate ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
toast.success(
  editTemplate
    ? "Template updated successfully"
    : "Template created successfully"
);
    loadTemplates();
    setShowDialog(false);
  };

  /* ------------------------------
      DELETE TEMPLATE
  ------------------------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;

    await fetch(`${API_BASE}/email-templates/${id}`, { method: "DELETE" });

    loadTemplates();
  };

  /* ------------------------------
      SEND EMAIL TO ALL EMPLOYEES
  ------------------------------- */
  const handleSendMail = async (template) => {
    if (!window.confirm("Send email to all employees?")) return;

    const res = await fetch(`${API_BASE}/email-templates/send-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: template.id }),
    });

    const data = await res.json();
    alert(data.message);
  };

  /* ------------------------------
      ACTIVATE / DEACTIVATE
  ------------------------------- */
  const handleToggleStatus = async (template) => {
  try {
    await fetch(`${API_BASE}/email-templates/${template.id}/toggle`, {
      method: "PATCH",
    });

    // ✅ SHOW TOAST BASED ON CURRENT STATUS
    toast.success(
      template.isActive
        ? "Email template deactivated successfully"
        : "Email template activated successfully"
    );

    loadTemplates();
  } catch (error) {
    toast.error("Failed to update email template status");
  }
};


  /* ------------------------------
      FINAL FILTER
  ------------------------------- */
  const filtered = templates.filter((t) => {
    if (!t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    if (tab === "all") return true;
    if (tab === "active") return t.isActive;
    if (tab === "inactive") return !t.isActive;

    if (categories.includes(tab)) return t.category === tab;

    return true;
  });

  /* ------------------------------
      UI START
  ------------------------------- */
  
  return (
    
  <>
    {/* ✅ TOAST CONTAINER – ADD HERE */}
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
    />
    
    
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Email Templates
      </Typography>

      {/* SEARCH */}
      <TextField
        placeholder="Search templates..."
        fullWidth
        variant="outlined"
        sx={{ mb: 3, background: "white", borderRadius: "8px" }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* FILTER TABS */}
      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="all" label="All" />
        <Tab value="active" label="Active" />
        <Tab value="inactive" label="Inactive" />
        {categories.map((c) => (
          <Tab key={c} value={c} label={c.toUpperCase()} />
        ))}
      </Tabs>

      {/* CREATE BUTTON */}
      <Box textAlign="right" mb={2}>
        <Button
          variant="contained"
          sx={{ borderRadius: "8px" }}
          onClick={() => handleOpenDialog()}
        >
          + Create Template
        </Button>
      </Box>
        


      {/* TABLE */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: "10px" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f3f3f3" }}>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Language</b></TableCell>
              <TableCell><b>Variables</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} sx={{ "&:hover": { background: "#fafafa" } }}>
                <TableCell>
                  <Typography fontWeight="bold">{t.name}</Typography>
                  <Typography fontSize="13px" color="gray">
                    {t.subject}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip label={t.category} />
                </TableCell>

                <TableCell>
                  <Chip
                    label={languageNames[t.language]}
                    variant="outlined"
                    color="info"
                  />
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {t.variables.slice(0, 3).map((v) => (
                      <Chip key={v} label={v} variant="outlined" />
                    ))}
                    {t.variables.length > 3 && (
                      <Chip label={`+${t.variables.length - 3}`} />
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={t.isActive ? "Active" : "Inactive"}
                    color={t.isActive ? "success" : "default"}
                  />
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" onClick={() => handleSendMail(t)}>
                      Send
                    </Button>

                    <Button size="small" variant="outlined" onClick={() => handleOpenDialog(t)}>
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color={t.isActive ? "warning" : "success"}
                      onClick={() => handleToggleStatus(t)}
                    >
                      {t.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* MODAL */}
      <Dialog open={showDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editTemplate ? "Edit Template" : "Create Template"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            sx={{ mt: 2 }}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
            >
              {languages.map((l) => (
                <MenuItem key={l} value={l}>
                  {languageNames[l]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Email Subject"
            sx={{ mt: 2 }}
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          />

          <Typography sx={{ mt: 2 }}>
          <b>Email Body</b>
        </Typography>

        <div style={{ height: "250px", marginBottom: "40px" }}>
          <ReactQuill
            theme="snow"
            value={formData.body}
            onChange={(value) => setFormData({ ...formData, body: value })}
            style={{ height: "200px" }}
          />
        </div>


          <Typography sx={{ mt: 2, mb: 1 }}>
            <b>Available Variables</b>
          </Typography>

          {variableList.map((v) => (
            <Chip key={v.key} label={`{${v.key}}`} sx={{ mr: 1, mb: 1 }} />
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editTemplate ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
      </>
);
  
  
};


export default EmailTemplateEditor;
