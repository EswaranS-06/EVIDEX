import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

import { Calendar, Globe, CheckCircle, Edit2, Wrench, Eye, Plus, ArrowRight, ChevronLeft, ChevronRight, Save, Trash2, X } from 'lucide-react';

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert, confirm } = useModal();
    const isNew = id === 'new';

    // Data State
    const [report, setReport] = useState({
        client_name: '',
        application_name: '', // Added application_name
        target: '', // changed from targetUrl
        start_date: '',
        end_date: '',
        report_type: 'Web Application', // default
        test_location: 'Off-site',
        tools_used: '',
        prepared_by: '',
        reviewed_by: '',
        approved_by: '',
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
                test_location: 'Off-site',
                tools_used: '',
                status: 'Draft'
            });
            setFindings([]);
        }
    }, [id, isNew]);

    const getSeverityBg = (sev) => {
        const s = (sev || '').toLowerCase();
        switch (s) {
            case 'critical': return 'rgba(142, 45, 226, 0.1)';
            case 'high': return 'rgba(255, 77, 109, 0.1)';
            case 'medium': return 'rgba(254, 228, 64, 0.1)';
            case 'low': return 'rgba(0, 240, 255, 0.1)';
            default: return 'var(--glass-bg)';
        }
    };

    const getSeverityColor = (sev) => {
        const s = (sev || '').toLowerCase();
        switch (s) {
            case 'critical': return 'var(--color-secondary)';
            case 'high': return 'var(--color-error)';
            case 'medium': return 'var(--color-warning)';
            case 'low': return 'var(--color-primary)';
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
                test_location: report.test_location,
                tools_used: report.tools_used,
                start_date: report.start_date || report.startDate,
                end_date: report.end_date || report.endDate,
                report_type: report.report_type || 'Web Application',
                status: report.status || 'Draft',
                prepared_by: report.prepared_by || 'Pentester',
                reviewed_by: report.reviewed_by,
                approved_by: report.approved_by,
                status: report.status || 'Draft'
            };

            let response;
            if (isNew) {
                response = await api.post('/api/reports/', payload);
                await alert('Assessment created successfully!', 'Success');
                navigate(`/report/${response.data.id}`); // Redirect to edit mode
            } else {
                response = await api.patch(`/api/reports/${id}/`, payload);
                await alert('Assessment metadata updated successfully!', 'Success');
            }
        } catch (err) {
            console.error("Failed to save report:", err);
            await alert("Failed to save assessment details. Please check your network.", "Error");
        }
    };

    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1280);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Handle Responsive Sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) {
                setShowSidebar(false);
            } else {
                setShowSidebar(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            await alert("Please save the report first before adding findings.", "Warning");
            return;
        }

        try {
            await api.post(`/api/reports/${id}/findings/`, {
                vulnerability: vulnId,
                affected_url: report.target || '/'
            });
            // Refresh findings
            const findingsRes = await api.get(`/api/reports/${id}/findings/`);
            setFindings(findingsRes.data);
            await alert("Vulnerability added to report successfully!", "Finding Added");
        } catch (err) {
            console.error("Failed to add finding:", err);
            await alert("Failed to add finding. Please try again.", "Error");
        }
    };

    const handleDeleteFinding = async (findingId) => {
        const isConfirmed = await confirm("Are you sure you want to remove this finding from the report?", "Confirm Delete", { isDangerous: true, confirmText: 'Remove' });
        if (!isConfirmed) return;

        try {
            await api.delete(`/api/reports/${id}/findings/${findingId}/`);
            // Refresh list
            setFindings(findings.filter(f => f.id !== findingId));
        } catch (err) {
            console.error("Failed to delete finding:", err);
            alert("Failed to delete finding.");
        }
    };

    // Filter Logic
    const filteredCategories = useMemo(() => {
        return owaspCategories.map(cat => {
            const matchingVulns = cat.vulnerabilities.filter(v =>
                v.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            // Include category if it matches name OR has matching vulns
            if (cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || matchingVulns.length > 0) {
                return { ...cat, vulnerabilities: matchingVulns }; // Return filtered vulns if searching
            }
            return null;
        }).filter(Boolean);
    }, [owaspCategories, searchTerm]);

    return (
        <div className="report-details-wrapper" style={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex' }}>
            {/* Center Content Area - Resizes when sidebar is open to preserve visibility */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                marginRight: showSidebar && window.innerWidth > 1024 ? (window.innerWidth > 1400 ? '480px' : '400px') : '0'
            }}>
                <div className="report-details-container">

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '20px',
                        padding: '10px 0'
                    }}>
                        <button onClick={() => navigate('/reports')} className="btn-ghost" style={{ paddingLeft: 0, minWidth: '150px', justifyContent: 'flex-start' }}>
                            <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back to Reports
                        </button>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                            <button className="btn btn-ghost" title="Preview">
                                <Eye size={18} style={{ marginRight: '8px' }} /> PREVIEW
                            </button>

                            {isEditing && (
                                <button className="btn btn-primary" onClick={() => { handleSave(); setIsEditing(false); }}>
                                    <Save size={18} style={{ marginRight: '8px' }} /> SAVE
                                </button>
                            )}

                            <button
                                className={`btn ${isEditing ? 'btn-primary' : 'btn-ghost'}`}
                                title="Edit Metadata"
                                onClick={() => setIsEditing(!isEditing)}
                                style={isEditing ? { background: 'var(--color-primary)', color: 'black' } : {}}
                            >
                                <Edit2 size={18} style={{ marginRight: isEditing ? '8px' : '0' }} />
                                {isEditing ? 'EDITING' : 'EDIT'}
                            </button>

                            {!showSidebar && (
                                <button className="btn btn-neon" onClick={() => setShowSidebar(true)}>
                                    <Plus size={18} style={{ marginRight: '8px' }} /> OWASP VULNERABILITIES
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header Section (Metadata) */}
                    {!isEditing && !isNew ? (
                        <div style={{ marginBottom: '40px', padding: '0 10px' }}>
                            <h1 style={{
                                fontSize: '2.8rem',
                                fontWeight: '900',
                                margin: 0,
                                background: 'linear-gradient(to right, #fff, var(--color-text-muted))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.03em'
                            }}>
                                {report.client_name || 'Loading...'}
                            </h1>
                            <div style={{
                                display: 'flex',
                                gap: '20px',
                                marginTop: '12px',
                                color: 'var(--color-text-muted)',
                                fontSize: '1rem',
                                alignItems: 'center'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Globe size={16} /> {report.application_name}
                                </span>
                                <span style={{ width: '4px', height: '4px', background: 'var(--color-border)', borderRadius: '50%' }}></span>
                                <span>{report.report_type}</span>
                                <span style={{ width: '4px', height: '4px', background: 'var(--color-border)', borderRadius: '50%' }}></span>
                                <span>{report.test_location}</span>
                                {report.tools_used && (
                                    <>
                                        <span style={{ width: '4px', height: '4px', background: 'var(--color-border)', borderRadius: '50%' }}></span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Wrench size={16} /> {report.tools_used.split('\n')[0]}{report.tools_used.split('\n').length > 1 ? ` +${report.tools_used.split('\n').length - 1} more` : ''}
                                        </span>
                                    </>
                                )}
                                <span style={{ width: '4px', height: '4px', background: 'var(--color-border)', borderRadius: '50%' }}></span>
                                <span style={{
                                    background: getSeverityBg(report.status),
                                    color: getSeverityColor(report.status),
                                    padding: '2px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    border: `1px solid ${getSeverityColor(report.status)}`
                                }}>
                                    {report.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', position: 'relative' }}>
                            <div className="responsive-grid-2">
                                {/* Client Name */}
                                <div className="input-group">
                                    <label className="input-label">Client Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={report.client_name || ''}
                                        onChange={(e) => setReport({ ...report, client_name: e.target.value })}
                                        style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
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
                                    />
                                </div>

                                {/* Target URL / IP */}
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Target URLs / IP Ranges</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="Enter targets, one per line"
                                        value={report.target || ''}
                                        onChange={(e) => setReport({ ...report, target: e.target.value })}
                                        style={{ minHeight: '80px', paddingTop: '12px' }}
                                    />
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
                                        />
                                    </div>
                                </div>

                                {/* Test Location */}
                                <div className="input-group">
                                    <label className="input-label">Test Performed</label>
                                    <select
                                        className="input-field"
                                        value={report.test_location || 'Off-site'}
                                        onChange={(e) => setReport({ ...report, test_location: e.target.value })}
                                    >
                                        <option value="Off-site">Off-site</option>
                                        <option value="On-site">On-site</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Report Type</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={report.report_type || ''}
                                        onChange={(e) => setReport({ ...report, report_type: e.target.value })}
                                    />
                                </div>

                                {/* Status */}
                                <div className="input-group">
                                    <label className="input-label">Status</label>
                                    <select
                                        className="input-field"
                                        value={report.status || 'Draft'}
                                        onChange={(e) => setReport({ ...report, status: e.target.value })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Verified">Verified</option>
                                    </select>
                                </div>

                                {/* Tools Used */}
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Tools Used for Testing</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="Enter tools used, one per line"
                                        value={report.tools_used || ''}
                                        onChange={(e) => setReport({ ...report, tools_used: e.target.value })}
                                        style={{ minHeight: '80px', paddingTop: '12px' }}
                                    />
                                </div>

                                {/* Personnel */}
                                <div className="input-group">
                                    <label className="input-label">Prepared By</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={report.prepared_by || ''}
                                        onChange={(e) => setReport({ ...report, prepared_by: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Reviewed By</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={report.reviewed_by || ''}
                                        onChange={(e) => setReport({ ...report, reviewed_by: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Approved By</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={report.approved_by || ''}
                                        onChange={(e) => setReport({ ...report, approved_by: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}


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
                                        <div key={finding.id} className="glass-panel animate-fade-in" style={{
                                            padding: '24px',
                                            marginBottom: '16px',
                                            borderLeft: `6px solid ${getSeverityColor(finding.final_severity)}`,
                                            background: 'rgba(255,255,255,0.02)',
                                            transition: 'transform 0.2s ease'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
                                                        {finding.final_title}
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '3px 10px',
                                                            borderRadius: '6px',
                                                            background: getSeverityBg(finding.final_severity),
                                                            color: getSeverityColor(finding.final_severity),
                                                            fontWeight: '800',
                                                            border: `1px solid ${getSeverityColor(finding.final_severity)}`,
                                                            letterSpacing: '0.02em'
                                                        }}>
                                                            {finding.final_severity?.toUpperCase()}
                                                        </span>
                                                        {finding.category_name && (
                                                            <>
                                                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>|</span>
                                                                <span style={{
                                                                    fontSize: '0.75rem',
                                                                    color: 'var(--color-primary)',
                                                                    fontWeight: '600',
                                                                    background: 'rgba(0, 240, 255, 0.05)',
                                                                    padding: '2px 10px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid rgba(0, 240, 255, 0.1)'
                                                                }}>
                                                                    {finding.category_name}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => navigate(`/report/${id}/finding/${finding.id}`)}
                                                        style={{ padding: '8px', borderRadius: '8px' }}
                                                        title="Edit Finding"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => handleDeleteFinding(finding.id)}
                                                        style={{ color: 'var(--color-error)', padding: '8px', borderRadius: '8px' }}
                                                        title="Delete Finding"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {finding.final_description && (
                                                <div style={{
                                                    marginTop: '20px',
                                                    padding: '20px',
                                                    background: 'rgba(0,0,0,0.25)',
                                                    borderRadius: '12px',
                                                    fontSize: '0.95rem',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    lineHeight: '1.7',
                                                    border: '1px solid rgba(255,255,255,0.03)',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {finding.final_description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Right Sidebar for Vulnerabilities - Rendered via Portal for screen-level fixed positioning */}
            {document.getElementById('sidebar-portal-root') && createPortal(
                <div className={`responsive-sidebar ${!showSidebar ? 'collapsed' : ''}`}>
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>VULNERABILITIES</h2>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>OWASP TOP 10 & VARIANTS</span>
                        </div>
                        <button
                            className="btn-icon"
                            onClick={() => setShowSidebar(false)}
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                color: 'var(--color-primary)',
                                width: '40px',
                                height: '40px'
                            }}
                        >
                            <ChevronRight size={24} />
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
                                                cat.vulnerabilities.map(vuln => {
                                                    const sevColor = getSeverityColor(vuln.default_severity || vuln.severity);
                                                    const sevBg = getSeverityBg(vuln.default_severity || vuln.severity);

                                                    return (
                                                        <div key={vuln.id}
                                                            className="vuln-selection-item"
                                                            onClick={() => addFinding(vuln.id)}
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                padding: '12px',
                                                                gap: '8px',
                                                                borderRadius: '8px',
                                                                background: selectedVulns.has(vuln.id) ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                                                                marginBottom: '8px',
                                                                cursor: 'pointer',
                                                                border: `1px solid ${selectedVulns.has(vuln.id) ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'}`,
                                                                borderLeft: `4px solid ${sevColor}`,
                                                                transition: 'all 0.2s ease'
                                                            }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '6px',
                                                                    background: sevBg,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <Plus size={14} style={{ color: sevColor }} />
                                                                </div>
                                                                <span className="vuln-name" style={{ fontSize: '0.85rem', flex: 1, color: '#fff', fontWeight: '500' }}>
                                                                    {vuln.name}
                                                                </span>
                                                                <span style={{
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: '800',
                                                                    color: sevColor,
                                                                    opacity: 0.8
                                                                }}>
                                                                    {(vuln.default_severity || vuln.severity || 'LOW').toUpperCase()}
                                                                </span>
                                                            </div>

                                                            <div className="vuln-description" style={{
                                                                fontSize: '0.75rem',
                                                                color: 'var(--color-text-muted)',
                                                                lineHeight: '1.4',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: '2',
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {vuln.description}
                                                            </div>
                                                        </div>
                                                    );
                                                })
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
                </div>,
                document.getElementById('sidebar-portal-root')
            )}

        </div>
    );
};

export default ReportDetails;
