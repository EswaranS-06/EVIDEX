import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useSecurityRules } from '../../hooks/useRBAC';

const SecurityPanel = () => {
    const { data: rules, isLoading, error } = useSecurityRules();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="error-text">Failed to load rules</div>;

    return (
        <div className="rbac-card">
            <div className="card-header">
                <ShieldCheck size={24} className="text-secondary" />
                <h3>Security Enforcement Rules</h3>
            </div>
            
            <div className="security-rules-grid">
                {rules.map(rule => (
                    <div key={rule.rule} className="security-rule-card">
                        <div className="rule-title">
                            {rule.rule} 
                            <span className={`status-badge ${rule.status.toLowerCase()}`}>
                                {rule.status}
                            </span>
                        </div>
                        <p className="description text-secondary">
                            {rule.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityPanel;
