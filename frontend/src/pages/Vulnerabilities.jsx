import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Database, Shield, Layout, List, Layers, Tag, ChevronRight, ChevronDown } from 'lucide-react';
import { useModal } from '../context/ModalContext';

// Module-level cache to persist data across navigations in the current session
let cachedVulnerabilities = null;
let cachedCategories = null;

const Vulnerabilities = () => {
    const navigate = useNavigate();
    const { confirm, alert } = useModal();
    const [vulnerabilities, setVulnerabilities] = useState(cachedVulnerabilities || []);
    const [categories, setCategories] = useState(cachedCategories || []);
    const [loading, setLoading] = useState(!cachedVulnerabilities);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'categories'
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [vulnRes, catRes] = await Promise.all([
                api.get('/api/vulnerabilities/'),
                api.get('/api/owasp/categories/')
            ]);

            // Update state
            setVulnerabilities(vulnRes.data);
            setCategories(catRes.data);

            // Update global cache
            cachedVulnerabilities = vulnRes.data;
            cachedCategories = catRes.data;
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm(
            "Are you sure you want to delete this vulnerability definition from the library?",
            "Delete Vulnerability",
            { confirmText: 'Delete', isDangerous: true }
        );

        if (isConfirmed) {
            try {
                await api.delete(`/api/vulnerabilities/${id}/`);
                const remaining = vulnerabilities.filter(v => v.id !== id);
                setVulnerabilities(remaining);
                cachedVulnerabilities = remaining; // Update cache after modification
            } catch (err) {
                console.error("Delete failed:", err);
                await alert("Failed to delete vulnerability definition.", "Error");
            }
        }
    };

    const handleAddCategory = async () => {
        const name = await prompt("Enter the name for the new OWASP Category:", "Create Category");
        if (name) {
            try {
                const response = await api.post('/api/owasp/categories/', { name, description: '' });
                setCategories([...categories, response.data]);
                await alert("Category created successfully!", "Success");
            } catch (err) {
                console.error("Failed to create category:", err);
                await alert("Failed to create category. It might already exist.", "Error");
            }
        }
    };

    const handleDeleteCategory = async (id) => {
        const isConfirmed = await confirm(
            "Are you sure you want to delete this category? This will not delete the vulnerabilities inside it, but will remove the grouping.",
            "Delete Category",
            { confirmText: 'Delete', isDangerous: true }
        );

        if (isConfirmed) {
            try {
                await api.delete(`/api/owasp/categories/${id}/`);
                setCategories(categories.filter(c => c.id !== id));
            } catch (err) {
                console.error("Delete failed:", err);
                await alert("Failed to delete category.", "Error");
            }
        }
    };

    const getSeverityColor = (sev) => {
        switch (sev?.toUpperCase()) {
            case 'CRITICAL': return 'var(--color-secondary)';
            case 'HIGH': return 'var(--color-error)';
            case 'MEDIUM': return 'var(--color-warning)';
            case 'LOW': return 'var(--color-primary)';
            default: return 'var(--color-text-muted)';
        }
    };

    // Memoize filtered results for better performance
    const filteredVulnerabilities = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return vulnerabilities.filter(v =>
            v.title.toLowerCase().includes(lowerSearch) ||
            v.description.toLowerCase().includes(lowerSearch) ||
            v.source_type.toLowerCase().includes(lowerSearch)
        );
    }, [vulnerabilities, searchTerm]);

    const toggleCategory = (catId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(catId)) {
            newExpanded.delete(catId);
        } else {
            newExpanded.add(catId);
        }
        setExpandedCategories(newExpanded);
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="animate-pulse" style={{ color: 'var(--color-primary)' }}>Loading Vulnerability Library...</div>
            </div>
        );
    }

    return (
        <div className="vulnerabilities-page">
            {/* Header Section */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            margin: 0,
                            background: 'linear-gradient(to right, #fff, var(--color-primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.03em'
                        }}>
                            Vulnerabilities Library
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>
                            Manage global vulnerability definitions, categories, and standardized remediation signatures.
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar Section */}
            <div className="glass-panel" style={{
                padding: '20px 30px',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by title, description, or source..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '50px', transform: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="glass-panel" style={{ padding: '4px', display: 'flex', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                        <button
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('list')}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                            <List size={16} style={{ marginRight: '8px' }} /> List
                        </button>
                        <button
                            className={`btn ${viewMode === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('categories')}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                            <Layout size={16} style={{ marginRight: '8px' }} /> Categories
                        </button>
                    </div>

                    <button className="btn btn-ghost" onClick={handleAddCategory}>
                        <Layers size={20} style={{ marginRight: '8px' }} />
                        NEW CATEGORY
                    </button>

                    <button className="btn btn-primary" onClick={() => navigate('/finding/new')}>
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        NEW DEFINITION
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {viewMode === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredVulnerabilities.map(vuln => (
                        <div key={vuln.id} className="glass-panel library-item" style={{
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderLeft: `4px solid ${getSeverityColor(vuln.severity)}`
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--color-text-muted)',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {vuln.source_type}
                                    </span>
                                    {vuln.cve_id && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            background: 'rgba(0, 240, 255, 0.1)',
                                            color: 'var(--color-primary)'
                                        }}>
                                            {vuln.cve_id}
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: getSeverityColor(vuln.severity)
                                    }}>
                                        {vuln.severity}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '6px' }}>{vuln.title}</h3>
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.9rem',
                                    margin: 0,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {vuln.description}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginLeft: '30px' }}>
                                <button className="btn btn-icon" onClick={() => navigate(`/finding/${vuln.id}`)} title="Edit Definition">
                                    <Edit2 size={18} />
                                </button>
                                <button className="btn btn-icon delete" onClick={() => handleDelete(vuln.id)} title="Delete Definition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredVulnerabilities.length === 0 && (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Database size={48} style={{ marginBottom: '20px', opacity: 0.2, display: 'block', margin: '0 auto' }} />
                            <p>No vulnerability definitions found.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {categories.map(cat => (
                        <div key={cat.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div
                                onClick={() => toggleCategory(cat.id)}
                                style={{
                                    padding: '24px',
                                    background: 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: expandedCategories.has(cat.id) ? '1px solid var(--glass-border)' : 'none'
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>{cat.name}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{cat.vulnerabilities?.length || 0} Standards</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: '4px', color: 'var(--color-error)' }}
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedCategories.has(cat.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                            </div>

                            {expandedCategories.has(cat.id) && (
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {cat.vulnerabilities && cat.vulnerabilities.length > 0 ? (
                                        cat.vulnerabilities.map(v => (
                                            <div key={v.id} style={{
                                                padding: '12px',
                                                borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid var(--glass-border)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{v.name}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {v.default_severity}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '10px' }}>
                                            No standard vulnerabilities in this category.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .library-item:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    transform: translateX(10px);
                }
                .btn-icon {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    padding: 0 !important;
                    border: 1px solid var(--glass-border);
                    color: var(--color-primary);
                }
                .btn-icon.delete {
                    color: var(--color-error);
                }
                .btn-icon:hover {
                    background: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
            `}} />
        </div>
    );
};

export default Vulnerabilities;
