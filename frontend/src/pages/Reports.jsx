import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search, FilePlus, Edit2, Trash2, CheckCircle, Lock, Calendar, FileText } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const Reports = () => {
    const navigate = useNavigate();
    const { confirm } = useModal();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/reports/');
            setReports(response.data);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    };

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
        report.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.application_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteReport = async (reportId) => {
        const isConfirmed = await confirm(
            "This action cannot be undone. All findings and evidence associated with this report will be permanently removed.",
            "Delete Report?",
            { confirmText: 'Delete', isDangerous: true }
        );

        if (!isConfirmed) return;

        try {
            await api.delete(`/api/reports/${reportId}/`);
            setReports(reports.filter(r => r.id !== reportId));
        } catch (err) {
            console.error("Failed to delete report:", err);
        }
    };

    return (
        <div className="reports-container">
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

                <button className="btn btn-primary" onClick={() => navigate('/create')}>
                    <FilePlus size={18} style={{ marginRight: '8px' }} />
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
                                background: 'var(--glass-bg)',
                                borderLeft: '4px solid var(--color-primary)',
                                borderColor: 'var(--glass-border)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
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
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{report.client_name} - {report.application_name}</h3>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {new Date(report.created_at || Date.now()).toLocaleDateString()}
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
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📝 {report.findings_count || 0} Findings
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-ghost" title="Edit" onClick={(e) => { e.stopPropagation(); navigate(`/report/${report.id}`); }}>
                                    <Edit2 size={18} />
                                </button>
                                <button className="btn btn-ghost" title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}>
                                    <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
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
