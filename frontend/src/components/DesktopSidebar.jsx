import React from 'react';
import { Home, Sprout, Users, User, Settings, LogOut, Moon, Sun, Mic, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/DesktopSidebar.css';

const DesktopSidebar = ({ activeTab, setTab, setScreen, isDarkMode, toggleTheme, onLogout, isEnglish }) => {
    const menuItems = [
        { id: 'home', icon: Home, labelMar: 'होम', labelEng: 'Home', screen: 'home' },
        { id: 'scanner', icon: Loader2, labelMar: 'स्कॅन क्रॉप', labelEng: 'Scan Crop', screen: 'scanner' },
        { id: 'crops', icon: Sprout, labelMar: 'पीके', labelEng: 'Crops', screen: 'recommendations' },
        { id: 'community', icon: Users, labelMar: 'समुदाय', labelEng: 'Community', screen: 'community' },
        { id: 'profile', icon: User, labelMar: 'प्रोफाईल', labelEng: 'Profile', screen: 'profile' },
        { id: 'settings', icon: Settings, labelMar: 'सेटिंग्ज', labelEng: 'Settings', screen: 'settings' },
        { id: 'feedback', icon: MessageSquare, labelMar: 'अभिप्राय', labelEng: 'Feedback', screen: 'feedback' },
    ];

    return (
        <div className={`desktop-sidebar ${isDarkMode ? 'dark' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-box">
                    <Sprout size={32} color="var(--primary)" />
                    <span className="logo-text">AgriAdvisor</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => {
                            setTab(item.id);
                            setScreen(item.screen);
                        }}
                    >
                        <item.icon size={24} />
                        <div className="sidebar-labels">
                            <span className="marathi">{isEnglish ? item.labelEng : item.labelMar}</span>
                        </div>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-action-btn" onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span>
                        {isDarkMode
                            ? (isEnglish ? 'Light Mode' : 'लाईट मोड')
                            : (isEnglish ? 'Dark Mode' : 'डार्क मोड')}
                    </span>
                </button>

                <button className="sidebar-action-btn logout" onClick={onLogout}>
                    <LogOut size={20} />
                    <span>{isEnglish ? 'Logout' : 'बाहेर पडा'}</span>
                </button>
            </div>
        </div>
    );
};

export default DesktopSidebar;
