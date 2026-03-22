import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                    <div className="glass-panel" style={{ padding: '40px' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--color-error)', marginBottom: '20px' }}>Something went wrong.</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>An unexpected error has occurred. Our team has been notified.</p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
