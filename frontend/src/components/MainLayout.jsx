import React from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const iconSize = 24; // Icon size

    return (
        <div className="sidebar glass-panel" style={{
            width: isCollapsed ? '80px' : '280px',
            height: 'calc(100vh - 40px)',
            margin: '20px',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            transition: 'width 0.3s ease'
        }}>
            <div
                className="app-logo"
                onClick={toggleSidebar}
                style={{
                    marginBottom: '40px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
            >
                <Shield size={32} className="text-primary" style={{ marginRight: isCollapsed ? '0' : '10px', verticalAlign: 'middle', color: 'var(--color-primary)' }} />
                {!isCollapsed && <span style={{ verticalAlign: 'middle' }}>EVIDEX</span>}
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!isCollapsed && (
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                    }}>
                        Navi Pages
                    </div>
                )}

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    style={{
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        gap: isCollapsed ? '0' : '12px'
                    }}
                >
                    <LayoutDashboard size={iconSize} style={{ minWidth: `${iconSize}px`, flexShrink: 0 }} />
                    {!isCollapsed && <span>Dashboard</span>}
                </NavLink>

                <NavLink
                    to="/reports"
                    className={`nav-item ${location.pathname.startsWith('/report') ? 'active' : ''}`}
                    style={{
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        gap: isCollapsed ? '0' : '12px'
                    }}
                >
                    <FileText size={iconSize} style={{ minWidth: `${iconSize}px`, flexShrink: 0 }} />
                    {!isCollapsed && <span>Reports</span>}
                </NavLink>

                <div style={{ flex: 1 }}></div>

                <NavLink
                    to="/settings"
                    className="nav-item"
                    style={{
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        gap: isCollapsed ? '0' : '12px'
                    }}
                >
                    <Settings size={iconSize} style={{ minWidth: `${iconSize}px`, flexShrink: 0 }} />
                    {!isCollapsed && <span>Settings</span>}
                </NavLink>
            </nav>

            {/* User Profile Section */}
            <div style={{
                marginTop: 'auto',
                padding: '16px 0',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                }}>
                    <Shield size={16} />
                </div>
                {!isCollapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {useAuth().user?.username || 'User'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {useAuth().user?.email || 'user@evidex.com'}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '0', paddingTop: '10px' }}>
                <button
                    className="btn-ghost"
                    onClick={logout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: '10px 0',
                        border: 'none',
                        cursor: 'pointer',
                        gap: isCollapsed ? '0' : '10px'
                    }}
                >
                    <LogOut size={iconSize} style={{ minWidth: `${iconSize}px`, flexShrink: 0 }} />
                    {!isCollapsed && 'Logout'}
                </button>
            </div>
        </div>
    );
};

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="layout-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg-dark)' }}>
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <main style={{ flex: 1, padding: '20px 20px 20px 0', overflowY: 'auto' }}>
                <Outlet context={{ isCollapsed, setIsCollapsed, toggleSidebar }} />
            </main>
        </div>
    );
};

export default MainLayout;
