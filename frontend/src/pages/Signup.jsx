import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Mail, Briefcase } from 'lucide-react';
import '../styles/Auth.css';

import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '', // Changed from fullName/email to match backend if needed
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const { register, error: authError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        const success = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password
        });

        if (success) {
            navigate('/login');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-circle circle-1"></div>
            <div className="auth-bg-circle circle-2"></div>

            <div className="glass-panel auth-card animate-fade-in">
                <div className="auth-header">
                    <div className="app-logo">
                        <Shield size={48} className="text-secondary" style={{ display: 'block', margin: '0 auto 10px', color: 'var(--color-secondary)' }} />
                        EVIDEX
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join the professional pentesting platform</p>

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
                                name="username"
                                className="input-field"
                                placeholder="johndoe"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                placeholder="john@example.com"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                type="password"
                                name="confirmPassword"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px', width: '100%' }}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Create Account
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
