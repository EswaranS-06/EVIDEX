import React, { useState, useEffect, Suspense, memo } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Shield, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';
import Navbar from './Navbar';

const Sidebar = memo(({ isCollapsed, isMobile, showMobileSidebar, closeMobileSidebar }) => {
    const location = useLocation();
    const iconSize = 24;

    const sidebarClass = `app-sidebar ${isCollapsed ? 'collapsed' : ''} ${showMobileSidebar ? 'mobile-open' : ''}`;

    return (
        <div className={sidebarClass}>
            {/* Sidebar Overlay for Mobile */}
            {showMobileSidebar && (
                <div
                    className="sidebar-overlay"
                    onClick={closeMobileSidebar}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: -1 }}
                />
            )}

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>


                <NavLink
                    to="/report-status"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    title={isCollapsed ? "Report Status" : ""}
                >
                    <Shield size={iconSize} style={{ minWidth: `${iconSize}px` }} />
                    <span style={{
                        display: isCollapsed ? 'none' : 'block'
                    }}>Report Status</span>
                </NavLink>

                <NavLink
                    to="/create"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    title={isCollapsed ? "Create" : ""}
                >
                    <Plus size={iconSize} style={{ minWidth: `${iconSize}px` }} />
                    <span style={{
                        display: isCollapsed ? 'none' : 'block'
                    }}>Create</span>
                </NavLink>

                <NavLink
                    to="/reports"
                    className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    title={isCollapsed ? "Reports" : ""}
                >
                    <FileText size={iconSize} style={{ minWidth: `${iconSize}px` }} />
                    <span style={{
                        display: isCollapsed ? 'none' : 'block'
                    }}>Reports</span>
                </NavLink>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    title={isCollapsed ? "Dashboard" : ""}
                >
                    <LayoutDashboard size={iconSize} style={{ minWidth: `${iconSize}px` }} />
                    <span style={{
                        display: isCollapsed ? 'none' : 'block',
                        opacity: isCollapsed ? 0 : 1
                    }}>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className="nav-item"
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    title={isCollapsed ? "Settings" : ""}
                >
                    <Settings size={iconSize} style={{ minWidth: `${iconSize}px` }} />
                    <span style={{
                        display: isCollapsed ? 'none' : 'block'
                    }}>Settings</span>
                </NavLink>
            </nav>

            {/* Footer / Version info could go here */}
            <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem' }}>
                {!isCollapsed && "v1.0.0"}
            </div>
        </div>
    );
});

const MainLayout = () => {
    // Responsive State
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const location = useLocation();

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(false); // Mobile uses overlay, not collapse-width
                setShowMobileSidebar(false);
            } else {
                if (window.innerWidth < 1024) setIsCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setShowMobileSidebar(!showMobileSidebar);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="layout-container" style={{ display: 'block' }}>
            {/* Navbar (Fixed Top) */}
            <Navbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isCollapsed} />

            {/* Sidebar (Fixed Left) */}
            <Sidebar
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                showMobileSidebar={showMobileSidebar}
                closeMobileSidebar={() => setShowMobileSidebar(false)}
            />

            {/* Main Content Wrapper (Adjusts margin based on sidebar) */}
            <main className={`layout-content-wrapper ${isCollapsed ? 'collapsed' : ''}`}>

                {/* Max-width Container */}
                <div className="content-container">
                    {/* Page Transition Wrapper */}
                    <div className="page-transition-wrapper" key={location.pathname}>
                        <Suspense fallback={<LoadingSkeleton />}>
                            <Outlet context={{ isCollapsed, setIsCollapsed, toggleSidebar }} />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
