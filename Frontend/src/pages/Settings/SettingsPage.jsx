// SettingsPage.jsx
import React, { useState } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

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
    </Box>
  );
}

/* ---------- Branding ---------- */

function BrandingSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(null); // 'identity' | 'usage' | 'whitelabel'

  const openDrawer = (key) => {
    setDrawerKey(key);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerKey(null);
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
      </Grid>

      <RightDrawer open={drawerOpen} onClose={closeDrawer} title="Branding">
        {drawerKey === 'identity' && <BrandingIdentityForm onClose={closeDrawer} />}
        {drawerKey === 'usage' && <BrandingUsageForm onClose={closeDrawer} />}
        {drawerKey === 'whitelabel' && <BrandingWhiteLabelForm onClose={closeDrawer} />}
      </RightDrawer>
    </>
  );
}

function BrandingIdentityForm({ onClose }) {
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1976d2');
  const [secondaryColor, setSecondaryColor] = useState('#2e7d32');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ companyName, primaryColor, secondaryColor });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Button variant="outlined" component="label">
          Upload logo
          <input type="file" accept="image/*" hidden />
        </Button>

        <TextField
          label="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Primary color"
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Secondary color"
          type="color"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
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

function BrandingUsageForm({ onClose }) {
  const [portal, setPortal] = useState(true);
  const [payslip, setPayslip] = useState(true);
  const [email, setEmail] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ portal, payslip, email });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1}>
        <FormControlLabel
          control={<Checkbox checked={portal} onChange={(e) => setPortal(e.target.checked)} />}
          label="Apply branding to employee portal"
        />
        <FormControlLabel
          control={<Checkbox checked={payslip} onChange={(e) => setPayslip(e.target.checked)} />}
          label="Apply branding to payslips"
        />
        <FormControlLabel
          control={<Checkbox checked={email} onChange={(e) => setEmail(e.target.checked)} />}
          label="Apply branding to email templates"
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function BrandingWhiteLabelForm({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [tenant, setTenant] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ enabled, tenant });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
          label="Enable white‑label"
        />

        {enabled && (
          <FormControl fullWidth>
            <InputLabel id="tenant-label">Tenant</InputLabel>
            <Select
              labelId="tenant-label"
              label="Tenant"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
            >
              <MenuItem value="tenant-a">Tenant A</MenuItem>
              <MenuItem value="tenant-b">Tenant B</MenuItem>
              <MenuItem value="tenant-c">Tenant C</MenuItem>
            </Select>
          </FormControl>
        )}

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

/* ---------- Salary Cycle ---------- */

