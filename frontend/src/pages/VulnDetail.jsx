import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ChevronLeft, Save } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import EvidenceSection from '../components/EvidenceSection';

const VulnDetail = () => {
    const { id, reportId } = useParams();
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
    const [owaspVulnerability, setOwaspVulnerability] = useState('');
    const [owaspVulnerabilities, setOwaspVulnerabilities] = useState([]);
    const [owaspVariant, setOwaspVariant] = useState('');
    const [variants, setVariants] = useState([]);
    const [cveId, setCveId] = useState('');
    const [cvssScore, setCvssScore] = useState('');
    const [cvssVector, setCvssVector] = useState('');
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [isCreateNewCategory, setIsCreateNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Auto-save tracker
    const isInitialMount = useRef(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/owasp/categories/');
                setCategories(response.data || []);
            } catch (err) {
                console.error("Failed to fetch OWASP categories", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Vulnerabilities for Category
    useEffect(() => {
        if (owaspCategory && !isCreateNewCategory) {
            const fetchVulnerabilities = async () => {
                try {
                    const response = await api.get(`/api/owasp/categories/${owaspCategory}/`);
                    setOwaspVulnerabilities(response.data.vulnerabilities || []);
                } catch (err) {
                    console.error("Failed to fetch OWASP vulnerabilities", err);
                }
            };
            fetchVulnerabilities();
        } else {
            setOwaspVulnerabilities([]);
        }
    }, [owaspCategory, isCreateNewCategory]);

    // Fetch Variants for Vulnerability
    useEffect(() => {
        if (owaspVulnerability) {
            const fetchVariants = async () => {
                try {
                    const response = await api.get(`/api/owasp/vulnerabilities/${owaspVulnerability}/variants/`);
                    setVariants(response.data || []);
                } catch (err) {
                    console.error("Failed to fetch OWASP variants", err);
                }
            };
            fetchVariants();
        } else {
            setVariants([]);
        }
    }, [owaspVulnerability]);

    // Fetch Initial Data
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const prefillVulnId = queryParams.get('owasp_vuln');
        const prefillCatId = queryParams.get('cat');

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
                        setSourceType(f.source_type || 'CUSTOM');
                        setCveId(f.cve_id || '');
                        setCvssScore(f.cvss_score || '');
                        setCvssVector(f.cvss_vector || '');
                        setOwaspVulnerability(f.vulnerability || '');
                        
                        if (f.vulnerability) {
                            try {
                                const resVuln = await api.get(`/api/vulnerabilities/${f.vulnerability}/`);
                                const v = resVuln.data;
                                setOwaspCategory(v.owasp_category || '');
                                setOwaspVariant(v.variant || '');
                            } catch (err) {
                                console.error("Failed to fetch base vulnerability", err);
                            }
                        }
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
                        setOwaspVulnerability(v.owasp_vulnerability || '');
                        setOwaspVariant(v.variant || '');
                        setCveId(v.cve_id || '');
                        setCvssScore(v.cvss_score || '');
                        setCvssVector(v.cvss_vector || '');
                    }
                } catch (err) {
                    console.error("Failed to fetch data", err);
                } finally {
                    setLoading(false);
                    setTimeout(() => { isInitialMount.current = false; }, 0);
                }
            };
            fetchData();
        } else {
            // Handle pre-fill for new vulnerability definitions
            if (prefillVulnId) {
                const fetchTemplate = async () => {
                    try {
                        setSourceType('OWASP');
                        if (prefillCatId) setOwaspCategory(prefillCatId);
                        
                        const response = await api.get(`/api/owasp/vulnerabilities/${prefillVulnId}/`);
                        const v = response.data;
                        setOwaspVulnerability(prefillVulnId);
                        setTitle(v.name || '');
                        setSeverity(v.default_severity || 'Medium');
                        setDescription(v.description || '');
                        setImpact(v.default_impact || '');
                        setRemediation(v.default_remediation || '');
                        setHasUnsavedChanges(true); // Mark as modified so it can be saved
                    } catch (err) {
                        console.error("Failed to fetch template data", err);
                    }
                };
                fetchTemplate();
            }
            setTimeout(() => { isInitialMount.current = false; }, 0);
        }
    }, [id, reportId, isNew]);

    // Severity Helpers
    const getSeverityStyle = (sev) => {
        switch (sev.toLowerCase()) {
            case 'critical': return { bg: 'rgba(255, 0, 0, 0.1)', text: '#ff4d4d' };
            case 'high': return { bg: 'rgba(255, 121, 63, 0.1)', text: '#ff793f' };
            case 'medium': return { bg: 'rgba(255, 177, 66, 0.1)', text: '#ffb142' };
            case 'low': return { bg: 'rgba(51, 217, 178, 0.1)', text: '#33d9b2' };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--color-text-muted)' };
        }
    };
    const currentStyle = getSeverityStyle(severity);

    // Handlers
    const handleEdit = (field, value) => {
        if (field === 'description') setDescription(value);
        if (field === 'impact') setImpact(value);
        if (field === 'remediation') setRemediation(value);
        setHasUnsavedChanges(true);
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
        setOwaspVulnerability('');
        setHasUnsavedChanges(true);
    };

    const handleVulnerabilityChange = (e) => {
        const vulnId = e.target.value;
        setOwaspVulnerability(vulnId);
        setHasUnsavedChanges(true);

        const v = owaspVulnerabilities.find(item => item.id.toString() === vulnId);
        if (v) {
            setTitle(v.title || v.name || '');
            setSeverity(v.severity || v.default_severity || 'Medium');
            setDescription(v.description || '');
            setImpact(v.impact || '');
            setRemediation(v.remediation || '');
        }
    };

    const handleVariantChange = (e) => {
        const variantId = e.target.value;
        setOwaspVariant(variantId);
        setHasUnsavedChanges(true);

        const v = variants.find(item => item.id.toString() === variantId);
        if (v && v.description) {
            setDescription(prev => prev ? `${prev}\n\nVariant: ${v.description}` : v.description);
        }
    };

    const handleReferencesChange = (e) => {
        setReferences(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleNewCategoryNameChange = (e) => {
        setNewCategoryName(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleCveIdChange = (e) => {
        setCveId(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleCvssScoreChange = (e) => {
        setCvssScore(e.target.value);
        setHasUnsavedChanges(true);
    };

    const handleCvssVectorChange = (e) => {
        setCvssVector(e.target.value);
        setHasUnsavedChanges(true);
    };

    // Save Logic
    const saveChanges = async (isManual = false) => {
        if (!hasUnsavedChanges && !isManual) return;

        setSaving(true);
        try {
            let categoryId = owaspCategory;
            if (isCreateNewCategory && newCategoryName.trim()) {
                const existing = categories.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
                if (existing) {
                    categoryId = existing.id;
                } else {
                    const catRes = await api.post('/api/owasp/categories/', { name: newCategoryName.trim() });
                    categoryId = catRes.data.id;
                    setCategories(prev => [...prev, catRes.data]);
                }
                setIsCreateNewCategory(false);
                setNewCategoryName('');
                setOwaspCategory(categoryId.toString());
            }

            const payload = reportId ? {
                vulnerability: owaspVulnerability || null,
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
                owasp_category: categoryId || null,
                owasp_vulnerability: owaspVulnerability || null,
                variant: owaspVariant || null,
                cve_id: cveId || null,
                cvss_score: cvssScore || null,
                cvss_vector: cvssVector || null,
                references: references
            };

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
    };

    // Auto-save useEffect
    useEffect(() => {
        if (!isInitialMount.current && hasUnsavedChanges) {
            const timer = setTimeout(() => { saveChanges(); }, 2000);
            return () => clearTimeout(timer);
        }
    }, [title, severity, description, impact, remediation, sourceType, owaspCategory, owaspVulnerability, owaspVariant, references, cveId, cvssScore, cvssVector, hasUnsavedChanges]);

    const handleManualSave = async () => {
        await saveChanges(true);
        navigate(-1);
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Finding Editor...</div>;
    }

    return (
        <div className="finding-detail-container" style={{ paddingBottom: '40px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '20px', paddingLeft: 0 }}>
                <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back
            </button>

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
                        {saving && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Saving...</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['Low', 'Medium', 'High', 'Critical'].map((level) => {
                            const style = getSeverityStyle(level);
                            const isActive = severity.toLowerCase() === level.toLowerCase();
                            return (
                                <button key={level} onClick={() => handleSeverityChange(level)} style={{
                                    flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid',
                                    borderColor: isActive ? style.text : 'var(--color-border)',
                                    background: isActive ? style.bg : 'transparent',
                                    color: isActive ? style.text : 'var(--color-text-muted)',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}>
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: 20 }}>
                    <label className="input-label">{reportId ? "Tester Vulnerability Name" : "Name of VULNERABILITY"}</label>
                    <input
                        type="text" className="input-field" placeholder="Enter vulnerability name"
                        value={title} onChange={handleTitleChange} style={{ fontSize: '1.5rem', fontWeight: 'bold' }} maxLength={200} required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Source Type</label>
                        <select className="input-field" value={sourceType} onChange={handleSourceTypeChange}>
                            <option value="OWASP">OWASP</option>
                            <option value="CVE">CVE</option>
                            <option value="CUSTOM">Custom</option>
                        </select>
                    </div>

                    {(sourceType === 'OWASP' || sourceType === 'CUSTOM') && (
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>OWASP Category</label>
                                <button
                                    type="button" onClick={() => setIsCreateNewCategory(!isCreateNewCategory)}
                                    className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                >
                                    {isCreateNewCategory ? "Back to Select" : "+ Add Category"}
                                </button>
                            </div>
                            {isCreateNewCategory ? (
                                <input
                                    type="text" className="input-field" placeholder="Enter new category name..."
                                    value={newCategoryName} onChange={handleNewCategoryNameChange} autoFocus
                                />
                            ) : (
                                <select className="input-field" value={owaspCategory} onChange={handleCategoryChange}>
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>

                {sourceType === 'OWASP' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">OWASP Vulnerability</label>
                            <select className="input-field" value={owaspVulnerability} onChange={handleVulnerabilityChange} disabled={!owaspCategory}>
                                <option value="">Select Vulnerability...</option>
                                {owaspVulnerabilities.map(v => (
                                    <option key={v.id} value={v.id}>{v.title || v.name}</option>
                                ))}
                            </select>
                        </div>
                        {variants.length > 0 && (
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Vulnerability Variant</label>
                                <select className="input-field" value={owaspVariant} onChange={handleVariantChange}>
                                    <option value="">Select Variant...</option>
                                    {variants.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {sourceType === 'CVE' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">CVE ID</label>
                            <input type="text" className="input-field" placeholder="CVE-YYYY-NNNNN" value={cveId} onChange={handleCveIdChange} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">CVSS Score</label>
                            <input type="number" step="0.1" min="0" max="10" className="input-field" placeholder="0.0" value={cvssScore} onChange={handleCvssScoreChange} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">CVSS Vector</label>
                            <input type="text" className="input-field" placeholder="CVSS:..." value={cvssVector} onChange={handleCvssVectorChange} />
                        </div>
                    </div>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Description</label>
                <textarea className="input-field" style={{ width: '100%', minHeight: '120px', marginTop: '10px' }} value={description} onChange={(e) => handleEdit('description', e.target.value)} required />
            </div>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Impact</label>
                <textarea className="input-field" style={{ width: '100%', minHeight: '100px', marginTop: '10px' }} value={impact} onChange={(e) => handleEdit('impact', e.target.value)} required />
            </div>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Remediation</label>
                <textarea className="input-field" style={{ width: '100%', minHeight: '100px', marginTop: '10px' }} value={remediation} onChange={(e) => handleEdit('remediation', e.target.value)} required />
            </div>

            {!reportId && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>References</label>
                    <textarea className="input-field" style={{ width: '100%', minHeight: '80px', marginTop: '10px' }} value={references} onChange={handleReferencesChange} />
                </div>
            )}

            {reportId && <EvidenceSection findingId={id} isNew={isNew} />}

            <div style={{ textAlign: 'right', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {hasUnsavedChanges ? 'You have unsaved changes' : 'All changes saved auto'}
                </span>
                <button className="btn btn-primary" onClick={handleManualSave} disabled={saving && !hasUnsavedChanges} style={{ padding: '12px 30px' }}>
                    <Save size={20} style={{ marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save & Exit'}
                </button>
            </div>
        </div>
    );
};

export default VulnDetail;
