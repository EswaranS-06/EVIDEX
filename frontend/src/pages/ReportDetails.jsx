import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { Calendar, Globe, CheckCircle, Edit2, Eye, Plus, ChevronLeft } from 'lucide-react';

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    // Mock Data State
    const [report, setReport] = useState({
        clientName: isNew ? '' : 'Client A',
        targetUrl: isNew ? '' : 'https://example.com',
        startDate: isNew ? '' : '2025-10-10',
        endDate: isNew ? '' : '2025-10-15',
        scope: isNew ? '' : 'Web Application, API',
        status: isNew ? 'Draft' : 'In Progress'
    });

    const [vulnerabilities, setVulnerabilities] = useState([
        { id: 1, title: 'SQL Injection', selected: true },
        { id: 2, title: 'Broken Access Control', selected: true },
        { id: 3, title: 'XSS Reflected', selected: false },
    ]);

    return (
        <MainLayout>
            <div className="report-details-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Back Button */}
                <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ marginBottom: '20px', paddingLeft: 0 }}>
                    <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back to Dashboard
                </button>

                {/* Header Section (Metadata) */}
                <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                        <button className="btn btn-ghost" title="Preview">
                            <Eye size={18} style={{ marginRight: '5px' }} /> PREVIEW
                        </button>
                        <button className="btn btn-ghost" title="Edit Metadata">
                            <Edit2 size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>

                        {/* Client Name */}
                        <div className="input-group">
                            <label className="input-label">Client Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={report.clientName}
                                onChange={(e) => setReport({ ...report, clientName: e.target.value })}
                                style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                            />
                        </div>

                        {/* Target URL */}
                        <div className="input-group">
                            <label className="input-label">Target URL</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={report.targetUrl}
                                    onChange={(e) => setReport({ ...report, targetUrl: e.target.value })}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="input-group">
                            <label className="input-label">Start Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="date"
                                    className="input-field"
                                    value={report.startDate}
                                    onChange={(e) => setReport({ ...report, startDate: e.target.value })}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">End Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="date"
                                    className="input-field"
                                    value={report.endDate}
                                    onChange={(e) => setReport({ ...report, endDate: e.target.value })}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>

                        {/* Scope */}
                        <div className="input-group">
                            <label className="input-label">Scope</label>
                            <input
                                type="text"
                                className="input-field"
                                value={report.scope}
                                onChange={(e) => setReport({ ...report, scope: e.target.value })}
                            />
                        </div>

                        {/* Status */}
                        <div className="input-group">
                            <label className="input-label">Status</label>
                            <select
                                className="input-field"
                                value={report.status}
                                onChange={(e) => setReport({ ...report, status: e.target.value })}
                            >
                                <option>Draft</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vulnerabilities Section */}
                <div className="vulnerabilities-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Vulnerabilities</h2>
                        <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => navigate('/finding/new')}>
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        {vulnerabilities.map((vuln, index) => (
                            <div key={vuln.id} style={{
                                padding: '16px 20px',
                                borderBottom: index !== vulnerabilities.length - 1 ? '1px solid var(--color-border)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: vuln.selected ? 'rgba(0, 240, 255, 0.05)' : 'transparent'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input
                                        type="checkbox"
                                        checked={vuln.selected}
                                        onChange={() => {
                                            const newVulns = [...vulnerabilities];
                                            newVulns[index].selected = !newVulns[index].selected;
                                            setVulnerabilities(newVulns);
                                        }}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                    />
                                    <span style={{ fontWeight: 500, color: vuln.selected ? 'white' : 'var(--color-text-muted)' }}>
                                        V{index + 1}: {vuln.title}
                                    </span>
                                </div>

                                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--color-border)' }} onClick={() => navigate(`/finding/${vuln.id}`)}>
                                    EDIT
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default ReportDetails;
