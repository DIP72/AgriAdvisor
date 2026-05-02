import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ChevronDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { cropData } from '../cropData';
import { useAuth } from '../context/AuthContext';
import TTSButton from '../components/TTSButton';
import '../styles/CropRecommendationScreen.css';
import FarmPattern from '../assets/bg2.png';

const API_URL = import.meta.env.VITE_API_URL || '';

// Map API response fields to the shape the card UI expects
function normalizeApiCrop(crop, index) {
    return {
        id: crop.id || crop.nameEn?.toLowerCase().replace(/\s+/g, '-') || `crop-${index}`,
        name: crop.nameMr || crop.nameEn || '',
        marathiName: crop.nameMr || crop.nameEn || '',
        englishName: crop.nameEn || crop.nameMr || '',
        rank: index + 1,
        image: crop.image || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80',
        price: crop.price || '—',
        matchScore: crop.matchScore ?? 50,
        tags: Array.isArray(crop.tags) ? crop.tags : [],
        profit: crop.profit || '',
        profitPer: crop.profitPer || '',
        soil: crop.soil || [],
        season: Array.isArray(crop.season) ? crop.season : (crop.season ? [crop.season] : []),
        waterReq: crop.waterReq || 'Medium',
        risks: crop.risks || { weather: { value: 30, level: 'Low' }, market: { value: 30, level: 'Low' }, water: { value: 30, level: 'Low' } },
        calendar: crop.calendar || { start: '—', end: '—', duration: crop.duration ? `${crop.duration} days` : '—' },
        outlook: crop.outlook || []
    };
}

