import React from 'react';
import {
    Shield,
    CircleHelp,
    Phone,
    FileText,
    X,
    ChevronRight,
    User,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const SideMenu = ({ isOpen, onClose, darkMode, setScreen, setTab, isEnglish }) => {
    const menuItems = [
        { icon: Loader2, title: isEnglish ? 'Scan Crop' : 'स्कॅन क्रॉप', color: '#4CAF50', id: 'scanner' },
        { icon: Shield, title: isEnglish ? 'Insurance Info' : 'विमा माहिती', color: '#2196F3' },
        { icon: CircleHelp, title: isEnglish ? 'Help & Support' : 'मदत आणि सहाय्य', color: '#9C27B0' },
        { icon: Phone, title: isEnglish ? 'Contact Us' : 'संपर्क साधा', color: '#4CAF50' },
        { icon: FileText, title: isEnglish ? 'Privacy Policy' : 'गोपनीयता धोरण', color: '#607D8B' },
        { icon: User, title: isEnglish ? 'Profile' : 'प्रोफाईल', color: '#FF5722', id: 'profile' },
        { icon: MessageSquare, title: isEnglish ? 'Feedback' : 'अभिप्राय', color: '#E91E63', id: 'feedback' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2000
                        }}
                    />

                    {/* Drawer */}
                    <Motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: '85%',
                            maxWidth: '360px',
                            background: darkMode ? '#1a1a1a' : 'white',
                            zIndex: 2001,
                            boxShadow: '20px 0 50px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '40px 24px 24px',
                            background: 'var(--primary-dark)',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: 20,
                                    right: 20,
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    padding: '8px',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                            <h2 className="marathi" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>AgriAdvisor</h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>सहाय्य केंद्र • Help Center</p>
                        </div>

                        {/* List */}
                        <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {menuItems.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            if (item.id === 'profile' && setScreen && setTab) {
                                                setScreen('profile');
                                                setTab('profile');
                                                onClose();
                                            } else if (item.id === 'scanner' && setScreen && setTab) {
                                                setScreen('scanner');
                                                setTab('scanner');
                                                onClose();
                                            } else if (item.id === 'feedback' && setScreen) {
                                                setScreen('feedback');
                                                onClose();
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: darkMode ? '#242424' : '#f8f9fa',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                background: `${item.color}15`,
                                                padding: '10px',
                                                borderRadius: '12px',
                                                color: item.color
                                            }}>
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <div className="marathi" style={{ fontSize: '0.95rem', fontWeight: 700, color: darkMode ? '#fff' : '#1f2937' }}>
                                                    {item.title}
                                                </div>
                                                {!isEnglish && item.subtitle && (
                                                    <div className="english-sub" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                                        {item.subtitle}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} color="#cbd5e1" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '24px',
                            borderTop: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Version 1.0.4 • © 2026 AgriAdvisor
                            </p>
                        </div>
                    </Motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SideMenu;
