import React from 'react';
import { useStatusTransitions } from '../../hooks/useRBAC';
import { Network, ArrowRight } from 'lucide-react';

const StatusFlow = () => {
    const { data: transitions, isLoading, error } = useStatusTransitions();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="error-text">Failed to load transitions</div>;

    const statuses = ["Draft", "In Progress", "Completed", "Approved"];

    const getTransitionsForStatus = (fromStatus) => {
        return transitions.filter(t => t.from === fromStatus);
    };

    return (
        <div className="rbac-card">
            <div className="card-header">
                <Network size={24} className="text-primary" />
                <h3>Report Status Flow Logic</h3>
            </div>
            
            <div className="flow-container">
                {statuses.map((status, idx) => (
                    <div key={status} className="flow-step-wrapper">
                        <div className={`flow-node ${status.toLowerCase().replace(' ', '-')}`}>
                            <div className="node-title">{status}</div>
                            <div className="allowed-roles">
                                {getTransitionsForStatus(status).map(t => (
                                    <div key={t.to} className="transition-rule">
                                        <ArrowRight size={14} /> 
                                        <span>{t.to}: <b>{t.roles.join(', ')}</b></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {idx < statuses.length - 1 && (
                            <div className="flow-connector">
                                <ArrowRight size={24} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <p className="description text-secondary">
                Visualization of role-based status lifecycle. Roles listed indicate who can move the report FROM that state.
            </p>
        </div>
    );
};

export default StatusFlow;
