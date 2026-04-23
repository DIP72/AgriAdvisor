import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { MapPin, Sun, Moon, Droplets, Wind, AlertTriangle, TrendingUp, Lightbulb, MessageSquareQuote, Sprout, Users, Cloud, CloudRain, CloudSnow } from 'lucide-react';
import MarketTicker from '../components/MarketTicker';
import { cropData } from '../cropData';
import { useLanguage } from '../context/LanguageContext';
import TTSButton from '../components/TTSButton';
import '../styles/HomeScreen.css';

const HomeScreen = ({ setScreen, setTab, isDarkMode, isEnglish, setSelectedCrop, setIsVoiceOpen }) => {
    const isEn = isEnglish;
    const [weather, setWeather] = React.useState({
        temperature: null,
        humidity: null,
        windspeed: null,
        description: 'Loading...',
        descriptionMR: 'Loading...',
        location: 'Getting location...',
        timestamp: Date.now()
    });
    const [userLocation, setUserLocation] = React.useState(null);

    // Get user's actual location and fetch weather
    React.useEffect(() => {
        const getLocationAndWeather = async () => {
            console.log('Starting geolocation and weather fetch...');
            
            if (navigator.geolocation) {
                console.log('Geolocation supported, requesting position...');
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        console.log('Got position:', lat, lon);
                        setUserLocation({ lat, lon });
                        
                        // Fetch real weather data
                        try {
                            const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '669bb3aebebfb11c8ba58b45a0efe970';
                            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                            console.log('Fetching weather from:', apiUrl);
                            
                            const response = await fetch(apiUrl);
                            console.log('Weather API response status:', response.status);
                            
                            if (response.ok) {
                                const data = await response.json();
                                console.log('Weather API data:', data);
                                console.log('Current time:', new Date());
                                console.log('API data time:', new Date(data.dt * 1000));
                                console.log('Sunrise:', new Date(data.sys.sunrise * 1000));
                                console.log('Sunset:', new Date(data.sys.sunset * 1000));
                                console.log('Current hour:', new Date().getHours());
                                console.log('Is nighttime?', new Date().getHours() >= 19 || new Date().getHours() <= 6);
                                
                                const weatherData = {
                                    temperature: Math.round(data.main.temp),
                                    humidity: data.main.humidity,
                                    windspeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                                    description: data.weather[0].description,
                                    descriptionMR: data.weather[0].description, // Keep in English for now
                                    location: data.name || `Your Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
                                    timestamp: Date.now(),
                                    apiTime: data.dt * 1000,
                                    sunrise: data.sys.sunrise * 1000,
                                    sunset: data.sys.sunset * 1000
                                };
                                
                                console.log('Setting weather data:', weatherData);
                                setWeather(weatherData);
                            } else {
                                console.error('Weather API error:', response.status, response.statusText);
                                setWeather(prev => ({
                                    ...prev,
                                    location: `Your Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
                                    description: 'Weather unavailable'
                                }));
                            }
                        } catch (error) {
                            console.error('Error fetching weather:', error);
                            setWeather(prev => ({
                                ...prev,
                                location: `Your Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
                                description: 'Weather unavailable'
                            }));
                        }
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        setWeather(prev => ({
                            ...prev,
                            location: 'Location unavailable',
                            description: 'Weather unavailable'
                        }));
                    }
                );
            } else {
                console.log('Geolocation not supported');
                setWeather(prev => ({
                    ...prev,
                    location: 'Geolocation not supported',
                    description: 'Weather unavailable'
                }));
            }
        };

        getLocationAndWeather();
    }, []);

    const weatherTranslations = {
        'clear sky': 'clear sky',
        'few clouds': 'few clouds',
        'scattered clouds': 'scattered clouds',
        'broken clouds': 'broken clouds',
        'shower rain': 'shower rain',
        'rain': 'rain',
        'thunderstorm': 'thunderstorm',
        'snow': 'snow',
        'mist': 'mist',
        'haze': 'haze',
        'overcast clouds': 'overcast clouds',
        'light rain': 'light rain',
        'moderate rain': 'moderate rain',
        'heavy intensity rain': 'heavy intensity rain'
    };

    const translateWeather = (desc) => {
        if (isEn) return desc;
        const lowerDesc = desc.toLowerCase();
        return weatherTranslations[lowerDesc] || desc;
    };

    const getWeatherIcon = () => {
        if (!weather || !weather.description) return <Sun size={64} color="#ffd54f" />;
        
        const currentHour = new Date().getHours();
        const isNighttime = currentHour >= 19 || currentHour <= 6;
        const description = weather.description.toLowerCase();
        
        // Night time icons
        if (isNighttime) {
            if (description.includes('rain') || description.includes('drizzle')) {
                return <CloudRain size={64} color="#6b7280" />;
            } else if (description.includes('snow')) {
                return <CloudSnow size={64} color="#e5e7eb" />;
            } else if (description.includes('cloud')) {
                return <Cloud size={64} color="#6b7280" />;
            } else {
                return <Moon size={64} color="#fbbf24" />;
            }
        }
        
        // Day time icons
        if (description.includes('rain') || description.includes('drizzle')) {
            return <CloudRain size={64} color="#3b82f6" />;
        } else if (description.includes('snow')) {
            return <CloudSnow size={64} color="#94a3b8" />;
        } else if (description.includes('cloud')) {
            return <Cloud size={64} color="#9ca3af" />;
        } else {
            return <Sun size={64} color="#ffd54f" />;
        }
    };

    const getRiskFactor = () => {
        if (!weather || weather.temperature === null || weather.humidity === null || weather.windspeed === null) {
            return { level: isEn ? 'Loading...' : 'Loading...', value: 0, color: '#6b7280' };
        }
        let score = 20; // Base score
        let tempPoints = 0;
        let humidityPoints = 0;
        let windPoints = 0;
        
        // Temperature risk
        if (weather.temperature > 38) {
            tempPoints = 45;
            score += 45;
        } else if (weather.temperature > 32) {
            tempPoints = 25;
            score += 25;
        }

        // Humidity risk
        if (weather.humidity > 85) {
            humidityPoints = 20;
            score += 20;
        } else if (weather.humidity > 70) {
            humidityPoints = 10;
            score += 10;
        }

        // Wind risk
        if (weather.windspeed > 25) {
            windPoints = 10;
            score += 10;
        } else if (weather.windspeed > 15) {
            windPoints = 5;
            score += 5;
        }

        console.log('Risk Assessment Calculation:');
        console.log('Base score: 20');
        console.log('Temperature risk:', weather.temperature, '°C ->', tempPoints, 'points');
        console.log('Humidity risk:', weather.humidity, '% ->', humidityPoints, 'points');
        console.log('Wind risk:', weather.windspeed, 'km/h ->', windPoints, 'points');
        console.log('Total score:', score);

        if (score >= 70) return { level: isEn ? 'Very High' : 'Very High', value: score, color: '#dc2626' };
        if (score >= 50) return { level: isEn ? 'High' : 'High', value: score, color: '#f97316' };
        if (score >= 30) return { level: isEn ? 'Moderate' : 'Moderate', value: score, color: '#eab308' };
        return { level: isEn ? 'Low' : 'Low', value: score, color: '#10b981' };
    };

    const diseaseRisk = getRiskFactor();

    const getRiskAnalysisDescription = () => {
        if (weather.temperature === null || weather.humidity === null || weather.windspeed === null) {
            return "Analyzing weather conditions...";
        }

        const descriptions = [];
        console.log('Generating risk analysis for:', { temperature: weather.temperature, humidity: weather.humidity, windspeed: weather.windspeed });
        
        // Temperature analysis
        if (weather.temperature > 35) {
            descriptions.push("High temperature increases heat stress risk");
        } else if (weather.temperature > 30) {
            descriptions.push("Moderate temperature - good for most crops");
        } else {
            descriptions.push("Comfortable temperature for crop growth");
        }
        
        // Humidity analysis
        if (weather.humidity > 80) {
            descriptions.push("High humidity promotes fungal diseases");
        } else if (weather.humidity > 60) {
            descriptions.push("Moderate humidity - monitor for diseases");
        } else if (weather.humidity < 30) {
            descriptions.push("Low humidity reduces disease risk significantly");
        } else {
            descriptions.push("Optimal humidity levels");
        }
        
        // Wind analysis
        if (weather.windspeed > 20) {
            descriptions.push("Strong winds may cause crop damage");
        } else if (weather.windspeed > 10) {
            descriptions.push("Moderate winds - good air circulation");
        } else {
            descriptions.push("Calm winds - ideal conditions");
        }
        
        // Overall assessment
        if (diseaseRisk.level === 'Low' || diseaseRisk.level === 'Loading...') {
            descriptions.push("Excellent conditions for farming activities");
        }
        
        const finalDescription = descriptions.join(". ");
        console.log('Generated description:', finalDescription);
        return finalDescription;
    };

    const getTTSText = () => {
        if (weather.temperature === null || weather.humidity === null || weather.windspeed === null) {
            return isEn ? "Loading weather data..." : "Loading weather data...";
        }
        
        let text = isEn
            ? `Current weather in ${weather.location}: ${weather.temperature}°C, ${weather.description}, humidity ${weather.humidity}%, wind speed ${weather.windspeed} km/h.`
            : `${weather.location} madhyal havaman ${weather.temperature}°C, ${weather.descriptionMR}, aaurti ${weather.humidity}%, vaayu veg ${weather.windspeed} km/h.`;
        text += diseaseRisk
            ? (isEn ? `Alert: ${diseaseRisk.level} risk detected.` : `Warning: ${diseaseRisk.level} risk detected.`)
            : (isEn ? "Weather conditions are normal." : "Havaman paristhiti normal aahe.");
        return text;
    };

    return (
        <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="app-shell home-shell" style={{ background: 'transparent' }}>
                <div style={{
                    background: isDarkMode ? '#111827' : 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                    width: '100%',
                    margin: '0 auto 40px',
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    border: isDarkMode ? '1px solid #374151' : 'none',
                    paddingBottom: '96px',
                    position: 'relative'
                }} className="pb-24">

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="season-chip bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm" style={{ margin: 0 }}>
                            {isEn ? 'Rabi Season - Feb 2026' : 'Rabi Season - Feb 2026'}
                        </div>
                        <TTSButton textToRead={getTTSText()} isDarkMode={isDarkMode} />
                    </div>

                    <div className="my-4">
                        <MarketTicker isEnglish={isEn} isDarkMode={isDarkMode} />
                    </div>

                    <div className="weather-card" style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', margin: '0 0 20px', padding: '20px', boxShadow: 'none', border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', background: isDarkMode ? '#1f2937' : 'transparent', borderRadius: '16px' }}>
                        {weather ? (
                            <>
                                <div className="weather-header">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={16} />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{weather.location}</span>
                                        </div>
                                        <div className="weather-temp">
                                            {weather.temperature !== null ? `${weather.temperature}°C` : 'Loading...'}
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', textTransform: 'capitalize' }}>
                                            {isEn ? weather.description : weather.descriptionMR}
                                        </div>
                                    </div>
                                    <div>
                                        {getWeatherIcon()}
                                    </div>
                                </div>

                                <div className="weather-details">
                                    <div className="detail-item">
                                        <Droplets size={20} color="#3b82f6" />
                                        <div>
                                            <div className="detail-label">{isEn ? 'Humidity' : 'Aaurti'}</div>
                                            <div className="detail-value">
                                                {weather.humidity !== null ? `${weather.humidity}%` : 'Loading...'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <Wind size={20} color="#10b981" />
                                        <div>
                                            <div className="detail-label">{isEn ? 'Wind Speed' : 'Vaayu Veg'}</div>
                                            <div className="detail-value">
                                                {weather.windspeed !== null ? `${weather.windspeed} km/h` : 'Loading...'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="risk-assessment">
                                    <div className="risk-header">
                                        <AlertTriangle size={20} color={diseaseRisk.color} />
                                        <span style={{ color: diseaseRisk.color, fontWeight: 600 }}>
                                            {isEn ? 'Risk Assessment' : 'Jokhim Mulankan'}
                                        </span>
                                    </div>
                                    <div className="risk-level" style={{ background: `${diseaseRisk.color}20`, color: diseaseRisk.color }}>
                                        {diseaseRisk.level} ({diseaseRisk.value}%)
                                    </div>
                                    {weather.temperature !== null && (
                                        <div style={{ 
                                            marginTop: '12px', 
                                            padding: '10px', 
                                            backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
                                            borderRadius: '6px',
                                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                                        }}>
                                            <div style={{ 
                                                fontSize: '13px', 
                                                fontWeight: 600, 
                                                color: isDarkMode ? '#d1d5db' : '#374151',
                                                marginBottom: '6px'
                                            }}>
                                                {isEn ? 'Detailed Analysis:' : 'Detailed Analysis:'}
                                            </div>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                                lineHeight: '1.4'
                                            }}>
                                                {getRiskAnalysisDescription()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', fontWeight: 700 }}>{isEn ? 'Loading weather...' : 'Loading weather...'}</div>
                        )}
                    </div>

                    {/* Weather Risk Analysis Button */}
                    <div className="weather-risk-card" style={{ 
                        color: isDarkMode ? '#f3f4f6' : '#1f2937', 
                        margin: '0 0 24px', 
                        padding: '24px', 
                        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
                        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                        background: isDarkMode ? '#1f2937' : '#ffffff', 
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }} onClick={() => setScreen('weather-risk-demo')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 6px rgba(46, 125, 50, 0.25)'
                                    }}>
                                        AI
                                    </div>
                                    <div>
                                        <h3 style={{ 
                                            margin: 0, 
                                            fontSize: '1.125rem', 
                                            fontWeight: '600', 
                                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                            lineHeight: '1.2'
                                        }}>
                                            {isEn ? 'Weather Risk Analysis' : 'Weather Risk Analysis'}
                                        </h3>
                                        <div style={{ 
                                            fontSize: '0.875rem', 
                                            color: isDarkMode ? '#9ca3af' : '#6b7280', 
                                            lineHeight: '1.4',
                                            marginTop: '4px'
                                        }}>
                                            {isEn 
                                                ? 'AI-powered disease, pest, and stress risk analysis with 5-day forecasting' 
                                                : 'AI-powered disease, pest, and stress risk analysis with 5-day forecasting'
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                                        color: 'white', 
                                        padding: '4px 12px', 
                                        borderRadius: '20px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
                                    }}>
                                        {isEn ? 'NEW' : 'NEW'}
                                    </span>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        background: isDarkMode ? '#374151' : '#f3f4f6', 
                                        color: isDarkMode ? '#d1d5db' : '#6b7280', 
                                        padding: '4px 12px', 
                                        borderRadius: '20px',
                                        fontWeight: '600'
                                    }}>
                                        {isEn ? 'AI Powered' : 'AI Powered'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #2E7D32, #4CAF50, #2E7D32)',
                            opacity: '0.8'
                        }} />
                    </div>

                    <div className="quick-actions">
                        <div className="action-card" onClick={() => setScreen('recommendations')}>
                            <Sprout size={24} color="#2E7D32" />
                            <div>
                                <div className="action-title">{isEn ? 'Crop Recommendations' : 'Crop Recommendations'}</div>
                                <div className="action-desc">{isEn ? 'Personalized suggestions' : 'Personalized suggestions'}</div>
                            </div>
                        </div>
                        <div className="action-card" onClick={() => setScreen('community')}>
                            <Users size={24} color="#3b82f6" />
                            <div>
                                <div className="action-title">{isEn ? 'Community' : 'Community'}</div>
                                <div className="action-desc">{isEn ? 'Farmer discussions' : 'Farmer discussions'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Motion.div>
        </>
    );
};

export default HomeScreen;
