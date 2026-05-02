import React, { useState, useEffect } from 'react';
import { Volume2, Droplets, CloudOff, ChevronRight, ChevronLeft, CloudRain, Snowflake, Sun, CalendarRange, Loader2 } from 'lucide-react';
import FarmPattern from '../assets/bg2.png';
import { useAuth } from '../context/AuthContext';
import '../styles/FarmInfoScreen.css';

const FarmInfoScreen = ({ onNext, onBack, farmInfo, setFarmInfo, isDesktop }) => {
    const { updateFarmInfo: saveToBackend } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { acres, soil, irrigation, season: plantingSeason } = farmInfo;

    // Helper to update farmInfo state
    const updateFarmInfo = (updates) => {
        setFarmInfo(prev => ({ ...prev, ...updates }));
    };

    const handleNext = async () => {
        if (!acres || !soil || plantingSeason === undefined) {
            setError(isEnglish ? 'Please fill all fields' : 'कृपया सर्व माहिती भरा');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const updatedUser = await saveToBackend({
                location: farmInfo.location,
                farmSize: parseFloat(acres),
                soilType: soil,
                irrigation: !!irrigation,
                plantingSeason: plantingSeason
            });
            onNext(updatedUser.farmInfo);
        } catch (err) {
            setError(err.message || 'Failed to save farm information');
        } finally {
            setLoading(false);
        }
    };

    const setAcres = (val) => updateFarmInfo({ acres: val });
    const setSoil = (val) => updateFarmInfo({ soil: val });
    const setIrrigation = (val) => updateFarmInfo({ irrigation: val });
    const setPlantingSeason = (val) => updateFarmInfo({ season: val });

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isEnglish, setIsEnglish] = useState(true);


    const handleSpeak = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const textToRead = isEnglish
            ? "Tell us about your farm. Select your farm size and soil type."
            : "तुमच्या शेताची माहिती. कृपया आपल्या शेताचा आकार आणि मातीचा प्रकार निवडा.";

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = isEnglish ? 'en-US' : 'mr-IN';

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    const soilTypes = [
        { id: 'black', mr: 'काळी कापूस', en: 'Black Cotton', color: '#373B4D' },
        { id: 'red', mr: 'लाल माती', en: 'Red Soil', color: '#8D5858' },
        { id: 'loamy', mr: 'चिकणमाती', en: 'Loamy', color: '#8D6E63' },
        { id: 'sandy', mr: 'वालुकामय', en: 'Sandy', color: '#FFD54F' },
    ];

    const seasons = [
        { id: 'kharif', mr: 'खरीप', en: 'Kharif', icon: CloudRain, color: '#607D8B' },
        { id: 'rabi', mr: 'रबी', en: 'Rabi', icon: Snowflake, color: '#03A9F4' },
        { id: 'summer', mr: 'उन्हाळी', en: 'Summer', icon: Sun, color: '#FF9800' },
        { id: 'all_year', mr: 'वर्षभर', en: 'All Year', icon: CalendarRange, color: '#4CAF50' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div className="top-bar content-card" style={{
                width: '100%',
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                position: 'fixed',
                top: 0,
                transition: 'all 0.3s ease',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    transition: 'all 0.3s ease',
                                    marginLeft: '-8px'
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <span className="title" style={{
                            letterSpacing: '-0.5px',
                            color: 'var(--primary)',
                            transition: 'all 0.3s ease'
                        }}>AgriAdvisor</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {!isDesktop && (
                            <div
                                onClick={() => setIsEnglish(!isEnglish)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#f3f4f6',
                                    padding: '3px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    width: '90px',
                                    height: '40px',
                                    border: '1px solid #eee',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    left: isEnglish ? '48px' : '3px',
                                    width: '39px',
                                    height: '34px',
                                    background: 'var(--primary)',
                                    borderRadius: '25px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    zIndex: 1
                                }} />
                                <span style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    zIndex: 2,
                                    color: !isEnglish ? 'white' : 'var(--text-muted)'
                                }}>MR</span>
                                <span style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    zIndex: 2,
                                    color: isEnglish ? 'white' : 'var(--text-muted)'
                                }}>EN</span>
                            </div>
                        )}
                        <div
                            onClick={handleSpeak}
                            style={{
                                background: isSpeaking ? 'var(--accent-orange)' : 'white',
                                padding: '6px',
                                borderRadius: '50%',
                                color: isSpeaking ? 'white' : 'var(--primary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Volume2 size={20} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="app-shell content-card" style={{
                background: 'transparent',
                width: '100%',
                padding: '24px',
                minHeight: '100vh',
                paddingTop: '80px'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    marginBottom: '80px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h1 className="marathi" style={{ fontSize: '1.75rem', color: '#1f2937' }}>
                                {isEnglish ? 'Farm Information' : 'तुमच्या शेताची माहिती'}
                            </h1>
                            <p className="english-sub" style={{ fontSize: '1rem', color: '#6b7280' }}>
                                {isEnglish ? 'Help us personalize your experience' : 'अनुभव अधिक प्रभावी करण्यासाठी माहिती द्या'}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h2 className="marathi" style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#1f2937' }}>
                            {isEnglish ? 'Farm Location' : 'शेताचे ठिकाण'}
                        </h2>
                        <p className="english-sub" style={{ color: '#6b7280' }}>{isEnglish ? 'Enter your village/district' : 'तुमचे गाव/जिल्हा प्रविष्ट करा'}</p>
                        <div style={{ marginTop: '16px' }}>
                            <input
                                type="text"
                                value={farmInfo.location || ''}
                                onChange={(e) => updateFarmInfo({ location: e.target.value })}
                                placeholder={isEnglish ? "Enter location" : "ठिकाण प्रविष्ट करा"}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    outline: 'none',
                                    background: '#f9fafb'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h2 className="marathi" style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#1f2937' }}>
                            {isEnglish ? 'Farm Size (Acres)' : 'शेत आकार (एकर)'}
                        </h2>
                        <p className="english-sub" style={{ color: '#6b7280' }}>{isEnglish ? 'Select area in acres' : 'एकरमध्ये क्षेत्र निवडा'}</p>
                        <div style={{ marginTop: '16px', position: 'relative' }}>
                            <input
                                type="number"
                                step="any"
                                value={acres || ''}
                                onChange={(e) => setAcres(e.target.value)}
                                placeholder={isEnglish ? "Enter size" : "आकार प्रविष्ट करा"}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    background: '#f9fafb'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#15803d'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontWeight: 700,
                                color: '#6b7280'
                            }}>
                                {isEnglish ? 'Acres' : 'एकर'}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h2 className="marathi" style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#1f2937' }}>
                            {isEnglish ? 'Soil Type' : 'माती प्रकार'}
                        </h2>
                        <p className="english-sub" style={{ color: '#6b7280' }}>{isEnglish ? 'Select soil on your land' : 'तुमच्या जमिनीचा प्रकार निवडा'}</p>
                        <div className="selection-grid">
                            {soilTypes.map(type => (
                                <div
                                    key={type.id}
                                    className="choice-card"
                                    onClick={() => setSoil(type.id)}
                                    style={{
                                        background: soil === type.id ? '#15803d' : '#f3f4f6',
                                        color: soil === type.id ? 'white' : '#1f2937',
                                        border: soil === type.id ? '2px solid #15803d' : '2px solid transparent',
                                        boxShadow: soil === type.id ? '0 8px 16px rgba(21, 128, 61, 0.2)' : 'none'
                                    }}
                                >
                                    <div className="choice-icon-box" style={{ background: type.color, opacity: soil === type.id ? 1 : 0.8 }} />
                                    <div>
                                        <div className="marathi" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                            {isEnglish ? type.en : type.mr}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h2 className="marathi" style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#1f2937' }}>
                            {isEnglish ? 'Irrigation Available?' : 'सिंचन उपलब्ध?'}
                        </h2>
                        <p className="english-sub" style={{ color: '#6b7280' }}>{isEnglish ? 'Do you have water supply?' : 'पाण्याची उपलब्धता आहे का?'}</p>
                        <div className="selection-grid">
                            <div
                                className="choice-card"
                                onClick={() => setIrrigation(true)}
                                style={{
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    background: irrigation ? '#15803d' : '#f3f4f6',
                                    color: irrigation ? 'white' : '#1f2937',
                                    border: irrigation ? '2px solid #15803d' : '2px solid transparent'
                                }}
                            >
                                <Droplets size={32} color={irrigation ? 'white' : '#1f2937'} />
                                <div className="marathi" style={{ fontWeight: 700 }}>{isEnglish ? 'Yes' : 'होय'}</div>
                            </div>
                            <div
                                className="choice-card"
                                onClick={() => setIrrigation(false)}
                                style={{
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    background: !irrigation ? '#15803d' : '#f3f4f6',
                                    color: !irrigation ? 'white' : '#1f2937',
                                    border: !irrigation ? '2px solid #15803d' : '2px solid transparent'
                                }}
                            >
                                <CloudOff size={32} color={!irrigation ? 'white' : '#1f2937'} />
                                <div className="marathi" style={{ fontWeight: 700 }}>{isEnglish ? 'No' : 'नाही'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <h2 className="marathi" style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#1f2937' }}>
                            {isEnglish ? 'Planting Season' : 'पेरणी वेळ'}
                        </h2>
                        <p className="english-sub" style={{ color: '#6b7280' }}>{isEnglish ? 'Current or upcoming season' : 'सध्याचा किंवा येणारा हंगाम'}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
                            {seasons.map(season => {
                                const Icon = season.icon;
                                const isActive = plantingSeason === season.id;
                                return (
                                    <div
                                        key={season.id}
                                        onClick={() => setPlantingSeason(season.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px',
                                            borderRadius: '50px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: isActive ? '#15803d' : '#f3f4f6',
                                            border: `2px solid ${isActive ? '#15803d' : 'transparent'}`,
                                            color: isActive ? 'white' : '#1f2937',
                                            fontWeight: 700
                                        }}
                                    >
                                        <Icon size={18} color={isActive ? 'white' : season.color} />
                                        <div>
                                            <div className="marathi" style={{ fontSize: '0.85rem', lineHeight: 1 }}>
                                                {isEnglish ? season.en : season.mr}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <div className={`floating-next-btn ${loading ? 'disabled' : ''}`} onClick={!loading ? handleNext : null}>
                    <span className="marathi" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {loading
                            ? (isEnglish ? 'Saving...' : 'जतन होत आहे...')
                            : (isEnglish ? 'Get Crop Recommendations' : 'पीक शिफारसी मिळवा')}
                    </span>
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <ChevronRight size={24} />}
                </div>
            </div>
        </div>
    );
};

export default FarmInfoScreen;
