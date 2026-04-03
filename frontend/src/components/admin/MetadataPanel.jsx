import React from 'react';
import { Database, Lock } from 'lucide-react';

const MetadataPanel = () => {
    const rules = [
        {"field": "prepared_by", "rule": "Set to last modifying user", "role": "Automatic (Any)"},
        {"field": "reviewed_by", "rule": "Set when status → Approved", "role": "Automatic (Reviewer)"},
        {"field": "approved_by", "rule": "Set when status → Approved", "role": "Automatic (Approver)"},
    ];

    return (
        <div className="rbac-card">
            <div className="card-header">
                <Database size={24} className="text-secondary" />
                <h3>Metadata Integrity Rules</h3>
            </div>
            <div className="metadata-rules-list">
                {rules.map(r => (
                    <div key={r.field} className="metadata-rule-item">
                        <div className="metadata-field">
                            <span className="code-font">{r.field}</span>
                            <span className="badge lock">
                                <Lock size={12} /> Read-only
                            </span>
                        </div>
                        <div className="rule-content">
                            <b>Automation:</b> {r.rule}
                            <div className="text-secondary">Owner: {r.role}</div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="description text-warning">
                All metadata is system-managed. Manual override is blocked at the API level.
            </p>
        </div>
    );
};

export default MetadataPanel;
