import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle, XCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationStack = () => {
    const { notifications, unreadCount, markAsRead, clearNotifications } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notif) => {
        if (!notif.is_read) {
            markAsRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
            setIsOpen(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} color="var(--color-success)" />;
            case 'error': return <XCircle size={18} color="var(--color-error)" />;
            default: return <Info size={18} color="var(--color-primary)" />;
        }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="btn-icon"
                style={{ marginRight: '10px', position: 'relative' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        className="notification-badge"
                        style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            background: 'var(--color-error)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '50%',
                            padding: '2px 5px',
                            minWidth: '18px',
                            textAlign: 'center'
                        }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '10px',
                        width: '320px',
                        maxHeight: '400px',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        background: 'var(--glass-bg)',
                        boxShadow: '0 8px 32px var(--shadow-color)'
                    }}
                >
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h4>
                        <button
                            className="btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
                            onClick={() => { clearNotifications(); setIsOpen(false); }}
                        >
                            <Trash2 size={14} style={{ marginRight: '4px' }} /> Clear
                        </button>
                    </div>

                    <div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                No notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        background: n.is_read ? 'transparent' : 'var(--table-hover-bg)',
                                        opacity: n.is_read ? 0.7 : 1
                                    }}
                                    className="hover-bg"
                                >
                                    <div style={{ marginTop: '2px' }}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: n.is_read ? '500' : '600', fontSize: '0.9rem', marginBottom: '4px' }}>
                                            {n.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', opacity: 0.7 }}>
                                            {new Date(n.created_at).toLocaleString()}
                                            {n.updated_at && n.updated_at !== n.created_at && ` • Modified: ${new Date(n.updated_at).toLocaleString()}`}
                                        </div>
                                    </div>
                                    {!n.is_read && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationStack;
