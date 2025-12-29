// SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Drawer,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import BrandingIdentityForm from '../Settings/BrandingIdentityForm.jsx';
import BrandingUsageForm from '../Settings/BrandingUsageForm.jsx';
import BrandingWhiteLabelForm from '../Settings/BrandingWhiteLabelForm.jsx';
import BrandingWhiteLabelTenantForm from './BrandingWhiteLabelTenantForm.jsx';
import { fetchSettings } from '../../api/authApi';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getLeaveTypesApi,
  createLeaveTypeApi,
  updateLeaveTypeApi,
  getAuthSettingsApi,
  updateAuthSettingsApi,
  createAuthSettingsApi,
  createSalaryCycleApi,
  updateSalaryCycleApi,
  getSalaryCycleApi,
} from "../../api/authApi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('branding');
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <Box sx={{ height: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
        </Toolbar>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab value="branding" label="Branding" />
          <Tab value="salary" label="Salary Cycle" />
          <Tab value="leave" label="Leave Policy" />
          <Tab value="integrations" label="Integrations" />
          <Tab value="security" label="Security" />
        </Tabs>
      </AppBar>
      <Box sx={{ p: 3 }}>
        {activeTab === 'branding' && <BrandingSection />}
        {activeTab === 'salary' && <SalarySection />}
        {activeTab === 'leave' && <LeaveSection />}
        {activeTab === 'integrations' && <IntegrationsSection />}
        {activeTab === 'security' && <SecuritySection />}
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}

/* ---------- Branding ---------- */
function BrandingSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(null);
  const [activeTenant, setActiveTenant] = useState(null);
  useEffect(() => {
    fetchSettings().then((res) => {
      setActiveTenant(res.data?.whiteLabel?.activeTenant);
    });
  }, []);
  const openDrawer = (key) => {
    setDrawerKey(key);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerKey('');
  };
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Company identity</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload logo, set company name and theme colors.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => openDrawer('identity')}>
                Edit
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Brand usage</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Control branding on portal, payslips and email templates.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => openDrawer('usage')}>
                Edit
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">White‑label</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enable white‑label and configure tenant branding.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => openDrawer('whitelabel')}>
                Edit
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">White‑label Tanent Form</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create white‑label and configure tenant branding.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => openDrawer('whitelabelform')}>
                Edit
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      <RightDrawer open={drawerOpen} onClose={closeDrawer} title="Branding">
        {drawerKey === 'identity' && <BrandingIdentityForm onClose={closeDrawer} />}
        {drawerKey === 'usage' && <BrandingUsageForm onClose={closeDrawer} />}
        {drawerKey === 'whitelabel' && <BrandingWhiteLabelForm onClose={closeDrawer} />}
        {drawerKey === 'whitelabelform' && (
          <BrandingWhiteLabelTenantForm tenantKey={activeTenant} onClose={closeDrawer} />
        )}
      </RightDrawer>
    </>
  );
}

