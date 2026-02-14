import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, CheckCircle, Lock, Calendar, FileText, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const { setIsCollapsed } = useOutletContext();

    const [statusFilter, setStatusFilter] = useState('All');

    // Real Data State
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        'Draft': 0,
        'In Progress': 0,
        'Completed': 0,
        'Verified': 0,
        'Total': 0
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/reports/');
            const data = response.data;
            setReports(data);

            // Calculate Stats
            const newStats = {
                'Draft': data.filter(r => r.status === 'Draft').length,
                'In Progress': data.filter(r => r.status === 'In Progress').length,
                'Completed': data.filter(r => r.status === 'Completed').length,
                'Verified': data.filter(r => r.status === 'Verified').length,
                'Total': data.length
            };
            setStats(newStats);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
            setError("Failed to load reports.");
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => statusFilter === 'All' || r.status === statusFilter);

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

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                {/* Header content removed per user request */}
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
                        style={{ width: '100%', paddingLeft: '40px', background: 'rgba(0,0,0,0.2)' }}
                    />
                </div>

                <button className="btn btn-primary" onClick={() => {
                    navigate('/create');
                }}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    NEW REPORT
                </button>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div
                    className="glass-panel"
                    onClick={() => setStatusFilter(statusFilter === 'Draft' ? 'All' : 'Draft')}
                    style={{
                        padding: '16px 20px',
                        flex: '1 1 150px',
                        borderLeft: '4px solid var(--color-text-muted)',
                        cursor: 'pointer',
                        transform: statusFilter === 'Draft' ? 'translateY(-4px)' : 'none',
                        borderColor: statusFilter === 'Draft' ? 'var(--color-primary)' : 'var(--color-border)',
                        boxShadow: statusFilter === 'Draft' ? 'var(--shadow-glow)' : 'var(--shadow-card)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>Draft</h3>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.Draft}</div>
                </div>

                <div
                    className="glass-panel"
                    onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'All' : 'In Progress')}
                    style={{
                        padding: '16px 20px',
                        flex: '1 1 150px',
                        borderLeft: '4px solid var(--color-primary)',
                        cursor: 'pointer',
                        transform: statusFilter === 'In Progress' ? 'translateY(-4px)' : 'none',
                        borderColor: statusFilter === 'In Progress' ? 'var(--color-primary)' : 'var(--color-border)',
                        boxShadow: statusFilter === 'In Progress' ? 'var(--shadow-glow)' : 'var(--shadow-card)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>In Progress</h3>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stats['In Progress']}</div>
                </div>

                <div
                    className="glass-panel"
                    onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
                    style={{
                        padding: '16px 20px',
                        flex: '1 1 150px',
                        borderLeft: '4px solid var(--color-success)',
                        cursor: 'pointer',
                        transform: statusFilter === 'Completed' ? 'translateY(-4px)' : 'none',
                        borderColor: statusFilter === 'Completed' ? 'var(--color-success)' : 'var(--color-border)',
                        boxShadow: statusFilter === 'Completed' ? '0 0 15px rgba(0, 245, 212, 0.2)' : 'var(--shadow-card)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>Completed</h3>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)' }}>{stats.Completed}</div>
                </div>

                <div
                    className="glass-panel"
                    onClick={() => setStatusFilter(statusFilter === 'Verified' ? 'All' : 'Verified')}
                    style={{
                        padding: '16px 20px',
                        flex: '1 1 150px',
                        borderLeft: '4px solid #00d2ff',
                        cursor: 'pointer',
                        transform: statusFilter === 'Verified' ? 'translateY(-4px)' : 'none',
                        borderColor: statusFilter === 'Verified' ? '#00d2ff' : 'var(--color-border)',
                        boxShadow: statusFilter === 'Verified' ? '0 0 15px rgba(0, 210, 255, 0.2)' : 'var(--shadow-card)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>Verified</h3>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#00d2ff' }}>{stats.Verified}</div>
                </div>

                <div
                    className="glass-panel"
                    onClick={() => setStatusFilter('All')}
                    style={{
                        padding: '16px 20px',
                        flex: '1 1 150px',
                        borderLeft: '4px solid var(--color-secondary)',
                        background: 'linear-gradient(135deg, rgba(142,45,226,0.1), rgba(0,240,255,0.05))',
                        cursor: 'pointer',
                        transform: statusFilter === 'All' ? 'translateY(-4px)' : 'none',
                        boxShadow: statusFilter === 'All' ? '0 0 15px rgba(142, 45, 226, 0.2)' : 'var(--shadow-card)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>Total Reports</h3>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.Total}</div>
                </div>
            </div>

            {/* Dashboard Bottom Row */}
            <div className="flex-stack-on-mobile">

                {/* Reports List - LEFT SIDE */}
                <div className="reports-list" style={{ flex: '1.8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>
                            {statusFilter === 'All' ? 'Recent Reports' : `${statusFilter} Reports`}
                        </h2>
                        {statusFilter !== 'All' && (
                            <button className="btn btn-ghost" onClick={() => setStatusFilter('All')} style={{ fontSize: '0.75rem' }}>
                                Clear Filter ×
                            </button>
                        )}
                    </div>

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
                                    borderLeft: '4px solid var(--color-primary)', // Default accent
                                    borderColor: 'var(--glass-border)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
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
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{report.client_name} - {report.application_name}</h3>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} /> {new Date(report.created_at || report.start_date || Date.now()).toLocaleDateString()}
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
                                    <button className="btn btn-ghost" title="Actions" onClick={(e) => e.stopPropagation()}>
                                        {report.locked ? <Lock size={18} /> : <Trash2 size={18} style={{ color: 'var(--color-error)' }} />}
                                    </button>
                                    <button className="btn btn-ghost" title="Verify" onClick={(e) => e.stopPropagation()}>
                                        <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn btn-neon"
                            onClick={() => navigate('/reports')}
                            style={{ padding: '12px 40px', fontSize: '1rem' }}
                        >
                            View All Reports
                        </button>
                    </div>
                </div>

                {/* OWASP Chart removed per user request */}

            </div>
        </div>
    );
};

export default Dashboard;
