import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import EvidenceSection from '../components/EvidenceSection';

import { ChevronLeft, Plus, Upload, File, Eye, Save } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const VulnDetail = () => {
    const { reportId, id } = useParams();
    const navigate = useNavigate();
    const { alert } = useModal();
    const isNew = id === 'new';

    // Form State
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState('Medium');
    const [description, setDescription] = useState('');
    const [impact, setImpact] = useState('');
    const [remediation, setRemediation] = useState('');
    const [sourceType, setSourceType] = useState('CUSTOM');
    const [references, setReferences] = useState('');
    const [owaspCategory, setOwaspCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Auto-save tracker
    const isInitialMount = useRef(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/owasp/categories/');
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch OWASP categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Load data from Backend
    useEffect(() => {
        if (!isNew) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    let response;
                    if (reportId) {
                        response = await api.get(`/api/reports/${reportId}/findings/${id}/`);
                        const f = response.data;
                        setTitle(f.tester_title || f.final_title || '');
                        setSeverity(f.tester_severity || f.final_severity || 'Medium');
                        setDescription(f.tester_description || '');
                        setImpact(f.tester_impact || '');
                        setRemediation(f.tester_remediation || '');

                    } else {
                        response = await api.get(`/api/vulnerabilities/${id}/`);
                        const v = response.data;
                        setTitle(v.title || '');
                        setSeverity(v.severity || 'Medium');
                        setDescription(v.description || '');
                        setImpact(v.impact || '');
                        setRemediation(v.remediation || '');
                        setSourceType(v.source_type || 'CUSTOM');
                        setReferences(v.references || '');
                        setOwaspCategory(v.owasp_category || '');
                    }
                } catch (err) {
                    console.error("Failed to fetch data", err);
                } finally {
                    setLoading(false);
                    // Reset initial mount to false after loading the data so we can detect real changes
                    setTimeout(() => { isInitialMount.current = false; }, 0);
                }
            };
            fetchData();
        } else {
            isInitialMount.current = false;
        }
    }, [id, reportId, isNew]);

    const severityColors = {
        'low': { bg: 'rgba(0, 240, 255, 0.1)', text: 'var(--color-primary)', border: 'var(--color-primary)' },
        'medium': { bg: 'rgba(254, 228, 64, 0.1)', text: 'var(--color-warning)', border: 'var(--color-warning)' },
        'high': { bg: 'rgba(255, 77, 109, 0.1)', text: 'var(--color-error)', border: 'var(--color-error)' },
        'critical': { bg: 'rgba(142, 45, 226, 0.2)', text: 'var(--color-secondary)', border: 'var(--color-secondary)' },
        'default': { bg: 'rgba(255,255,255,0.05)', text: 'var(--color-text-muted)', border: 'var(--color-border)' }
    };

    const getSeverityStyle = (sev) => {
        const s = (sev || 'medium').toLowerCase();
        return severityColors[s] || severityColors['default'];
    };

    const currentStyle = getSeverityStyle(severity);

    const handleEdit = (field, value) => {
        setHasUnsavedChanges(true);
        if (field === 'description') setDescription(value);
        else if (field === 'impact') setImpact(value);
        else if (field === 'remediation') setRemediation(value);
    };

    const handleSeverityChange = (level) => {
        setSeverity(level);
        setHasUnsavedChanges(true);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleSourceTypeChange = (e) => {
        setSourceType(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleCategoryChange = (e) => {
        setOwaspCategory(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleReferencesChange = (e) => {
        setReferences(e.target.value);
        setHasUnsavedChanges(true);
    };

    // Auto-save logic
    const saveChanges = useCallback(async (isManual = false) => {
        if (!hasUnsavedChanges && !isManual) return; // Prevent unnecessary saves, but still allow manual click

        const payload = reportId ? {
            tester_title: title,
            tester_severity: severity.toUpperCase(),
            tester_description: description,
            tester_impact: impact,
            tester_remediation: remediation
        } : {
            title: title,
            severity: severity.toUpperCase(),
            description: description,
            impact: impact,
            remediation: remediation,
            source_type: sourceType,
            references: references,
            owasp_category: owaspCategory || null
        };

        setSaving(true);
        try {
            if (reportId) {
                if (isNew) {
                    const res = await api.post(`/api/reports/${reportId}/findings/`, payload);
                    if (isManual) { navigate(`/report/${reportId}/finding/${res.data.id}/edit`, { replace: true }); }
                } else {
                    await api.patch(`/api/reports/${reportId}/findings/${id}/`, payload);
                }
            } else {
                if (isNew) {
                    const res = await api.post(`/api/vulnerabilities/`, payload);
                    if (isManual) { navigate(`/finding/${res.data.id}`, { replace: true }); }
                } else {
                    await api.patch(`/api/vulnerabilities/${id}/`, payload);
                }
            }
            setHasUnsavedChanges(false);
            if (isManual && !isNew) {
                await alert('Data saved successfully!', 'Save Successful');
            }
        } catch (err) {
            console.error("Save failed", err);
            if (isManual) {
                const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Check your connection and try again.";
                await alert("Failed to save: " + errorMsg, "Save Error");
            }
        } finally {
            setSaving(false);
        }
    }, [hasUnsavedChanges, title, severity, description, impact, remediation, sourceType, references, owaspCategory, reportId, id, isNew, navigate, alert]);

    // Call save whenever relevant form fields change, after 2 seconds (debounce)
    useEffect(() => {
        // Skip first render and only save if there are unsaved changes
        if (!isInitialMount.current && hasUnsavedChanges) {
            const timer = setTimeout(() => {
                saveChanges();
            }, 2000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [title, severity, description, impact, remediation, sourceType, owaspCategory, references, hasUnsavedChanges, saveChanges]);

    // Handle exiting with unsaved changes
    useEffect(() => {
        return () => {
            if (hasUnsavedChanges && !isNew) {
                // If the user unmounts with unsaved changes (e.g., clicking Back or another route), try to save cleanly
                saveChanges();
            }
        };
    }, [hasUnsavedChanges, title, severity, description, impact, remediation, id, reportId, isNew, saveChanges]);

    const handleManualSave = async () => {
        await saveChanges(true);
        navigate(-1);
    };



    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Finding Editor...</div>;
    }

    return (
        <div className="finding-detail-container" style={{ paddingBottom: '40px' }}>
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '20px', paddingLeft: 0 }}>
                <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back
            </button>

            {/* Header */}
            <div className="glass-panel" style={{
                padding: '24px',
                marginBottom: '24px',
                borderLeft: `6px solid ${currentStyle.text}`,
                transition: 'border-color 0.3s ease'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>Tester Severity Level</label>
                        {hasUnsavedChanges && <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontStyle: 'italic' }}>Unsaved Changes...</span>}
                        {saving && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Auto-saving...</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['Low', 'Medium', 'High', 'Critical'].map((level) => {
                            const style = getSeverityStyle(level);
                            const isActive = severity.toLowerCase() === level.toLowerCase();
                            return (
                                <button
                                    key={level}
                                    onClick={() => handleSeverityChange(level)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: isActive ? style.text : 'var(--color-border)',
                                        background: isActive ? style.bg : 'transparent',
                                        color: isActive ? style.text : 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">{reportId ? "Tester Vulnerability Name" : "Name of OWASP VULNERABILITY"}</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter vulnerability name"
                        value={title}
                        onChange={handleTitleChange}
                        style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                    />
                </div>

                {!reportId && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Source Type</label>
                            <select
                                className="input-field"
                                value={sourceType}
                                onChange={handleSourceTypeChange}
                            >
                                <option value="OWASP">OWASP</option>
                                <option value="CVE">CVE</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                        </div>
                        {sourceType === 'OWASP' && (
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">OWASP Category</label>
                                <select
                                    className="input-field"
                                    value={owaspCategory}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Tester Description</label>
                </div>
                <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                    value={description}
                    onChange={(e) => handleEdit('description', e.target.value)}
                    placeholder="Enter customized tester description for this finding..."
                />
            </div>

            {/* Impact Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Tester Impact</label>
                </div>
                <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    value={impact}
                    onChange={(e) => handleEdit('impact', e.target.value)}
                    placeholder="Enter customized tester impact..."
                />
            </div>

            {/* Remediation Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Tester Remediation</label>
                </div>
                <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    value={remediation}
                    onChange={(e) => handleEdit('remediation', e.target.value)}
                    placeholder="Enter customized tester remediation..."
                />
            </div>

            {/* References Field */}
            {!reportId && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>References</label>
                    </div>
                    <textarea
                        className="input-field"
                        style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                        value={references}
                        onChange={handleReferencesChange}
                        placeholder="Enter vulnerability references..."
                    />
                </div>
            )}

            {/* Evidence Section */}
            {reportId && (
                <EvidenceSection findingId={id} isNew={isNew} />
            )}

            <div style={{ textAlign: 'right', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {hasUnsavedChanges ? 'You have unsaved changes' : 'All changes saved automatically'}
                </span>
                <button
                    className={`btn btn-primary ${saving ? 'saving' : ''}`}
                    onClick={handleManualSave}
                    disabled={saving && !hasUnsavedChanges}
                    style={{ padding: '12px 30px', fontSize: '1rem' }}
                >
                    {!saving && <Save size={20} style={{ marginRight: '8px' }} />}
                    {saving ? 'Saving...' : 'Save & Exit'}
                </button>
            </div>
        </div>
    );
};

export default VulnDetail;
