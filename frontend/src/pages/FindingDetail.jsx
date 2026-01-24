import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ChevronLeft, RefreshCw, Plus, Upload, File, Trash2, Save } from 'lucide-react';

const FindingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    // Mock Database for Defaults
    const defaults = {
        title: 'SQL Injection',
        source: 'OWASP A03:2021-Injection',
        description: 'SQL injection errors occur when:\n1. Data enters a program from an untrusted source.\n2. The data is used to dynamically construct a SQL query.',
        impact: 'An attacker can read sensitive data from the database, modify database data (Insert/Update/Delete), execute administration operations on the database (such as shutdown the DBMS), recover the content of a given file present on the DBMS file system and in some cases issue commands to the operating system.',
        remediation: '1. Use prepared statements (with parameterized queries).\n2. Use stored procedures.\n3. Validate user input.'
    };

    // Form State
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState('Medium');
    const [description, setDescription] = useState('');
    const [impact, setImpact] = useState('');
    const [remediation, setRemediation] = useState('');

    // Load data on mount
    useEffect(() => {
        const savedData = localStorage.getItem(`finding_${id}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            setTitle(data.title);
            setSeverity(data.severity);
            setDescription(data.description);
            setImpact(data.impact);
            setRemediation(data.remediation);
            if (data.evidence) setEvidenceList(data.evidence);
        } else if (!isNew) {
            // Use defaults if editing existing but no local changes yet
            setTitle(defaults.title);
            setSeverity('High');
            setDescription(defaults.description);
            setImpact(defaults.impact);
            setRemediation(defaults.remediation);
        }
    }, [id, isNew]);

    const severityColors = {
        'Low': { bg: 'rgba(0, 240, 255, 0.1)', text: 'var(--color-primary)', border: 'var(--color-primary)' },
        'Medium': { bg: 'rgba(254, 228, 64, 0.1)', text: 'var(--color-warning)', border: 'var(--color-warning)' },
        'High': { bg: 'rgba(255, 77, 109, 0.1)', text: 'var(--color-error)', border: 'var(--color-error)' },
        'Critical': { bg: 'rgba(142, 45, 226, 0.2)', text: 'var(--color-secondary)', border: 'var(--color-secondary)' }
    };

    // Tracking Edits (for "Using default" badge) - only relevant if not new
    const [isDescdefault, setIsDescDefault] = useState(!isNew);
    const [isImpactDefault, setIsImpactDefault] = useState(!isNew);
    const [isRemediationDefault, setIsRemediationDefault] = useState(!isNew);

    const handleReset = (field) => {
        if (field === 'description') {
            setDescription(defaults.description);
            setIsDescDefault(true);
        } else if (field === 'impact') {
            setImpact(defaults.impact);
            setIsImpactDefault(true);
        } else if (field === 'remediation') {
            setRemediation(defaults.remediation);
            setIsRemediationDefault(true);
        }
    };

    const handleEdit = (field, value) => {
        if (field === 'description') {
            setDescription(value);
            setIsDescDefault(!isNew && value === defaults.description);
        } else if (field === 'impact') {
            setImpact(value);
            setIsImpactDefault(!isNew && value === defaults.impact);
        } else if (field === 'remediation') {
            setRemediation(value);
            setIsRemediationDefault(!isNew && value === defaults.remediation);
        }
    };

    // Evidence State
    const [evidenceList, setEvidenceList] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newEvidence, setNewEvidence] = useState({ title: '', file: null, notes: '' });
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewEvidence({ ...newEvidence, file: file });
        }
    };

    const handleAddEvidence = () => {
        if (!newEvidence.title) return; // Simple validation

        setEvidenceList([
            ...evidenceList,
            {
                id: Date.now(),
                step: evidenceList.length + 1,
                ...newEvidence
            }
        ]);
        setNewEvidence({ title: '', file: null, notes: '' });
        setShowUploadForm(false);
    };

    const handleSave = () => {
        // Collect all updated data
        const savedData = {
            title,
            severity,
            description,
            impact,
            remediation,
            evidence: evidenceList
        };

        // Save to localStorage for mock persistence
        localStorage.setItem(`finding_${id}`, JSON.stringify(savedData));

        console.log('Saving OWASP Vulnerability:', savedData);

        // Show success feedback
        alert('OWASP Vulnerability saved successfully!');

        // Navigate back to the previous page
        navigate(-1);
    };

    return (
        <div className="finding-detail-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: '20px', paddingLeft: 0 }}>
                <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back
            </button>

            {/* Header */}
            <div className="glass-panel" style={{
                padding: '24px',
                marginBottom: '24px',
                borderLeft: `6px solid ${severityColors[severity].text}`,
                transition: 'border-color 0.3s ease'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>Severity Level</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {Object.keys(severityColors).map((level) => (
                            <button
                                key={level}
                                onClick={() => setSeverity(level)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: severity === level ? severityColors[level].text : 'var(--color-border)',
                                    background: severity === level ? severityColors[level].bg : 'transparent',
                                    color: severity === level ? severityColors[level].text : 'var(--color-text-muted)',
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
                        ))}
                    </div>
                </div>

                {isNew ? (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Name of OWASP VULNERABILITY</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter vulnerability name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                        />
                    </div>
                ) : (
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                        {title}
                        <span style={{
                            fontSize: '0.75rem',
                            background: severityColors[severity].bg,
                            color: severityColors[severity].text,
                            padding: '4px 12px',
                            borderRadius: '100px',
                            marginLeft: '15px',
                            border: `1px solid ${severityColors[severity].text}`,
                            fontWeight: '700',
                            letterSpacing: '0.05em'
                        }}>
                            {severity.toUpperCase()}
                        </span>
                    </h1>
                )}
                {!isNew && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Source: {defaults.source}</div>}
            </div>

            {/* Description Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Description</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!isNew && (
                            <>
                                <span style={{ fontSize: '0.75rem', color: isDescdefault ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
                                    {isDescdefault ? '(Using default)' : '(Edited)'}
                                </span>
                                {!isDescdefault && (
                                    <button onClick={() => handleReset('description')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.75rem', height: 'auto' }}>
                                        <RefreshCw size={12} style={{ marginRight: '4px' }} /> Reset
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                    value={description}
                    onChange={(e) => handleEdit('description', e.target.value)}
                />
            </div>

            {/* Impact Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Impact</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!isNew && (
                            <>
                                <span style={{ fontSize: '0.75rem', color: isImpactDefault ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
                                    {isImpactDefault ? '(Using default)' : '(Edited)'}
                                </span>
                                {!isImpactDefault && (
                                    <button onClick={() => handleReset('impact')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.75rem', height: 'auto' }}>
                                        <RefreshCw size={12} style={{ marginRight: '4px' }} /> Reset
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    value={impact}
                    onChange={(e) => handleEdit('impact', e.target.value)}
                />
            </div>

            {/* Remediation Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Remediation</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!isNew && (
                            <>
                                <span style={{ fontSize: '0.75rem', color: isRemediationDefault ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
                                    {isRemediationDefault ? '(Using default)' : '(Edited)'}
                                </span>
                                {!isRemediationDefault && (
                                    <button onClick={() => handleReset('remediation')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.75rem', height: 'auto' }}>
                                        <RefreshCw size={12} style={{ marginRight: '4px' }} /> Reset
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    value={remediation}
                    onChange={(e) => handleEdit('remediation', e.target.value)}
                />
            </div>

            {/* Evidence Section */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Evidence</h2>
                    {!showUploadForm && (
                        <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
                            <Plus size={18} style={{ marginRight: '5px' }} /> Add Evidence
                        </button>
                    )}
                </div>

                {/* Evidence List */}
                {evidenceList.map((item, index) => (
                    <div key={item.id} className="glass-panel" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                            Evidence {index + 1}
                        </div>
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>{item.title}</h3>
                        {item.notes && <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px', fontSize: '0.9rem' }}>{item.notes}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                            <File size={20} className="text-secondary" style={{ color: 'var(--color-primary)' }} />
                            <span style={{ fontSize: '0.9rem' }}>{item.file ? item.file.name : 'screenshot_mock.png'}</span>
                        </div>
                    </div>
                ))}

                {/* Upload Form */}
                {showUploadForm && (
                    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--color-primary)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Evidence Upload</h3>

                        <div className="input-group">
                            <label className="input-label">Title / Description</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Admin Login Page reflected XSS"
                                value={newEvidence.title}
                                onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">File</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                            <div
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: '2px dashed var(--color-border)',
                                    padding: '20px',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: newEvidence.file ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    background: newEvidence.file ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                                    borderColor: newEvidence.file ? 'var(--color-primary)' : 'var(--color-border)'
                                }}
                            >
                                <Upload size={24} style={{ display: 'block', margin: '0 auto 10px' }} />
                                {newEvidence.file ? newEvidence.file.name : 'Choose File or Drag & Drop'}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Notes (Optional)</label>
                            <textarea
                                className="input-field"
                                rows="3"
                                value={newEvidence.notes}
                                onChange={(e) => setNewEvidence({ ...newEvidence, notes: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button className="btn btn-primary" onClick={handleAddEvidence} style={{ flex: 1 }}>
                                Upload
                            </button>
                            <button className="btn btn-ghost" onClick={() => setShowUploadForm(false)} style={{ flex: 1 }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'right', marginTop: '40px' }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ padding: '12px 30px', fontSize: '1rem' }}>
                    <Save size={20} style={{ marginRight: '8px' }} /> Save OWASP VULNERABILITIES
                </button>
            </div>

        </div>
    );
};

export default FindingDetail;
