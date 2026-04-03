/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        try {
            const response = await api.get('/api/notifications/');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        const initFetch = async () => { await fetchNotifications(); };
        initFetch();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const clearNotifications = async () => {
        try {
            await api.delete('/api/notifications/clear/');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const [toasts, setToasts] = useState([]);

    const notify = useCallback((message, status = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, status }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            fetchNotifications,
            markAsRead,
            clearNotifications,
            notify,
            toasts
        }}>
            {children}
            {/* Toast Container */}
            <div className="toast-container" style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast-notification animate-slide-left ${toast.status}`}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: toast.status === 'success' ? 'var(--color-success-bg, rgba(0, 255, 157, 0.9))' : 'var(--color-error-bg, rgba(255, 70, 70, 0.9))',
                            color: '#fff',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                            pointerEvents: 'auto',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${toast.status === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`
                        }}
                    >
                        {toast.status === 'success' ? '✅' : '❌'} {toast.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
export const useNotifications = () => useContext(NotificationContext);
