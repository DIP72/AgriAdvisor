import React, { useState, useEffect } from 'react';
import EnhancedWeatherRiskDashboard from './EnhancedWeatherRiskDashboard';
import useWeatherRisk from '../hooks/useWeatherRisk';
import '../styles/WeatherRiskDemo.css';

const WeatherRiskDemo = () => {
    const [userLocation, setUserLocation] = useState({ lat: 18.5204, lon: 73.8567 });
    const [cropType, setCropType] = useState('rice');
    const [showDashboard, setShowDashboard] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('Getting your location...');
    const [selectedCrop, setSelectedCrop] = useState('rice');
    const [locationError, setLocationError] = useState(null);

    // Get user's actual location on component mount
    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        setUserLocation({ lat, lon });
                        setSelectedLocation(`Your Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
                        console.log('Got user location:', lat, lon);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        setLocationError('Unable to get your location. Using default Pune location.');
                        setSelectedLocation('Pune, Maharashtra (Default)');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                setLocationError('Geolocation not supported by your browser. Using default Pune location.');
                setSelectedLocation('Pune, Maharashtra (Default)');
            }
        };

        getLocation();
    }, []);

    const crops = ['rice', 'wheat', 'cotton', 'maize'];

    // Use the fixed useWeatherRisk hook
    const { riskData, alerts, loading, error, connected, activeAlertsCount } = useWeatherRisk(userLocation, cropType);

    if (showDashboard) {
        return (
            <div className="weather-risk-demo">
                <div className="demo-header">
                    <button onClick={() => setShowDashboard(false)} className="back-btn">
                        Back to Demo
                    </button>
                    <h2>Weather Risk Dashboard</h2>
                </div>
                <EnhancedWeatherRiskDashboard 
                    userLocation={userLocation} 
                    initialCropType={cropType}
                    isDarkMode={false}
                    isEnglish={true}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1>Weather Risk Analysis</h1>
                <p>Real-time agricultural risk intelligence for your location</p>
            </div>

            <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '10px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <div style={{ 
                        display: 'inline-block', 
                        padding: '5px 15px', 
                        backgroundColor: '#22c55e', 
                        color: 'white', 
                        borderRadius: '20px',
                        fontSize: '14px'
                    }}>
                        Connected
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Your Location</h3>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0284c7' }}>
                            {selectedLocation}
                        </div>
                        {locationError && (
                            <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>
                                {locationError}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Select Crop Type</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                        {crops.map((crop) => (
                            <button
                                key={crop}
                                onClick={() => setSelectedCrop(crop)}
                                style={{
                                    padding: '10px',
                                    backgroundColor: selectedCrop === crop ? '#2E7D32' : '#e5e7eb',
                                    color: selectedCrop === crop ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                {crop.charAt(0).toUpperCase() + crop.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                        onClick={() => setShowDashboard(true)}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: '#2E7D32',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        View Full Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeatherRiskDemo;
