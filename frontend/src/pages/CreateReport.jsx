import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useModal } from '../context/ModalContext';
import {
    ChevronRight,
    ChevronLeft,
    Building2,
    Globe,
    ShieldCheck,
    Layout,
    Check,
    FilePlus,
    Users,
    Search,
    MapPin,
    HardDrive,
    Trash2,
    Plus,
    Wrench,
    AlertCircle,
    Activity
} from 'lucide-react';

const CreateReport = () => {
    const navigate = useNavigate();
    const { alert } = useModal();
    const [step, setStep] = useState(1);
    const [organizations, setOrganizations] = useState([]);
    const [isCreateNewOrg, setIsCreateNewOrg] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        assessmentType: 'Internal', // Internal, External
        organizationId: '',
        newOrganizationName: '',
        applicationName: '',
        targets: [''], // Array of strings for multiple URLs
        toolsUsed: [''], // Array of strings for multiple tools
        testLocation: 'Off-site', // On-site, Off-site
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        preparedBy: 'Pentester',
        reviewedBy: '',
        approvedBy: '',
        selectedVulnerabilityIds: []
    });
    const [owaspCategories, setOwaspCategories] = useState([]);
    const [vulnSearchTerm, setVulnSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const response = await api.get('/api/reports/');
                // Handle both paginated and non-paginated responses
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                const uniqueClients = [...new Set(data.map(r => r.client_name))].filter(Boolean).sort();
                setOrganizations(uniqueClients);
            } catch (err) {
                console.error("Failed to fetch organizations:", err);
            }
        };

        const fetchOWASP = async () => {
            try {
                const response = await api.get('/api/owasp/categories/');
                setOwaspCategories(response.data);
                if (response.data.length > 0) {
                    setExpandedCategories(new Set([response.data[0].id]));
                }
            } catch (err) {
                console.error("Failed to fetch OWASP categories:", err);
            }
        };

        fetchOrgs();
        fetchOWASP();
    }, []);

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const toggleVuln = (vulnId) => {
        const newSelected = new Set(formData.selectedVulnerabilityIds);
        if (newSelected.has(vulnId)) {
            newSelected.delete(vulnId);
        } else {
            newSelected.add(vulnId);
        }
        setFormData({ ...formData, selectedVulnerabilityIds: Array.from(newSelected) });
    };

    const toggleCategory = (catId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(catId)) {
            newExpanded.delete(catId);
        } else {
            newExpanded.add(catId);
        }
        setExpandedCategories(newExpanded);
    };

    const filteredCategories = owaspCategories.map(cat => {
        const matchingVulns = cat.vulnerabilities.filter(v =>
            v.name.toLowerCase().includes(vulnSearchTerm.toLowerCase())
        );
        if (cat.name.toLowerCase().includes(vulnSearchTerm.toLowerCase()) || matchingVulns.length > 0) {
            return { ...cat, vulnerabilities: matchingVulns };
        }
        return null;
    }).filter(Boolean);

    const getSeverityBg = (sev) => {
        const s = (sev || '').toLowerCase();
        switch (s) {
            case 'critical': return 'rgba(142, 45, 226, 0.1)';
            case 'high': return 'rgba(255, 77, 109, 0.1)';
            case 'medium': return 'rgba(254, 228, 64, 0.1)';
            case 'low': return 'rgba(0, 240, 255, 0.1)';
            default: return 'var(--glass-bg)';
        }
    };

    const getSeverityColor = (sev) => {
        const s = (sev || '').toLowerCase();
        switch (s) {
            case 'critical': return 'var(--color-secondary)';
            case 'high': return 'var(--color-error)';
            case 'medium': return 'var(--color-warning)';
            case 'low': return 'var(--color-primary)';
            default: return 'var(--color-border)';
        }
    };



    const renderStepIndicators = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '20px' }}>
            {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: step >= s ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: step >= s ? 'black' : 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        boxShadow: step >= s ? '0 0 15px var(--color-primary-glow)' : 'none'
                    }}>
                        {step > s ? <Check size={18} /> : s}
                    </div>
                    {s < 4 && <div style={{ width: '40px', height: '2px', background: step > s ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)' }} />}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Organization Information</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Choose the type of assessment and organization details.</p>
            </div>

            {/* Assessment Type */}
            <div className="input-group">
                <label className="input-label" style={{ marginBottom: '16px' }}>Assessment Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div
                        onClick={() => setFormData({ ...formData, assessmentType: 'Internal' })}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            border: `1px solid ${formData.assessmentType === 'Internal' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            background: formData.assessmentType === 'Internal' ? 'rgba(0, 240, 255, 0.05)' : 'var(--color-bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'center'
                        }}
                    >
                        <ShieldCheck size={32} color={formData.assessmentType === 'Internal' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>Internal</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Internal network assessment</div>
                        </div>
                    </div>

                    <div
                        onClick={() => setFormData({ ...formData, assessmentType: 'External' })}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            border: `1px solid ${formData.assessmentType === 'External' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            background: formData.assessmentType === 'External' ? 'rgba(0, 240, 255, 0.05)' : 'var(--color-bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'center'
                        }}
                    >
                        <Globe size={32} color={formData.assessmentType === 'External' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>External</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>External perimeter assessment</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Performed (On-site/Off-site) */}
            <div className="input-group">
                <label className="input-label" style={{ marginBottom: '16px' }}>Test Performed</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div
                        onClick={() => setFormData({ ...formData, testLocation: 'On-site' })}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${formData.testLocation === 'On-site' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            background: formData.testLocation === 'On-site' ? 'rgba(0, 240, 255, 0.05)' : 'var(--color-bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <MapPin size={24} color={formData.testLocation === 'On-site' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>On-site</div>
                    </div>

                    <div
                        onClick={() => setFormData({ ...formData, testLocation: 'Off-site' })}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${formData.testLocation === 'Off-site' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            background: formData.testLocation === 'Off-site' ? 'rgba(0, 240, 255, 0.05)' : 'var(--color-bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <HardDrive size={24} color={formData.testLocation === 'Off-site' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>Off-site</div>
                    </div>
                </div>
            </div>

            {/* Organization Selection */}
            <div className="input-group">
                <label className="input-label">Organization</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateNewOrg(false);
                                setFormData({ ...formData, newOrganizationName: '' }); // Clear new org name when switching
                            }}
                            className={`btn ${!isCreateNewOrg ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ flex: 1, padding: '10px' }}
                        >
                            Select Existing
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateNewOrg(true);
                                setFormData({ ...formData, organizationId: '' }); // Clear selected org when switching
                            }}
                            className={`btn ${isCreateNewOrg ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ flex: 1, padding: '10px' }}
                        >
                            Create New
                        </button>
                    </div>

                    {!isCreateNewOrg ? (
                        <select
                            className="input-field"
                            value={formData.organizationId}
                            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                            style={{ background: 'rgba(0,0,0,0.3)' }}
                        >
                            <option value="">Select an existing organization</option>
                            {organizations.map(org => (
                                <option key={org} value={org}>{org}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="animate-fade-in">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter new organization name"
                                value={formData.newOrganizationName}
                                onChange={(e) => setFormData({ ...formData, newOrganizationName: e.target.value })}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Step 1 of 4
                </div>
                <button
                    onClick={nextStep}
                    className="btn btn-primary"
                    style={{ padding: '12px 32px' }}
                    disabled={isCreateNewOrg ? !formData.newOrganizationName.trim() : !formData.organizationId}
                >
                    Next <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Application Details</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Provide information about the system being tested.</p>
            </div>

            <div className="input-group">
                <label className="input-label">Application Name</label>
                <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Finance Portal"
                    value={formData.applicationName}
                    onChange={(e) => setFormData({ ...formData, applicationName: e.target.value })}
                />
            </div>

            <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Target URLs / IP Ranges</label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, targets: [...formData.targets, ''] })}
                        className="btn btn-ghost"
                        style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--color-primary)' }}
                    >
                        <Plus size={14} style={{ marginRight: '4px' }} /> Add URL
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.targets.map((target, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Globe size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. https://app.example.com"
                                    value={target}
                                    onChange={(e) => {
                                        const newTargets = [...formData.targets];
                                        newTargets[index] = e.target.value;
                                        setFormData({ ...formData, targets: newTargets });
                                    }}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            {formData.targets.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newTargets = formData.targets.filter((_, i) => i !== index);
                                        setFormData({ ...formData, targets: newTargets });
                                    }}
                                    className="btn btn-ghost"
                                    style={{ color: 'var(--color-error)', padding: '0 12px' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Tools used for testing</label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, toolsUsed: [...formData.toolsUsed, ''] })}
                        className="btn btn-ghost"
                        style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--color-primary)' }}
                    >
                        <Plus size={14} style={{ marginRight: '4px' }} /> Add Tool
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.toolsUsed.map((tool, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Wrench size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Burp Suite, Nmap, Metasploit"
                                    value={tool}
                                    onChange={(e) => {
                                        const newTools = [...formData.toolsUsed];
                                        newTools[index] = e.target.value;
                                        setFormData({ ...formData, toolsUsed: newTools });
                                    }}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            {formData.toolsUsed.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newTools = formData.toolsUsed.filter((_, i) => i !== index);
                                        setFormData({ ...formData, toolsUsed: newTools });
                                    }}
                                    className="btn btn-ghost"
                                    style={{ color: 'var(--color-error)', padding: '0 12px' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={prevStep} className="btn btn-ghost" style={{ padding: '12px 24px' }}>
                    <ChevronLeft size={18} style={{ marginRight: '8px' }} /> Previous
                </button>
                <button
                    onClick={nextStep}
                    className="btn btn-primary"
                    style={{ padding: '12px 32px' }}
                    disabled={!formData.applicationName.trim()}
                >
                    Next <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Timeline & Metadata</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Set the schedule and preparation details.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                    <label className="input-label">Start Date</label>
                    <input
                        type="date"
                        className="input-field"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">End Date</label>
                    <input
                        type="date"
                        className="input-field"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                    <label className="input-label">Prepared By</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.preparedBy}
                        onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Reviewed By</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Name of reviewer"
                        value={formData.reviewedBy}
                        onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Approved By</label>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Name of approver"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={prevStep} className="btn btn-ghost" style={{ padding: '12px 24px' }}>
                    <ChevronLeft size={18} style={{ marginRight: '8px' }} /> Previous
                </button>
                <button
                    onClick={nextStep}
                    className="btn btn-primary"
                    style={{ padding: '12px 32px' }}
                    disabled={!formData.startDate || !formData.endDate}
                >
                    Next <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Select Vulnerabilities</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Pre-load existing OWASP vulnerabilities into your report.</p>
            </div>

            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search vulnerabilities..."
                    value={vulnSearchTerm}
                    onChange={(e) => setVulnSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                />
            </div>

            <div style={{
                height: '600px', // Significantly increased height
                overflowY: 'auto',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                background: 'rgba(0,0,0,0.2)',
                position: 'relative',
                zIndex: 1
            }} className="custom-scrollbar">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: vulnSearchTerm ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '16px'
                }}>
                    {filteredCategories.map(cat => (
                        <div key={cat.id} className="glass-panel" style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.02)', alignSelf: 'start' }}>
                            <div
                                onClick={() => toggleCategory(cat.id)}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    background: expandedCategories.has(cat.id) ? 'rgba(0, 240, 255, 0.05)' : 'transparent'
                                }}
                            >
                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{cat.code} - {cat.name}</span>
                                <ChevronLeft size={16} style={{ transform: expandedCategories.has(cat.id) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'all 0.3s' }} />
                            </div>

                            {expandedCategories.has(cat.id) && (
                                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {cat.vulnerabilities.map(vuln => {
                                        const isSelected = formData.selectedVulnerabilityIds.includes(vuln.id);
                                        return (
                                            <div
                                                key={vuln.id}
                                                onClick={() => toggleVuln(vuln.id)}
                                                className="vuln-selection-item"
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                                                    borderLeft: `3px solid ${getSeverityColor(vuln.default_severity)}`,
                                                    borderBottom: `1px solid ${isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'}`,
                                                    borderTop: `1px solid ${isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'}`,
                                                    borderRight: `1px solid ${isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'}`,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--color-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: isSelected ? 'var(--color-primary)' : 'transparent',
                                                        flexShrink: 0
                                                    }}>
                                                        {isSelected && <Check size={14} color="black" strokeWidth={3} />}
                                                    </div>
                                                    <span className="vuln-name" style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500',
                                                        color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                                                        flex: 1
                                                    }}>{vuln.name}</span>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: '700',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: getSeverityBg(vuln.default_severity),
                                                        color: getSeverityColor(vuln.default_severity),
                                                        border: `1px solid ${getSeverityColor(vuln.default_severity)}`,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {vuln.default_severity}
                                                    </span>
                                                </div>

                                                <div className="vuln-description" style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--color-text-muted)',
                                                    lineHeight: '1.4',
                                                    maxHeight: '0',
                                                    opacity: '0',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.3s ease-out',
                                                    paddingLeft: '30px'
                                                }}>
                                                    {vuln.description}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                marginTop: 'auto' // Push to bottom of flex container if height is constrained
            }}>
                <button onClick={prevStep} className="btn btn-ghost" style={{ padding: '12px 24px' }}>
                    <ChevronLeft size={18} style={{ marginRight: '8px' }} /> Previous
                </button>
                <div style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    {formData.selectedVulnerabilityIds.length} Selected
                </div>
                <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    style={{ padding: '12px 32px', background: 'var(--color-success)', color: '#000' }}
                >
                    <ShieldCheck size={18} style={{ marginRight: '8px' }} /> Create Report
                </button>
            </div>
        </div>
    );

    const handleSubmit = async () => {
        const payload = {
            client_name: isCreateNewOrg ? formData.newOrganizationName : formData.organizationId,
            application_name: formData.applicationName,
            report_type: formData.assessmentType,
            target: formData.targets.filter(t => t.trim() !== '').join('\n'),
            tools_used: formData.toolsUsed.filter(t => t.trim() !== '').join('\n'),
            test_location: formData.testLocation,
            start_date: formData.startDate,
            end_date: formData.endDate,
            prepared_by: formData.preparedBy,
            reviewed_by: formData.reviewedBy,
            approved_by: formData.approvedBy,
            status: 'Draft'
        };

        try {
            const response = await api.post('/api/reports/', payload);
            const reportId = response.data.id;

            // Add selected vulnerabilities as findings
            if (formData.selectedVulnerabilityIds.length > 0) {
                await Promise.all(formData.selectedVulnerabilityIds.map(vulnId =>
                    api.post(`/api/reports/${reportId}/findings/`, {
                        vulnerability: vulnId,
                        affected_url: formData.targets[0] || '/'
                    })
                ));
            }

            await alert('Assessment Initialized Successfully!', 'Success');
            navigate(`/report/${reportId}`);
        } catch (err) {
            console.error("Failed to create report:", err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Check your input and try again.";
            await alert("Failed to create report: " + errorMsg, "Error");
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', transition: 'max-width 0.4s ease' }}>
            <div className="glass-panel" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'var(--color-primary)'
                    }}>
                        <FilePlus size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Initialize Assessment</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Follow the steps to set up your security report.</p>
                    </div>
                </div>

                {renderStepIndicators()}

                <div style={{ minHeight: step === 4 ? '750px' : '520px', transition: 'min-height 0.4s ease', position: 'relative' }}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && <div style={{ height: '750px' }}>{renderStep4()}</div>}
                </div>
            </div>
        </div>
    );
};

export default CreateReport;
