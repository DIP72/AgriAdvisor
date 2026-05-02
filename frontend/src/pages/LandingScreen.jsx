import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { LogIn, Phone, Mail, ArrowRight, Languages, Eye, EyeOff, ChevronRight, Sprout, User } from 'lucide-react';
import LandingImg from '../assets/landing 2.webp';
import HeroVideo from '../assets/hero-video.mp4';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import '../styles/LandingScreen.css';

const LandingScreen = ({ onNext, isDesktop }) => {
    const [view, setView] = useState('landing'); // 'landing', 'login', or 'signup'
    const [isEnglish, setIsEnglish] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginEmail, register } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log('Attempting login with:', email);
            const user = await loginEmail(email, password);
            console.log('Login successful! User:', user);
            // App.jsx will handle navigation via AuthContext state changes
        } catch (err) {
            console.error('Login error detail:', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            // App.jsx will handle navigation via AuthContext state changes
        } catch (err) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    // Landing Page View
    if (view === 'landing') {
        return (
            <Motion.div
                key="landing"
                initial={{ opacity: 1 }}
                exit={{ opacity: isDesktop ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="landing-page"
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="hero-video"
                >
                    <source src={HeroVideo} type="video/mp4" />
                </video>
                <div className="hero-dark-overlay"></div>

                {/* Top Navbar */}
                <nav className="landing-navbar">
                    <div className="nav-container-landing">
                        <div className="nav-left-landing">
                            <div className="landing-brand">
                                <Sprout size={28} className="leaf-logo-landing" />
                                <span className="brand-name-landing">AgriAdvisor</span>
                            </div>
                        </div>

                        <div className="nav-right-landing">
                            <div className="landing-lang-toggle-container">
                                <button
                                    className="lang-toggle-landing-minimal"
                                    onClick={() => setIsEnglish(!isEnglish)}
                                >
                                    {isEnglish ? 'मराठी' : 'English'}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content-overlay"
                >
                    <h1 className="hero-title-main">AGRI-ADVISOR</h1>
                    <p className="hero-subtitle-sub">{isEnglish ? 'SMART AGRICULTURE • DATA-DRIVEN DECISIONS' : 'स्मार्ट कृषी • डेटा-चालित निर्णय'}</p>

                    <button
                        onClick={() => setView('login')}
                        className="hero-discover-btn"
                    >
                        {isEnglish ? 'DISCOVER' : 'शोध घ्या'}
                    </button>
                </Motion.div>
            </Motion.div>
        );
    }

    // Login/Signup UI
    return (
        <Motion.div
            key="auth-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="login-container"
        >
            {/* Left Side - Hero Image (Desktop Only) */}
            {isDesktop && (
                <Motion.div
                    className="login-hero"
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    style={{
                        backgroundImage: `linear-gradient(rgba(46, 125, 50, 0.7), rgba(27, 94, 32, 0.8)), url(${LandingImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="hero-content">
                        <Motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h2 className="hero-title">
                                {isEnglish ? 'Welcome to AgriAdvisor' : 'AgriAdvisor मध्ये आपले स्वागत आहे'}
                            </h2>
                            <p className="hero-subtitle">
                                {isEnglish
                                    ? 'Get personalized insights and expert guidance for your farm'
                                    : 'तुमच्या शेतासाठी वैयक्तिक माहिती आणि तज्ञ मार्गदर्शन मिळवा'}
                            </p>
                            <div className="hero-features">
                                <div className="feature-item">✓ {isEnglish ? 'Personalized Crop Plans' : 'वैयक्तिक पीक योजना'}</div>
                                <div className="feature-item">✓ {isEnglish ? 'Save Your Farm Data' : 'तुमचा शेत डेटा सुरक्षित करा'}</div>
                                <div className="feature-item">✓ {isEnglish ? 'Track Your Progress' : 'तुमची प्रगती ट्रॅक करा'}</div>
                                <div className="feature-item">✓ {isEnglish ? 'Connect with Experts' : 'तज्ञांशी संपर्क साधा'}</div>
                            </div>
                        </Motion.div>
                    </div>
                </Motion.div>
            )}

            {/* Right Side - Auth Form */}
            <div className="login-form-container">
                <Motion.div
                    initial={{ opacity: 0, x: isDesktop ? 100 : 0, y: isDesktop ? 0 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="login-form-wrapper"
                >
                    {/* Language Toggle */}
                    <div className="language-toggle-container">
                        <button
                            className="language-toggle-btn"
                            onClick={() => setIsEnglish(!isEnglish)}
                        >
                            <Languages size={18} />
                            <span>{isEnglish ? 'मराठी' : 'English'}</span>
                        </button>
                    </div>

                    <div className="login-header">
                        <div className="logo-container">
                            <Sprout size={40} color="var(--primary)" />
                        </div>
                        <h2 className="login-title">
                            {view === 'login'
                                ? (isEnglish ? 'Sign In' : 'साइन इन करा')
                                : (isEnglish ? 'Create Account' : 'खाते तयार करा')}
                        </h2>
                        <p className="login-subtitle">
                            {view === 'login'
                                ? (isEnglish ? 'Enter your credentials to access your account' : 'तुमच्या खात्यात प्रवेश करण्यासाठी तुमची माहिती प्रविष्ट करा')
                                : (isEnglish ? 'Join our community of smart farmers' : 'स्मार्ट शेतकऱ्यांच्या आमच्या समुदायात सामील व्हा')}
                        </p>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    {/* Diagnostic Logs (Frontend) */}
                    {loading && <p style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center' }}>Connecting to server...</p>}

                    {/* Manual Auth Form */}
                    <form className="login-form" onSubmit={view === 'login' ? handleLogin : handleSignup}>
                        {view === 'signup' && (
                            <div className="form-group">
                                <label className="form-label">
                                    {isEnglish ? 'Full Name' : 'पूर्ण नाव'}
                                </label>
                                <div className="input-wrapper">
                                    <User size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={isEnglish ? 'Enter your name' : 'तुमचे नाव प्रविष्ट करा'}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                {isEnglish ? 'Email Address' : 'ईमेल पत्ता'}
                            </label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder={isEnglish ? 'Enter your email' : 'तुमचा ईमेल प्रविष्ट करा'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {isEnglish ? 'Password' : 'पासवर्ड'}
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder={isEnglish ? 'Enter your password' : 'तुमचा पासवर्ड प्रविष्ट करा'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '45px' }}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {view === 'login' && (
                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>{isEnglish ? 'Remember me' : 'मला लक्षात ठेवा'}</span>
                                </label>
                                <a href="#" className="forgot-password">
                                    {isEnglish ? 'Forgot Password?' : 'पासवर्ड विसरलात?'}
                                </a>
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (isEnglish ? 'Processing...' : 'प्रक्रिया सुरू आहे...') : (view === 'login' ? (isEnglish ? 'Sign In' : 'साइन इन करा') : (isEnglish ? 'Sign Up' : 'नोंदणी करा'))}
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    {/* Google Sign-In Option */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '12px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {isEnglish ? 'OR' : 'किंवा'}
                            </span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                        </div>
                        <GoogleLoginButton
                            onSuccess={() => setLoading(false)}
                            onError={(err) => {
                                setError(err.message || (isEnglish ? 'Google Login Failed' : 'Google लॉगिन अयशस्वी'));
                                setLoading(false);
                            }}
                        />
                    </div>

                    {/* Toggle between Login/Signup */}
                    <div className="signup-link">
                        <span>
                            {view === 'login'
                                ? (isEnglish ? "Don't have an account?" : 'खाते नाही?')
                                : (isEnglish ? "Already have an account?" : 'आधीच खाते आहे?')}
                        </span>
                        <a href="#" onClick={(e) => { e.preventDefault(); setView(view === 'login' ? 'signup' : 'login'); setError(''); }}>
                            {view === 'login' ? (isEnglish ? 'Sign Up' : 'नोंदणी करा') : (isEnglish ? 'Sign In' : 'साइन इन करा')}
                        </a>
                    </div>

                    {/* Back to Landing */}
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button
                            onClick={() => { setView('landing'); setError(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {isEnglish ? '← Back to Home' : '← होम वर परत जा'}
                        </button>
                    </div>
                </Motion.div>
            </div>
        </Motion.div>
    );
};

export default LandingScreen;
