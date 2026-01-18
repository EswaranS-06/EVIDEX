import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { Search, Plus, Edit2, Trash2, CheckCircle, Lock, Calendar, FileText } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    // Mock Data
    const [reports] = useState([
        { id: 1, name: 'Web Application Penetration Test - Client A', date: 'Oct 10, 2025', status: 'Completed', locked: false },
        { id: 2, name: 'API Security Assessment - Client B', date: 'Jan 05, 2026', status: 'In Progress', locked: false },
        { id: 3, name: 'Internal Network Audit - Client C', date: 'Dec 12, 2025', status: 'Verified', locked: false },
    ]);

    return (
        <MainLayout>
            <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

                    <button className="btn btn-primary" onClick={() => navigate('/report/new')}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        NEW REPORT
                    </button>
                </div>

                {/* Stats Row */}
                <div style={{ marginBottom: '24px', display: 'flex', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
                        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '5px' }}>In Progress</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>1</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
                        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '5px' }}>Completed</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>2</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '20px', flex: 1, background: 'linear-gradient(135deg, rgba(30,36,51,0.8), rgba(112,0,255,0.1))' }}>
                        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '5px' }}>Total Reports</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reports.length}</div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="reports-list">
                    <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Recent Reports</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reports.map(report => (
                            <div
                                key={report.id}
                                className="glass-panel"
                                onClick={() => navigate(`/report/${report.id}`)}
                                style={{
                                    padding: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                    </div>

                    {/* Sketch "NUM OF REPORT" implementation */}
                    <div style={{ marginTop: '20px', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Num of Reports: {reports.length}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