const CropRecommendationScreen = ({ onSelectCrop, isEnglish, isDarkMode, farmInfo = {}, isDesktop, showAll = false, setScreen }) => {
    const { user, token } = useAuth();
    const [filters, setFilters] = useState({ soil: 'All', season: 'All', water: 'All' });
    const [apiCrops, setApiCrops] = useState(null);   // null = not yet fetched
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [weatherInfo, setWeatherInfo] = useState(null);
    const isEn = isEnglish;

    // Merge farmInfo from prop and from user profile
    const effectiveFarmInfo = {
        ...(user?.farmInfo || {}),
        ...farmInfo
    };

    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                soilType: effectiveFarmInfo.soilType || effectiveFarmInfo.soil || '',
                plantingSeason: effectiveFarmInfo.plantingSeason || effectiveFarmInfo.season || '',
                location: effectiveFarmInfo.location || '',
                lat: effectiveFarmInfo.lat,
                lon: effectiveFarmInfo.lon
            };

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/api/recommend-crops`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            if (data.weather) setWeatherInfo(data.weather);

            const normalized = (data.recommendations || []).map(normalizeApiCrop);
            setApiCrops(normalized.length > 0 ? normalized : null);
        } catch (err) {
            console.warn('[CropRecommendation] API failed, using static fallback:', err.message);
            setError(err.message);
            setApiCrops(null);
        } finally {
            setLoading(false);
        }
    }, [effectiveFarmInfo.soilType, effectiveFarmInfo.plantingSeason, effectiveFarmInfo.location, token]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Use API results when available, fall back to static cropData
    const sourceData = apiCrops ?? cropData;
    const usingFallback = apiCrops === null && !loading;

    const filteredCrops = sourceData.filter(crop => {
        const soilMatch = filters.soil === 'All' || crop.soil?.includes(filters.soil);
        const seasonMatch = filters.season === 'All' || crop.season?.includes(filters.season) || crop.season?.includes('Whole Year');
        const waterMatch = filters.water === 'All' || crop.waterReq === filters.water;
        return soilMatch && seasonMatch && waterMatch;
    });

    const displayCrops = showAll ? filteredCrops : filteredCrops.slice(0, 3);

    const filterOptions = {
        soil: [
            { val: 'All', en: 'Soil: All', mr: 'माती: सर्व' },
            { val: 'Black', en: 'Black', mr: 'काळी' },
            { val: 'Red', en: 'Red', mr: 'लाल' },
            { val: 'Alluvial', en: 'Alluvial', mr: 'गाळाची' }
        ],
        season: [
            { val: 'All', en: 'Season: All', mr: 'हंगाम: सर्व' },
            { val: 'Kharif', en: 'Kharif', mr: 'खरीप' },
            { val: 'Rabi', en: 'Rabi', mr: 'रब्बी' },
            { val: 'Summer', en: 'Summer', mr: 'उन्हाळी' }
        ],
        water: [
            { val: 'All', en: 'Water: All', mr: 'पाणी: सर्व' },
            { val: 'Low', en: 'Low', mr: 'कमी' },
            { val: 'Medium', en: 'Medium', mr: 'मध्यम' },
            { val: 'High', en: 'High', mr: 'जास्त' }
        ]
    };

    const getTTSText = () => {
        let text = isEn ? 'Top Crops for You. ' : 'तुमच्यासाठी टॉप पिके. ';
        displayCrops.forEach((crop, index) => {
            if (isEn) {
                text += `Number ${index + 1}, ${crop.englishName}, Match ${crop.matchScore} percent. `;
            } else {
                text += `क्रमांक ${index + 1}, ${crop.marathiName}, जुळणी ${crop.matchScore} टक्के. `;
            }
        });
        return text;
    };

    return (
        <div style={{
            width: '100%',
            margin: '0 auto',
            padding: '0 20px 40px',
            background: isDarkMode ? 'transparent' : `linear-gradient(rgba(240, 249, 241, 0.95), rgba(240, 249, 241, 0.95)), url(${FarmPattern})`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            minHeight: '100vh'
        }}>
            <div style={{
                background: isDarkMode ? '#111827' : 'white',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.04)',
                width: '100%',
                margin: '0 auto',
                border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0',
                color: isDarkMode ? '#f3f4f6' : '#111827'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    padding: '0 8px'
                }}>
                    <div>
                        <h2 className="marathi" style={{
                            fontSize: '1.5rem',
                            color: isDarkMode ? '#fff' : 'var(--primary-dark)',
                            lineHeight: 1.1
                        }}>
                            {showAll
                                ? (isEn ? 'All Ranked Crops' : 'सर्व रँक केलेली पिके')
                                : (isEn ? 'Top Crops for You' : 'तुमच्यासाठी टॉप पिके')
                            }
                        </h2>
                        <span style={{
                            fontSize: '0.9rem',
                            color: isDarkMode ? '#9ca3af' : 'var(--text-muted)',
                            fontWeight: 500,
                            display: 'block',
                            marginTop: '4px'
                        }}>
                            {isEn ? 'तुमच्यासाठी टॉप पिके' : 'Top Crops for You'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!loading && (
                            <button
                                onClick={fetchRecommendations}
                                title={isEn ? 'Refresh recommendations' : 'पुन्हा लोड करा'}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <RefreshCw size={16} />
                            </button>
                        )}
                        <TTSButton textToRead={getTTSText()} isDarkMode={isDarkMode} />
                    </div>
                </div>

                {/* Weather badge when live data is available */}
                {weatherInfo && !usingFallback && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isDarkMode ? '#1f2937' : '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#16a34a',
                        marginBottom: '16px'
                    }}>
                        🌡️ {weatherInfo.temperature}°C · 💧 {weatherInfo.humidity}%
                        {weatherInfo.location && ` · ${weatherInfo.location}`}
                        <span style={{ color: '#86efac', fontWeight: 400 }}>
                            {weatherInfo.source === 'live' ? (isEn ? ' · Live' : ' · लाइव्ह') : (isEn ? ' · Estimated' : ' · अंदाजे')}
                        </span>
                    </div>
                )}

                {/* Fallback notice */}
                {usingFallback && error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: isDarkMode ? '#1f2937' : '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        fontSize: '0.8rem',
                        color: isDarkMode ? '#fbbf24' : '#92400e'
                    }}>
                        <AlertCircle size={14} />
                        <span>
                            {isEn
                                ? 'Showing general recommendations. Personalized results unavailable.'
                                : 'सामान्य शिफारसी दाखवत आहे. वैयक्तिक निकाल उपलब्ध नाही.'}
                        </span>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px 20px',
                        gap: '12px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                    }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        <p className="marathi" style={{ fontSize: '0.95rem', margin: 0 }}>
                            {isEn ? 'Finding best crops for your farm…' : 'तुमच्या शेतासाठी सर्वोत्तम पिके शोधत आहे…'}
                        </p>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Filter Dropdowns */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            {Object.keys(filterOptions).map(key => (
                                <div key={key} style={{ position: 'relative', flex: 1 }}>
                                    <select
                                        value={filters[key]}
                                        onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                        style={{
                                            width: '100%',
                                            appearance: 'none',
                                            WebkitAppearance: 'none',
                                            backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
                                            color: isDarkMode ? '#fff' : '#1f2937',
                                            padding: '10px 12px',
                                            paddingRight: '32px',
                                            borderRadius: '12px',
                                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        {filterOptions[key].map(opt => (
                                            <option key={opt.val} value={opt.val}>
                                                {isEn ? opt.en : opt.mr}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Crop List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {displayCrops.length > 0 ? (
                                displayCrops.map((crop) => (
                                    <Motion.div
                                        key={crop.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onSelectCrop(crop)}
                                        style={{
                                            background: isDarkMode ? '#1f2937' : '#fff',
                                            borderRadius: '20px',
                                            padding: '24px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            border: isDarkMode ? '1px solid #4a5568' : '1px solid #f5f5f5',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {/* Row 1: Names, Rank and Price */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                }}>
                                                    #{crop.rank}
                                                </div>
                                                <div>
                                                    <h3 className="marathi" style={{
                                                        fontSize: '1.1rem',
                                                        color: isDarkMode ? '#fff' : 'var(--text-main)',
                                                        lineHeight: 1.2,
                                                        fontWeight: 700
                                                    }}>
                                                        {isEn ? crop.englishName : crop.marathiName}
                                                    </h3>
                                                    <p style={{
                                                        fontSize: '0.8rem',
                                                        color: isDarkMode ? '#9ca3af' : 'var(--text-muted)',
                                                        marginTop: '2px'
                                                    }}>
                                                        {isEn ? crop.marathiName : crop.englishName}
                                                    </p>
                                                </div>
                                            </div>
                                            {crop.price && crop.price !== '—' && (
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                                                        {crop.price.split('/')[0]}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                        /{crop.price.split('/')[1]}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Row 2: Match Progress Bar */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                marginBottom: '4px',
                                                color: isDarkMode ? '#e5e7eb' : 'inherit',
                                                alignItems: 'flex-end'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="marathi" style={{ lineHeight: 1.2 }}>
                                                        {isEn ? 'Match' : 'जुळणी'}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 400 }}>
                                                        {isEn ? 'जुळणी' : 'Match'}
                                                    </span>
                                                </div>
                                                <span style={{ color: 'var(--primary)' }}>{crop.matchScore}%</span>
                                            </div>
                                            <div style={{
                                                height: '6px',
                                                background: isDarkMode ? '#4a5568' : '#f1f3f4',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                marginTop: '4px'
                                            }}>
                                                <Motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${crop.matchScore}%` }}
                                                    style={{
                                                        height: '100%',
                                                        background: 'var(--primary-light)',
                                                        borderRadius: '10px'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 3: Tags */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {crop.tags.slice(0, 2).map((tag, idx) => {
                                                const isSuccess = tag.includes('Resistant') || tag.includes('Staple') || tag.includes('Quality') || tag.includes('Low');
                                                return (
                                                    <div key={idx} style={{
                                                        background: isSuccess ? 'rgba(46, 125, 50, 0.08)' : 'rgba(255, 152, 0, 0.08)',
                                                        color: isSuccess ? '#2E7D32' : '#F57C00',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        border: isSuccess ? '1px solid rgba(46, 125, 50, 0.1)' : '1px solid rgba(255, 152, 0, 0.1)'
                                                    }}>
                                                        {tag}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Motion.div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <h3 className="marathi" style={{ color: isDarkMode ? '#fff' : '#374151', marginBottom: '10px', fontSize: '1rem' }}>
                                        {isEn ? 'No crops found.' : 'पिके आढळली नाहीत.'}
                                    </h3>
                                    <p className="english-sub" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '0.8rem' }}>
                                        {isEn ? 'Try changing the filters.' : 'फिल्टर्स बदलून पहा.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {!showAll && filteredCrops.length > 3 && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button
                                    onClick={() => setScreen('all-crops')}
                                    style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '14px',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span className="marathi">{isEn ? 'Get More Info' : 'अधिक माहिती मिळवा'}</span>
                                    <TrendingUp size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default CropRecommendationScreen;
