import React, { useState, useRef } from 'react';
import {
  Home,
  Sprout,
  Users,
  User,
  Mic,
  Settings,
  Loader2
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';

import LandingScreen from './pages/LandingScreen';
import FarmInfoScreen from './pages/FarmInfoScreen';
import HomeScreen from './pages/HomeScreen';
import VoiceModal from './components/VoiceModal';
import CommunityScreen from './pages/CommunityScreen';
import ProfileScreen from './pages/ProfileScreen';
import SettingsScreen from './pages/SettingsScreen';
import FeedbackScreen from './pages/FeedbackScreen';
import SideMenu from './components/SideMenu';
import CropRecommendationScreen from './pages/CropRecommendationScreen';
import CropDetailScreen from './pages/CropDetailScreen';
import DesktopSidebar from './components/DesktopSidebar';
import CropScanner from './components/CropScanner';
import MainHeader from './components/MainHeader';
import NotificationTray from './components/NotificationTray';
import WeatherRiskDemo from './components/WeatherRiskDemo';
import io from 'socket.io-client';

const BottomNav = ({ activeTab, setTab, setScreen, isEnglish }) => {
  return (
    <div className="bottom-nav" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => { setTab('home'); setScreen('home'); }}>
          <Home size={22} />
          <span className="marathi">{isEnglish ? 'Home' : 'होम'}</span>
        </div>
        <div className={`nav-item ${activeTab === 'crops' ? 'active' : ''}`}
          onClick={() => { setTab('crops'); setScreen('recommendations'); }}>
          <Sprout size={22} />
          <span className="marathi">{isEnglish ? 'Crops' : 'पीके'}</span>
        </div>
        <div className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => { setTab('scanner'); setScreen('scanner'); }}>
          <Loader2 size={22} className={activeTab === 'scanner' ? 'text-green-600' : ''} />
          <span className="marathi">{isEnglish ? 'Scan' : 'स्कॅन'}</span>
        </div>
        <div className={`nav-item ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => { setTab('community'); setScreen('community'); }}>
          <Users size={22} />
          <span className="marathi">{isEnglish ? 'Community' : 'समुदाय'}</span>
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => { setTab('settings'); setScreen('settings'); }}>
          <Settings size={22} />
          <span className="marathi">{isEnglish ? 'Settings' : 'सेटिंग्ज'}</span>
        </div>
      </div>
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = ({ isEnglish, isDarkMode, onFinished }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isEn = isEnglish;

  const steps = [
    { en: 'Fetching mandi prices', mr: 'मंडी भाव मिळवत आहे' },
    { en: 'Checking IMD weather data', mr: 'IMD हवामान डेटा तपासत आहे' },
    { en: 'Analyzing risks and demand', mr: 'जोखीम आणि मागणीचे विश्लेषण' },
    { en: 'Preparing recommendations', mr: 'शिफारसी तयार करत आहे' }
  ];

  React.useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        onFinished();
      }, 500);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStep, onFinished]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <Motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(46, 125, 50, 0.1)',
          padding: '24px',
          borderRadius: '50%',
          marginBottom: '24px'
        }}
      >
        <Sprout size={64} color="var(--primary)" />
      </Motion.div>

      <h2 className="marathi" style={{
        fontSize: '1.75rem',
        marginBottom: '32px',
        color: isDarkMode ? 'white' : 'var(--primary-dark)'
      }}>
        {isEn ? 'Analyzing Your Farm...' : 'तुमच्या शेताचे विश्लेषण करत आहे...'}
      </h2>

      <div style={{
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'left'
      }}>
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <Motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: isCompleted || isActive ? (isDarkMode ? '#fff' : '#1f2937') : (isDarkMode ? '#4b5563' : '#9ca3af'),
                fontWeight: isActive ? 700 : 500
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isCompleted ? (
                  <Motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Motion.div>
                ) : isActive ? (
                  <Motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{
                      width: '18px',
                      height: '18px',
                      border: `2px solid ${isDarkMode ? '#fff' : 'var(--primary)'}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              <span className="marathi">{isEn ? step.en : step.mr}</span>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
};

function App() {
  const { isEnglish, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [onboarding, setOnboarding] = useState('landing');
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [farmDetails, setFarmDetails] = useState({});
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [previousCropScreen, setPreviousCropScreen] = useState('recommendations');
  const [notifications, setNotifications] = useState([]);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      const backendUrl = import.meta.env.VITE_API_URL || '';
      // Use standard connection without trailing slash for better reliability
      const sock = io(backendUrl || undefined);

      // Explicitly join the room to stay in sync with activity
      sock.emit('joinRoom', 'farmers-community');

      sock.on('community:newActivity', (data) => {
        // Robust check: ensure IDs are compared as strings
        const currentUserId = String(user.id);
        const incomingAuthorId = String(data.authorId);

        if (incomingAuthorId !== currentUserId) {
          // Play sound with a fallback to avoid blocking
          try {
            if (notificationSound.current) {
              notificationSound.current.currentTime = 0;
              notificationSound.current.play().catch(() => { });
            }
          } catch (e) { }

          setNotifications(prev => {
            // Uniqueness check
            if (prev.find(n => n._id === data._id)) return prev;

            const newNotif = { ...data, timestamp: Date.now() };

            setTimeout(() => {
              setNotifications(current => current.filter(n => (n._id || n.timestamp) !== (newNotif._id || newNotif.timestamp)));
            }, 6000);

            return [newNotif, ...prev].slice(0, 3);
          });
        }
      });

      return () => {
        sock.off('community:newActivity');
        sock.disconnect();
      };
    }
  }, [isAuthenticated, user?.id]);

  React.useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        if (user?.farmInfo) {
          setFarmDetails(user.farmInfo);
        }
        if (user?.isOnboarded) {
          setOnboarding('finished');
          setScreen('home');
        } else {
          setOnboarding('farm_info');
        }
      } else {
        setOnboarding('landing');
      }
    }
  }, [isAuthenticated, user, authLoading]);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <div
      className={`${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} w-full min-h-screen`}
      style={{
        background: isDarkMode ? '#0f172a' : '#f8fafc',
      }}
    >
        <AnimatePresence mode="wait">
          {onboarding === 'landing' && (
            <LandingScreen key="landing" onNext={() => setOnboarding('farm_info')} isDesktop={isDesktop} />
          )}
          {onboarding === 'farm_info' && (
            <FarmInfoScreen
              key="farm_info"
              farmInfo={farmDetails}
              setFarmInfo={setFarmDetails}
              isDesktop={isDesktop}
              onNext={(data) => {
                if (data) setFarmDetails(data);
                setOnboarding('finished');
                setScreen('home');
              }}
              onBack={() => setOnboarding('landing')}
            />
          )}
          {onboarding === 'finished' && (
            <div
              key="app-finished"
              className={`${isDesktop ? 'desktop-layout' : ''}`}
              style={{
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                alignItems: isDesktop ? 'stretch' : 'center',
                width: '100%',
                minHeight: '100vh',
              }}
            >
              {isDesktop && (
                <DesktopSidebar
                  activeTab={activeTab}
                  setTab={setActiveTab}
                  setScreen={setScreen}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  isEnglish={isEnglish}
                  onLogout={() => {
                    localStorage.removeItem('token');
                    setOnboarding('landing');
                    window.location.reload();
                  }}
                />
              )}

              <div
                className={isDesktop ? "main-content-desktop" : "mobile-content-wrapper"}
                style={{
                  flex: isDesktop ? 1 : 'unset',
                  width: isDesktop ? 'auto' : '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: screen === 'scanner' ? '0' : (isDesktop ? '100px' : '84px')
                }}
              >
                <MainHeader
                  screen={screen}
                  setScreen={setScreen}
                  setTab={setActiveTab}
                  isEnglish={isEnglish}
                  setIsMenuOpen={setIsMenuOpen}
                  isDesktop={isDesktop}
                  isDarkMode={isDarkMode}
                  previousCropScreen={previousCropScreen}
                />
                {screen !== 'scanner' && (
                  <MainHeader
                    screen={screen}
                    setScreen={setScreen}
                    setTab={setActiveTab}
                    isEnglish={isEnglish}
                    setIsEnglish={setIsEnglish}
                    setIsMenuOpen={setIsMenuOpen}
                    isDesktop={isDesktop}
                    isDarkMode={isDarkMode}
                    previousCropScreen={previousCropScreen}
                  />
                )}

                {!isDesktop && (
                  <SideMenu
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    darkMode={isDarkMode}
                    setScreen={setScreen}
                    setTab={setActiveTab}
                    isEnglish={isEnglish}
                  />
                )}

                <div className="content-card">
                  {screen === 'home' && (
                    <HomeScreen
                      setSelectedCrop={setSelectedCrop}
                      setIsVoiceOpen={setIsVoiceOpen}
                      setScreen={setScreen}
                      setTab={setActiveTab}
                      isDarkMode={isDarkMode}
                      isEnglish={isEnglish}
                    />
                  )}
                  {screen === 'recommendations' && (
                    <CropRecommendationScreen
                      isEnglish={isEnglish}
                      isDarkMode={isDarkMode}
                      isDesktop={isDesktop}
                      farmInfo={farmDetails}
                      showAll={false}
                      setScreen={setScreen}
                      onSelectCrop={(crop) => {
                        setSelectedCrop(crop);
                        setPreviousCropScreen('recommendations');
                        setScreen('crop-detail');
                      }}
                    />
                  )}
                  {screen === 'weather-risk-demo' && (
                    <WeatherRiskDemo />
                  )}
                  {screen === 'crop-detail' && (
                    <CropDetailScreen
                      crop={selectedCrop}
                      onBack={() => setScreen(previousCropScreen)}
                      isDarkMode={isDarkMode}
                      isEnglish={isEnglish}
                    />
                  )}
                  {screen === 'community' && <CommunityScreen isDarkMode={isDarkMode} />}
                  {screen === 'scanner' && <CropScanner setScreen={setScreen} />}
                  {screen === 'profile' && (
                    <ProfileScreen
                      darkMode={isDarkMode}
                      isDesktop={isDesktop}
                      onEdit={() => setOnboarding('farm_info')}
                    />
                  )}
                  {screen === 'settings' && (
                    <SettingsScreen
                      isDarkMode={isDarkMode}
                      setIsDarkMode={setIsDarkMode}
                      toggleTheme={toggleTheme}
                      isEnglish={isEnglish}
                      isDesktop={isDesktop}
                      onLogout={() => {
                        localStorage.removeItem('token');
                        setOnboarding('landing');
                        window.location.reload();
                      }}
                    />
                  )}
                  {screen === 'feedback' && (
                    <FeedbackScreen
                      isDarkMode={isDarkMode}
                      isEnglish={isEnglish}
                    />
                  )}
                </div>

                {!isDesktop && <BottomNav activeTab={activeTab} setTab={setActiveTab} setScreen={setScreen} isEnglish={isEnglish} />}
              </div>
            </div>
          )}
        </AnimatePresence>

      <VoiceModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </div>
  );
}

export default App;
