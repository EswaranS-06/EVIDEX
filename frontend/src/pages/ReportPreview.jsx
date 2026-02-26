import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Loader, ZoomIn, ZoomOut } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
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
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
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

    const handleExportPDF = async () => {
        try {
            setExporting(true);
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${pdfApiUrl}?download=1`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!response.ok) {
                throw new Error(`Export failed (status ${response.status})`);
            }

            // Extract filename from Content-Disposition header
            let filename = 'VAPT_Report.pdf';
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
                            description: 'PDF Document',
                            accept: { 'application/pdf': ['.pdf'] },
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

    return (
        <div style={{
            margin: '-24px',
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

                {/* Right: Export */}
                <button
                    className="btn btn-primary"
                    onClick={handleExportPDF}
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
                    {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
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