/* ---------- Salary Cycle ---------- */
function SalarySection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cycles, setCycles] = useState([]); // now an array
  const [loading, setLoading] = useState(true);
  const [editingCycle, setEditingCycle] = useState(null);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await getSalaryCycleApi();
        setCycles(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch salary cycles", err);
        toast.error("Failed to load salary cycles");
        setCycles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  const openDrawer = (cycle = null) => {
    setEditingCycle(cycle);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCycle(null);
  };

  const handleSaved = async () => {
    try {
      const res = await getSalaryCycleApi();
      setCycles(Array.isArray(res.data) ? res.data : []);
      toast.success("Salary cycle saved successfully");
    } catch (err) {
      console.error("Failed to refresh salary cycles", err);
      toast.error("Failed to refresh salary cycles");
    }
    closeDrawer();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => openDrawer(null)}
          sx={{ mb: 2 }}
        >
          + Add Salary Cycle
        </Button>
      </Box>

      <Grid container spacing={2}>
        {cycles.length > 0 ? (
          cycles.map((cycle) => (
            <Grid item xs={12} md={6} key={cycle.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{cycle.cycle_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Frequency: {cycle.pay_frequency} • {cycle.is_active ? "Active" : "Inactive"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cycle: Day {cycle.cycle_start_day} – {cycle.cycle_end_day}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cut-off: {cycle.cut_off_day} | Processing: {cycle.processing_day} | Payout: {cycle.payout_day}
                      </Typography>
                    </Box>
                    {cycle.is_active && (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          ml: 1,
                        }}
                      />
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openDrawer(cycle)}
                    disabled={!cycle.is_active}
                  >
                    {cycle.is_active ? 'Edit' : 'View Only'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card
              variant="outlined"
              sx={{
                borderStyle: 'dashed',
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">No salary cycles configured</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <RightDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingCycle ? 'Edit Salary Cycle' : 'Add Salary Cycle'}
      >
        <SalaryForm
          initial={editingCycle}
          onClose={closeDrawer}
          onSaved={handleSaved}
        />
      </RightDrawer>
    </>
  );
}

function SalaryForm({ initial, onClose, onSaved }) {
  const [cycle_name, setCycleName] = useState(initial?.cycle_name || '');
  const [pay_frequency, setPayFrequency] = useState(initial?.pay_frequency || 'monthly');
  const [cycle_start_day, setCycleStartDay] = useState(initial?.cycle_start_day?.toString() || '');
  const [cycle_end_day, setCycleEndDay] = useState(initial?.cycle_end_day?.toString() || '');
  const [cut_off_day, setCutOffDay] = useState(initial?.cut_off_day?.toString() || '');
  const [processing_day, setProcessingDay] = useState(initial?.processing_day?.toString() || '');
  const [payout_day, setPayoutDay] = useState(initial?.payout_day?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      cycle_name,
      pay_frequency,
      cycle_start_day: parseInt(cycle_start_day, 10),
      cycle_end_day: parseInt(cycle_end_day, 10),
      cut_off_day: parseInt(cut_off_day, 10),
      processing_day: parseInt(processing_day, 10),
      payout_day: parseInt(payout_day, 10),
    };

    try {
      if (initial) {
        await updateSalaryCycleApi(payload);
      } else {
        await createSalaryCycleApi(payload);
      }
      onSaved();
      onClose();
      toast.success("Salary cycle saved successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to save salary cycle";
      toast.error(errorMsg);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Cycle name"
          value={cycle_name}
          onChange={(e) => setCycleName(e.target.value)}
          fullWidth
          required
        />
        <FormControl fullWidth>
          <InputLabel id="freq-label">Pay frequency</InputLabel>
          <Select
            labelId="freq-label"
            label="Pay frequency"
            value={pay_frequency}
            onChange={(e) => setPayFrequency(e.target.value)}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="biweekly">Bi-weekly</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Cycle start day"
          type="number"
          inputProps={{ min: 1, max: 31, step: 1 }}
          value={cycle_start_day}
          onChange={(e) => setCycleStartDay(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Cycle end day"
          type="number"
          inputProps={{ min: 1, max: 31, step: 1 }}
          value={cycle_end_day}
          onChange={(e) => setCycleEndDay(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Cut-off day"
          type="number"
          inputProps={{ min: 1, max: 31, step: 1 }}
          value={cut_off_day}
          onChange={(e) => setCutOffDay(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Processing day"
          type="number"
          inputProps={{ min: 1, max: 31, step: 1 }}
          value={processing_day}
          onChange={(e) => setProcessingDay(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Payout day"
          type="number"
          inputProps={{ min: 1, max: 31, step: 1 }}
          value={payout_day}
          onChange={(e) => setPayoutDay(e.target.value)}
          fullWidth
          required
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ---------- Leave Policy ---------- */
// ... (unchanged — keep all existing LeaveSection code as-is)

function LeaveSection() {
  const [leaves, setLeaves] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const fetchLeaves = async () => {
    try {
      const res = await getLeaveTypesApi();
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leave types", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openDrawer = (leave) => {
    setEditing(leave);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setEditing(null);
    setDrawerOpen(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        {leaves.map((lt) => (
          <Grid key={lt.id} item xs={12} md={4}>
            <Card sx={{ cursor: "pointer" }} onClick={() => openDrawer(lt)}>
              <CardContent>
                <Typography variant="h6">{lt.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accrual: {lt.accrual_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carry-forward: {lt.carry_forward ? "Yes" : "No"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              borderStyle: "dashed",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => openDrawer(null)}
          >
            <Typography color="primary">+ Add leave type</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: "pointer" }} onClick={() => navigate("/dashboard/employee/holiday")}>
            <CardContent>
              <Typography variant="h6">Holiday calendar</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage holidays and mapping.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <RightDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? "Edit leave type" : "Add leave type"}
      >
        <LeaveForm
          initial={editing}
          onClose={closeDrawer}
          onSaved={fetchLeaves}
        />
      </RightDrawer>
    </>
  );
}

function LeaveForm({ initial, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || "");
  const [code, setCode] = useState(initial?.code || "");
  const [category, setCategory] = useState(initial?.category || "Paid");
  const [accrual, setAccrual] = useState(initial?.accrual_type || "Monthly");
  const [carryForward, setCarryForward] = useState(initial?.carry_forward || false);
  const [maxBalance, setMaxBalance] = useState(initial?.max_balance || "");
  const [requiresCertificate, setRequiresCertificate] = useState(
    initial?.requires_certificate || false
  );
  const isSick = name.toLowerCase().includes("sick");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      code,
      category,
      accrual,
      carryForward,
      maxBalance,
      requiresCertificate,
    };
    try {
      if (initial?.id) {
        await updateLeaveTypeApi(initial.id, payload);
      } else {
        await createLeaveTypeApi(payload);
      }
      onSaved();
      onClose();
      toast.success("Leave type saved successfully");
    } catch (err) {
      console.error("Failed to save leave type", err);
      toast.error("Failed to save leave type");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Leave name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          fullWidth
          required
        />
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Accrual</InputLabel>
          <Select value={accrual} onChange={(e) => setAccrual(e.target.value)}>
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Yearly">Yearly</MenuItem>
            <MenuItem value="Tenure-based">Tenure-based</MenuItem>
            <MenuItem value="None">None</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Maximum balance (days)"
          type="number"
          value={maxBalance}
          onChange={(e) => setMaxBalance(e.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={carryForward}
              onChange={(e) => setCarryForward(e.target.checked)}
            />
          }
          label="Allow carry-forward"
        />
        {isSick && (
          <FormControlLabel
            control={
              <Checkbox
                checked={requiresCertificate}
                onChange={(e) => setRequiresCertificate(e.target.checked)}
              />
            }
            label="Require medical certificate"
          />
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ---------- Integrations ---------- */
// ... (unchanged — keep all existing IntegrationsSection code as-is)

function IntegrationsSection() {
  const [drawerKey, setDrawerKey] = useState(null);
  const closeDrawer = () => setDrawerKey(null);
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">API / SFTP connectors</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Configure payroll, accounting and compliance integrations.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('api')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Single Sign‑On (SSO)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Connect your identity provider and enable SSO.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('sso')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Biometric / attendance</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Integrate biometric devices or attendance apps.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('device')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">HRMS / ERP</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Map payroll and employee data to ERP systems.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('erp')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      <RightDrawer
        open={Boolean(drawerKey)}
        onClose={closeDrawer}
        title={
          drawerKey === 'api'
            ? 'API / SFTP connectors'
            : drawerKey === 'sso'
            ? 'Single Sign‑On (SSO)'
            : drawerKey === 'device'
            ? 'Biometric / attendance'
            : drawerKey === 'erp'
            ? 'HRMS / ERP'
            : ''
        }
      >
        {drawerKey === 'api' && <ApiSftpForm onClose={closeDrawer} />}
        {drawerKey === 'sso' && <SsoForm onClose={closeDrawer} />}
        {drawerKey === 'device' && <DeviceForm onClose={closeDrawer} />}
        {drawerKey === 'erp' && <ErpForm onClose={closeDrawer} />}
      </RightDrawer>
    </>
  );
}

function ApiSftpForm({ onClose }) {
  const [apiEnabled, setApiEnabled] = useState(false);
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [sftpEnabled, setSftpEnabled] = useState(false);
  const [sftpHost, setSftpHost] = useState('');
  const [sftpUser, setSftpUser] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      api: { apiEnabled, endpoint, apiKey },
      sftp: { sftpEnabled, sftpHost, sftpUser },
    });
    onClose();
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox checked={apiEnabled} onChange={(e) => setApiEnabled(e.target.checked)} />
          }
          label="Enable API connector"
        />
        {apiEnabled && (
          <>
            <TextField
              label="API endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              fullWidth
            />
            <TextField
              label="API key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              fullWidth
            />
          </>
        )}
        <FormControlLabel
          control={
            <Checkbox checked={sftpEnabled} onChange={(e) => setSftpEnabled(e.target.checked)} />
          }
          label="Enable SFTP connector"
        />
        {sftpEnabled && (
          <>
            <TextField
              label="SFTP host"
              value={sftpHost}
              onChange={(e) => setSftpHost(e.target.value)}
              fullWidth
            />
            <TextField
              label="SFTP username"
              value={sftpUser}
              onChange={(e) => setSftpUser(e.target.value)}
              fullWidth
            />
          </>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function SsoForm({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState('SAML');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ enabled, provider, clientId, clientSecret });
    onClose();
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
          label="Enable SSO"
        />
        {enabled && (
          <>
            <FormControl fullWidth>
              <InputLabel id="provider-label">Provider type</InputLabel>
              <Select
                labelId="provider-label"
                label="Provider type"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <MenuItem value="SAML">SAML</MenuItem>
                <MenuItem value="OIDC">OpenID Connect</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              fullWidth
            />
            <TextField
              label="Client secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              fullWidth
            />
          </>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function DeviceForm({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [schedule, setSchedule] = useState('Hourly');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ enabled, baseUrl, schedule });
    onClose();
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
          label="Enable attendance integration"
        />
        {enabled && (
          <>
            <TextField
              label="API base URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="schedule-label">Sync schedule</InputLabel>
              <Select
                labelId="schedule-label"
                label="Sync schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              >
                <MenuItem value="Hourly">Hourly</MenuItem>
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Manual">Manual</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function ErpForm({ onClose }) {
  const [system, setSystem] = useState('Generic');
  const [companyCode, setCompanyCode] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ system, companyCode, costCenter });
    onClose();
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="erp-label">ERP system</InputLabel>
          <Select
            labelId="erp-label"
            label="ERP system"
            value={system}
            onChange={(e) => setSystem(e.target.value)}
          >
            <MenuItem value="Generic">Generic</MenuItem>
            <MenuItem value="SAP">SAP</MenuItem>
            <MenuItem value="Oracle">Oracle</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Default company code"
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
          fullWidth
        />
        <TextField
          label="Default cost center"
          value={costCenter}
          onChange={(e) => setCostCenter(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ---------- Security ---------- */
// ... (unchanged — keep all existing SecuritySection code as-is)

function SecuritySection() {
  const [drawerKey, setDrawerKey] = useState(null);
  const [authSettings, setAuthSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthSettings = async () => {
      try {
        const res = await getAuthSettingsApi();
        const data = res.data;
        if (data && typeof data === 'object' && data.id !== undefined) {
          setAuthSettings(data);
        } else {
          setAuthSettings(null);
        }
      } catch (err) {
        console.error("Failed to fetch auth settings:", err);
        setAuthSettings(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthSettings();
  }, []);

  const closeDrawer = () => setDrawerKey(null);

  const saveAuthSettings = async (partialData) => {
    try {
      let result;
      if (authSettings && authSettings.id !== undefined) {
        result = await updateAuthSettingsApi(partialData);
        setAuthSettings(result.data.settings);
      } else {
        const fullPayload = {
          min_password_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_number: true,
          require_special: false,
          otp_expiry_minutes: 10,
          ip_restriction_enabled: false,
          allowed_ips: [],
          ...partialData,
        };
        result = await createAuthSettingsApi(fullPayload);
        setAuthSettings(result.data.settings);
      }
      toast.success("Security settings saved successfully");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to save security settings";
      toast.error(errorMsg);
      console.error("Save error:", err);
      return false;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Roles & permissions</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Manage RBAC and module access per role.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('roles')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Authentication</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Password policy and OTP configuration.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('auth')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Network & audit</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                IP restrictions.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setDrawerKey('network')}>
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      <RightDrawer
        open={Boolean(drawerKey)}
        onClose={closeDrawer}
        title={
          drawerKey === 'roles'
            ? 'Roles & permissions'
            : drawerKey === 'auth'
            ? 'Authentication'
            : drawerKey === 'network'
            ? 'Network & audit'
            : ''
        }
      >
        {drawerKey === 'roles' && <SecurityRolesForm onClose={closeDrawer} />}
        {drawerKey === 'auth' && (
          <SecurityAuthForm
            current={authSettings}
            onSave={saveAuthSettings}
            onClose={closeDrawer}
          />
        )}
        {drawerKey === 'network' && (
          <SecurityNetworkForm
            current={authSettings}
            onSave={saveAuthSettings}
            onClose={closeDrawer}
          />
        )}
      </RightDrawer>
    </>
  );
}

function SecurityRolesForm({ onClose }) {
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ roleName, permissions });
    onClose();
  };
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Role name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Permissions (comma separated)"
          value={permissions}
          onChange={(e) => setPermissions(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function SecurityAuthForm({ current, onSave, onClose }) {
  const [minLength, setMinLength] = useState(current?.min_password_length ?? 8);
  const [requireUppercase, setRequireUppercase] = useState(current?.require_uppercase ?? true);
  const [requireLowercase, setRequireLowercase] = useState(current?.require_lowercase ?? true);
  const [requireNumber, setRequireNumber] = useState(current?.require_number ?? true);
  const [requireSpecial, setRequireSpecial] = useState(current?.require_special ?? false);
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(current?.otp_expiry_minutes ?? 10);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      min_password_length: minLength,
      require_uppercase: requireUppercase,
      require_lowercase: requireLowercase,
      require_number: requireNumber,
      require_special: requireSpecial,
      otp_expiry_minutes: otpExpiryMinutes,
    };
    const success = await onSave(payload);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Minimum password length"
          type="number"
          inputProps={{ min: 6, max: 32 }}
          value={minLength}
          onChange={(e) => setMinLength(Math.min(32, Math.max(6, Number(e.target.value) || 6)))}
          fullWidth
          required
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={requireUppercase}
              onChange={(e) => setRequireUppercase(e.target.checked)}
            />
          }
          label="Require uppercase letter (A–Z)"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={requireLowercase}
              onChange={(e) => setRequireLowercase(e.target.checked)}
            />
          }
          label="Require lowercase letter (a–z)"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={requireNumber}
              onChange={(e) => setRequireNumber(e.target.checked)}
            />
          }
          label="Require number (0–9)"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={requireSpecial}
              onChange={(e) => setRequireSpecial(e.target.checked)}
            />
          }
          label="Require special character (!@#$%^&*)"
        />
        <TextField
          label="OTP expiry (minutes)"
          type="number"
          inputProps={{ min: 1, max: 30 }}
          value={otpExpiryMinutes}
          onChange={(e) =>
            setOtpExpiryMinutes(Math.min(30, Math.max(1, Number(e.target.value) || 1)))
          }
          fullWidth
          required
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function SecurityNetworkForm({ current, onSave, onClose }) {
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(
    current?.ip_restriction_enabled ?? false
  );
  const [allowedIps, setAllowedIps] = useState(
    Array.isArray(current?.allowed_ips) ? current.allowed_ips.join(', ') : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ipList = allowedIps
      .split(',')
      .map(ip => ip.trim())
      .filter(ip => ip);
    const payload = {
      ip_restriction_enabled: ipRestrictionEnabled,
      allowed_ips: ipList,
    };
    const success = await onSave(payload);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={ipRestrictionEnabled}
              onChange={(e) => setIpRestrictionEnabled(e.target.checked)}
            />
          }
          label="Enable IP address restrictions"
        />
        {ipRestrictionEnabled && (
          <TextField
            label="Allowed IP addresses"
            helperText="Enter IPs separated by commas (e.g., 192.168.1.1, 203.0.113.0/24)"
            multiline
            minRows={3}
            value={allowedIps}
            onChange={(e) => setAllowedIps(e.target.value)}
            fullWidth
          />
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ---------- Shared Right Drawer ---------- */
function RightDrawer({ open, onClose, title, children }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 380, maxWidth: '100%', p: 2 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton size="小" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Drawer>
  );
}