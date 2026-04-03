import React, { useState } from 'react';
import { useUsers, useRoles, useUpdateUserRole, useAuditLogs } from '../../hooks/useRBAC';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Users, UserCog, UserCheck, ShieldAlert, Search, RefreshCw, X, History, Info, Mail, User as UserIcon, CheckCircle } from 'lucide-react';
import '../../styles/admin.css';

const UserDetailsPanel = ({ user, onClose, setLastUpdatedUserId }) => {
    const { data: auditLogs, isLoading: logsLoading } = useAuditLogs(user?.id);
    const { notify } = useNotifications();
    const { data: roles } = useRoles();
    const updateRoleMutation = useUpdateUserRole();

    if (!user) return null;

    const handleRoleChange = async (newRoleId) => {
        const newRoleName = roles?.find(r => String(r.id) === String(newRoleId))?.name || 'User';
        try {
            await updateRoleMutation.mutateAsync({ userId: user.id, roleId: newRoleId });
            notify(`Role for ${user.username} updated to ${newRoleName}`, 'success');
            setLastUpdatedUserId(user.id);
            setTimeout(() => setLastUpdatedUserId(null), 1500);
        } catch (err) {
            notify(`Failed to update ${user.username}: ${err.message}`, 'error');
        }
    };

    return (
        <div className="glass-panel admin-detail-panel animate-slide-left">
            <div className="detail-header">
                <h3>User Information</h3>
                <button className="btn-icon" onClick={onClose}><X size={20} /></button>
            </div>

            <div className="user-profile-header">
                <div className="user-avatar-large">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-meta">
                    <h4>{user.username}</h4>
                    <span className="text-secondary">{user.email}</span>
                </div>
            </div>

            <div className="detail-section">
                <h5 className="section-title"><UserCog size={16} /> Access Control</h5>
                <div className="role-management-auto">
                    <label>Current Role</label>
                    <div className="select-wrapper">
                        <select 
                            className="admin-select full-width"
                            value={roles?.find(r => r.name === user.role)?.id || ""}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            disabled={updateRoleMutation.isPending}
                        >
                            {roles?.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        {updateRoleMutation.isPending && <RefreshCw size={14} className="animate-spin select-spinner" />}
                    </div>
                    <p className="hint text-success">Changes are auto-saved and notified immediately.</p>
                </div>
            </div>

            <div className="detail-section flex-1 overflow-hidden">
                <h5 className="section-title"><History size={16} /> Audit Trail</h5>
                <div className="mini-log-container">
                    {logsLoading ? (
                        <div className="text-center p-4">Loading trail...</div>
                    ) : auditLogs?.length > 0 ? (
                        auditLogs.map(log => (
                            <div key={log.id} className="mini-log-item">
                                <span className="log-action">{log.action.replace(/_/g, ' ')}</span>
                                <span className="log-values">
                                    {log.old_value && <s>{log.old_value.split(':').pop()}</s>} → {log.new_value.split(':').pop()}
                                </span>
                                <span className="log-date">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-data-hint">No specific logs found for this user.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserManagementPage = () => {
    const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
    const { data: roles } = useRoles();
    const { user: authUser } = useAuth();
    const { notify } = useNotifications();
    const updateRoleMutation = useUpdateUserRole();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [lastUpdatedUserId, setLastUpdatedUserId] = useState(null);

    const handleQuickRoleChange = async (e, userId, username) => {
        e.stopPropagation();
        const roleId = e.target.value;
        const newRoleName = roles?.find(r => String(r.id) === String(roleId))?.name || 'User';
        
        try {
            await updateRoleMutation.mutateAsync({ userId, roleId });
            notify(`Successfully updated ${username} to ${newRoleName}`, 'success');
            setLastUpdatedUserId(userId);
            setTimeout(() => setLastUpdatedUserId(null), 1500);
        } catch (err) {
            notify(`Failed to update ${username}: ${err.message}`, 'error');
        }
    };

    const filteredUsers = users?.filter(u => 
        u.id !== authUser?.id && (
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Sync selected user details when the underlying data changes
    React.useEffect(() => {
        if (selectedUser) {
            const updated = users?.find(u => u.id === selectedUser.id);
            if (updated && (updated.role !== selectedUser.role)) {
                setSelectedUser(updated);
            }
        }
    }, [users, selectedUser]);

    if (usersLoading) return <div className="admin-page-container">Loading Users...</div>;

    return (
        <div className="admin-page-container animate-fade-in relative overflow-hidden">
            <div className={`main-content-area ${selectedUser ? 'shrink' : ''}`}>
                <header className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <UserCog size={32} className="text-primary" />
                        <h1>User Access Management</h1>
                    </div>
                </header>

                <div className="rbac-card" style={{ marginBottom: '24px' }}>
                    <div className="search-bar-admin">
                        <Search size={20} className="text-secondary" />
                        <input 
                            type="text" 
                            placeholder="Search users (excluding yourself)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>
                </div>

                <div className="rbac-card">
                    <div className="card-header">
                        <Users size={24} className="text-secondary" />
                        <h3>Account Directory</h3>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="rbac-table clickable-rows">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Access Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers?.map(user => (
                                    <tr 
                                        key={user.id} 
                                        className={`${selectedUser?.id === user.id ? 'selected' : ''} ${lastUpdatedUserId === user.id ? 'row-updated-flash' : ''}`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <td className="role-cell">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="user-avatar-small">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{user.email || 'N/A'}</td>
                                        <td>
                                            <span className={`role-badge ${user.role?.toLowerCase() || 'user'}`}>
                                                {user.role || 'User'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <select 
                                                    className="admin-select"
                                                    value={roles?.find(r => r.name === user.role)?.id || ""}
                                                    onChange={(e) => handleQuickRoleChange(e, user.id, user.username)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user.id}
                                                >
                                                    {roles?.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                                {updateRoleMutation.isPending && <RefreshCw size={12} className="animate-spin text-secondary" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <UserDetailsPanel 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    setLastUpdatedUserId={setLastUpdatedUserId}
                />
            )}
        </div>
    );
};

export default UserManagementPage;
