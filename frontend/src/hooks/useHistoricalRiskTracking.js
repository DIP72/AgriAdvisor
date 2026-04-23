import { useState, useEffect, useCallback } from 'react';

const useHistoricalRiskTracking = (userLocation, cropType) => {
    const [historicalData, setHistoricalData] = useState([]);
    const [riskTrends, setRiskTrends] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize with sample data (in production, this would come from backend API)
    const generateSampleHistoricalData = useCallback(() => {
        const data = [];
        const today = new Date();
        
        // Generate last 30 days of data
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Generate realistic weather patterns
            const baseTemp = 25 + Math.sin(i * 0.2) * 10; // Seasonal variation
            const temp = baseTemp + (Math.random() - 0.5) * 8;
            const humidity = 60 + Math.sin(i * 0.3) * 20 + (Math.random() - 0.5) * 15;
            const windSpeed = 10 + Math.random() * 15;
            const rainfall = Math.random() > 0.7 ? Math.random() * 20 : 0;
            
            // Calculate risk scores based on weather
            const diseaseRisk = calculateDiseaseRisk(temp, humidity, rainfall);
            const pestRisk = calculatePestRisk(temp, humidity, windSpeed);
            const stressRisk = calculateStressRisk(temp, humidity, rainfall);
            const overallRisk = Math.max(diseaseRisk, pestRisk, stressRisk);
            
            data.push({
                date: date.toISOString().split('T')[0],
                temperature: Math.round(temp * 10) / 10,
                humidity: Math.round(humidity),
                windSpeed: Math.round(windSpeed * 10) / 10,
                rainfall: Math.round(rainfall * 10) / 10,
                risks: {
                    disease: diseaseRisk,
                    pest: pestRisk,
                    stress: stressRisk,
                    overall: overallRisk
                },
                cropType: cropType || 'general'
            });
        }
        
        return data;
    }, [cropType]);

    // Calculate disease risk based on weather conditions
    const calculateDiseaseRisk = (temp, humidity, rainfall) => {
        let risk = 0;
        
        // High humidity increases disease risk
        if (humidity > 80) risk += 40;
        else if (humidity > 60) risk += 20;
        
        // Moderate temperatures favor disease development
        if (temp >= 20 && temp <= 30) risk += 30;
        else if (temp >= 15 && temp <= 35) risk += 15;
        
        // Rainfall promotes fungal diseases
        if (rainfall > 10) risk += 30;
        else if (rainfall > 5) risk += 15;
        
        return Math.min(100, risk);
    };

    // Calculate pest risk based on weather conditions
    const calculatePestRisk = (temp, humidity, windSpeed) => {
        let risk = 0;
        
        // Warm temperatures increase pest activity
        if (temp >= 25 && temp <= 35) risk += 35;
        else if (temp >= 20 && temp <= 40) risk += 20;
        
        // Moderate humidity favors pest reproduction
        if (humidity >= 50 && humidity <= 70) risk += 25;
        else if (humidity >= 40 && humidity <= 80) risk += 15;
        
        // Low wind allows pests to settle
        if (windSpeed < 10) risk += 20;
        else if (windSpeed < 20) risk += 10;
        
        return Math.min(100, risk);
    };

    // Calculate stress risk based on weather conditions
    const calculateStressRisk = (temp, humidity, rainfall) => {
        let risk = 0;
        
        // Extreme temperatures cause stress
        if (temp > 35) risk += 50;
        else if (temp > 30) risk += 25;
        else if (temp < 15) risk += 30;
        else if (temp < 10) risk += 45;
        
        // Low humidity causes drought stress
        if (humidity < 30) risk += 35;
        else if (humidity < 40) risk += 20;
        
        // Lack of rainfall causes water stress
        if (rainfall < 1) risk += 30;
        else if (rainfall < 5) risk += 15;
        
        return Math.min(100, risk);
    };

    // Analyze risk trends
    const analyzeRiskTrends = useCallback((data) => {
        if (data.length < 7) return [];

        const trends = [];
        const riskTypes = ['disease', 'pest', 'stress', 'overall'];
        
        riskTypes.forEach(riskType => {
            const recentData = data.slice(7); // Last 7 days
            const olderData = data.slice(14, 7); // Previous 7 days
            
            const recentAvg = recentData.reduce((sum, day) => sum + day.risks[riskType], 0) / recentData.length;
            const olderAvg = olderData.reduce((sum, day) => sum + day.risks[riskType], 0) / olderData.length;
            
            const change = recentAvg - olderAvg;
            const changePercent = olderAvg > 0 ? (change / olderAvg) * 100 : 0;
            
            let trend = 'stable';
            if (changePercent > 10) trend = 'increasing';
            else if (changePercent < -10) trend = 'decreasing';
            
            trends.push({
                type: riskType,
                current: Math.round(recentAvg),
                previous: Math.round(olderAvg),
                change: Math.round(change),
                changePercent: Math.round(changePercent),
                trend: trend,
                direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
            });
        });
        
        return trends;
    }, []);

    // Identify weather patterns
    const identifyPatterns = useCallback((data) => {
        if (data.length < 14) return [];

        const patterns = [];
        
        // Weekly patterns
        const weeklyAverages = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        dayNames.forEach((day, index) => {
            const dayData = data.filter(d => new Date(d.date).getDay() === index);
            if (dayData.length > 0) {
                weeklyAverages[day] = {
                    avgRisk: dayData.reduce((sum, d) => sum + d.risks.overall, 0) / dayData.length,
                    avgTemp: dayData.reduce((sum, d) => sum + d.temperature, 0) / dayData.length,
                    avgHumidity: dayData.reduce((sum, d) => sum + d.humidity, 0) / dayData.length,
                    count: dayData.length
                };
            }
        });
        
        // Find highest and lowest risk days
        let highestRiskDay = null;
        let lowestRiskDay = null;
        
        Object.entries(weeklyAverages).forEach(([day, data]) => {
            if (!highestRiskDay || data.avgRisk > highestRiskDay.avgRisk) {
                highestRiskDay = { day, ...data };
            }
            if (!lowestRiskDay || data.avgRisk < lowestRiskDay.avgRisk) {
                lowestRiskDay = { day, ...data };
            }
        });
        
        if (highestRiskDay && lowestRiskDay) {
            patterns.push({
                type: 'weekly',
                highestRiskDay: highestRiskDay.day,
                lowestRiskDay: lowestRiskDay.day,
                riskDifference: Math.round(highestRiskDay.avgRisk - lowestRiskDay.avgRisk),
                recommendation: `Schedule high-risk activities for ${lowestRiskDay.day} and avoid critical operations on ${highestRiskDay.day}`
            });
        }
        
        // Monthly trends
        const recentMonth = data.slice(30);
        const avgMonthlyRisk = recentMonth.reduce((sum, d) => sum + d.risks.overall, 0) / recentMonth.length;
        
        patterns.push({
            type: 'monthly',
            averageRisk: Math.round(avgMonthlyRisk),
            riskLevel: avgMonthlyRisk > 60 ? 'high' : avgMonthlyRisk > 30 ? 'moderate' : 'low',
            daysAboveThreshold: recentMonth.filter(d => d.risks.overall > 50).length,
            recommendation: avgMonthlyRisk > 50 
                ? 'Consider additional protective measures this month' 
                : 'Favorable conditions for most farming activities'
        });
        
        // Weather correlation patterns
        const tempRiskCorrelation = calculateCorrelation(
            recentMonth.map(d => d.temperature),
            recentMonth.map(d => d.risks.overall)
        );
        
        const humidityRiskCorrelation = calculateCorrelation(
            recentMonth.map(d => d.humidity),
            recentMonth.map(d => d.risks.disease)
        );
        
        patterns.push({
            type: 'correlation',
            temperatureRiskCorrelation: Math.round(tempRiskCorrelation * 100) / 100,
            humidityDiseaseCorrelation: Math.round(humidityRiskCorrelation * 100) / 100,
            insight: Math.abs(tempRiskCorrelation) > 0.5 
                ? 'Strong correlation between temperature and overall risk'
                : 'Risk factors are influenced by multiple weather variables'
        });
        
        return patterns;
    }, []);

    // Calculate correlation coefficient
    const calculateCorrelation = (x, y) => {
        const n = x.length;
        if (n === 0) return 0;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
        const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
        const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    };

    // Get risk statistics for a period
    const getRiskStatistics = useCallback((period = '30days') => {
        if (historicalData.length === 0) return null;
        
        let filteredData = historicalData;
        
        if (period === '7days') {
            filteredData = historicalData.slice(7);
        } else if (period === '14days') {
            filteredData = historicalData.slice(14);
        }
        
        const stats = {
            period: period,
            daysAnalyzed: filteredData.length,
            averageOverallRisk: Math.round(filteredData.reduce((sum, d) => sum + d.risks.overall, 0) / filteredData.length),
            averageDiseaseRisk: Math.round(filteredData.reduce((sum, d) => sum + d.risks.disease, 0) / filteredData.length),
            averagePestRisk: Math.round(filteredData.reduce((sum, d) => sum + d.risks.pest, 0) / filteredData.length),
            averageStressRisk: Math.round(filteredData.reduce((sum, d) => sum + d.risks.stress, 0) / filteredData.length),
            maxRisk: Math.max(...filteredData.map(d => d.risks.overall)),
            minRisk: Math.min(...filteredData.map(d => d.risks.overall)),
            highRiskDays: filteredData.filter(d => d.risks.overall > 60).length,
            moderateRiskDays: filteredData.filter(d => d.risks.overall >= 30 && d.risks.overall <= 60).length,
            lowRiskDays: filteredData.filter(d => d.risks.overall < 30).length,
            averageTemperature: Math.round(filteredData.reduce((sum, d) => sum + d.temperature, 0) / filteredData.length * 10) / 10,
            averageHumidity: Math.round(filteredData.reduce((sum, d) => sum + d.humidity, 0) / filteredData.length),
            totalRainfall: Math.round(filteredData.reduce((sum, d) => sum + d.rainfall, 0) * 10) / 10
        };
        
        return stats;
    }, [historicalData]);

    // Get risk prediction for next days
    const predictRisk = useCallback((days = 7) => {
        if (historicalData.length < 14) return [];
        
        const predictions = [];
        const recentData = historicalData.slice(7); // Last 7 days
        
        // Simple linear regression for prediction
        for (let i = 1; i <= days; i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            
            // Predict based on recent trends
            const trend = analyzeRiskTrends(recentData);
            const overallTrend = trend.find(t => t.type === 'overall');
            
            let predictedRisk = recentData[recentData.length - 1]?.risks.overall || 30;
            
            if (overallTrend) {
                const dailyChange = overallTrend.change / 7; // Average daily change
                predictedRisk = Math.max(0, Math.min(100, predictedRisk + (dailyChange * i)));
            }
            
            // Add some randomness for realism
            predictedRisk += (Math.random() - 0.5) * 10;
            predictedRisk = Math.max(0, Math.min(100, predictedRisk));
            
            predictions.push({
                date: futureDate.toISOString().split('T')[0],
                predictedRisk: Math.round(predictedRisk),
                confidence: Math.max(60, 90 - (i * 5)), // Confidence decreases over time
                factors: ['Historical trends', 'Seasonal patterns', 'Recent weather']
            });
        }
        
        return predictions;
    }, [historicalData, analyzeRiskTrends]);

    // Initialize historical data
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        try {
            // In production, this would fetch from backend API
            const data = generateSampleHistoricalData();
            setHistoricalData(data);
            
            // Analyze trends and patterns
            const trends = analyzeRiskTrends(data);
            const patterns = identifyPatterns(data);
            
            setRiskTrends(trends);
            setPatterns(patterns);
            
        } catch (err) {
            setError('Failed to load historical data');
            console.error('Error loading historical data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [generateSampleHistoricalData, analyzeRiskTrends, identifyPatterns]);

    // Add new data point
    const addDataPoint = useCallback((newData) => {
        const dataPoint = {
            date: new Date().toISOString().split('T')[0],
            temperature: newData.temperature,
            humidity: newData.humidity,
            windSpeed: newData.windSpeed,
            rainfall: newData.rainfall || 0,
            risks: {
                disease: calculateDiseaseRisk(newData.temperature, newData.humidity, newData.rainfall || 0),
                pest: calculatePestRisk(newData.temperature, newData.humidity, newData.windSpeed),
                stress: calculateStressRisk(newData.temperature, newData.humidity, newData.rainfall || 0),
                overall: 0 // Will be calculated below
            },
            cropType: cropType || 'general'
        };
        
        dataPoint.risks.overall = Math.max(
            dataPoint.risks.disease,
            dataPoint.risks.pest,
            dataPoint.risks.stress
        );
        
        setHistoricalData(prev => {
            const updated = [...prev.slice(-29), dataPoint]; // Keep last 30 days
            const trends = analyzeRiskTrends(updated);
            const patterns = identifyPatterns(updated);
            
            setRiskTrends(trends);
            setPatterns(patterns);
            
            return updated;
        });
    }, [cropType, analyzeRiskTrends, identifyPatterns]);

    return {
        historicalData,
        riskTrends,
        patterns,
        isLoading,
        error,
        statistics: getRiskStatistics(),
        predictions: predictRisk(),
        addDataPoint,
        refreshData: () => {
            const data = generateSampleHistoricalData();
            setHistoricalData(data);
            setRiskTrends(analyzeRiskTrends(data));
            setPatterns(identifyPatterns(data));
        }
    };
};

export default useHistoricalRiskTracking;
