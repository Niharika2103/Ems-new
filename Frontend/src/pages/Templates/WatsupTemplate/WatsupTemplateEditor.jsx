import React, { useState, useEffect } from 'react';
import {getTemplatesApi,createTemplateApi,updateTemplateApi,updateTemplateStatusApi,deleteTemplateApi} from '../../../api/authApi';

const WhatsAppTemplateEditor = () => {
  const [templates, setTemplates] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  // Initial data
  // const initialTemplates = [
  //   {
  //     id: 1,
  //     name: 'Leave Approved',
  //     category: 'leave_updates',
  //     description: 'Notify employees when leave is approved',
  //     templateId: 'leave_approved_v1',
  //     message: '✅ *Leave Approved*\n\nDear {employee_name},\nYour leave from *{start_date}* to *{end_date}* has been approved.\n\nLeave ID: {leave_id}\nApproved by: {approver_name}',
  //     status: 'active',
  //     approval: 'approved',
  //     consentRequired: true,
  //     lastUsed: '2024-01-15',
  //     usage: { total: 150, delivered: 148, read: 140 }
  //   },
  //   {
  //     id: 2,
  //     name: 'Shift Reminder',
  //     category: 'shift_reminders',
  //     description: 'Remind employees about upcoming shifts',
  //     templateId: 'shift_reminder_v1',
  //     message: '⏰ *Shift Reminder*\n\nHello {employee_name},\nYour shift starts at *{shift_time}*\nLocation: {location}\nManager: {manager_name}',
  //     status: 'active',
  //     approval: 'approved',
  //     consentRequired: true,
  //     lastUsed: '2024-01-14',
  //     usage: { total: 300, delivered: 295, read: 280 }
  //   },
  //   {
  //     id: 3,
  //     name: 'Attendance Alert',
  //     category: 'attendance_alerts',
  //     description: 'Alert employees about attendance status',
  //     templateId: 'attendance_alert_v1',
  //     message: '📋 *Attendance Alert*\n\nDear {employee_name},\nDate: {date}\nStatus: *{attendance_status}*\nReason: {reason}',
  //     status: 'inactive',
  //     approval: 'pending',
  //     consentRequired: true,
  //     lastUsed: null,
  //     usage: { total: 0, delivered: 0, read: 0 }
  //   },
  //   {
  //     id: 4,
  //     name: 'Salary Credited',
  //     category: 'payroll_alerts',
  //     description: 'Notify employees about salary deposit',
  //     templateId: 'salary_credited_v1',
  //     message: '💰 *Salary Credited*\n\nHello {employee_name},\nSalary for {month} {year} has been credited.\nAmount: {amount}',
  //     status: 'active',
  //     approval: 'approved',
  //     consentRequired: true,
  //     lastUsed: '2024-01-10',
  //     usage: { total: 200, delivered: 198, read: 185 }
  //   }
  // ];

 useEffect(() => {
  fetchTemplates();
}, []);

const fetchTemplates = async () => {
  const res = await getTemplatesApi();

  setTemplates(
    res.data.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      templateId: t.template_id,
      message: t.message,
      status: t.status,
      approval: t.approval,
      consentRequired: t.consent_required,
      lastUsed: null,
      usage: { total: 0, delivered: 0, read: 0 }
    }))
  );
};
const categories = [
  {
    id: 'all',
    name: 'All Templates',
    count: templates.length
  },
  {
    id: 'leave_updates',
    name: 'Leave Updates',
    count: templates.filter(t => t.category === 'leave_updates').length
  },
  {
    id: 'shift_reminders',
    name: 'Shift Reminders',
    count: templates.filter(t => t.category === 'shift_reminders').length
  },
  {
    id: 'attendance_alerts',
    name: 'Attendance Alerts',
    count: templates.filter(t => t.category === 'attendance_alerts').length
  },
  {
    id: 'payroll_alerts',
    name: 'Payroll Alerts',
    count: templates.filter(t => t.category === 'payroll_alerts').length
  }
];

