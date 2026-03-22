import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/api/auth/me/');
            setUser(response.data);
        } catch (err) {
            console.error('Auth verification failed:', err);
            // Interceptor handles refresh, if it fails here, tokens are cleared
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await api.post('/api/auth/login/', {
                username: email, // Backend might expect 'username' even if we use email
                password: password,
            });

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // After login, fetch user details
            await checkAuth();
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
            return false;
        }
    };

    const register = async (userData) => {
        setError(null);
        try {
            await api.post('/api/auth/register/', userData);
            // Usually we redirect to login or auto-login
            // For now, let's just return success and let component handle redirect
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
