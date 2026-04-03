import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as rbacService from '../api/rbacService';

// ... existing queries ...

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, roleId }) => rbacService.updateUserRole(userId, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['audit', 'logs'] });
        },
    });
};

export const useRBACMatrix = () => {
    return useQuery({
        queryKey: ['rbac', 'matrix'],
        queryFn: rbacService.getRBACMatrix,
    });
};

export const useStatusTransitions = () => {
    return useQuery({
        queryKey: ['rbac', 'transitions'],
        queryFn: rbacService.getStatusTransitions,
    });
};

export const useSecurityRules = () => {
    return useQuery({
        queryKey: ['rbac', 'security-rules'],
        queryFn: rbacService.getSecurityRules,
    });
};

export const useAuditLogs = (targetUserId = null) => {
    return useQuery({
        queryKey: ['audit', 'logs', targetUserId],
        queryFn: () => rbacService.getAuditLogs(targetUserId),
    });
};

// User Management
export const useUsers = () => {
    return useQuery({
        queryKey: ['admin', 'users'],
        queryFn: rbacService.getUsers,
    });
};

export const useRoles = () => {
    return useQuery({
        queryKey: ['admin', 'roles'],
        queryFn: rbacService.getRoles,
    });
};
