import React from 'react';
import { useAuditLogs } from '../../hooks/useRBAC';
import { Search } from 'lucide-react';

const AuditLogs = () => {
    const { data: logs, isLoading, error } = useAuditLogs();

    if (isLoading) return <div>Loading Audit logs...</div>;
    if (error) return <div className="error-text">Failed to load audit logs</div>;

    const getActionBadgeClass = (action) => {
        if (action.includes('STATUS_CHANGE')) return 'badge-status';
        if (action.includes('DELETE')) return 'badge-danger';
        return 'badge-info';
    };

    return (
        <div className="rbac-card">
            <div className="card-header">
                <Search size={24} className="text-secondary" />
                <h3>System Audit Logs</h3>
            </div>
            
            <div className="table-responsive">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>From → To</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.user}</td>
                                <td>
                                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>Report {log.report_id}</td>
                                <td>
                                    {log.old_value && (
                                        <span className="text-secondary">{log.old_value} → </span>
                                    )}
                                    <b>{log.new_value || "Viewed"}</b>
                                </td>
                                <td className="text-secondary">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
};

export default AuditLogs;
