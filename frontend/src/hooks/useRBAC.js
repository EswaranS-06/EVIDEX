import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as rbacService from '../api/rbacService';

// ... existing queries ...

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, roleId }) => rbacService.updateUserRole(userId, roleId),
        // OPTIMISTIC UPDATE: Update UI immediately before server response
        onMutate: async ({ userId, roleId }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['admin', 'users'] });

            // Snapshot the previous value
            const previousUsers = queryClient.getQueryData(['admin', 'users']);

            // Optimistically update to the new value
            queryClient.setQueryData(['admin', 'users'], (old) => {
                const roles = queryClient.getQueryData(['admin', 'roles']);
                const newRoleName = roles?.find(r => String(r.id) === String(roleId))?.name || 'User';
                
                return old?.map(user => 
                    user.id === userId ? { ...user, role: newRoleName } : user
                );
            });

            // Return a context object with the snapshotted value
            return { previousUsers };
        },
        onError: (err, variables, context) => {
            // Roll back to the previous value if mutation fails
            queryClient.setQueryData(['admin', 'users'], context.previousUsers);
        },
        onSettled: () => {
            // Refetch after error or success:
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
