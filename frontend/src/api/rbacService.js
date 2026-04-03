import api from './axios';

export const getRBACMatrix = async () => {
    const response = await api.get('/api/rbac/matrix/');
    return response.data;
};

export const getStatusTransitions = async () => {
    const response = await api.get('/api/rbac/status-transitions/');
    return response.data;
};

export const getSecurityRules = async () => {
    const response = await api.get('/api/rbac/security-rules/');
    return response.data;
};

export const getAuditLogs = async (targetUserId = null) => {
    let url = '/api/audit/logs/';
    if (targetUserId) {
        url += `?target_user_id=${targetUserId}`;
    }
    const response = await api.get(url);
    return response.data;
};

// User Management
export const getUsers = async () => {
    const response = await api.get('/api/auth/users/');
    return response.data;
};

export const updateUserRole = async (userId, roleId) => {
    const response = await api.patch(`/api/auth/users/${userId}/role/`, { role_id: roleId });
    return response.data;
};

export const getRoles = async () => {
    const response = await api.get('/api/auth/roles/');
    return response.data;
};
