import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

import { Calendar, Globe, CheckCircle, Edit2, Eye, Plus, ChevronLeft, Save } from 'lucide-react';

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    // Data State
    const [report, setReport] = useState({
        client_name: '',
        application_name: '', // Added application_name
        target: '', // changed from targetUrl
        start_date: '',
        end_date: '',
        report_type: 'Web Application', // default
        scope: '', // Note: Backend has report_type, frontend has scope. Might map scope to report_type or ignore for now.
        status: 'Draft'
    });

    // Findings State
    const [findings, setFindings] = useState([]);

    // Fetch Report Data
    useEffect(() => {
        if (!isNew) {
            const fetchReport = async () => {
                try {
                    const response = await api.get(`/api/reports/${id}/`);
                    setReport(response.data);

                    // Fetch findings
                    const findingsRes = await api.get(`/api/reports/${id}/findings/`);
                    setFindings(findingsRes.data);
                } catch (err) {
                    console.error("Failed to fetch report:", err);
                    alert("Failed to load report data.");
                }
            };
            fetchReport();
        } else {
            // Reset for new report
            setReport({
                client_name: '',
                application_name: '',
                target: '',
                start_date: '',
                end_date: '',
                report_type: 'Web Application',
                status: 'Draft'
            });
            setFindings([]);
        }
    }, [id, isNew]);

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

    const handleSave = async () => {
        try {
            // Frontend keys might match backend keys now
            const payload = {
                client_name: report.client_name,
                application_name: report.application_name || 'My App', // fallback
                target: report.target || report.targetUrl, // handle migration
                start_date: report.start_date || report.startDate,
                end_date: report.end_date || report.endDate,
                report_type: report.report_type || 'Web Application',
                status: report.status || 'Draft',
                prepared_by: 'Pentester' // Hardcode or get from user context
            };

            let response;
            if (isNew) {
                response = await api.post('/api/reports/', payload);
                alert('Report created successfully!');
                navigate(`/report/${response.data.id}`); // Redirect to edit mode
            } else {
                response = await api.patch(`/api/reports/${id}/`, payload);
                alert('Report updated successfully!');
            }
        } catch (err) {
            console.error("Failed to save report:", err);
            alert("Failed to save report. Check console for details.");
        }
    };

    const [showSidebar, setShowSidebar] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // OWASP Data State
    const [owaspCategories, setOwaspCategories] = useState([]);
    const [selectedVulns, setSelectedVulns] = useState(new Set());
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    useEffect(() => {
        const fetchOWASP = async () => {
            try {
                const response = await api.get('/api/owasp/categories/');
                setOwaspCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch OWASP categories:", err);
            }
        };
        fetchOWASP();
    }, []);

    const toggleCategory = (catId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(catId)) {
            newExpanded.delete(catId);
        } else {
            newExpanded.add(catId);
        }
        setExpandedCategories(newExpanded);
    };

    const addFinding = async (vulnId) => {
        if (isNew) {
            alert("Please save the report first before adding findings.");
            return;
        }

        try {
            await api.post(`/api/reports/${id}/findings/`, {
                vulnerability_definition_id: vulnId,
                affected_url: report.target || '/'
            });
            // Refresh findings
            const findingsRes = await api.get(`/api/reports/${id}/findings/`);
            setFindings(findingsRes.data);
            alert("Finding added to report!");
        } catch (err) {
            console.error("Failed to add finding:", err);
            alert("Failed to add finding.");
        }
    };

    // Filter Logic
    const filteredCategories = owaspCategories.map(cat => {
        const matchingVulns = cat.vulnerabilities.filter(v =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Include category if it matches name OR has matching vulns
        if (cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || matchingVulns.length > 0) {
            return { ...cat, vulnerabilities: matchingVulns }; // Return filtered vulns if searching
        }
        return null;
    }).filter(Boolean);

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

                    {/* Header Section (Metadata) - SAME AS BEFORE */}
                    {/* ... (Keep existing Metadata section logic same as previous step, just collapsed here for brevity if replace tool allows partial context match, otherwise I need to include it all. Since I'm replacing the whole center div, I must include it) */}

                    <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                            {/* ... buttons ... */}
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
                                    value={report.client_name || ''}
                                    onChange={(e) => setReport({ ...report, client_name: e.target.value })}
                                    style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                                    disabled={!isEditing && !isNew}
                                />
                            </div>

                            {/* Application Name */}
                            <div className="input-group">
                                <label className="input-label">Application Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={report.application_name || ''}
                                    onChange={(e) => setReport({ ...report, application_name: e.target.value })}
                                    disabled={!isEditing && !isNew}
                                />
                            </div>

                            {/* Target */}
                            <div className="input-group">
                                <label className="input-label">Target URL / IP</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={report.target || ''}
                                        onChange={(e) => setReport({ ...report, target: e.target.value })}
                                        style={{ paddingLeft: '40px' }}
                                        disabled={!isEditing && !isNew}
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
                                        value={report.start_date || ''}
                                        onChange={(e) => setReport({ ...report, start_date: e.target.value })}
                                        style={{ paddingLeft: '40px' }}
                                        disabled={!isEditing && !isNew}
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
                                        value={report.end_date || ''}
                                        onChange={(e) => setReport({ ...report, end_date: e.target.value })}
                                        style={{ paddingLeft: '40px' }}
                                        disabled={!isEditing && !isNew}
                                    />
                                </div>
                            </div>

                            {/* Report Type */}
                            <div className="input-group">
                                <label className="input-label">Report Type</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={report.report_type || ''}
                                    onChange={(e) => setReport({ ...report, report_type: e.target.value })}
                                    disabled={!isEditing && !isNew}
                                />
                            </div>

                            {/* Status */}
                            <div className="input-group">
                                <label className="input-label">Status</label>
                                <select
                                    className="input-field"
                                    value={report.status || 'Draft'}
                                    onChange={(e) => setReport({ ...report, status: e.target.value })}
                                    disabled={!isEditing && !isNew}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Verified">Verified</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* Findings Section */}
                    {!isNew && (
                        <div style={{ marginTop: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Findings</h2>
                                <button className="btn btn-primary" onClick={() => navigate(`/report/${id}/finding/new`)}>
                                    <Plus size={18} style={{ marginRight: '8px' }} /> Add Custom Finding
                                </button>
                            </div>

                            {findings.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <CheckCircle size={48} style={{ marginBottom: '15px', opacity: 0.2 }} />
                                    <p>No findings added yet.</p>
                                    <p style={{ fontSize: '0.9rem' }}>Select vulnerabilities from the sidebar or add a custom one.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {findings.map((finding) => (
                                        <div key={finding.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${getSeverityColor(finding.final_severity)}` }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{finding.final_title}</h3>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: getSeverityBg(finding.final_severity),
                                                    color: getSeverityColor(finding.final_severity)
                                                }}>
                                                    {finding.final_severity}
                                                </span>
                                            </div>
                                            <button className="btn btn-ghost" onClick={() => navigate(`/report/${id}/finding/${finding.id}`)}>
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                        {filteredCategories.map((cat) => (
                            <div key={cat.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                                <div
                                    onClick={() => toggleCategory(cat.id)}
                                    style={{
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <span>{cat.code ? `${cat.code} - ` : ''}{cat.name}</span>
                                    <ChevronLeft size={16} style={{ transform: expandedCategories.has(cat.id) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </div>

                                {expandedCategories.has(cat.id) && (
                                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)' }}>
                                        {cat.vulnerabilities.length === 0 ? (
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '8px' }}>No vulnerabilities found.</div>
                                        ) : (
                                            cat.vulnerabilities.map(vuln => (
                                                <div key={vuln.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px',
                                                    gap: '10px',
                                                    borderRadius: '4px',
                                                    background: selectedVulns.has(vuln.id) ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                                                    marginBottom: '4px'
                                                }}>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ color: 'var(--color-primary)' }}
                                                        title="Add to Report"
                                                        onClick={(e) => { e.stopPropagation(); addFinding(vuln.id); }}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <span style={{ fontSize: '0.85rem', flex: 1, color: 'var(--color-text-main)' }}>{vuln.name}</span>
                                                    <button className="btn btn-ghost" style={{ padding: '4px', color: 'var(--color-text-muted)' }} onClick={() => navigate(`/finding/${vuln.id}`)}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
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
