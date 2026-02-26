import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IntroSplash = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Show for 2.5 seconds, then trigger exit animation
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 2200);

        // Redirect after exit animation (0.8s)
        const redirectTimer = setTimeout(() => {
            navigate('/dashboard');
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(redirectTimer);
        };
    }, [navigate]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#05070a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflow: 'hidden',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isExiting ? 'scale(5)' : 'scale(1)',
            opacity: isExiting ? 0 : 1,
            pointerEvents: isExiting ? 'none' : 'auto'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                animation: 'intro-entrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}>
                <div style={{
                    padding: '20px',
                    background: 'rgba(0, 240, 255, 0.1)',
                    borderRadius: '24px',
                    border: '1px solid var(--color-primary)',
                    boxShadow: '0 0 40px var(--color-primary-glow)',
                    color: 'var(--color-primary)',
                    transform: 'translateZ(0)'
                }}>
                    <Shield size={80} strokeWidth={1.5} />
                </div>

                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '900',
                    color: '#fff',
                    margin: 0,
                    letterSpacing: '0.2em',
                    fontFamily: 'var(--font-family-display)',
                    background: 'linear-gradient(to bottom, #fff, var(--color-primary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0, 240, 255, 0.3)'
                }}>
                    EVIDEX
                </h1>

                <div style={{
                    height: '2px',
                    width: '100px',
                    background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
                    marginTop: '10px'
                }} />
            </div>

            <style>{`
                @keyframes intro-entrance {
                    0% {
                        opacity: 0;
                        transform: translateY(30px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default IntroSplash;
