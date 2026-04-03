import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--color-bg-dark)'
            }}>
                <div className="animate-pulse" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based protection: use user.role (assuming it contains the role from the backend)
    // or user.role_name depending on response structure. Check accounts serializers for me endpoint.
    if (roles && !roles.includes(user.role)) {
        console.warn(`User with role ${user.role} tried to access unauthorized route.`);
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
