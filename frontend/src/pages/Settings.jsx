import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../api/axios';
import {
    User,
    Mail,
    Shield,
    Moon,
    Sun,
    Save,
    Key,
    Bell,
    Eye,
    EyeOff,
    Check
} from 'lucide-react';

const Settings = () => {
    const { user, checkAuth } = useAuth();
    const { alert } = useModal();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || ''
    });
    const [loading, setLoading] = useState(false);

    // Theme Toggle Logic
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/api/auth/me/', profileData);
            await alert('Profile updated successfully!', 'Success');
            setIsEditingProfile(false);
            if (checkAuth) await checkAuth(); // Refresh user context
        } catch (err) {
            console.error('Update failed:', err);
            await alert('Failed to update profile. Please try again.', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Header */}
            <div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    margin: 0,
                    background: 'linear-gradient(to right, var(--color-text-main), var(--color-primary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.03em'
                }}>
                    Account Settings
                </h1>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    Manage your profile, preferences, and security settings.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>

                {/* Profile Section */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                padding: '10px',
                                background: 'rgba(0, 240, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'var(--color-primary)'
                            }}>
                                <User size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Personal Profile</h3>
                        </div>
                        {!isEditingProfile && (
                            <button
                                className="btn btn-ghost"
                                style={{ fontSize: '0.8rem', padding: '6px 16px' }}
                                onClick={() => setIsEditingProfile(true)}
                            >
                                EDIT
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <input
                                type="text"
                                className="input-field"
                                value={profileData.username}
                                disabled={!isEditingProfile}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                style={{ background: isEditingProfile ? 'var(--color-bg-input)' : 'var(--tag-bg)' }}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    value={profileData.email}
                                    disabled={!isEditingProfile}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    style={{ paddingLeft: '40px', background: isEditingProfile ? 'var(--color-bg-input)' : 'var(--tag-bg)' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="input-group">
                                <label className="input-label">First Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={profileData.first_name}
                                    disabled={!isEditingProfile}
                                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                    style={{ background: isEditingProfile ? 'var(--color-bg-input)' : 'var(--tag-bg)' }}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Last Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={profileData.last_name}
                                    disabled={!isEditingProfile}
                                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                    style={{ background: isEditingProfile ? 'var(--color-bg-input)' : 'var(--tag-bg)' }}
                                />
                            </div>
                        </div>

                        {isEditingProfile && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    disabled={loading}
                                >
                                    {loading ? 'SAVING...' : <><Save size={18} style={{ marginRight: '8px' }} /> SAVE CHANGES</>}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => setIsEditingProfile(false)}
                                >
                                    CANCEL
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Preferences Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{
                                padding: '10px',
                                background: 'rgba(247, 37, 133, 0.1)',
                                borderRadius: '12px',
                                color: 'var(--color-accent)'
                            }}>
                                <Bell size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Preferences</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                background: 'var(--table-hover-bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Theme Mode</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                                    </div>
                                </div>
                                <button
                                    onClick={handleThemeToggle}
                                    className="btn btn-ghost"
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        padding: 0,
                                        background: 'var(--color-bg-dark)',
                                        border: '1px solid var(--color-primary)'
                                    }}
                                >
                                    {theme === 'dark' ? <Moon size={22} color="var(--color-primary)" /> : <Sun size={22} color="var(--color-warning)" />}
                                </button>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                background: 'var(--table-hover-bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Notifications</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Email notifications for findings</div>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '20px',
                                    background: 'var(--color-primary)',
                                    borderRadius: '10px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        background: 'black',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        right: '2px',
                                        top: '2px'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{
                                padding: '10px',
                                background: 'rgba(142, 45, 226, 0.1)',
                                borderRadius: '12px',
                                color: 'var(--color-secondary)'
                            }}>
                                <Shield size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Security</h3>
                        </div>

                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '15px' }}>
                            <Key size={18} style={{ marginRight: '12px' }} /> CHANGE PASSWORD
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
