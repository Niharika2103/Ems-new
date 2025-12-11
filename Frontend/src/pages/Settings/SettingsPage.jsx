import React, { useState } from 'react';

const SettingsPage = () => {

  // ⭐ Function to format today's date (YYYY-MM-DD)
  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ⭐ Default Cut-off Date = Today
  const [cutoffDate, setCutoffDate] = useState(getToday());

  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  const Section = ({ id, title, children }) => (
    <div className="mb-6 border rounded-lg shadow-sm">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 text-left font-medium bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
      >
        {title}
        <span className={`transition-transform ${openSection === id ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {openSection === id && (
        <div className="p-4 bg-white border-t">
          {children}
        </div>
      )}
    </div>
  );

  const handleSave = () => {
    alert("✅ All settings saved successfully!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      {/* 1. Branding & White-label */}
      <Section id="branding" title="1. Branding & White-label">
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Upload Company Logo</label>
            <input type="file" accept="image/*" className="border rounded px-3 py-2 w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input type="text" placeholder="Acme Corp" className="border rounded px-3 py-2 w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Theme Colors</label>
            <div className="flex gap-3">
              <div>
                <label className="block text-xs">Primary</label>
                <input type="color" defaultValue="#007BFF" className="w-10 h-10" />
              </div>

              <div>
                <label className="block text-xs">Secondary</label>
                <input type="color" defaultValue="#6C757D" className="w-10 h-10" />
              </div>
            </div>
          </div>

          <label className="flex items-center mt-4">
            <input type="checkbox" className="mr-2" />
            Apply branding to Employee Portal, Payslips, and Email Templates
          </label>

          <label className="flex items-center mt-2">
            <input type="checkbox" className="mr-2" />
            Enable White-label for Multiple Tenants
          </label>

        </div>
      </Section>

      {/* 2. Payroll Configuration */}
      <Section id="payroll" title="2. Payroll Configuration">
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Payroll Frequency</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>Monthly</option>
              <option>Bi-weekly</option>
              <option>Weekly</option>
            </select>
          </div>

          {/* ⭐ Cut-off Date with Today's Default */}
          <div>
            <label className="block text-sm font-medium mb-1">Cut-off Date for Attendance/Leave</label>
            <input
              type="date"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Approval Workflow for Salary Release</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>Manager → Finance → Admin</option>
              <option>Auto-approve after 24h</option>
              <option>Custom Workflow</option>
            </select>
          </div>

          <label className="flex items-center mt-2">
            <input type="checkbox" className="mr-2" />
            Support Multiple Cycles for Different Employee Groups
          </label>

        </div>
      </Section>

      {/* 3. Leave Management */}
      <Section id="leave" title="3. Leave Management">
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Define Leave Types</label>

            <div className="flex flex-wrap gap-2">
              {["Casual", "Sick", "Earned", "Maternity", "Paternity", "Bereavement"].map(type => (
                <label key={type} className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-1" />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Accrual Rules</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>Monthly</option>
              <option>Yearly</option>
              <option>Tenure-based</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Carry-forward / Lapse / Encashment</label>

            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center">
                <input type="radio" name="carryforward" className="mr-1" /> Carry Forward
              </label>
              <label className="flex items-center">
                <input type="radio" name="carryforward" className="mr-1" /> Lapse
              </label>
              <label className="flex items-center">
                <input type="radio" name="carryforward" className="mr-1" /> Encashment
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Holiday Calendar Mapping</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>Select Country/Region</option>
              <option>United States</option>
              <option>India</option>
              <option>Custom Upload</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role-based Approval Workflows</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>Manager → HR → Director</option>
              <option>Direct Manager Only</option>
              <option>Custom Roles</option>
            </select>
          </div>

        </div>
      </Section>

      {/* 4. Integrations */}
      <Section id="integrations" title="4. Integrations">
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">API/SFTP Connectors</label>

            <div className="flex flex-wrap gap-2">
              {["Payroll System", "Accounting Software", "Compliance Platform"].map(system => (
                <label key={system} className="flex items-center">
                  <input type="checkbox" className="mr-1" />
                  {system}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Enable Single Sign-On (SSO)
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Biometric/Attendance App Integration</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>None</option>
              <option>ZKTeco</option>
              <option>BioTime</option>
              <option>Custom API</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Standard HRMS/ERP Connectors</label>

            <div className="flex flex-wrap gap-2">
              {["SAP", "Oracle HCM", "Workday", "Zoho People"].map(erp => (
                <label key={erp} className="flex items-center">
                  <input type="checkbox" className="mr-1" />
                  {erp}
                </label>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* 5. Security & Compliance */}
      <Section id="security" title="5. Security & Compliance">
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Role-based Access Control (RBAC)</label>
            <select className="border rounded px-3 py-2 w-full">
              <option>Admin, Manager, Employee</option>
              <option>Custom Roles</option>
            </select>
          </div>

          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Enable Multi-Factor Authentication (MFA)
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Password Policy</label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-1" /> Minimum 8 characters
              </label>

              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-1" /> Include numbers & symbols
              </label>

              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> Expire every 90 days
              </label>

              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> Block reuse of last 5 passwords
              </label>
            </div>
          </div>

          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            IP/Device Restrictions (Optional)
          </label>

          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Enable Detailed Audit Logs for All Admin Actions
          </label>

        </div>
      </Section>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