function SalarySection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const cycles = [
    { id: 1, name: 'Default monthly', frequency: 'Monthly', groups: 'All employees' },
    { id: 2, name: 'Sales bi‑weekly', frequency: 'Bi‑weekly', groups: 'Sales' },
  ];

  const openDrawer = (cycle) => {
    setEditing(cycle);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setEditing(null);
    setDrawerOpen(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        {cycles.map((c) => (
          <Grid key={c.id} item xs={12} md={4}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => openDrawer(c)}>
              <CardContent>
                <Typography variant="h6">{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Frequency: {c.frequency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Groups: {c.groups}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              borderStyle: 'dashed',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => openDrawer(null)}
          >
            <Typography color="primary">+ Add salary cycle</Typography>
          </Card>
        </Grid>
      </Grid>

      <RightDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? 'Edit salary cycle' : 'Add salary cycle'}
      >
        <SalaryForm initial={editing} onClose={closeDrawer} />
      </RightDrawer>
    </>
  );
}

function SalaryForm({ initial, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [frequency, setFrequency] = useState(initial?.frequency || 'Monthly');
  const [cutoff, setCutoff] = useState(initial?.cutoffDay || '');
  const [groups, setGroups] = useState(initial?.groups || '');
  const [workflow, setWorkflow] = useState(initial?.workflow || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, frequency, cutoff, groups, workflow });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Cycle name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />

        <FormControl fullWidth>
          <InputLabel id="freq-label">Frequency</InputLabel>
          <Select
            labelId="freq-label"
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Cut‑off day / date"
          value={cutoff}
          onChange={(e) => setCutoff(e.target.value)}
          fullWidth
        />

        <TextField
          label="Employee groups"
          value={groups}
          onChange={(e) => setGroups(e.target.value)}
          fullWidth
        />

        <TextField
          label="Approval workflow"
          placeholder="Manager → HR → Finance"
          value={workflow}
          onChange={(e) => setWorkflow(e.target.value)}
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

/* ---------- Leave Policy ---------- */

function LeaveSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const leaves = [
    { id: 1, name: 'Casual leave', code: 'CL', accrual: 'Monthly', carryForward: false },
    { id: 2, name: 'Sick leave', code: 'SL', accrual: 'Yearly', carryForward: true },
  ];

  const openDrawer = (lt) => {
    setEditing(lt);
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
            <Card sx={{ cursor: 'pointer' }} onClick={() => openDrawer(lt)}>
              <CardContent>
                <Typography variant="h6">{lt.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accrual: {lt.accrual}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carry‑forward: {lt.carryForward ? 'Yes' : 'No'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              borderStyle: 'dashed',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => openDrawer(null)}
          >
            <Typography color="primary">+ Add leave type</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/employee/holiday')}
          >
            <CardContent>
              <Typography variant="h6">Holiday calendar</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Manage holidays and mapping to locations/groups.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Approval workflows</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Configure role‑based leave approval flows.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <RightDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? 'Edit leave type' : 'Add leave type'}
      >
        <LeaveForm initial={editing} onClose={closeDrawer} />
      </RightDrawer>
    </>
  );
}

function LeaveForm({ initial, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [code, setCode] = useState(initial?.code || '');
  const [category, setCategory] = useState(initial?.category || 'Paid');
  const [accrual, setAccrual] = useState(initial?.accrual || 'Monthly');
  const [carryForward, setCarryForward] = useState(initial?.carryForward || false);
  const [maxBalance, setMaxBalance] = useState(initial?.maxBalance || '');
  const [requiresCertificate, setRequiresCertificate] = useState(
    initial?.requiresCertificate || false
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name,
      code,
      category,
      accrual,
      carryForward,
      maxBalance,
      requiresCertificate,
    });
    onClose();
  };

  const isSick = name.toLowerCase().includes('sick');

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
          onChange={(e) => setCode(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="cat-label">Category</InputLabel>
          <Select
            labelId="cat-label"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="accrual-label">Accrual</InputLabel>
          <Select
            labelId="accrual-label"
            label="Accrual"
            value={accrual}
            onChange={(e) => setAccrual(e.target.value)}
          >
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
          label="Allow carry‑forward"
        />

        {isSick && (
          <FormControlLabel
            control={
              <Checkbox
                checked={requiresCertificate}
                onChange={(e) => setRequiresCertificate(e.target.checked)}
              />
            }
            label="Require medical certificate for long absences"
          />
        )}

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

/* ---------- Integrations ---------- */

function IntegrationsSection() {
  const [drawerKey, setDrawerKey] = useState(null); // 'api' | 'sso' | 'device' | 'erp'

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

function SecuritySection() {
  const [drawerKey, setDrawerKey] = useState(null); // 'roles' | 'auth' | 'network'

  const closeDrawer = () => setDrawerKey(null);

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
                MFA and password policy configuration.
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
                IP restrictions and audit logs.
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
        {drawerKey === 'auth' && <SecurityAuthForm onClose={closeDrawer} />}
        {drawerKey === 'network' && <SecurityNetworkForm onClose={closeDrawer} />}
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

function SecurityAuthForm({ onClose }) {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [expiryDays, setExpiryDays] = useState(90);
  const [minLength, setMinLength] = useState(8);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ mfaEnabled, expiryDays, minLength });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox checked={mfaEnabled} onChange={(e) => setMfaEnabled(e.target.checked)} />
          }
          label="Enable Multi‑Factor Authentication (MFA)"
        />
        <TextField
          label="Password expiry (days)"
          type="number"
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
          fullWidth
        />
        <TextField
          label="Password minimum length"
          type="number"
          value={minLength}
          onChange={(e) => setMinLength(Number(e.target.value))}
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

function SecurityNetworkForm({ onClose }) {
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [auditEnabled, setAuditEnabled] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ipRestrictionEnabled, allowedIps, auditEnabled });
    onClose();
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
          label="Enable IP restrictions"
        />
        {ipRestrictionEnabled && (
          <TextField
            label="Allowed IPs (comma separated)"
            multiline
            minRows={3}
            value={allowedIps}
            onChange={(e) => setAllowedIps(e.target.value)}
            fullWidth
          />
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={auditEnabled}
              onChange={(e) => setAuditEnabled(e.target.checked)}
            />
          }
          label="Enable detailed audit logs"
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
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Drawer>
  );
}
