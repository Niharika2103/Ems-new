import React, { useState, useEffect } from 'react';

const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Updated: Removed "Leave Approved", added "Birthday Wishes"
  const initialTemplates = [
    {
      id: 1,
      name: 'Welcome Onboarding',
      category: 'onboarding',
      subject: 'Welcome {employee_name} to {company_name}!',
      body: 'Dear {employee_name},\n\nWelcome to {company_name}! We are excited to have you on board.\n\nEmployee ID: {employee_id}\nDepartment: {department}\n\nPlease complete your onboarding tasks by {deadline}.\n\nBest regards,\nHR Team',
      language: 'en',
      isActive: true,
      sentCount: 245,
      createdDate: '2024-01-15',
      variables: ['employee_name', 'company_name', 'employee_id', 'department', 'deadline']
    },
    {
      id: 2,
      name: 'Monthly Payslip',
      category: 'payslip',
      subject: 'Payslip for {month} {year}',
      body: 'Dear {employee_name},\n\nYour payslip for {month} {year} is attached.\n\nNet Salary: {net_salary}\nDeductions: {deductions}\n\nRegards,\nAccounts Department',
      language: 'en',
      isActive: true,
      sentCount: 120,
      createdDate: '2024-01-10',
      variables: ['employee_name', 'month', 'year', 'net_salary', 'deductions']
    },
    {
      id: 3,
      name: 'Birthday Wishes',
      category: 'wishes',
      subject: '🎉 Happy {occasion}, {employee_name}!',
      body: 'Dear {employee_name},\n\nOn behalf of everyone at {company_name},\nwe wish you a very Happy {occasion}! 🎂\n\n{wishes_message}\n\nWarm regards,\nHR Team',
      language: 'en',
      isActive: true,
      sentCount: 56,
      createdDate: '2024-02-01',
      variables: ['employee_name', 'company_name', 'occasion', 'wishes_message']
    }
    
  ];

  useEffect(() => {
    setTemplates(initialTemplates);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: 'onboarding',
    subject: '',
    body: '',
    language: 'en',
    isActive: true
  });

  // ✅ Added 'wishes' category
  const categories = ['onboarding', 'payslip', 'wishes', 'reminder', 'announcement', 'other'];
  const languages = ['en', 'es', 'fr', 'de', 'hi'];
  const languageNames = { 
    en: 'English', 
    es: 'Spanish', 
    fr: 'French', 
    de: 'German',
    hi: 'Hindi'
  };

  // ✅ Added wish-related variables
  const availableVariables = [
    { key: 'employee_name', label: 'Employee Name' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'manager_name', label: 'Manager Name' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'net_salary', label: 'Net Salary' },
    { key: 'deductions', label: 'Deductions' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'reason', label: 'Reason' },
    { key: 'link', label: 'Link' },
    { key: 'occasion', label: 'Occasion (e.g., Birthday, Diwali)' },
    { key: 'wishes_message', label: 'Custom Wishes Message' }
  ];

  const handleOpenDialog = (template = null) => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        subject: template.subject,
        body: template.body,
        language: template.language,
        isActive: template.isActive
      });
      setEditTemplate(template);
    } else {
      setFormData({
        name: '',
        category: 'wishes',
        subject: '',
        body: '',
        language: 'en',
        isActive: true
      });
      setEditTemplate(null);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditTemplate(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Extract variables from body + subject
    const regex = /{([^}]+)}/g;
    const matches = [];
    let match;
    const combinedText = formData.body + ' ' + formData.subject;
    while ((match = regex.exec(combinedText)) !== null) {
      matches.push(match[1]);
    }
    const uniqueVariables = [...new Set(matches)];
    
    if (editTemplate) {
      const updatedTemplates = templates.map(t => 
        t.id === editTemplate.id ? { 
          ...editTemplate, 
          ...formData,
          variables: uniqueVariables
        } : t
      );
      setTemplates(updatedTemplates);
    } else {
      const newTemplate = {
        id: templates.length + 1,
        ...formData,
        variables: uniqueVariables,
        sentCount: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    }
    
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-body');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = `{${variable}}`;
    
    setFormData({
      ...formData,
      body: formData.body.substring(0, start) + newText + formData.body.substring(end)
    });
    
    // Restore cursor position
    setTimeout(() => {
      const newPos = start + newText.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  };

  const filteredTemplates = templates.filter(template => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return template.name.toLowerCase().includes(searchLower) || 
             template.subject.toLowerCase().includes(searchLower);
    }
    
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return template.isActive;
    if (activeTab === 'inactive') return !template.isActive;
    return template.category === activeTab;
  });

  // Inline CSS
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap',
      gap: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonSecondary: {
      padding: '8px 16px',
      backgroundColor: '#f8f9fa',
      color: '#495057',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    buttonDanger: {
      padding: '8px 16px',
      backgroundColor: '#fff5f5',
      color: '#dc3545',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    tabs: {
      display: 'flex',
      gap: '5px',
      marginBottom: '25px',
      borderBottom: '2px solid #e9ecef',
      paddingBottom: '0',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '12px 20px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: '#6c757d',
      fontSize: '14px',
      fontWeight: '500',
      position: 'relative',
      transition: 'all 0.2s'
    },
    activeTab: {
      color: '#007bff',
      borderBottom: '2px solid #007bff',
      marginBottom: '-2px'
    },
    searchContainer: {
      marginBottom: '25px',
      maxWidth: '400px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#495057',
      borderBottom: '2px solid #e9ecef'
    },
    tableCell: {
      padding: '16px',
      borderBottom: '1px solid #e9ecef'
    },
    badge: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block'
    },
    badgeActive: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    badgeInactive: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    chip: {
      padding: '4px 10px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      fontSize: '12px',
      display: 'inline-block',
      margin: '2px',
      color: '#495057'
    },
    dialogOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    dialog: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    dialogHeader: {
      padding: '24px',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8f9fa'
    },
    dialogTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a1a'
    },
    dialogContent: {
      padding: '24px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#495057',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '180px',
      resize: 'vertical',
      fontFamily: 'monospace',
      boxSizing: 'border-box',
      lineHeight: '1.5'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    variablesContainer: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '6px',
      marginTop: '10px'
    },
    variablesGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    variableButton: {
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    checkbox: {
      width: '18px',
      height: '18px'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px',
      justifyContent: 'flex-end'
    },
    templatePreview: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '6px',
      marginTop: '12px',
      fontSize: '13px',
      color: '#495057',
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#007bff', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}>
            📧
          </div>
          <div>
            <h1 style={styles.title}>Email Templates</h1>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
              Manage email templates for onboarding, payslips, wishes and more
            </p>
          </div>
        </div>
        <button 
          style={styles.button}
          onClick={() => handleOpenDialog()}
        >
          <span style={{ fontSize: '18px' }}>+</span> Create Template
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search templates by name or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'all' && styles.activeTab)}}
          onClick={() => setActiveTab('all')}
        >
          All Templates ({templates.length})
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'active' && styles.activeTab)}}
          onClick={() => setActiveTab('active')}
        >
          Active ({templates.filter(t => t.isActive).length})
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'inactive' && styles.activeTab)}}
          onClick={() => setActiveTab('inactive')}
        >
          Inactive ({templates.filter(t => !t.isActive).length})
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            style={{
              ...styles.tab, 
              ...(activeTab === cat && styles.activeTab)
            }}
            onClick={() => setActiveTab(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Table */}
      {filteredTemplates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>No templates found</h3>
          <p style={{ margin: '0 0 20px 0' }}>
            {searchTerm ? 'Try a different search term' : 'Create your first email template'}
          </p>
          <button 
            style={styles.button}
            onClick={() => handleOpenDialog()}
          >
            Create Template
          </button>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Template Name</th>
              <th style={styles.tableHeader}>Category</th>
              <th style={styles.tableHeader}>Language</th>
              <th style={styles.tableHeader}>Variables</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(template => (
              <tr key={template.id} style={{ 
                backgroundColor: template.isActive ? 'white' : '#f8f9fa',
                opacity: template.isActive ? 1 : 0.8
              }}>
                <td style={styles.tableCell}>
                  <div style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6c757d' }}>
                    {template.subject.length > 60 ? template.subject.substring(0, 60) + '...' : template.subject}
                  </div>
                  <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '4px' }}>
                    Used {template.sentCount} times • Created {template.createdDate}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.chip,
                    backgroundColor: template.category === 'onboarding' ? '#e3f2fd' :
                                    template.category === 'payslip' ? '#e8f5e9' :
                                    template.category === 'wishes' ? '#fff3e0' :
                                    '#f3e5f5'
                  }}>
                    {template.category}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🌐</span>
                    {languageNames[template.language] || template.language}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {template.variables.slice(0, 3).map((variable, index) => (
                      <span key={index} style={styles.chip}>
                        {variable}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span style={styles.chip}>+{template.variables.length - 3}</span>
                    )}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.badge,
                    ...(template.isActive ? styles.badgeActive : styles.badgeInactive)
                  }}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      style={{...styles.buttonSecondary, padding: '6px 12px'}}
                      onClick={() => handleOpenDialog(template)}
                      title="Edit template"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      style={{...styles.buttonSecondary, padding: '6px 12px'}}
                      onClick={() => handleToggleActive(template.id)}
                      title={template.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {template.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button 
                      style={{...styles.buttonDanger, padding: '6px 12px'}}
                      onClick={() => handleDelete(template.id)}
                      title="Delete template"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <div style={styles.dialogHeader}>
              <h2 style={styles.dialogTitle}>
                {editTemplate ? 'Edit Email Template' : 'Create New Email Template'}
              </h2>
              <button 
                onClick={handleCloseDialog}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '4px',
                  borderRadius: '4px',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={styles.dialogContent}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Template Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Birthday Wishes"
                      required
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={styles.select}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Language *</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      style={styles.select}
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>
                          {languageNames[lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        style={styles.checkbox}
                      />
                      <label htmlFor="isActive" style={{...styles.label, margin: 0}}>
                        Active Template
                      </label>
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Happy {occasion}, {employee_name}!"
                    required
                    style={styles.input}
                  />
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    Use {'{variable_name}'} for dynamic content
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Body *</label>
                  <textarea
                    id="template-body"
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    placeholder="Dear {employee_name},&#10;&#10;Happy {occasion}!..."
                    required
                    style={styles.textarea}
                  />
                  
                  {/* Preview */}
                  {formData.body && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                        Preview:
                      </div>
                      <div style={styles.templatePreview}>
                        {formData.body}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Available Variables</label>
                  <div style={styles.variablesContainer}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                      Click to insert variable at cursor position
                    </div>
                    <div style={styles.variablesGrid}>
                      {availableVariables.map(variable => (
                        <button
                          key={variable.key}
                          type="button"
                          onClick={() => insertVariable(variable.key)}
                          style={styles.variableButton}
                          title={variable.label}
                        >
                          <span style={{ color: '#007bff' }}>{`{${variable.key}}`}</span>
                          <span style={{ color: '#6c757d', fontSize: '11px' }}>{variable.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={styles.actionButtons}>
                  <button 
                    type="button" 
                    style={{...styles.buttonSecondary, padding: '12px 24px'}} 
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{...styles.button, padding: '12px 24px'}}
                  >
                    {editTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateEditor;