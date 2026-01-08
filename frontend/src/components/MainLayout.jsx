import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Shield } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="sidebar glass-panel" style={{
            width: '280px',
            height: 'calc(100vh - 40px)',
            margin: '20px',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
        }}>
            <div className="app-logo" style={{ marginBottom: '40px' }}>
                <Shield size={32} className="text-primary" style={{ marginRight: '10px', verticalAlign: 'middle', color: 'var(--color-primary)' }} />
                <span style={{ verticalAlign: 'middle' }}>EVIDEX</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    letterSpacing: '1px'
                }}>
                    Navi Pages
                </div>

                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FileText size={20} />
                    <span>Reports</span>
                </NavLink>

                <div style={{ flex: 1 }}></div>

                <NavLink to="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 0' }}>
                    <LogOut size={20} style={{ marginRight: '10px' }} />
                    Logout
                </button>
            </div>
        </div>
    );
};

const MainLayout = ({ children }) => {
    return (
        <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-dark)' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px 20px 20px 0', overflowY: 'auto' }}>
                {children}
            </main>


        </div>
    );
};

export default MainLayout;
