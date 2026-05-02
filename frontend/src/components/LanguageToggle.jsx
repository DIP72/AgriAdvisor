import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = ({ isEnglish, isDarkMode }) => {
    const { toggleLanguage } = useLanguage();
    
    return (
        <div
            className="lang-toggle-nav"
            onClick={toggleLanguage}
            style={{
                cursor: 'pointer',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(46, 125, 50, 0.1)',
                color: isDarkMode ? '#fff' : 'var(--primary)',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(46, 125, 50, 0.2)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                transition: 'all 0.3s ease'
            }}
        >
            <span style={{ opacity: !isEnglish ? 1 : 0.4, transition: 'opacity 0.2s' }}>मराठी</span>
            <div style={{
                width: '1px',
                height: '14px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(46, 125, 50, 0.3)'
            }} />
            <span style={{ opacity: isEnglish ? 1 : 0.4, transition: 'opacity 0.2s' }}>English</span>
        </div>
    );
};

export default LanguageToggle;
