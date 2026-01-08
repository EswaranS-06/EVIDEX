import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        // Navigate to dashboard mock
        navigate('/dashboard');
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-circle circle-1"></div>
            <div className="auth-bg-circle circle-2"></div>

            <div className="glass-panel auth-card animate-fade-in">
                <div className="auth-header">
                    <div className="app-logo">
                        <Shield size={48} className="text-secondary" style={{ display: 'block', margin: '0 auto 10px', color: 'var(--color-primary)' }} />
                        EVIDEX
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to access your pentest reports</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Username / Email</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter your username"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Sign In
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
