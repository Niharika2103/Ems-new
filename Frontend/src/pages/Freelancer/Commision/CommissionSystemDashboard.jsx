// CommissionSystemDashboard.jsx
import React, { useState, useEffect } from 'react';

const CommissionSystemDashboard = () => {
  // Mock initial data (plain JS objects)
  const initialLedger = [
    { id: '1', date: '2025-12-01', rep: 'Alice', saleAmount: 5000, rateId: 'r1', commission: 500, status: 'paid' },
    { id: '2', date: '2025-12-02', rep: 'Bob', saleAmount: 12000, rateId: 'r1', commission: 1200, status: 'pending' },
    { id: '3', date: '2025-12-03', rep: 'Charlie', saleAmount: 8000, rateId: 'r2', commission: 1200, status: 'disputed', notes: 'Rate mismatch' },
  ];

  const initialRates = [
    { id: 'r1', role: 'Sales Rep', rate: 10, active: true },
    { id: 'r2', role: 'Senior Rep', rate: 15, active: true },
  ];

  const initialDisputes = [
    { id: 'd1', ledgerId: '3', reason: 'Incorrect rate applied', resolved: false, createdAt: '2025-12-03T10:00:00Z' },
  ];

  const [ledger, setLedger] = useState(initialLedger);
  const [rates, setRates] = useState(initialRates);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newRate, setNewRate] = useState({ role: '', rate: 0 });
  const [file, setFile] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Calculate commission
  const calculateCommission = (sale, rate) => {
    return parseFloat((sale * (rate / 100)).toFixed(2));
  };

  // Recalculate commissions when rates change (mock real-time)
  useEffect(() => {
    setLedger(prev =>
      prev.map(entry => {
        const rateObj = rates.find(r => r.id === entry.rateId);
        const rate = rateObj ? rateObj.rate : 0;
        const newCommission = calculateCommission(entry.saleAmount, rate);
        return { ...entry, commission: newCommission };
      })
    );
  }, [rates]);

  // Add new rate
  const addRate = () => {
    if (!newRate.role || newRate.rate <= 0) return;
    const newRule = {
      id: `r${Date.now()}`,
      role: newRate.role,
      rate: newRate.rate,
      active: true,
    };
    setRates([...rates, newRule]);
    setNewRate({ role: '', rate: 0 });
  };

  // Flag dispute
  const flagDispute = (id, reason) => {
    const newDispute = {
      id: `d${Date.now()}`,
      ledgerId: id,
      reason,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    setDisputes([...disputes, newDispute]);
    setLedger(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'disputed', notes: reason } : e))
    );
  };

  // Resolve dispute
  const resolveDispute = (disputeId) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return;

    setDisputes(prev =>
      prev.map(d => (d.id === disputeId ? { ...d, resolved: true } : d))
    );

    setLedger(prev =>
      prev.map(e =>
        e.id === dispute.ledgerId ? { ...e, status: 'paid' } : e
      )
    );
  };

  // Export CSV
  const exportLedger = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = ['ID', 'Date', 'Rep', 'Sale Amount', 'Rate ID', 'Commission', 'Status', 'Notes'];
      const rows = ledger.map(e => [
        e.id,
        e.date,
        e.rep,
        e.saleAmount.toString(),
        e.rateId || '',
        e.commission.toString(),
        e.status,
        e.notes || ''
      ]);
      const csv = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission_ledger_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 500);
  };

  // File upload handler
  const handleReconUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      alert(`✅ File "${e.target.files[0].name}" uploaded. (Mock reconciliation in progress)`);
    }
  };

  // Summary stats
  const totalEarned = ledger.reduce((sum, l) => sum + l.commission, 0);
  const pendingPayouts = ledger
    .filter(l => l.status === 'pending')
    .reduce((sum, l) => sum + l.commission, 0);
  const disputedCount = ledger.filter(l => l.status === 'disputed').length;

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>Commission Management System</h1>
        <p style={{ color: '#666' }}>Real-time calculation • Ledger • Disputes • Reconciliation • Export</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['dashboard', 'ledger', 'config'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab ? '#007bff' : '#f0f0f0',
              color: activeTab === tab ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Total Earned</h3>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' }}>${totalEarned.toFixed(2)}</p>
            </div>
            <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Pending Payouts</h3>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ffc107' }}>${pendingPayouts.toFixed(2)}</p>
            </div>
            <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Disputed Entries</h3>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#dc3545' }}>{disputedCount}</p>
            </div>
          </div>

          <h3>Recent Transactions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Rep</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Commission ($)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.slice(0, 5).map((entry) => (
                <tr key={entry.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.date}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.rep}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>${entry.commission}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'white',
                      backgroundColor:
                        entry.status === 'paid' ? '#28a745' :
                        entry.status === 'pending' ? '#ffc107' :
                        '#dc3545'
                    }}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LEDGER */}
      {activeTab === 'ledger' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Commission Ledger</h2>
            <button
              onClick={exportLedger}
              disabled={exporting}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Rep</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Sale ($)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Rate (%)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Commission ($)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => {
                const rateObj = rates.find(r => r.id === entry.rateId);
                const rate = rateObj ? rateObj.rate : 0;
                return (
                  <tr key={entry.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.date}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entry.rep}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{entry.saleAmount}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{rate}%</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                      ${entry.commission}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'white',
                        backgroundColor:
                          entry.status === 'paid' ? '#28a745' :
                          entry.status === 'pending' ? '#ffc107' :
                          '#dc3545'
                      }}>
                        {entry.status}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      {entry.status !== 'disputed' && (
                        <button
                          onClick={() => flagDispute(entry.id, 'Manual review needed')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                          }}
                        >
                          Dispute
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CONFIGURATION */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Rate Config */}
          <div style={{ flex: '1', minWidth: '300px', border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h3>Rate Configuration</h3>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="Role (e.g., Sales Rep)"
                value={newRate.role}
                onChange={(e) => setNewRate({ ...newRate, role: e.target.value })}
                style={{ padding: '8px', border: '1px solid #ccc', minWidth: '150px' }}
              />
              <input
                type="number"
                placeholder="Rate (%)"
                value={newRate.rate || ''}
                onChange={(e) => setNewRate({ ...newRate, rate: parseFloat(e.target.value) || 0 })}
                style={{ padding: '8px', border: '1px solid #ccc', width: '100px' }}
              />
              <button onClick={addRate} style={{ padding: '8px 12px' }}>Add Rate</button>
            </div>
            <h4>Active Rules</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {rates.map((rate) => (
                <li key={rate.id} style={{ padding: '8px', border: '1px solid #eee', margin: '4px 0' }}>
                  {rate.role}: {rate.rate}% ({rate.active ? 'Active' : 'Inactive'})
                </li>
              ))}
            </ul>
          </div>

          {/* Disputes */}
          <div style={{ flex: '1', minWidth: '300px', border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h3>Dispute Handling</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ledger ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Reason</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Status</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dispute.ledgerId}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dispute.reason}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'white',
                        backgroundColor: dispute.resolved ? '#28a745' : '#dc3545'
                      }}>
                        {dispute.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      {!dispute.resolved && (
                        <button
                          onClick={() => resolveDispute(dispute.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reconciliation */}
          <div style={{ flex: '1', minWidth: '300px', border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h3>Reconciliation</h3>
            <p>Upload payout file (CSV/Excel) to match ledger.</p>
            <input type="file" accept=".csv,.xlsx" onChange={handleReconUpload} />
            {file && <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Uploaded: {file.name}</p>}
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '4px', fontSize: '14px' }}>
              <strong>Result (mock):</strong> 18/20 matched. 2 discrepancies.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionSystemDashboard;