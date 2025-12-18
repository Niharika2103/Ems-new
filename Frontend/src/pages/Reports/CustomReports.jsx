// src/components/reports/CustomReports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const getToday = () => new Date().toISOString().split('T')[0];

const CustomReports = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Available fields for custom reports
  const availableFields = [
    'Employee Name', 'Department', 'Performance', 'Salary', 'Hire Date',
    'Project', 'Freelancer', 'ROI', 'Compliance Status'
  ];

  useEffect(() => {
    const dummyTemplates = [
      {
        id: 1,
        name: 'High Performers in Engineering',
        fields: ['Employee Name', 'Department', 'Performance'],
        lastRun: '2025-12-01',
        createdBy: 'Alex Johnson',
      },
      {
        id: 2,
        name: 'Freelancer ROI > 75%',
        fields: ['Project', 'Freelancer', 'ROI', 'Value Generated'],
        lastRun: '2025-11-25',
        createdBy: 'Maria Garcia',
      },
      {
        id: 3,
        name: 'Pending Compliance Items',
        fields: ['Report Title', 'Category', 'Status', 'Due Date'],
        lastRun: '2025-12-05',
        createdBy: 'James Wilson',
      },
    ];
    setTemplates(dummyTemplates);
    setFilteredTemplates(dummyTemplates);
  }, []);

  useEffect(() => {
    let result = templates;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(term));
    }

    // Date filtering by lastRun
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);

      result = result.filter(t => {
        const run = new Date(t.lastRun);
        return run >= start && run < end;
      });
    }

    setFilteredTemplates(result);
  }, [searchTerm, startDate, endDate, templates]);

  const handleExport = (format) => {
    console.log(`[AUDIT] Custom report exported in ${format}`);
    alert(`Exporting Custom report as ${format}...`);
    setAnchorEl(null);
  };

  const handleSaveTemplate = () => {
    if (currentTemplate.id) {
      // Update
      setTemplates(templates.map(t => t.id === currentTemplate.id ? currentTemplate : t));
    } else {
      // Create
      const newTemplate = {
        ...currentTemplate,
        id: Date.now(),
        lastRun: getToday(),
        createdBy: 'Current User',
      };
      setTemplates([...templates, newTemplate]);
    }
    setOpenModal(false);
    setCurrentTemplate(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const openTemplateForm = (template = null) => {
    setCurrentTemplate(template || {
      name: '',
      fields: [],
      lastRun: getToday(),
      createdBy: 'Current User',
    });
    setOpenModal(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="medium">
          Custom Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleExport('PDF')}>PDF</MenuItem>
            <MenuItem onClick={() => handleExport('Excel')}>Excel (.xlsx)</MenuItem>
            <MenuItem onClick={() => handleExport('CSV')}>CSV</MenuItem>
          </Menu>
        
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
        <TextField
          size="small"
          placeholder="Search template name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 0.5 }} /> }}
          sx={{ minWidth: 240 }}
        />

        <TextField
          label="Start Date"
          type="date"
          size=" small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ minWidth: 140 }}
        />

        <TextField
          label="End Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ minWidth: 140 }}
        />
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Saved Report Templates
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filteredTemplates.length} template(s) found
          </Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Template Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fields Included</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Last Run</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Created By</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>
                        <Chip label={`${t.fields.length} fields`} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">{t.lastRun}</TableCell>
                      <TableCell align="right">{t.createdBy}</TableCell>
                      <TableCell align="center">
                        <Button size="small" startIcon={<EditIcon />} onClick={() => openTemplateForm(t)} />
                        <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(t.id)} color="error" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No custom report templates found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Template Form Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTemplate?.id ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Template Name"
            fullWidth
            value={currentTemplate?.name || ''}
            onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Fields</InputLabel>
            <Select
              multiple
              value={currentTemplate?.fields || []}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, fields: e.target.value })}
              renderValue={(selected) => `${selected.length} field(s) selected`}
            >
              {availableFields.map((field) => (
                <MenuItem key={field} value={field}>
                  <Checkbox checked={(currentTemplate?.fields || []).includes(field)} />
                  {field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            {currentTemplate?.id ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReports;