import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import '../styles/Auth.css';

import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { login, error: authError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        const success = await login(username, password);
        if (success) {
            navigate('/intro');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-circle circle-1"></div>
            <div className="auth-bg-circle circle-2"></div>

            <div className="glass-panel auth-card animate-fade-in">
                <div className="auth-header">
                    <div className="app-logo">
                        <Shield size={42} className="brand-icon" />
                        EVIDEX
                    </div>

                    <p className="auth-subtitle">Sign in to access your pentest reports</p>

                    {(authError || localError) && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            marginTop: '1rem',
                            textAlign: 'center',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {authError || localError}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter your username"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