const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  });

  
  const [formData, setFormData] = useState({
    name: '',
    category: 'leave_updates',
    description: '',
    templateId: '',
    message: '',
    status: 'inactive',
    approval: 'pending',
    consentRequired: true
  });


  // Template operations
  const handleCreateTemplate = () => {
    setFormData({
      name: '',
      category: 'leave_updates',
      description: '',
      templateId: '',
      message: '',
      status: 'inactive',
      approval: 'pending',
      consentRequired: true
    });
    setEditTemplate(null);
    setShowDialog(true);
  };

  const handleEditTemplate = (template) => {
    setFormData({
      name: template.name,
      category: template.category,
      description: template.description,
      templateId: template.templateId,
      message: template.message,
      status: template.status,
      approval: template.approval,
      consentRequired: template.consentRequired
    });
    setEditTemplate(template);
    setShowDialog(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    name: formData.name,
    category: formData.category,
    description: formData.description,
    templateId: formData.templateId,
    message: formData.message,
    status: formData.status,
    approval: formData.approval,
    consentRequired: formData.consentRequired
  };

  if (editTemplate) {
    await updateTemplateApi(editTemplate.id, payload);
  } else {
    await createTemplateApi(payload);
  }

  await fetchTemplates();
  setShowDialog(false);
};



 const handleToggleStatus = async (id) => {
  const template = templates.find(t => t.id === id);
  const newStatus = template.status === "active" ? "active" : "inactive";

  await updateTemplateStatusApi(id, newStatus);
  await fetchTemplates();
};


  const handleDeleteTemplate = async (id) => {
  if (!window.confirm("Are you sure you want to delete this template?")) return;

  await deleteTemplateApi(id);
  setTemplates(prev => prev.filter(t => t.id !== id));
};


  // Helper functions for styling
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getApprovalColor = (approval) => {
    switch(approval) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      leave_updates: '#3b82f6',
      shift_reminders: '#f59e0b',
      attendance_alerts: '#ef4444',
      payroll_alerts: '#10b981',
      emergency: '#8b5cf6',
      announcement: '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  // Inline CSS Styles
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '20px'
    },
    headerLeft: {
      flex: 1,
      minWidth: '300px'
    },
    headerRight: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#111827',
      margin: '0 0 8px 0',
      lineHeight: '1.2'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      margin: '0',
      lineHeight: '1.5'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonSecondary: {
      padding: '8px 16px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    buttonDanger: {
      padding: '8px 16px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #fca5a5',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '4px',
      gap: '4px'
    },
    viewButton: {
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280'
    },
    viewButtonActive: {
      backgroundColor: 'white',
      color: '#111827',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    categories: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      flexWrap: 'wrap'
    },
    categoryButton: {
      padding: '10px 20px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    categoryButtonActive: {
      backgroundColor: '#1e40af',
      color: 'white',
      borderColor: '#1e40af'
    },
    countBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    templateCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      position: 'relative',
      transition: 'all 0.2s',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }
    },
    templateHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    templateTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 4px 0'
    },
    templateDescription: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0',
      lineHeight: '1.5'
    },
    categoryTag: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white',
      marginBottom: '12px'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    },
    messagePreview: {
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#4b5563',
      margin: '16px 0',
      whiteSpace: 'pre-wrap',
      maxHeight: '100px',
      overflow: 'hidden',
      lineHeight: '1.4'
    },
    usageStats: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    statItem: {
      textAlign: 'center'
    },
    statValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '2px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px'
    },
    // List View Styles
    listContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '40px'
    },
    listHeader: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
      fontWeight: '600',
      color: '#374151',
      fontSize: '14px'
    },
    listRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f9fafb'
      }
    },
    // Dialog Styles
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
      borderRadius: '16px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    dialogHeader: {
      padding: '24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    },
    dialogTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827'
    },
    dialogContent: {
      padding: '24px',
      overflowY: 'auto',
      maxHeight: 'calc(90vh - 140px)'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#374151',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'monospace',
      boxSizing: 'border-box',
      lineHeight: '1.5'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    checkbox: {
      width: '16px',
      height: '16px'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px',
      justifyContent: 'flex-end'
    },
    // Progress Bar
    progressBar: {
      height: '6px',
      backgroundColor: '#e9ecef',
      borderRadius: '3px',
      marginTop: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#25D366',
      borderRadius: '3px'
    }
  };

  // Template Card Component for Grid View
  const TemplateCard = ({ template }) => {
    const deliveryRate = template.usage.total > 0 
      ? Math.round((template.usage.delivered / template.usage.total) * 100)
      : 0;
    
    const readRate = template.usage.delivered > 0
      ? Math.round((template.usage.read / template.usage.delivered) * 100)
      : 0;

    return (
      <div 
        style={styles.templateCard}
        onClick={() => handleEditTemplate(template)}
      >
        <div style={styles.templateHeader}>
          <div style={{ flex: 1 }}>
            <div style={{
              ...styles.categoryTag,
              backgroundColor: getCategoryColor(template.category)
            }}>
              {template.category.replace('_', ' ')}
            </div>
            <h3 style={styles.templateTitle}>{template.name}</h3>
            <p style={styles.templateDescription}>{template.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(template.status) + '20',
              color: getStatusColor(template.status)
            }}>
              {template.status === 'active' ? '● Active' : '○ Inactive'}
            </span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getApprovalColor(template.approval) + '20',
              color: getApprovalColor(template.approval)
            }}>
              {template.approval}
            </span>
          </div>
        </div>

        <div style={styles.messagePreview}>
          {template.message.substring(0, 120)}...
        </div>

        <div style={styles.usageStats}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{template.usage.total}</div>
            <div style={styles.statLabel}>Total Sent</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{deliveryRate}%</div>
            <div style={styles.statLabel}>Delivered</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{readRate}%</div>
            <div style={styles.statLabel}>Read Rate</div>
          </div>
        </div>

        <div style={styles.actionButtons}>
          <button 
            style={styles.buttonSecondary}
            onClick={(e) => {
              e.stopPropagation();
              handleEditTemplate(template);
            }}
          >
            Edit
          </button>
          <button 
            style={styles.buttonSecondary}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(template.id);
            }}
          >
            {template.status === 'active' ? 'Activate':'Deactivate' }
          </button>
          <button 
            style={styles.buttonDanger}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTemplate(template.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>WhatsApp Communication Templates</h1>
          <p style={styles.subtitle}>
            Manage pre-approved WhatsApp message templates for employee communications
          </p>
        </div>
        
        <div style={styles.headerRight}>
          {/* View Toggle */}
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewButton,
                ...(activeView === 'grid' && styles.viewButtonActive)
              }}
              onClick={() => setActiveView('grid')}
            >
              <span style={{ marginRight: '6px' }}>▫️</span> Grid
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(activeView === 'list' && styles.viewButtonActive)
              }}
              onClick={() => setActiveView('list')}
            >
              <span style={{ marginRight: '6px' }}>≡</span> List
            </button>
          </div>
          
          <button 
            style={styles.button}
            onClick={handleCreateTemplate}
          >
            <span style={{ fontSize: '20px' }}>+</span> New Template
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div style={styles.categories}>
        {categories.map(category => (
          <button
            key={category.id}
            style={{
              ...styles.categoryButton,
              ...(selectedCategory === category.id && styles.categoryButtonActive)
            }}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
            {selectedCategory === category.id && (
              <span style={styles.countBadge}>{category.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* GRID VIEW */}
      {activeView === 'grid' && (
        <div style={styles.gridContainer}>
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {activeView === 'list' && (
        <div style={styles.listContainer}>
          {/* List Header */}
          <div style={styles.listHeader}>
            <div style={{ flex: 3 }}>Template Details</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 1 }}>Approval</div>
            <div style={{ flex: 1 }}>Usage</div>
            <div style={{ flex: 1 }}>Last Used</div>
            <div style={{ flex: 2 }}>Actions</div>
          </div>
          
          {/* List Rows */}
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              style={{
                ...styles.listRow,
                backgroundColor: template.status === 'inactive' ? '#f9fafb' : 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 
                template.status === 'inactive' ? '#f9fafb' : 'white'
              }
            >
              {/* Template Details Column */}
              <div style={{ flex: 3, padding: '0 16px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px' 
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                      {template.description}
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: getCategoryColor(template.category) + '20',
                      color: getCategoryColor(template.category),
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {template.category.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#9ca3af',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    ID: {template.templateId}
                  </div>
                </div>
              </div>
              
              {/* Status Column */}
              <div style={{ flex: 1, padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(template.status)
                  }} />
                  <span style={{ fontSize: '13px' }}>
                    {template.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Approval Column */}
              <div style={{ flex: 1, padding: '0 16px' }}>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: getApprovalColor(template.approval) + '20',
                  color: getApprovalColor(template.approval),
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {template.approval}
                </span>
              </div>
              
              {/* Usage Column */}
              <div style={{ flex: 1, padding: '0 16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {template.usage.total}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {template.usage.delivered} delivered
                </div>
                {template.usage.total > 0 && (
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${Math.round((template.usage.delivered / template.usage.total) * 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Last Used Column */}
              <div style={{ flex: 1, padding: '0 16px' }}>
                <div style={{ fontSize: '13px', color: '#111827' }}>
                  {template.lastUsed || 'Never used'}
                </div>
              </div>
              
              {/* Actions Column */}
              <div style={{ flex: 2, padding: '0 16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{
                      ...styles.buttonSecondary,
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                    onClick={() => handleEditTemplate(template)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{
                      ...styles.buttonSecondary,
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                    onClick={() => handleToggleStatus(template.id)}
                  >
                    {template.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    style={{
                      ...styles.buttonDanger,
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <div style={styles.dialogHeader}>
              <h2 style={styles.dialogTitle}>
                {editTemplate ? 'Edit WhatsApp Template' : 'Create New Template'}
              </h2>
              <button 
                onClick={() => setShowDialog(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  color: '#6b7280',
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Template Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Leave Approval Notification"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={styles.select}
                    >
                      <option value="leave_updates">Leave Updates</option>
                      <option value="shift_reminders">Shift Reminders</option>
                      <option value="attendance_alerts">Attendance Alerts</option>
                      <option value="payroll_alerts">Payroll Alerts</option>
                      <option value="emergency">Emergency</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      style={styles.select}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of when to use this template"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Template ID *</label>
                  <input
                    type="text"
                    value={formData.templateId}
                    onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                    placeholder="unique_template_id"
                    required
                    style={styles.input}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Unique identifier for WhatsApp Business API
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message Content *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Enter your message here. Use {variable} for dynamic content."
                    required
                    style={styles.textarea}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Use {'{variable}'} for dynamic content (e.g., {`{employee_name}, {date}`})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Approval Status</label>
                    <select
                      value={formData.approval}
                      onChange={(e) => setFormData({...formData, approval: e.target.value})}
                      style={styles.select}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id="consentRequired"
                        checked={formData.consentRequired}
                        onChange={(e) => setFormData({...formData, consentRequired: e.target.checked})}
                        style={styles.checkbox}
                      />
                      <label htmlFor="consentRequired" style={{...styles.label, margin: 0}}>
                        Require Opt-in
                      </label>
                    </div>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    style={{...styles.buttonSecondary, padding: '10px 20px'}} 
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{...styles.button, padding: '10px 20px'}}
                  >
                    {editTemplate ? 'Save Changes' : 'Create Template'}
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

export default WhatsAppTemplateEditor;