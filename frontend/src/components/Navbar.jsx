import React, { useState, useRef, useEffect } from 'react';
import { Shield, LogOut, Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, isSidebarCollapsed }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="app-navbar glass-panel">
            {/* Left: Branding & Toggle */}
            <div className="navbar-left">
                <button
                    className="btn-icon sidebar-toggle"
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={20} />
                </button>

                <div className="navbar-brand">
                    <Shield size={24} className="brand-icon" />
                    <span className="brand-text">EVIDEX</span>
                </div>
            </div>

            {/* Right: User & Actions */}
            <div className="navbar-right">
                {/* Notifications (Mock) */}
                <button className="btn-icon" style={{ marginRight: '10px' }}>
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <div className="user-profile" ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                    <div className="user-info">
                        <span className="user-name">{user?.username || 'Admin User'}</span>
                        <span className="user-role">Security Analyst</span>
                    </div>
                    <div className="user-avatar">
                        <User size={18} />
                    </div>

                    {isDropdownOpen && (
                        <div className="glass-panel" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '10px',
                            width: '180px',
                            padding: '8px',
                            zIndex: 1000,
                            flexDirection: 'column',
                            display: 'flex',
                            gap: '4px',
                            background: '#05070a', // Solid bg to prevent transparency issues
                        }}>
                            <button
                                className="btn-ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    logout();
                                }}
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    padding: '10px',
                                    color: 'var(--color-error)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <LogOut size={16} style={{ marginRight: '8px' }} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
