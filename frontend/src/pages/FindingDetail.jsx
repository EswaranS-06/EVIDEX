import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getEvidence, uploadEvidence, deleteEvidence } from '../api/evidence';

import { ChevronLeft, RefreshCw, Plus, Upload, File, Trash2, Save } from 'lucide-react';

const FindingDetail = () => {
    const { reportId, id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    // Form State
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState('Medium');
    const [description, setDescription] = useState('');
    const [impact, setImpact] = useState('');
    const [remediation, setRemediation] = useState('');
    const [loading, setLoading] = useState(!isNew);

    // Load data from Backend
    useEffect(() => {
        if (!isNew) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    let response;
                    if (reportId) {
                        // Editing a specific finding in a report
                        response = await api.get(`/api/reports/${reportId}/findings/${id}/`);
                        const f = response.data;
                        setTitle(f.final_title);
                        setSeverity(f.final_severity);
                        setDescription(f.final_description);
                        setImpact(f.final_impact);
                        setRemediation(f.final_remediation);
                        fetchEvidence();
                    } else {
                        // Editing a global vulnerability definition
                        response = await api.get(`/api/vulnerabilities/${id}/`);
                        const v = response.data;
                        setTitle(v.name);
                        setSeverity(v.severity);
                        setDescription(v.description);
                        setImpact(v.impact);
                        setRemediation(v.remediation);
                    }
                } catch (err) {
                    console.error("Failed to fetch data", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, reportId, isNew]);

    const severityColors = {
        'Low': { bg: 'rgba(0, 240, 255, 0.1)', text: 'var(--color-primary)', border: 'var(--color-primary)' },
        'Medium': { bg: 'rgba(254, 228, 64, 0.1)', text: 'var(--color-warning)', border: 'var(--color-warning)' },
        'High': { bg: 'rgba(255, 77, 109, 0.1)', text: 'var(--color-error)', border: 'var(--color-error)' },
        'Critical': { bg: 'rgba(142, 45, 226, 0.2)', text: 'var(--color-secondary)', border: 'var(--color-secondary)' }
    };



    const handleEdit = (field, value) => {
        if (field === 'description') {
            setDescription(value);
        } else if (field === 'impact') {
            setImpact(value);
        } else if (field === 'remediation') {
            setRemediation(value);
        }
    };

    // Evidence State
    const [evidenceList, setEvidenceList] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newEvidence, setNewEvidence] = useState({ title: '', file: null, notes: '' });
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewEvidence({ ...newEvidence, file: file });
        }
    };

    const fetchEvidence = async () => {
        try {
            const data = await getEvidence(id);
            setEvidenceList(data);
        } catch (error) {
            console.error('Failed to fetch evidence', error);
        }
    };

    useEffect(() => {
        if (!isNew) {
            fetchEvidence();
        }
    }, [id, isNew]);

    const handleAddEvidence = async () => {
        if (!newEvidence.title || !newEvidence.file) return;

        try {
            const formData = new FormData();
            formData.append('title', newEvidence.title);
            formData.append('file', newEvidence.file);
            formData.append('description', newEvidence.notes); // backend expects 'description'

            await uploadEvidence(id, formData);

            // Refresh list
            await fetchEvidence();

            setNewEvidence({ title: '', file: null, notes: '' });
            setShowUploadForm(false);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload evidence");
        }
    };

    const handleSave = async () => {
        const payload = reportId ? {
            final_title: title,
            final_severity: severity,
            final_description: description,
            final_impact: impact,
            final_remediation: remediation
        } : {
            name: title,
            severity,
            description,
            impact,
            remediation
        };

        try {
            if (reportId) {
                if (isNew) {
                    await api.post(`/api/reports/${reportId}/findings/`, payload);
                } else {
                    await api.patch(`/api/reports/${reportId}/findings/${id}/`, payload);
                }
            } else {
                if (isNew) {
                    await api.post(`/api/vulnerabilities/`, payload);
                } else {
                    await api.patch(`/api/vulnerabilities/${id}/`, payload);
                }
            }
            alert('Saved successfully!');
            navigate(-1);
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save.");
        }
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
            </div>

            {/* Description Field */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>Description</label>
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
                    {!showUploadForm && !isNew && (
                        <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
                            <Plus size={18} style={{ marginRight: '5px' }} /> Add Evidence
                        </button>
                    )}
                    {isNew && <span style={{ color: 'var(--color-text-muted)' }}>Save finding to add evidence</span>}
                </div>

                {/* Evidence List */}
                {evidenceList.map((item) => (
                    <div key={item.id} className="glass-panel" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>{item.title}</h3>
                        {item.description && <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px', fontSize: '0.9rem' }}>{item.description}</p>}

                        {/* Display Image */}
                        {item.file && (typeof item.file === 'string' ? (
                            <div style={{ marginTop: '10px' }}>
                                <img src={item.file} alt={item.title} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>
                                    <a href={item.file} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>View Full Size</a>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                <File size={20} className="text-secondary" style={{ color: 'var(--color-primary)' }} />
                                <span style={{ fontSize: '0.9rem' }}>{item.file.name}</span>
                            </div>
                        ))}
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
