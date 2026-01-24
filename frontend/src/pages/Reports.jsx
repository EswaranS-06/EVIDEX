import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, CheckCircle, Lock, Calendar, FileText } from 'lucide-react';

const Reports = () => {
    const navigate = useNavigate();

    // Mock Data
    const [reports] = useState([
        { id: 1, name: 'Web Application Penetration Test - Client A', date: 'Oct 10, 2025', status: 'Completed', severity: 'High', locked: false },
        { id: 2, name: 'API Security Assessment - Client B', date: 'Jan 05, 2026', status: 'In Progress', severity: 'Medium', locked: false },
        { id: 3, name: 'Internal Network Audit - Client C', date: 'Dec 12, 2025', status: 'Verified', severity: 'Low', locked: false },
        { id: 4, name: 'Mobile App Pentest - Client D', date: 'Feb 15, 2026', status: 'Draft', severity: 'Low', locked: false },
        { id: 5, name: 'Cloud Configuration Audit - Client E', date: 'Mar 01, 2026', status: 'In Progress', severity: 'Critical', locked: false },
    ]);

    const getSeverityBg = (sev) => {
        switch (sev) {
            case 'Critical': return 'rgba(142, 45, 226, 0.1)';
            case 'High': return 'rgba(255, 77, 109, 0.1)';
            case 'Medium': return 'rgba(254, 228, 64, 0.1)';
            case 'Low': return 'rgba(0, 240, 255, 0.1)';
            default: return 'var(--glass-bg)';
        }
    };

    const getSeverityColor = (sev) => {
        switch (sev) {
            case 'Critical': return 'var(--color-secondary)';
            case 'High': return 'var(--color-error)';
            case 'Medium': return 'var(--color-warning)';
            case 'Low': return 'var(--color-primary)';
            default: return 'var(--color-border)';
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredReports = reports.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="reports-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#fff' }}>All Reports</h1>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>View and manage all your security assessment reports.</p>
            </div>

            {/* Top Bar: Search and Actions */}
            <div className="top-bar glass-panel" style={{
                padding: '16px 24px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div className="search-bar" style={{ position: 'relative', width: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px', background: 'rgba(0,0,0,0.2)' }}
                    />
                </div>

                <button className="btn btn-primary" onClick={() => navigate('/report/new')}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    NEW REPORT
                </button>
            </div>

            {/* Reports List */}
            <div className="reports-list">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredReports.map(report => (
                        <div
                            key={report.id}
                            className="glass-panel"
                            onClick={() => navigate(`/report/${report.id}`)}
                            style={{
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                background: report.status === 'Completed' ? getSeverityBg(report.severity) : 'var(--glass-bg)',
                                borderLeft: report.status === 'Completed' ? `6px solid ${getSeverityColor(report.severity)}` : '1px solid var(--color-border)',
                                borderColor: report.status === 'Completed' ? getSeverityColor(report.severity) : 'var(--glass-border)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                if (report.status === 'Completed') {
                                    e.currentTarget.style.boxShadow = `0 10px 30px ${getSeverityBg(report.severity)}`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(0, 240, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <FileText size={24} />
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{report.name}</h3>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {report.date}
                                        </span>
                                        <span style={{
                                            color: report.status === 'Completed' ? 'var(--color-success)' : 'var(--color-primary)',
                                            background: report.status === 'Completed' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(0, 240, 255, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-ghost" title="Edit" onClick={(e) => { e.stopPropagation(); navigate(`/report/${report.id}`); }}>
                                    <Edit2 size={18} />
                                </button>
                                <button className="btn btn-ghost" title="Actions" onClick={(e) => e.stopPropagation()}>
                                    {report.locked ? <Lock size={18} /> : <Trash2 size={18} style={{ color: 'var(--color-error)' }} />}
                                </button>
                                <button className="btn btn-ghost" title="Verify" onClick={(e) => e.stopPropagation()}>
                                    <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredReports.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                            No reports found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
