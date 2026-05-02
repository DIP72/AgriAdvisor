import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    // Get saved language from localStorage or default to English
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return saved || 'english';
    });

    // Save language preference whenever it changes
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        const languages = ['english', 'marathi', 'hindi', 'bengali'];
        const currentIndex = languages.indexOf(language);
        const nextIndex = (currentIndex + 1) % languages.length;
        setLanguage(languages[nextIndex]);
    };

    const t = (englishText, marathiText, hindiText, bengaliText) => {
        switch (language) {
            case 'marathi':
                return marathiText;
            case 'hindi':
                return hindiText;
            case 'bengali':
                return bengaliText;
            default:
                return englishText;
        }
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t,
        isEnglish: language === 'english',
        isMarathi: language === 'marathi',
        isHindi: language === 'hindi',
        isBengali: language === 'bengali'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};