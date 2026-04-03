import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Loader, ZoomIn, ZoomOut, Mail, Send, Edit, X, CheckCircle, XCircle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useNotification } from '../context/NotificationContext';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const ReportPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [pdfData, setPdfData] = useState(null);
    const [scale, setScale] = useState(1.2);
    const [userIp, setUserIp] = useState('Unknown');

    // Fetch User IP for watermarking
    useEffect(() => {
        const fetchIp = async () => {
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                setUserIp(data.ip);
            } catch (err) {
                console.warn('Could not fetch client IP for watermarking:', err);
            }
        };
        fetchIp();
    }, []);

    const { fetchNotifications } = useNotification();

    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [exportPassword, setExportPassword] = useState('');
    const [exportFormat, setExportFormat] = useState('pdf');

    // Email / Compose Modal State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [emailForm, setEmailForm] = useState({
        email: '',
        cc: '',
        attachPDF: true,
        attachDOCX: false,
        password: '',
        subject: 'Security Assessment Report',
        body: 'Hi,\n\nPlease find attached the security assessment report.\n\nRegards,\nEVIDEX Team'
    });

    // Toast Notification State
    const [toastMeta, setToastMeta] = useState({ show: false, status: 'loading', message: '' });

    const showToast = (status, message) => {
        setToastMeta({ show: true, status, message });
        if (status !== 'loading') {
            setTimeout(() => setToastMeta({ show: false, status: '', message: '' }), 4000);
        }
    };

    const pdfApiUrl = `${API_BASE_URL}/api/reports/${id}/pdf/`;

    // Fetch PDF data as ArrayBuffer
    useEffect(() => {
        let cancelled = false;

        const fetchPdf = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('access_token');
                const response = await fetch(pdfApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...(userIp !== 'Unknown' ? { 'X-Forwarded-For': userIp } : {})
                    },
                    body: JSON.stringify({ password: '' }) // Empty password for preview
                });

                if (!response.ok) {
                    throw new Error(`Failed to load PDF (status ${response.status})`);
                }

                const buffer = await response.arrayBuffer();
                if (!cancelled) {
                    setPdfData({ data: new Uint8Array(buffer) });
                }
            } catch (err) {
                console.error('Failed to fetch PDF:', err);
                if (!cancelled) {
                    setError(err.message || 'Failed to load PDF preview');
                    setLoading(false);
                }
            }
        };

        fetchPdf();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    }, []);

    const onDocumentLoadError = useCallback((err) => {
        console.error('PDF load error:', err);
        setError('Failed to render PDF');
        setLoading(false);
    }, []);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    const executeExport = async () => {
        try {
            setExporting(true);
            setShowPasswordModal(false);
            const isPdf = exportFormat === 'pdf';
            const token = localStorage.getItem('access_token');
            const apiUrl = isPdf ? `${pdfApiUrl}?download=1` : `${API_BASE_URL}/api/reports/${id}/docx/`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(userIp !== 'Unknown' ? { 'X-Forwarded-For': userIp } : {})
                },
                body: JSON.stringify({ password: exportPassword })
            });

            if (!response.ok) {
                throw new Error(`Export failed (status ${response.status})`);
            }

            // Extract filename from Content-Disposition header
            let filename = `VAPT_Report.${exportFormat}`;
            const disposition = response.headers.get('Content-Disposition');
            if (disposition) {
                const match = disposition.match(/filename="?([^";\n]+)"?/);
                if (match && match[1]) {
                    filename = match[1].trim();
                }
            }

            const buffer = await response.arrayBuffer();
            const blob = new Blob([buffer], { type: 'application/pdf' });

            // Try the File System Access API first (shows a Save As dialog)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: isPdf ? 'PDF Document' : 'Word Document',
                            accept: isPdf ? { 'application/pdf': ['.pdf'] } : { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (pickerErr) {
                    if (pickerErr.name === 'AbortError') return;
                    console.warn('showSaveFilePicker failed, using fallback:', pickerErr);
                }
            }

            // Fallback: blob URL + anchor click
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            console.error('PDF export failed:', err);
            setError(err.message || 'Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    const handleSendEmail = async () => {
        try {
            setShowEmailModal(false);
            setShowComposeModal(false);
            showToast('loading', 'Sending email...');

            const token = localStorage.getItem('access_token');
            const payload = {
                report_id: id,
                email: emailForm.email,
                cc: emailForm.cc,
                attach_pdf: emailForm.attachPDF,
                attach_docx: emailForm.attachDOCX,
                password: emailForm.password,
                subject: emailForm.subject,
                body: emailForm.body
            };

            const response = await fetch(`${API_BASE_URL}/api/send-report-email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(userIp !== 'Unknown' ? { 'X-Forwarded-For': userIp } : {})
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send email');
            }

            showToast('success', 'Email sent successfully 📧');

            // reset form after success
            setEmailForm({
                email: '', cc: '', password: '',
                attachPDF: true, attachDOCX: false,
                subject: 'Security Assessment Report',
                body: 'Hi,\n\nPlease find attached the security assessment report.\n\nRegards,\nEVIDEX Team'
            });

            // Refresh notifications stack
            fetchNotifications();
        } catch (err) {
            console.error('Email send failed:', err);
            showToast('error', err.message || 'Failed to send email ❌');
        }
    };

    return (
        <div style={{
            margin: '-40px',
            height: 'calc(100vh - var(--navbar-height))',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Top toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid var(--glass-border)',
                backdropFilter: 'blur(12px)',
                flexShrink: 0,
                gap: '16px',
                flexWrap: 'wrap',
            }}>
                {/* Left: Go Back */}
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate(`/report/${id}`)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        padding: '8px 16px',
                    }}
                >
                    <ChevronLeft size={20} />
                    Back to Report
                </button>

                {/* Center: Title + Zoom + Page Info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                }}>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, #fff, var(--color-text-muted))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Report Preview
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0, 240, 255, 0.08)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(0, 240, 255, 0.15)',
                        fontWeight: '700',
                    }}>
                        PDF
                    </span>

                    {/* Zoom controls */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                    }}>
                        <button
                            onClick={handleZoomOut}
                            className="btn btn-ghost"
                            style={{ padding: '4px', minWidth: 'auto' }}
                            title="Zoom out"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            minWidth: '42px',
                            textAlign: 'center',
                        }}>
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="btn btn-ghost"
                            style={{ padding: '4px', minWidth: 'auto' }}
                            title="Zoom in"
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>

                    {/* Page count */}
                    {numPages && (
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '500',
                        }}>
                            {numPages} page{numPages !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Right: Export & Mail */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowEmailModal(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 20px', fontWeight: '600'
                        }}
                    >
                        <Mail size={18} /> Mail
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setExportPassword('');
                            setShowPasswordModal(true);
                        }}
                        disabled={exporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 20px',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            opacity: exporting ? 0.7 : 1,
                            cursor: exporting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {exporting ? (
                            <Loader size={18} className="spin-animation" />
                        ) : (
                            <Download size={18} />
                        )}
                        {exporting ? 'Exporting...' : 'Export Report'}
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div style={{
                flex: 1,
                position: 'relative',
                background: '#1a1a2e',
                minHeight: 0,
                overflow: 'auto',
            }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        zIndex: 2,
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            border: '3px solid rgba(0, 240, 255, 0.15)',
                            borderTopColor: 'var(--color-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }} />
                        <span style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                        }}>
                            Loading report preview...
                        </span>
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        zIndex: 2,
                    }}>
                        <span style={{
                            color: 'var(--color-error)',
                            fontSize: '1rem',
                            fontWeight: '600',
                        }}>
                            {error}
                        </span>
                        <button
                            className="btn btn-ghost"
                            onClick={() => window.location.reload()}
                            style={{ marginTop: '8px' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {pdfData && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '24px 0',
                        gap: '20px',
                    }}>
                        <Document
                            file={pdfData}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                        >
                            {Array.from(new Array(numPages), (_, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    style={{
                                        marginBottom: '20px',
                                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                )}
            </div>

            {/* Export Modal */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel animate-fade-in" style={{ padding: '30px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '15px' }}>Export Report</h3>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <div 
                                onClick={() => setExportFormat('pdf')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                    textAlign: 'center', border: `2px solid ${exportFormat === 'pdf' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                    background: exportFormat === 'pdf' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontWeight: '700', color: exportFormat === 'pdf' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>PDF</span>
                            </div>
                            <div 
                                onClick={() => setExportFormat('docx')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                    textAlign: 'center', border: `2px solid ${exportFormat === 'docx' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                    background: exportFormat === 'docx' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontWeight: '700', color: exportFormat === 'docx' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>WORD</span>
                            </div>
                        </div>

                        {exportFormat === 'pdf' && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                Optional: Enter a password to encrypt the PDF. Leave blank for no password.
                            </p>
                        )}
                        {exportFormat === 'docx' && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                Optional: Enter a password to encrypt the DOCX. Leave blank for no password.
                            </p>
                        )}

                        <input
                            type="password"
                            className="input-field"
                            placeholder="Password (optional)"
                            value={exportPassword}
                            onChange={(e) => setExportPassword(e.target.value)}
                            style={{ marginBottom: '20px' }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={executeExport} style={{ flex: 1 }}>
                                Confirm Download
                            </button>
                            <button className="btn btn-ghost" onClick={() => setShowPasswordModal(false)} style={{ flex: 1 }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel animate-fade-in" style={{ padding: '30px', width: '450px', maxWidth: '90%', position: 'relative' }}>
                        <button
                            className="btn-icon"
                            style={{ position: 'absolute', top: '15px', right: '15px' }}
                            onClick={() => setShowEmailModal(false)}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={22} className="text-primary" /> Send Report via Email
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Generated PDF report will be attached securely.
                        </p>

                        <div className="input-group" style={{ marginBottom: '15px' }}>
                            <label className="input-label">Destination Email (Optional)</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="Defaults to your registered email"
                                value={emailForm.email}
                                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '15px' }}>
                            <label className="input-label">Cc (Optional)</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="E.g. manager@example.com"
                                value={emailForm.cc}
                                onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '20px' }}>
                            <label className="input-label" style={{ marginBottom: '12px' }}>Attachment Format</label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={emailForm.attachPDF} 
                                        onChange={(e) => setEmailForm({ ...emailForm, attachPDF: e.target.checked })}
                                        style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                                    />
                                    PDF Report
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={emailForm.attachDOCX} 
                                        onChange={(e) => setEmailForm({ ...emailForm, attachDOCX: e.target.checked })}
                                        style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                                    />
                                    Word (DOCX)
                                </label>
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '25px' }}>
                            <label className="input-label">Password (Optional)</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Encrypt attached files"
                                value={emailForm.password}
                                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                                disabled={!emailForm.attachPDF && !emailForm.attachDOCX}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-ghost" onClick={() => { setShowEmailModal(false); setShowComposeModal(true); }} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Edit size={18} /> Compose
                            </button>
                            <button className="btn btn-primary" onClick={handleSendEmail} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Send size={18} /> Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compose Modal */}
            {showComposeModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel animate-fade-in" style={{ padding: '30px', width: '600px', maxWidth: '95%' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Edit size={22} className="text-primary" /> Compose Custom Email
                        </h3>

                        <div className="input-group" style={{ marginBottom: '15px' }}>
                            <label className="input-label">Cc (comma-separated)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={emailForm.cc}
                                onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                                placeholder="E.g. admin@example.com, manager@example.com"
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '15px' }}>
                            <label className="input-label">Subject</label>
                            <input
                                type="text"
                                className="input-field"
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '25px' }}>
                            <label className="input-label">Body Template</label>
                            <textarea
                                className="input-field"
                                rows="8"
                                value={emailForm.body}
                                onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                                style={{ lineHeight: '1.6' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => { setShowComposeModal(false); setShowEmailModal(true); }} style={{ padding: '10px 24px' }}>
                                Back
                            </button>
                            <button className="btn btn-primary" onClick={handleSendEmail} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                                <Send size={18} /> Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification Layer */}
            {toastMeta.show && (
                <div className="animate-fade-in" style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 10000,
                    padding: '16px 24px',
                    borderRadius: '8px',
                    background: toastMeta.status === 'success' ? 'var(--color-success)' : toastMeta.status === 'error' ? 'var(--color-error)' : 'var(--glass-bg)',
                    color: toastMeta.status === 'loading' ? 'var(--color-text-main)' : '#fff',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: '600'
                }}>
                    {toastMeta.status === 'loading' && <Loader size={20} className="spin-animation text-primary" />}
                    {toastMeta.status === 'success' && <CheckCircle size={20} />}
                    {toastMeta.status === 'error' && <XCircle size={20} />}
                    {toastMeta.message}
                </div>
            )}

            {/* Inline keyframes for spinner */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                .react-pdf__Page__canvas {
                    display: block !important;
                }
                .react-pdf__Page__textContent {
                    user-select: text;
                }
            `}</style>
        </div>
    );
};

export default ReportPreview;
