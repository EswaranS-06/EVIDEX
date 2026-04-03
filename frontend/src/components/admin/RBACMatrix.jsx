import React from 'react';
import { useRBACMatrix } from '../../hooks/useRBAC';
import { Shield, Check, X, AlertCircle } from 'lucide-react';

const RBACMatrix = () => {
    const { data: matrix, isLoading, error } = useRBACMatrix();

    if (isLoading) return <div>Loading Matrix...</div>;
    if (error) return <div className="error-text">Failed to load RBAC Matrix</div>;

    const allPermissions = ["Create", "Edit", "Delete", "View", "Export", "Email"];

    return (
        <div className="rbac-card">
            <div className="card-header">
                <Shield size={24} className="text-primary" />
                <h3>Role-Permission Matrix</h3>
            </div>
            <div className="table-responsive">
                <table className="rbac-table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            {allPermissions.map(p => <th key={p}>{p}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.map((row) => (
                            <tr key={row.role}>
                                <td className="role-cell">
                                    <span className={`role-badge ${row.role.toLowerCase()}`}>
                                        {row.role}
                                    </span>
                                </td>
                                {allPermissions.map(p => (
                                    <td key={p} className="text-center">
                                        {row.permissions.includes(p) ? (
                                            <Check size={20} className="text-success" />
                                        ) : (
                                            <X size={20} className="text-danger" />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RBACMatrix;
