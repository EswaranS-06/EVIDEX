import React from 'react';
import RBACMatrix from '../../components/admin/RBACMatrix';
import StatusFlow from '../../components/admin/StatusFlow';
import MetadataPanel from '../../components/admin/MetadataPanel';
import SecurityPanel from '../../components/admin/SecurityPanel';
import AuditLogs from '../../components/admin/AuditLogs';
import '../../styles/admin.css';

const RBACPage = () => {
    return (
        <div className="admin-page-container">
            <header className="page-header">
                <h1>RBAC Policy Manager</h1>
                <p className="description">
                    Administrative dashboard for monitoring and auditing role-based access controls.
                </p>
            </header>

            <div className="grid-layout">
                <section className="col-span-2">
                    <RBACMatrix />
                </section>
                
                <section>
                    <MetadataPanel />
                </section>
                
                <section className="col-span-2">
                    <StatusFlow />
                </section>
                
                <section>
                    <SecurityPanel />
                </section>
                
                <section className="col-span-3">
                    <AuditLogs />
                </section>
            </div>
            
            <footer className="footer-notice">
                ⚠️ All policies are enforced at the backend level. This dashboard is for <b>Observability & Compliance Monitoring</b>.
            </footer>
        </div>
    );
};

export default RBACPage;
