import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown, 
    Droplets, 
    Wind, 
    Thermometer, 
    Shield, 
    Sprout,
    Calendar,
    MapPin,
    Cloud,
    Sun,
    Moon,
    Activity,
    BarChart3,
    PieChart,
    Target,
    Zap,
    Heart,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    ChevronRight,
    Filter,
    Search,
    Star,
    Award,
    Leaf,
    X
} from 'lucide-react';
import useWeatherRisk from '../hooks/useWeatherRisk';
import { enhancedCropData, getCropById, getCropsByCategory, getAllCropCategories, searchCrops } from '../enhancedCropData';

const EnhancedWeatherRiskDashboard = ({ 
    userLocation = { lat: 18.5204, lon: 73.8567 }, 
    initialCropType = 'general',
    isDarkMode = false,
    isEnglish = true
}) => {
    const [selectedCrop, setSelectedCrop] = useState(initialCropType);
    const [selectedView, setSelectedView] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCropSelector, setShowCropSelector] = useState(false);
    const [expandedRisk, setExpandedRisk] = useState(null);

    // Get real data from useWeatherRisk hook
    const { riskData, loading, error } = useWeatherRisk(userLocation, selectedCrop);

    // Debug: Log the risk data structure
    useEffect(() => {
        if (riskData) {
            console.log('Risk Data Structure:', riskData);
            console.log('Current Risk:', riskData.current);
            console.log('Current Risk Data:', riskData.current?.risk);
            console.log('Recommendations:', riskData.current?.risk?.recommendations);
        }
    }, [riskData]);

    const getRiskColor = (score) => {
        if (score >= 80) return '#dc2626'; // red
        if (score >= 60) return '#f97316'; // orange
        if (score >= 40) return '#eab308'; // yellow
        if (score >= 20) return '#84cc16'; // light green
        return '#22c55e'; // green
    };

    const getRiskGradient = (score) => {
        if (score >= 80) return 'linear-gradient(135deg, #dc2626, #ef4444)';
        if (score >= 60) return 'linear-gradient(135deg, #f97316, #fb923c)';
        if (score >= 40) return 'linear-gradient(135deg, #eab308, #facc15)';
        if (score >= 20) return 'linear-gradient(135deg, #84cc16, #22c55e)';
        return 'linear-gradient(135deg, #22c55e, #10b981)';
    };

    const getRiskIcon = (severity) => {
        switch (severity) {
            case 'critical': return <AlertTriangle size={20} color="#dc2626" />;
            case 'high': return <AlertTriangle size={20} color="#f97316" />;
            case 'moderate': return <AlertTriangle size={20} color="#eab308" />;
            case 'low': return <Shield size={20} color="#22c55e" />;
            default: return <Shield size={20} color="#6b7280" />;
        }
    };

    const getWeatherIcon = () => {
        if (!riskData?.current) return <Cloud size={24} color="#6b7280" />;
        
        const temp = riskData.current.temperature || 20;
        const description = riskData.current.description || '';
        const hour = new Date().getHours();
        const isNight = hour >= 18 || hour <= 6;
        
        if (description.toLowerCase().includes('rain')) {
            return <Cloud size={24} color="#3b82f6" />;
        } else if (description.toLowerCase().includes('clear') || description.toLowerCase().includes('sun')) {
            return isNight ? <Moon size={24} color="#fbbf24" /> : <Sun size={24} color="#fbbf24" />;
        } else if (description.toLowerCase().includes('cloud')) {
            return <Cloud size={24} color="#6b7280" />;
        } else {
            return <Sun size={24} color="#fbbf24" />;
        }
    };

    const getDiseaseDescription = (riskLevel) => {
        if (riskLevel >= 70) {
            return 'Critical disease conditions detected. Immediate action required to prevent crop damage.';
        } else if (riskLevel >= 50) {
            return 'High disease risk present. Monitor crops closely and consider preventive treatments.';
        } else if (riskLevel >= 30) {
            return 'Moderate disease risk. Keep monitoring weather conditions and crop health.';
        } else {
            return 'Low disease risk. Favorable conditions for crop health.';
        }
    };

    const getPestDescription = (riskLevel, pestType) => {
        if (riskLevel >= 70) {
            return `Critical ${pestType || 'pest'} activity detected. Immediate pest control measures recommended.`;
        } else if (riskLevel >= 50) {
            return `High ${pestType || 'pest'} activity risk. Check for signs of infestation and implement control measures.`;
        } else if (riskLevel >= 30) {
            return `Moderate ${pestType || 'pest'} risk. Regular monitoring recommended.`;
        } else {
            return 'Low pest activity risk. Favorable conditions for crop protection.';
        }
    };

    const getStressDescription = (riskLevel) => {
        if (riskLevel >= 70) {
            return 'Critical stress conditions detected. Crops may experience significant damage without intervention.';
        } else if (riskLevel >= 50) {
            return 'High stress risk. Consider irrigation and stress management practices.';
        } else if (riskLevel >= 30) {
            return 'Moderate stress conditions. Monitor crop health and environmental factors.';
        } else {
            return 'Low stress risk. Favorable conditions for crop growth.';
        }
    };

    const getRiskDescription = (riskType, riskLevel) => {
        switch (riskType) {
            case 'disease':
                return getDiseaseDescription(riskLevel);
            case 'pest':
                return getPestDescription(riskLevel, null);
            case 'stress':
                return getStressDescription(riskLevel);
            case 'irrigation':
                if (riskLevel >= 70) return 'Critical irrigation demand detected. Immediate watering required to prevent crop damage.';
                if (riskLevel >= 50) return 'High irrigation demand. Schedule watering accordingly.';
                if (riskLevel >= 30) return 'Moderate irrigation needs. Monitor soil moisture levels.';
                return 'Low irrigation needs. Conserve water resources.';
            case 'fertilizer':
                if (riskLevel >= 70) return 'Critical fertilizer risk. Avoid application - high burn damage risk.';
                if (riskLevel >= 50) return 'High fertilizer risk. Reduce application rate or avoid application.';
                if (riskLevel >= 30) return 'Moderate fertilizer conditions. Apply with caution.';
                return 'Low fertilizer risk. Good conditions for application.';
            case 'harvest':
                if (riskLevel >= 70) return 'Critical harvest conditions. Delay harvesting to prevent losses.';
                if (riskLevel >= 50) return 'High harvest risk. Consider delaying harvest operations.';
                if (riskLevel >= 30) return 'Moderate harvest conditions. Monitor weather before harvesting.';
                return 'Optimal harvest conditions. Good time for harvesting.';
            case 'storage':
                if (riskLevel >= 70) return 'Critical storage conditions. Poor storage environment expected.';
                if (riskLevel >= 50) return 'High storage risk. Take preventive measures for crop preservation.';
                if (riskLevel >= 30) return 'Moderate storage conditions. Monitor for spoilage.';
                return 'Good storage conditions. Minimal risk of spoilage.';
            case 'planting':
                if (riskLevel >= 70) return 'Critical planting conditions. Delay planting until conditions improve.';
                if (riskLevel >= 50) return 'High planting risk. Consider postponing planting activities.';
                if (riskLevel >= 30) return 'Moderate planting conditions. Monitor before planting.';
                return 'Excellent conditions for planting. Ideal time for sowing.';
            case 'spraying':
                if (riskLevel >= 70) return 'Critical spraying conditions. Avoid pesticide application due to high drift risk.';
                if (riskLevel >= 50) return 'High spraying risk. Avoid application - poor effectiveness expected.';
                if (riskLevel >= 30) return 'Moderate spraying conditions. Apply with caution and proper timing.';
                return 'Ideal spraying conditions. Maximum effectiveness with minimal drift.';
            case 'overall':
                if (riskLevel >= 70) return 'Critical overall risk. Multiple factors require immediate attention.';
                if (riskLevel >= 50) return 'High overall risk. Protective measures strongly recommended.';
                if (riskLevel >= 30) return 'Moderate overall risk. Monitor conditions closely.';
                return 'Low overall risk. Favorable conditions for farming activities.';
            default:
                return 'Risk analysis based on current weather conditions.';
        }
    };

    const generateFallbackRecommendations = () => {
        const temp = riskData?.current?.temperature || 25;
        const humidity = riskData?.current?.humidity || 60;
        const windSpeed = riskData?.current?.windSpeed || 10;
        
        const recommendations = [];
        
        // Temperature-based recommendations
        if (temp > 35) {
            recommendations.push('High temperature detected. Increase irrigation frequency and provide shade to crops.');
        } else if (temp < 15) {
            recommendations.push('Low temperature detected. Consider cold protection measures for sensitive crops.');
        } else {
            recommendations.push('Temperature is optimal for most crop activities.');
        }
        
        // Humidity-based recommendations
        if (humidity > 80) {
            recommendations.push('High humidity increases disease risk. Improve air circulation and monitor for fungal infections.');
        } else if (humidity < 30) {
            recommendations.push('Low humidity detected. Consider irrigation to maintain optimal soil moisture.');
        } else {
            recommendations.push('Humidity is optimal for crop growth.');
        }
        
        // Wind-based recommendations
        if (windSpeed > 20) {
            recommendations.push('Strong winds detected. Avoid pesticide spraying and consider windbreaks.');
        } else if (windSpeed < 5) {
            recommendations.push('Calm winds. Good conditions for pesticide application.');
        } else {
            recommendations.push('Wind speed is moderate for field operations.');
        }
        
        // Time-based recommendations
        const hour = new Date().getHours();
        if (hour >= 6 && hour <= 10) {
            recommendations.push('Morning hours - ideal for planting and field activities.');
        } else if (hour >= 11 && hour <= 15) {
            recommendations.push('Peak heat hours - minimize field work and stay hydrated.');
        } else if (hour >= 16 && hour <= 18) {
            recommendations.push('Evening hours - good for harvesting and field assessment.');
        }
        
        // Crop-specific recommendations
        if (currentCrop?.id === 'rice') {
            recommendations.push('Rice requires high water. Ensure adequate irrigation and monitor for water stress.');
        } else if (currentCrop?.id === 'wheat') {
            recommendations.push('Wheat stress risk detected. Monitor for rust and apply fungicides if needed.');
        } else if (currentCrop?.id === 'cotton') {
            recommendations.push('Cotton requires moderate humidity. Monitor for bollworm activity and spray accordingly.');
        } else if (currentCrop?.id === 'maize') {
            recommendations.push('Maize is drought-tolerant but requires adequate water during critical growth stages.');
        }
        
        // Add a general recommendation
        recommendations.push('Regular monitoring of crop health and weather conditions is essential for optimal yield.');
        
        return recommendations;
    };

    const filteredCrops = () => {
        let crops = enhancedCropData;
        
        if (selectedCategory !== 'all') {
            crops = getCropsByCategory(selectedCategory);
        }
        
        if (searchQuery) {
            crops = searchCrops(searchQuery);
        }
        
        return crops;
    };

    const currentCrop = getCropById(selectedCrop);

    if (loading) {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                background: isDarkMode ? '#1f2937' : '#ffffff',
                borderRadius: '16px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Activity size={32} className="animate-spin" />
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {isEnglish ? 'Loading weather data...' : 'Loading weather data...'}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>
                        {isEnglish ? 'Fetching real-time risk analysis' : 'Fetching real-time risk analysis'}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#ef4444',
                background: isDarkMode ? '#1f2937' : '#ffffff',
                borderRadius: '16px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <XCircle size={32} />
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {isEnglish ? 'Error loading weather data' : 'Error loading weather data'}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>
                        {error.message || 'Please check your connection'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            background: isDarkMode ? '#111827' : '#f8fafc',
            borderRadius: '20px',
            padding: '24px',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: getRiskGradient(riskData?.current?.risk?.overall || 0),
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                            {getWeatherIcon()}
                        </div>
                        <div>
                            <h1 style={{ 
                                margin: 0, 
                                fontSize: '24px', 
                                fontWeight: '700',
                                color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            }}>
                                {isEnglish ? 'Weather Risk Analysis' : 'Weather Risk Analysis'}
                            </h1>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontSize: '14px',
                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                            }}>
                                <MapPin size={16} />
                                <span>{riskData?.current?.location || 'Loading...'}</span>
                                <span>·</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowCropSelector(!showCropSelector)}
                        style={{
                            background: isDarkMode ? '#374151' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                            borderRadius: '12px',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: '600',
                            color: isDarkMode ? '#f3f4f6' : '#1f2937'
                        }}
                    >
                        <Sprout size={20} color={currentCrop?.color || '#22c55e'} />
                        <span>{currentCrop?.name || 'General'}</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Crop Selector */}
            {showCropSelector && (
                <div style={{
                    background: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '18px' }}>
                            {isEnglish ? 'Select Crop' : 'Select Crop'}
                        </h3>
                        <button
                            onClick={() => setShowCropSelector(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                        </button>
                    </div>
                    
                    {/* Search and Filter */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ 
                            flex: 1, 
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Search size={20} style={{ 
                                position: 'absolute', 
                                left: '12px',
                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                            }} />
                            <input
                                type="text"
                                placeholder={isEnglish ? 'Search crops...' : 'Search crops...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    borderRadius: '8px',
                                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                    background: isDarkMode ? '#374151' : '#f9fafb',
                                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                background: isDarkMode ? '#374151' : '#f9fafb',
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: '14px'
                            }}
                        >
                            <option value="all">{isEnglish ? 'All Categories' : 'All Categories'}</option>
                            {getAllCropCategories().map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Crop Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '12px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        {filteredCrops().map(crop => (
                            <button
                                key={crop.id}
                                onClick={() => {
                                    setSelectedCrop(crop.id);
                                    setShowCropSelector(false);
                                }}
                                style={{
                                    background: selectedCrop === crop.id 
                                        ? `${crop.color}20` 
                                        : isDarkMode ? '#374151' : '#f9fafb',
                                    border: selectedCrop === crop.id 
                                        ? `2px solid ${crop.color}` 
                                        : `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: crop.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}>
                                        {crop.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                            fontSize: '14px'
                                        }}>
                                            {crop.name}
                                        </div>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                                            opacity: 0.8
                                        }}>
                                            {crop.category}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    lineHeight: '1.3'
                                }}>
                                    {crop.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* View Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '24px',
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
                {['overview', 'detailed', 'forecast', 'recommendations'].map(view => (
                    <button
                        key={view}
                        onClick={() => setSelectedView(view)}
                        style={{
                            padding: '12px 20px',
                            background: selectedView === view 
                                ? (isDarkMode ? '#374151' : '#ffffff')
                                : 'transparent',
                            border: 'none',
                            borderBottom: selectedView === view 
                                ? `2px solid ${currentCrop?.color || '#22c55e'}` 
                                : '2px solid transparent',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: selectedView === view ? '600' : '500',
                            color: selectedView === view 
                                ? (isDarkMode ? '#f3f4f6' : '#1f2937')
                                : (isDarkMode ? '#9ca3af' : '#6b7280'),
                            fontSize: '14px'
                        }}
                    >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content based on selected view */}
            {selectedView === 'overview' && (
                <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Current Weather Card */}
                    <div style={{
                        background: isDarkMode ? '#1f2937' : '#ffffff',
                        padding: '24px',
                        borderRadius: '16px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ 
                                margin: 0, 
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: '18px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Activity size={20} color={currentCrop?.color || '#22c55e'} />
                                Current Weather Analysis
                            </h3>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                padding: '4px 12px',
                                background: '#10b98120',
                                border: '1px solid #10b98140',
                                borderRadius: '20px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    animation: 'pulse 2s infinite'
                                }} />
                                <span style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '600',
                                    color: '#10b981'
                                }}>
                                    REAL DATA
                                </span>
                            </div>
                        </div>
                        
                        {/* Data Source Info */}
                        <div style={{
                            background: isDarkMode ? '#374151' : '#f9fafb',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                fontSize: '12px',
                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                            }}>
                                <span>Source: {riskData?.current?.source || 'Loading...'}</span>
                                <span>Location: {riskData?.current?.location || 'Loading...'}</span>
                                <span>Updated: {riskData?.current?.timestamp ? new Date(riskData.current.timestamp).toLocaleTimeString() : 'Loading...'}</span>
                            </div>
                        </div>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                            gap: '20px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    marginBottom: '8px' 
                                }}>
                                    <Thermometer size={20} color="#f97316" />
                                    <span style={{ fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                        Temperature
                                    </span>
                                </div>
                                <div style={{ 
                                    fontSize: '28px', 
                                    fontWeight: 'bold', 
                                    color: isDarkMode ? '#f3f4f6' : '#1f2937' 
                                }}>
                                    {riskData?.current?.temperature || '--'}°C
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    marginBottom: '8px' 
                                }}>
                                    <Droplets size={20} color="#3b82f6" />
                                    <span style={{ fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                        Humidity
                                    </span>
                                </div>
                                <div style={{ 
                                    fontSize: '28px', 
                                    fontWeight: 'bold', 
                                    color: isDarkMode ? '#f3f4f6' : '#1f2937' 
                                }}>
                                    {riskData?.current?.humidity || '--'}%
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    marginBottom: '8px' 
                                }}>
                                    <Wind size={20} color="#10b981" />
                                    <span style={{ fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                        Wind Speed
                                    </span>
                                </div>
                                <div style={{ 
                                    fontSize: '28px', 
                                    fontWeight: 'bold', 
                                    color: isDarkMode ? '#f3f4f6' : '#1f2937' 
                                }}>
                                    {riskData?.current?.windSpeed || '--'} km/h
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    marginBottom: '8px' 
                                }}>
                                    <AlertTriangle size={20} color="#f59e0b" />
                                    <span style={{ fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                        Risk Level
                                    </span>
                                </div>
                                <div style={{ 
                                    fontSize: '28px', 
                                    fontWeight: 'bold', 
                                    color: getRiskColor(riskData?.current?.risk?.overall || 0) 
                                }}>
                                    {riskData?.current?.risk?.overall || '--'}%
                                </div>
                            </div>
                        </div>
                        
                        {/* Crop-Specific Information */}
                        {currentCrop && (
                            <div style={{
                                background: isDarkMode ? '#374151' : '#f9fafb',
                                padding: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${currentCrop.color}40`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: currentCrop.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                    }}>
                                        {currentCrop.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                            fontSize: '16px'
                                        }}>
                                            {currentCrop.name} ({currentCrop.scientificName})
                                        </div>
                                        <div style={{ 
                                            fontSize: '14px', 
                                            color: isDarkMode ? '#9ca3af' : '#6b7280' 
                                        }}>
                                            {currentCrop.category} · {currentCrop.growingSeason.join(', ')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: '14px', 
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    lineHeight: '1.5'
                                }}>
                                    {currentCrop.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Risk Overview Cards */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {/* Disease Risk */}
                        <div style={{
                            background: isDarkMode ? '#1f2937' : '#ffffff',
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(220, 38, 38, 0.25)'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                                        Disease Risk
                                    </h4>
                                    <div style={{ 
                                        fontSize: '24px', 
                                        fontWeight: 'bold', 
                                        color: '#dc2626' 
                                    }}>
                                        {riskData?.current?.risk?.disease?.overall || 0}%
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                background: '#dc262620',
                                height: '8px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    width: `${riskData?.current?.risk?.disease?.overall || 0}%`,
                                    height: '100%',
                                    background: '#dc2626',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            <div style={{ 
                                fontSize: '14px', 
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                lineHeight: '1.4'
                            }}>
                                <strong>Type:</strong> {riskData?.current?.risk?.disease?.type || 'Unknown'}<br />
                                <strong>Severity:</strong> {riskData?.current?.risk?.disease?.severity || 'Low'}<br />
                                <strong>Description:</strong> {getDiseaseDescription(riskData?.current?.risk?.disease?.overall || 0)}
                            </div>
                        </div>

                        {/* Pest Risk */}
                        <div style={{
                            background: isDarkMode ? '#1f2937' : '#ffffff',
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(249, 115, 22, 0.25)'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                                        Pest Risk
                                    </h4>
                                    <div style={{ 
                                        fontSize: '24px', 
                                        fontWeight: 'bold', 
                                        color: '#f97316' 
                                    }}>
                                        {riskData?.current?.risk?.pest?.overall || 0}%
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                background: '#f9731620',
                                height: '8px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    width: `${riskData?.current?.risk?.pest?.overall || 0}%`,
                                    height: '100%',
                                    background: '#f97316',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            <div style={{ 
                                fontSize: '14px', 
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                lineHeight: '1.4'
                            }}>
                                <strong>Pest Type:</strong> {riskData?.current?.risk?.pest?.pestType || 'Unknown'}<br />
                                <strong>Severity:</strong> {riskData?.current?.risk?.pest?.severity || 'Low'}<br />
                                <strong>Description:</strong> {getPestDescription(riskData?.current?.risk?.pest?.overall || 0, riskData?.current?.risk?.pest?.pestType)}
                            </div>
                        </div>

                        {/* Stress Risk */}
                        <div style={{
                            background: isDarkMode ? '#1f2937' : '#ffffff',
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #eab308, #facc15)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(234, 179, 8, 0.25)'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                                        Stress Risk
                                    </h4>
                                    <div style={{ 
                                        fontSize: '24px', 
                                        fontWeight: 'bold', 
                                        color: '#eab308' 
                                    }}>
                                        {riskData?.current?.risk?.stress?.overall || 0}%
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                background: '#eab30820',
                                height: '8px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    width: `${riskData?.current?.risk?.stress?.overall || 0}%`,
                                    height: '100%',
                                    background: '#eab308',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            <div style={{ 
                                fontSize: '14px', 
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                lineHeight: '1.4'
                            }}>
                                <strong>Severity:</strong> {riskData?.current?.risk?.stress?.severity || 'Low'}<br />
                                <strong>Factors:</strong> {(riskData?.current?.risk?.stress?.factors || []).join(', ') || 'None'}<br />
                                <strong>Description:</strong> {getStressDescription(riskData?.current?.risk?.stress?.overall || 0)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Risk Analysis View */}
            {selectedView === 'detailed' && (
                <div style={{ display: 'grid', gap: '24px' }}>
                    <div style={{
                        background: isDarkMode ? '#1f2937' : '#ffffff',
                        padding: '24px',
                        borderRadius: '16px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}>
                        <h3 style={{ 
                            margin: '0 0 20px 0', 
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <BarChart3 size={20} color={currentCrop?.color || '#22c55e'} />
                            Comprehensive Risk Analysis (10 Parameters)
                        </h3>
                        
                        {/* All 10 Risk Parameters */}
                        {[
                            { id: 'disease', name: 'Disease Risk', color: '#dc2626', icon: AlertTriangle },
                            { id: 'pest', name: 'Pest Risk', color: '#f97316', icon: AlertTriangle },
                            { id: 'stress', name: 'Stress Risk', color: '#eab308', icon: AlertTriangle },
                            { id: 'irrigation', name: 'Irrigation Risk', color: '#3b82f6', icon: Droplets },
                            { id: 'fertilizer', name: 'Fertilizer Risk', color: '#10b981', icon: Leaf },
                            { id: 'harvest', name: 'Harvest Risk', color: '#f59e0b', icon: Target },
                            { id: 'storage', name: 'Storage Risk', color: '#8b5cf6', icon: Shield },
                            { id: 'planting', name: 'Planting Risk', color: '#06b6d4', icon: Sprout },
                            { id: 'spraying', name: 'Spraying Risk', color: '#ef4444', icon: Wind },
                            { id: 'overall', name: 'Overall Risk', color: '#64748b', icon: PieChart }
                        ].map((risk, index) => (
                            <div key={risk.id} style={{
                                background: `${risk.color}10`,
                                padding: '20px',
                                borderRadius: '12px',
                                border: `1px solid ${risk.color}30`,
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: risk.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <risk.icon size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ 
                                            margin: 0, 
                                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            {index + 1}. {risk.name}
                                        </h4>
                                        <div style={{ 
                                            fontSize: '24px', 
                                            fontWeight: 'bold', 
                                            color: risk.color 
                                        }}>
                                            {riskData?.current?.risk?.[risk.id]?.overall || 0}%
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    background: `${risk.color}20`,
                                    height: '8px',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        width: `${riskData?.current?.risk?.[risk.id]?.overall || 0}%`,
                                        height: '100%',
                                        background: risk.color,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <div style={{ 
                                    fontSize: '14px', 
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    lineHeight: '1.4'
                                }}>
                                    <strong>Severity:</strong> {riskData?.current?.risk?.[risk.id]?.severity || 'Low'}<br />
                                    <strong>Factors:</strong> {(riskData?.current?.risk?.[risk.id]?.factors || []).join(', ') || 'Normal conditions'}<br />
                                    <strong>Description:</strong> {getRiskDescription(risk.id, riskData?.current?.risk?.[risk.id]?.overall || 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Forecast View */}
            {selectedView === 'forecast' && (
                <div style={{ display: 'grid', gap: '24px' }}>
                    <div style={{
                        background: isDarkMode ? '#1f2937' : '#ffffff',
                        padding: '24px',
                        borderRadius: '16px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}>
                        <h3 style={{ 
                            margin: '0 0 20px 0', 
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Calendar size={20} color={currentCrop?.color || '#22c55e'} />
                            5-Day Risk Forecast
                        </h3>
                        
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {riskData?.forecast?.forecast?.slice(0, 5).map((day, index) => (
                                <div key={index} style={{
                                    background: isDarkMode ? '#374151' : '#f9fafb',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                                {day.temperature}°C · {day.humidity}% · {day.windSpeed} km/h
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: getRiskGradient(day.risk || 0),
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            {day.risk || 0}%
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                <div style={{ textAlign: 'center', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                    Forecast data not available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations View */}
            {selectedView === 'recommendations' && (
                <div style={{ display: 'grid', gap: '24px' }}>
                    <div style={{
                        background: isDarkMode ? '#1f2937' : '#ffffff',
                        padding: '24px',
                        borderRadius: '16px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}>
                        <h3 style={{ 
                            margin: '0 0 20px 0', 
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Info size={20} color={currentCrop?.color || '#22c55e'} />
                            Smart Recommendations for {currentCrop?.name || 'General'}
                        </h3>
                        
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {riskData?.current?.risk?.recommendations?.map((rec, index) => (
                                <div key={index} style={{
                                    background: isDarkMode ? '#374151' : '#f9fafb',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <CheckCircle size={20} color="#10b981" style={{ marginTop: '2px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontWeight: '600', 
                                                color: isDarkMode ? '#f3f4f4f6' : '#1f2937',
                                                marginBottom: '4px'
                                            }}>
                                                {rec}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                <div style={{ textAlign: 'center', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                                        No recommendations available
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.7 }}>
                                        Check back soon for personalized recommendations
                                    </div>
                                </div>
                            )}
                            
                            {/* Fallback recommendations if data is missing */}
                            {(!riskData?.current?.risk?.recommendations || riskData?.current?.risk?.recommendations?.length === 0) && (
                                <div style={{ textAlign: 'center', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                                        Smart Recommendations
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
                                        Based on current weather conditions for {currentCrop?.name || 'your crops'}
                                    </div>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {generateFallbackRecommendations().map((rec, index) => (
                                            <div key={index} style={{
                                                background: isDarkMode ? '#374151' : '#f9fafb',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                    <CheckCircle size={20} color="#10b981" style={{ marginTop: '2px' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ 
                                                            fontWeight: '600', 
                                                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {rec}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedWeatherRiskDashboard;
