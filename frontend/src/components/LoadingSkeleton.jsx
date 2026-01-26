import React from 'react';

const LoadingSkeleton = () => {
    return (
        <div className="glass-panel" style={{ padding: '20px', height: '100%', minHeight: '400px', animation: 'fadeIn 0.5s ease-in-out' }}>
            {/* Header Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ width: '200px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="skeleton-pulse"></div>
                <div style={{ width: '120px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="skeleton-pulse"></div>
            </div>

            {/* Content Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} className="skeleton-pulse"></div>
                ))}
            </div>

            <style>{`
                .skeleton-pulse {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

export default LoadingSkeleton;
