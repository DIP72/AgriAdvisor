import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle, BarChart3, PieChart, Activity, Calendar, Clock, Award } from 'lucide-react';

const PerformanceMetricsDashboard = ({ 
    riskData, 
    historicalData, 
    yieldPredictions, 
    costSavings, 
    userLocation, 
    cropType, 
    isDarkMode, 
    isEnglish 
}) => {
    const [metrics, setMetrics] = useState({});
    const [timeRange, setTimeRange] = useState('30days');
    const [isLoading, setIsLoading] = useState(false);

    // Calculate comprehensive performance metrics
    const calculateMetrics = useCallback(() => {
        if (!historicalData || historicalData.length === 0) return {};

        const days = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
        const relevantData = historicalData.slice(-days);

        // Risk metrics
        const riskMetrics = {
            averageRisk: Math.round(relevantData.reduce((sum, d) => sum + d.risks.overall, 0) / relevantData.length),
            peakRisk: Math.max(...relevantData.map(d => d.risks.overall)),
            lowRiskDays: relevantData.filter(d => d.risks.overall < 30).length,
            moderateRiskDays: relevantData.filter(d => d.risks.overall >= 30 && d.risks.overall <= 60).length,
            highRiskDays: relevantData.filter(d => d.risks.overall > 60).length,
            riskTrend: calculateTrend(relevantData.map(d => d.risks.overall))
        };

        // Weather metrics
        const weatherMetrics = {
            averageTemp: Math.round(relevantData.reduce((sum, d) => sum + d.temperature, 0) / relevantData.length * 10) / 10,
            averageHumidity: Math.round(relevantData.reduce((sum, d) => sum + d.humidity, 0) / relevantData.length),
            totalRainfall: Math.round(relevantData.reduce((sum, d) => sum + d.rainfall, 0) * 10) / 10,
            averageWindSpeed: Math.round(relevantData.reduce((sum, d) => sum + d.windSpeed, 0) / relevantData.length * 10) / 10,
            extremeWeatherDays: relevantData.filter(d => d.temperature > 35 || d.temperature < 10 || d.windSpeed > 25).length
        };

        // Yield metrics
        const yieldMetrics = yieldPredictions ? {
            currentYield: yieldPredictions.current?.predictedYield || 0,
            baseYield: yieldPredictions.current?.baseYield || 0,
            yieldVariation: yieldPredictions.current?.yieldVariation || 0,
            yieldRating: yieldPredictions.current?.rating || 'fair',
            seasonalForecast: yieldPredictions.seasonal || []
        } : {};

        // Cost metrics
        const costMetrics = costSavings ? {
            currentCosts: costSavings.totalSavings?.current || 0,
            optimizedCosts: costSavings.totalSavings?.optimized || 0,
            potentialSavings: costSavings.totalSavings?.saved || 0,
            roi: costSavings.roi?.roiPercent || 0,
            efficiency: costSavings.roi?.efficiency || 'fair',
            recommendations: costSavings.recommendations || []
        } : {};

        // Performance score (0-100)
        const performanceScore = calculatePerformanceScore(riskMetrics, yieldMetrics, costMetrics);

        // Alert metrics
        const alertMetrics = {
            totalAlerts: relevantData.filter(d => d.risks.overall > 50).length,
            criticalAlerts: relevantData.filter(d => d.risks.overall > 70).length,
            alertFrequency: (relevantData.filter(d => d.risks.overall > 50).length / relevantData.length) * 100,
            responseRate: 85 // Simulated response rate to alerts
        };

        return {
            risk: riskMetrics,
            weather: weatherMetrics,
            yield: yieldMetrics,
            cost: costMetrics,
            performance: {
                score: performanceScore,
                rating: getPerformanceRating(performanceScore),
                trend: calculateOverallTrend(riskMetrics, yieldMetrics, costMetrics)
            },
            alerts: alertMetrics,
            period: timeRange,
            daysAnalyzed: relevantData.length
        };
    }, [historicalData, timeRange, yieldPredictions, costSavings]);

    // Calculate trend direction
    const calculateTrend = (values) => {
        if (values.length < 2) return 'stable';
        
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (change > 5) return 'improving';
        if (change < -5) return 'declining';
        return 'stable';
    };

    // Calculate overall trend
    const calculateOverallTrend = (risk, yieldData, cost) => {
        const riskTrend = risk.riskTrend === 'declining' ? 1 : risk.riskTrend === 'stable' ? 0 : -1;
        const yieldTrend = yieldData.yieldVariation > 0 ? 1 : yieldData.yieldVariation < -10 ? -1 : 0;
        const costTrend = cost.potentialSavings > 0 ? 1 : cost.potentialSavings < -50 ? -1 : 0;
        
        const total = riskTrend + yieldTrend + costTrend;
        
        if (total > 1) return 'improving';
        if (total < -1) return 'declining';
        return 'stable';
    };

    // Calculate performance score
    const calculatePerformanceScore = (risk, yieldData, cost) => {
        let score = 50; // Base score

        // Risk component (40% weight)
        const riskScore = 100 - risk.averageRisk;
        score += (riskScore * 0.4);

        // Yield component (35% weight)
        const yieldScore = yieldData.yieldVariation > -10 ? Math.min(100, 100 + yieldData.yieldVariation) : Math.max(0, 100 + yieldData.yieldVariation);
        score += ((yieldScore - 50) * 0.35);

        // Cost component (25% weight)
        const costScore = cost.roi > 0 ? Math.min(100, 50 + cost.roi) : Math.max(0, 50 + cost.roi);
        score += ((costScore - 50) * 0.25);

        return Math.round(Math.max(0, Math.min(100, score)));
    };

    // Get performance rating
    const getPerformanceRating = (score) => {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 55) return 'fair';
        if (score >= 40) return 'poor';
        return 'critical';
    };

    // Initialize metrics
    useEffect(() => {
        setIsLoading(true);
        try {
            const calculatedMetrics = calculateMetrics();
            setMetrics(calculatedMetrics);
        } catch (error) {
            console.error('Error calculating metrics:', error);
        } finally {
            setIsLoading(false);
        }
    }, [calculateMetrics]);

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'improving': return <TrendingUp size={16} color="#10b981" />;
            case 'declining': return <TrendingDown size={16} color="#ef4444" />;
            default: return <Activity size={16} color="#6b7280" />;
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 55) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: isDarkMode ? '#9ca3af' : '#6b7280' 
            }}>
                <div>Loading performance metrics...</div>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '20px', 
            background: isDarkMode ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h2 style={{ 
                    margin: 0, 
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    fontSize: '20px',
                    fontWeight: '600'
                }}>
                    {isEnglish ? 'Performance Metrics Dashboard' : 'Performance Metrics Dashboard'}
                </h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                            background: isDarkMode ? '#374151' : '#ffffff',
                            color: isDarkMode ? '#f3f4f6' : '#1f2937'
                        }}
                    >
                        <option value="7days">{isEnglish ? 'Last 7 Days' : 'Last 7 Days'}</option>
                        <option value="14days">{isEnglish ? 'Last 14 Days' : 'Last 14 Days'}</option>
                        <option value="30days">{isEnglish ? 'Last 30 Days' : 'Last 30 Days'}</option>
                    </select>
                    <div style={{ 
                        fontSize: '12px', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280' 
                    }}>
                        {isEnglish ? `Analyzing ${metrics.daysAnalyzed} days` : `Analyzing ${metrics.daysAnalyzed} days`}
                    </div>
                </div>
            </div>

            {/* Performance Score Card */}
            <div style={{
                background: `linear-gradient(135deg, ${getScoreColor(metrics.performance?.score || 50)}20, ${getScoreColor(metrics.performance?.score || 50)}10)`,
                border: `2px solid ${getScoreColor(metrics.performance?.score || 50)}`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Award size={32} color={getScoreColor(metrics.performance?.score || 50)} />
                    <div>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: getScoreColor(metrics.performance?.score || 50) }}>
                            {metrics.performance?.score || 0}
                        </div>
                        <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                            {isEnglish ? 'Performance Score' : 'Performance Score'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {getTrendIcon(metrics.performance?.trend)}
                    <span style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        textTransform: 'capitalize'
                    }}>
                        {metrics.performance?.trend} - {metrics.performance?.rating}
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px',
                marginBottom: '24px'
            }}>
                {/* Risk Metrics */}
                <div style={{
                    background: isDarkMode ? '#374151' : '#f9fafb',
                    padding: '20px',
                    borderRadius: '10px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <AlertTriangle size={20} color="#f59e0b" />
                        <h3 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                            {isEnglish ? 'Risk Analysis' : 'Risk Analysis'}
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Average Risk' : 'Average Risk'}
                            </span>
                            <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {metrics.risk?.averageRisk || 0}%
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'High Risk Days' : 'High Risk Days'}
                            </span>
                            <span style={{ fontWeight: '600', color: '#ef4444' }}>
                                {metrics.risk?.highRiskDays || 0}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Risk Trend' : 'Risk Trend'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {getTrendIcon(metrics.risk?.riskTrend)}
                                <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                    {metrics.risk?.riskTrend}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Yield Metrics */}
                <div style={{
                    background: isDarkMode ? '#374151' : '#f9fafb',
                    padding: '20px',
                    borderRadius: '10px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Target size={20} color="#10b981" />
                        <h3 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                            {isEnglish ? 'Yield Performance' : 'Yield Performance'}
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Predicted Yield' : 'Predicted Yield'}
                            </span>
                            <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {metrics.yield?.currentYield || 0} tons/ha
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Yield Variation' : 'Yield Variation'}
                            </span>
                            <span style={{ 
                                fontWeight: '600', 
                                color: (metrics.yield?.yieldVariation || 0) > 0 ? '#10b981' : '#ef4444'
                            }}>
                                {metrics.yield?.yieldVariation > 0 ? '+' : ''}{metrics.yield?.yieldVariation || 0}%
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Yield Rating' : 'Yield Rating'}
                            </span>
                            <span style={{ 
                                fontWeight: '600', 
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                textTransform: 'capitalize'
                            }}>
                                {metrics.yield?.yieldRating || 'fair'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cost Metrics */}
                <div style={{
                    background: isDarkMode ? '#374151' : '#f9fafb',
                    padding: '20px',
                    borderRadius: '10px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <DollarSign size={20} color="#3b82f6" />
                        <h3 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                            {isEnglish ? 'Cost Analysis' : 'Cost Analysis'}
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Potential Savings' : 'Potential Savings'}
                            </span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>
                                {formatCurrency(metrics.cost?.potentialSavings || 0)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'ROI' : 'ROI'}
                            </span>
                            <span style={{ 
                                fontWeight: '600', 
                                color: (metrics.cost?.roi || 0) > 0 ? '#10b981' : '#ef4444'
                            }}>
                                {(metrics.cost?.roi || 0)}%
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Efficiency' : 'Efficiency'}
                            </span>
                            <span style={{ 
                                fontWeight: '600', 
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                textTransform: 'capitalize'
                            }}>
                                {metrics.cost?.efficiency || 'fair'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Weather Metrics */}
                <div style={{
                    background: isDarkMode ? '#374151' : '#f9fafb',
                    padding: '20px',
                    borderRadius: '10px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Calendar size={20} color="#8b5cf6" />
                        <h3 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                            {isEnglish ? 'Weather Summary' : 'Weather Summary'}
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Avg Temperature' : 'Avg Temperature'}
                            </span>
                            <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {metrics.weather?.averageTemp || 0}°C
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Total Rainfall' : 'Total Rainfall'}
                            </span>
                            <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {metrics.weather?.totalRainfall || 0}mm
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                {isEnglish ? 'Extreme Weather' : 'Extreme Weather'}
                            </span>
                            <span style={{ fontWeight: '600', color: '#ef4444' }}>
                                {metrics.weather?.extremeWeatherDays || 0} days
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {metrics.cost?.recommendations && metrics.cost.recommendations.length > 0 && (
                <div style={{
                    background: isDarkMode ? '#374151' : '#f9fafb',
                    padding: '20px',
                    borderRadius: '10px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                    <h3 style={{ 
                        margin: '0 0 16px 0', 
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        {isEnglish ? 'Top Recommendations' : 'Top Recommendations'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {metrics.cost.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} style={{
                                padding: '12px',
                                background: isDarkMode ? '#1f2937' : '#ffffff',
                                borderRadius: '8px',
                                borderLeft: `3px solid ${rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#1f2937', marginBottom: '4px' }}>
                                            {rec.title}
                                        </div>
                                        <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                            {rec.description}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {rec.potentialSavings && (
                                            <div style={{ fontWeight: '600', color: '#10b981', fontSize: '14px' }}>
                                                {formatCurrency(rec.potentialSavings)}
                                            </div>
                                        )}
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                                            textTransform: 'capitalize'
                                        }}>
                                            {rec.priority}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceMetricsDashboard;
