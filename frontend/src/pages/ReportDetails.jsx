import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Calendar, Globe, CheckCircle, Edit2, Eye, Plus, ChevronLeft, Save } from 'lucide-react';

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    // Mock Data State
    const [report, setReport] = useState({
        clientName: '',
        targetUrl: '',
        startDate: '',
        endDate: '',
        scope: '',
        status: 'Draft'
    });

    // Reset state when ID changes
    React.useEffect(() => {
        if (isNew) {
            setReport({
                clientName: '',
                targetUrl: '',
                startDate: '',
                endDate: '',
                scope: '',
                status: 'Draft'
            });
        } else {
            // Mock fetching data based on ID
            const mockReports = {
                '1': {
                    clientName: 'Client A',
                    targetUrl: 'https://example.com',
                    startDate: '2025-10-10',
                    endDate: '2025-10-15',
                    scope: 'Web Application, API',
                    status: 'Completed'
                },
                '2': {
                    clientName: 'Client B',
                    targetUrl: 'https://api.client-b.com',
                    startDate: '2026-01-05',
                    endDate: '',
                    scope: 'API Security',
                    status: 'In Progress'
                },
                '3': {
                    clientName: 'Client C',
                    targetUrl: '192.168.1.0/24',
                    startDate: '2025-12-12',
                    endDate: '2025-12-20',
                    scope: 'Internal Network',
                    status: 'Verified'
                }
            };

            const data = mockReports[id] || mockReports['1']; // Fallback to 1
            setReport(data);
        }
    }, [id, isNew]);

    const handleSave = () => {
        alert('Changes saved successfully!');
    };

    const [vulnerabilities, setVulnerabilities] = useState([
        { id: 1, title: 'SQL Injection', selected: true },
        { id: 2, title: 'Broken Access Control', selected: true },
        { id: 3, title: 'XSS Reflected', selected: false },
    ]);

    const [showSidebar, setShowSidebar] = useState(true); // Default open for visibility
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVulnerabilities = vulnerabilities.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (

        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* Center Content Area - Resizes based on sidebar */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                transition: 'all 0.3s ease'
            }}>
                <div className="report-details-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                    {/* Back Button and Sidebar Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ paddingLeft: 0 }}>
                            <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back to Dashboard
                        </button>
                        {!showSidebar && (
                            <button className="btn btn-primary" onClick={() => setShowSidebar(true)}>
                                <Plus size={18} style={{ marginRight: '8px' }} /> OWASP VULNERABILITIES
                            </button>
                        )}
                    </div>

                    {/* Header Section (Metadata) */}
                    <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-ghost" title="Preview">
                                <Eye size={18} style={{ marginRight: '5px' }} /> PREVIEW
                            </button>
                            {isEditing && (
                                <button className="btn btn-primary" onClick={() => { handleSave(); setIsEditing(false); }} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                    SAVE
                                </button>
                            )}
                            <button
                                className={`btn ${isEditing ? 'btn-primary' : 'btn-ghost'}`}
                                title="Edit Metadata"
                                onClick={() => setIsEditing(!isEditing)}
                                style={isEditing ? { background: 'var(--color-primary)', color: 'black' } : {}}
                            >
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
                                    disabled={!isEditing}
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
                                        disabled={!isEditing}
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
                                        disabled={!isEditing}
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
                                        disabled={!isEditing}
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
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Status */}
                            <div className="input-group">
                                <label className="input-label">Status</label>
                                <select
                                    className="input-field"
                                    value={report.status}
                                    onChange={(e) => setReport({ ...report, status: e.target.value })}
                                    disabled={!isEditing}
                                >
                                    <option>Draft</option>
                                    <option>In Progress</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Sidebar for Vulnerabilities */}
            <div style={{
                width: showSidebar ? '400px' : '0',
                overflow: 'hidden',
                transition: 'width 0.3s ease',
                borderLeft: showSidebar ? '1px solid var(--color-border)' : 'none',
                background: 'var(--color-bg-card)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', whiteSpace: 'nowrap' }}>OWASP VULNERABILITIES</h2>
                    <button className="btn btn-ghost" onClick={() => setShowSidebar(false)}>
                        <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                </div>

                <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>

                    {/* Add New & Search */}
                    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input-field"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '0.9rem', width: '100%', paddingLeft: '32px' }}
                            />
                            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }} onClick={() => navigate('/finding/new')}>
                            <Plus size={18} style={{ marginRight: '4px' }} /> Vuln
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredVulnerabilities.map((vuln, index) => (
                            <div key={vuln.id} style={{
                                padding: '16px',
                                background: vuln.selected ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: vuln.selected ? 'white' : 'var(--color-text-muted)' }}>
                                            {vuln.title}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost" style={{ padding: '4px', color: 'var(--color-text-muted)' }} onClick={() => navigate(`/finding/${vuln.id}`)}>
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer Save Button */}
                <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px' }}
                        onClick={() => alert('OWASP Vulnerabilities selection saved successfully!')}
                    >
                        <Save size={18} style={{ marginRight: '8px' }} /> Save OWASP VULNERABILITIES
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ReportDetails;
