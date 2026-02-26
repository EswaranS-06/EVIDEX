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
    Activity,
    Edit2
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportStatus = () => {
    const { alert } = useModal();
    const navigate = useNavigate();
    const location = useLocation();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [findingsLoading, setFindingsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const dropdownRef = React.useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/reports/');
            setReports(response.data);

            // Handle cross-page navigation selection
            const passedId = location.state?.reportId;
            if (passedId) {
                const found = response.data.find(r => r.id.toString() === passedId.toString());
                if (found) {
                    handleSelectReport(found);
                } else if (response.data.length > 0) {
                    handleSelectReport(response.data[0]);
                }
            } else if (response.data.length > 0) {
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
            await alert("Failed to update finding status. Please try again.", "Update Failed");
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 120px)' }}>
            {/* Top Bar: Search */}
            <div className="top-bar glass-panel" style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100
            }}>
                <div className="search-bar" ref={dropdownRef} style={{ position: 'relative', width: '450px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 10 }} />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search client or application to select report..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        style={{ width: '100%', paddingLeft: '40px', background: 'rgba(0,0,0,0.2)', border: showResults && searchTerm ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}
                    />

                    {/* Enhanced Search Results Dropdown */}
                    {showResults && searchTerm && (
                        <div className="glass-panel search-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '10px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            background: 'var(--glass-bg)',
                            padding: '10px',
                            border: '1px solid var(--color-primary)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            {filteredReports.length > 0 ? (
                                filteredReports.map(report => (
                                    <div
                                        key={report.id}
                                        onClick={() => {
                                            handleSelectReport(report);
                                            setSearchTerm('');
                                            setShowResults(false);
                                        }}
                                        className="search-result-item"
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: selectedReport?.id === report.id ? 'var(--nav-active-bg)' : 'var(--tag-bg)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: selectedReport?.id === report.id ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                                                {report.client_name}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {report.application_name}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: 'var(--tag-bg)',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No reports found matching "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {selectedReport && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--nav-active-bg)', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
                            <FileText size={16} color="var(--color-primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Active: {selectedReport.client_name}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-main)', margin: 0 }}>Status Tracker</h1>
                        <Activity size={20} color="var(--color-primary)" />
                    </div>
                </div>
            </div>

            <div className="report-status-page" style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>


                {/* Right Side: Finding Status Details */}
                <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedReport ? (
                        <>
                            {/* Selected Report Header */}
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', background: 'var(--table-hover-bg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedReport.client_name} - {selectedReport.application_name}</h1>
                                        <div style={{ display: 'flex', gap: '20px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {selectedReport.start_date || 'N/A'} - {selectedReport.end_date || 'N/A'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {selectedReport.prepared_by}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> {selectedReport.report_type}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
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
                                        <button
                                            className="btn btn-ghost"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => navigate(`/report/${selectedReport.id}`)}
                                        >
                                            <Edit2 size={14} style={{ marginRight: '6px' }} /> EDIT REPORT
                                        </button>
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
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                            <div style={{ fontWeight: '600', color: '#fff', fontSize: '1rem' }}>{finding.final_title}</div>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                {finding.category_name && (
                                                                    <span style={{
                                                                        fontSize: '0.65rem',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px',
                                                                        background: 'rgba(0, 240, 255, 0.05)',
                                                                        color: 'var(--color-primary)',
                                                                        border: '1px solid rgba(0, 240, 255, 0.2)',
                                                                        fontWeight: '700',
                                                                        letterSpacing: '0.02em'
                                                                    }}>
                                                                        {finding.category_name}
                                                                    </span>
                                                                )}
                                                                {finding.source_type && (
                                                                    <span style={{
                                                                        fontSize: '0.65rem',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px',
                                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                                        color: 'var(--color-text-muted)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {finding.source_type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '600px' }}>
                                                            {finding.final_description || 'No description provided'}
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
                            <h2>No Report Selected</h2>
                            <p>Use the search bar above to find and select a report</p>
                        </div>
                    )}
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .report-item-hover:hover {
                        background: var(--table-hover-bg) !important;
                    }
                    .table-row-hover:hover {
                        background: var(--table-hover-bg);
                    }
                `}} />
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .search-result-item:hover {
                        background: var(--nav-active-bg) !important;
                        transform: translateX(4px);
                    }
                    .search-dropdown::-webkit-scrollbar {
                        width: 4px;
                    }
                    .search-dropdown::-webkit-scrollbar-thumb {
                        background: var(--color-primary);
                        border-radius: 10px;
                    }
                `}} />
            </div>
        </div>
    );
};

export default ReportStatus;
