import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    ChevronRight,
    Filter,
    Shield,
    Calendar,
    User,
    Activity
} from 'lucide-react';

const ReportStatus = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [findingsLoading, setFindingsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/reports/');
            setReports(response.data);
            if (response.data.length > 0) {
                handleSelectReport(response.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectReport = async (report) => {
        setSelectedReport(report);
        setFindingsLoading(true);
        try {
            const response = await api.get(`/api/reports/${report.id}/findings/`);
            setFindings(response.data);
        } catch (err) {
            console.error("Failed to fetch findings:", err);
        } finally {
            setFindingsLoading(false);
        }
    };

    const toggleFindingStatus = async (findingId, currentStatus) => {
        const newStatus = currentStatus === 'Patched' ? 'Pending' : 'Patched';
        try {
            await api.patch(`/api/findings/${findingId}/`, {
                status: newStatus
            });
            // Update local state
            setFindings(findings.map(f => f.id === findingId ? { ...f, status: newStatus } : f));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status.");
        }
    };

    const filteredReports = reports.filter(r =>
        r.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.application_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityColor = (sev) => {
        switch (sev?.toUpperCase()) {
            case 'CRITICAL': return 'var(--color-secondary)';
            case 'HIGH': return 'var(--color-error)';
            case 'MEDIUM': return 'var(--color-warning)';
            case 'LOW': return 'var(--color-primary)';
            default: return 'var(--color-text-muted)';
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Reports...</div>;
    }

    return (
        <div className="report-status-page" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>

            {/* Left Sidebar: Report List */}
            <div className="glass-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="var(--color-primary)" /> Reports
                    </h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {filteredReports.map(report => (
                        <div
                            key={report.id}
                            onClick={() => handleSelectReport(report)}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '8px',
                                background: selectedReport?.id === report.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                                border: selectedReport?.id === report.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                            }}
                            className="report-item-hover"
                        >
                            <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: selectedReport?.id === report.id ? 'var(--color-primary)' : 'inherit' }}>
                                {report.client_name}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                                {report.application_name}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {new Date(report.created_at).toLocaleDateString()}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    {report.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Finding Status Details */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedReport ? (
                    <>
                        {/* Selected Report Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedReport.client_name} - {selectedReport.application_name}</h1>
                                    <div style={{ display: 'flex', gap: '20px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {selectedReport.start_date || 'N/A'} - {selectedReport.end_date || 'N/A'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {selectedReport.prepared_by}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> {selectedReport.report_type}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(0, 240, 255, 0.1)',
                                        color: 'var(--color-primary)',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        display: 'inline-block'
                                    }}>
                                        {selectedReport.status?.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Stats mini bar */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="glass-panel" style={{ padding: '10px 16px', flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Findings</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{findings.length}</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '10px 16px', flex: 1, background: 'rgba(0, 255, 157, 0.05)', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', textTransform: 'uppercase' }}>Patched</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                                        {findings.filter(f => f.status === 'Patched').length}
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ padding: '10px 16px', flex: 1, background: 'rgba(255, 77, 109, 0.05)', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', textTransform: 'uppercase' }}>Pending</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-error)' }}>
                                        {findings.filter(f => f.status === 'Pending').length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Findings List with Status Toggle */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {findingsLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Loading findings...</div>
                            ) : findings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                    <p>No findings found for this report.</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>VULNERABILITY</th>
                                            <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.85rem', width: '120px' }}>SEVERITY</th>
                                            <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.85rem', width: '150px' }}>STATUS</th>
                                            <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.85rem', width: '120px' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {findings.map(finding => (
                                            <tr key={finding.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="table-row-hover">
                                                <td style={{ padding: '16px 12px' }}>
                                                    <div style={{ fontWeight: '500' }}>{finding.final_title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                        {finding.vulnerability_name || 'Custom Finding'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 12px' }}>
                                                    <span style={{
                                                        color: getSeverityColor(finding.final_severity),
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <Activity size={14} /> {finding.final_severity}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 12px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: finding.status === 'Patched' ? 'var(--color-success)' : 'var(--color-warning)'
                                                    }}>
                                                        {finding.status === 'Patched' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{finding.status}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 12px' }}>
                                                    <button
                                                        className={`btn ${finding.status === 'Patched' ? 'btn-ghost' : 'btn-neon'}`}
                                                        style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100px' }}
                                                        onClick={() => toggleFindingStatus(finding.id, finding.status)}
                                                    >
                                                        {finding.status === 'Patched' ? 'PENDING' : 'PATCHED'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        <Shield size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
                        <p>Select a report from the list to view vulnerability status</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .report-item-hover:hover {
                    background: rgba(255,255,255,0.03) !important;
                }
                .table-row-hover:hover {
                    background: rgba(255,255,255,0.01);
                }
            `}} />
        </div>
    );
};

export default ReportStatus;
