import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from 'lucide-react';

const ModalContext = createContext(null);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState(null);

    const showModal = useCallback((config) => {
        setModalConfig(config);
    }, []);

    const hideModal = useCallback(() => {
        setModalConfig(null);
    }, []);

    const alert = useCallback((message, title = 'Alert') => {
        return new Promise((resolve) => {
            showModal({
                type: 'alert',
                title,
                message,
                onConfirm: () => {
                    hideModal();
                    resolve();
                }
            });
        });
    }, [showModal, hideModal]);

    const confirm = useCallback((message, title = 'Confirm Action', options = {}) => {
        return new Promise((resolve) => {
            showModal({
                type: 'confirm',
                title,
                message,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                isDangerous: options.isDangerous || false,
                onConfirm: () => {
                    hideModal();
                    resolve(true);
                },
                onCancel: () => {
                    hideModal();
                    resolve(false);
                }
            });
        });
    }, [showModal, hideModal]);

    const prompt = useCallback((message, title = 'Input Required', defaultValue = '') => {
        return new Promise((resolve) => {
            showModal({
                type: 'prompt',
                title,
                message,
                defaultValue,
                onConfirm: (value) => {
                    hideModal();
                    resolve(value);
                },
                onCancel: () => {
                    hideModal();
                    resolve(null);
                }
            });
        });
    }, [showModal, hideModal]);

    return (
        <ModalContext.Provider value={{ alert, confirm, prompt }}>
            {children}
            {modalConfig && <ModalOverlay config={modalConfig} onClose={hideModal} />}
        </ModalContext.Provider>
    );
};

const ModalOverlay = ({ config, onClose }) => {
    const [inputValue, setInputValue] = useState(config.defaultValue || '');

    const handleConfirm = () => {
        if (config.type === 'prompt') {
            config.onConfirm(inputValue);
        } else {
            config.onConfirm();
        }
    };

    const getIcon = () => {
        if (config.isDangerous) return <AlertCircle size={32} color="var(--color-error)" />;
        switch (config.type) {
            case 'alert': return <Info size={32} color="var(--color-primary)" />;
            case 'confirm': return <HelpCircle size={32} color="var(--color-warning)" />;
            case 'prompt': return <HelpCircle size={32} color="var(--color-primary)" />;
            default: return <Info size={32} color="var(--color-primary)" />;
        }
    };

    return (
        <div className="modal-overlay" onClick={config.onCancel || onClose}>
            <div className={`modal-content glass-panel ${config.isDangerous ? 'dangerous' : ''}`} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={config.onCancel || onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <div className="modal-icon-wrapper">
                        {getIcon()}
                    </div>
                </div>

                <div className="modal-body">
                    <h2 className="modal-title">{config.title}</h2>
                    <p className="modal-message">{config.message}</p>

                    {config.type === 'prompt' && (
                        <div className="modal-input-wrapper">
                            <input
                                type="text"
                                className="input-field"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirm();
                                    if (e.key === 'Escape') config.onCancel();
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {(config.type === 'confirm' || config.type === 'prompt') && (
                        <button className="btn btn-ghost" onClick={config.onCancel}>
                            {config.cancelText || 'Cancel'}
                        </button>
                    )}
                    <button
                        className={`btn ${config.isDangerous ? 'btn-error' : 'btn-primary'}`}
                        onClick={handleConfirm}
                    >
                        {config.confirmText || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};
