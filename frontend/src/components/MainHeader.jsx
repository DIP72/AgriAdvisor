import { Menu, ArrowLeft, Sprout, LogOut } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import TTSButton from './TTSButton';

const MainHeader = ({ screen, setScreen, setTab, isEnglish, setIsMenuOpen, isDesktop, isDarkMode, previousCropScreen }) => {
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <div className="top-bar flex items-center justify-between gap-2" style={{
            width: '100%',
            margin: '0 auto',
            background: isDarkMode ? '#0f172a' : 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            transition: 'all 0.3s ease',
            zIndex: 1100,
            padding: isDesktop ? '10px 40px' : '16px 20px',
            backdropFilter: 'blur(10px)',
            borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!isDesktop && (
                    <button onClick={() => setIsMenuOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: isDarkMode ? '#fff' : 'var(--primary)' }}>
                        <Menu size={24} />
                    </button>
                )}

                {screen !== 'home' && (
                    <button
                        onClick={() => {
                            if (screen === 'all-crops') {
                                setScreen('recommendations');
                                setTab('crops');
                            } else if (screen === 'crop-detail') {
                                setScreen(previousCropScreen || 'recommendations');
                                setTab('crops');
                            } else {
                                setScreen('home');
                                setTab('home');
                            }
                        }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: isDarkMode ? '#fff' : 'var(--primary)' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sprout size={isDesktop ? 28 : 24} style={{ color: '#4CAF50' }} />
                    <span className="title" style={{
                        letterSpacing: '-0.5px',
                        color: isDarkMode ? '#fff' : 'var(--primary)',
                        transition: 'all 0.3s ease',
                        fontSize: isDesktop ? '1.5rem' : '1.25rem',
                        fontWeight: 800
                    }}>AgriAdvisor</span>
                </div>
            </div>

            <div className="flex items-end gap-4">
                <LanguageToggle isEnglish={isEnglish} isDarkMode={isDarkMode} />

                <TTSButton
                    textToRead={isEnglish ? "Welcome to AgriAdvisor. Your agricultural precision farming assistant." : "Welcome to AgriAdvisor. Your agricultural precision farming assistant."}
                    isDarkMode={isDarkMode}
                />
                
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid ' + (isDarkMode ? '#374151' : '#d1d5db'),
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }}
                >
                    <LogOut size={16} />
                    {isDesktop ? 'Logout' : ''}
                </button>
            </div>
        </div>
    );
};

export default MainHeader;
