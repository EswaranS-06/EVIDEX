import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import EvidenceSection from '../components/EvidenceSection';

import { ChevronLeft, Plus, Upload, File, Trash2, Save, Eye, Edit2 } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const FindingDetail = () => {
    const { reportId, id } = useParams();
    const navigate = useNavigate();
    const { alert } = useModal();
    const isNew = id === 'new';

    // State
    const [finding, setFinding] = useState(null);
    const [status, setStatus] = useState('Pending'); // For editable status
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Load data from Backend
    useEffect(() => {
        if (!isNew && reportId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/api/reports/${reportId}/findings/${id}/`);
                    setFinding(response.data);
                    setStatus(response.data.status || 'Pending');
                    setStatus(response.data.status || 'Pending');
                } catch (err) {
                    console.error("Failed to fetch finding data", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else if (!reportId) {
            // Global vulnerability definition viewed via /finding/:id - redirect to edit directly for global vulns
            navigate(`/finding/${id}`, { replace: true });
        }
    }, [id, reportId, isNew, navigate]);

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

    const currentStyle = getSeverityStyle(finding?.final_severity);

    // URL helper removed since it's unused



    const handleSaveStatus = async (newStatus) => {
        setStatus(newStatus);
        setSaving(true);
        try {
            await api.patch(`/api/reports/${reportId}/findings/${id}/`, { status: newStatus });
        } catch (err) {
            console.error("Save status failed", err);
            await alert("Failed to save status update", "Save Error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Finding Details...</div>;
    }

    if (!finding) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Finding not found.</div>;
    }

    return (
        <div className="finding-detail-container" style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ paddingLeft: 0 }}>
                    <ChevronLeft size={20} style={{ marginRight: '5px' }} /> Back
                </button>
                <button onClick={() => navigate(`/report/${reportId}/finding/${id}/edit`)} className="btn btn-primary" style={{ paddingLeft: '15px' }}>
                    <Edit2 size={18} style={{ marginRight: '8px' }} /> Edit Details
                </button>
            </div>

            {/* Header */}
            <div className="glass-panel" style={{
                padding: '24px',
                marginBottom: '24px',
                borderLeft: `6px solid ${currentStyle.text}`,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            {finding.final_title || 'Untitled Finding'}
                            <span style={{
                                fontSize: '0.75rem',
                                background: currentStyle.bg,
                                color: currentStyle.text,
                                padding: '4px 12px',
                                borderRadius: '100px',
                                border: `1px solid ${currentStyle.text}`,
                                fontWeight: '700',
                                letterSpacing: '0.05em'
                            }}>
                                {(finding.final_severity || 'MEDIUM').toUpperCase()}
                            </span>
                        </h1>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
                                Source: <strong style={{ color: 'var(--color-text-main)' }}>{finding.source_type}</strong>
                            </span>
                            {finding.category_name && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
                                    Category: <strong style={{ color: 'var(--color-primary)' }}>{finding.category_name}</strong>
                                </span>
                            )}
                            {finding.cve_id && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
                                    CVE: <strong style={{ color: 'var(--color-secondary)' }}>{finding.cve_id}</strong>
                                </span>
                            )}
                            {finding.cvss_score && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
                                    CVSS: <strong style={{ color: 'var(--color-error)' }}>{finding.cvss_score}</strong>
                                </span>
                            )}
                            {finding.cvss_vector && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                    Vector: <span style={{ opacity: 0.8 }}>{finding.cvss_vector}</span>
                                </span>
                            )}
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Last updated {finding.updated_at ? new Date(finding.updated_at).toLocaleString() : 'N/A'} {finding.updated_by_name && `by ${finding.updated_by_name}`}
                        </div>
                    </div>

                    <div style={{ minWidth: '150px' }}>
                        <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Finding Status</label>
                        <select
                            className="input-field"
                            value={status}
                            onChange={(e) => handleSaveStatus(e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Patched">Patched</option>
                            <option value="False Positive">False Positive</option>
                        </select>
                        {saving && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'right' }}>Saving...</div>}
                    </div>
                </div>
            </div>

            {/* Final Description */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', marginBottom: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Description</h3>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
                    {finding.final_description || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No description provided.</span>}
                </div>
            </div>

            {/* Final Impact */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', marginBottom: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Impact</h3>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
                    {finding.final_impact || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No impact details provided.</span>}
                </div>
            </div>

            {/* Final Remediation */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', marginBottom: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Remediation</h3>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
                    {finding.final_remediation || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No remediation provided.</span>}
                </div>
            </div>

            {/* Evidence Section */}
            <EvidenceSection findingId={id} isNew={isNew} />
        </div>
    );
};

export default FindingDetail;
