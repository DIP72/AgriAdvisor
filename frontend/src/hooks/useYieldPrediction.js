import { useState, useEffect, useCallback } from 'react';

const useYieldPrediction = (cropType, historicalData, currentWeather) => {
    const [predictions, setPredictions] = useState([]);
    const [factors, setFactors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Crop-specific base yields (tons per hectare)
    const baseYields = {
        rice: 4.5,
        wheat: 3.2,
        cotton: 1.8,
        maize: 5.5,
        general: 4.0
    };

    // Weather impact factors for different crops
    const weatherFactors = {
        rice: {
            temperature: { optimal: [25, 32], high: 35, low: 20, impact: 0.8 },
            humidity: { optimal: [70, 85], high: 90, low: 50, impact: 0.6 },
            rainfall: { optimal: [100, 200], high: 300, low: 50, impact: 0.7 },
            windSpeed: { optimal: [0, 15], high: 25, low: 0, impact: 0.3 }
        },
        wheat: {
            temperature: { optimal: [15, 25], high: 30, low: 10, impact: 0.7 },
            humidity: { optimal: [50, 70], high: 80, low: 30, impact: 0.5 },
            rainfall: { optimal: [50, 150], high: 250, low: 25, impact: 0.6 },
            windSpeed: { optimal: [0, 20], high: 30, low: 0, impact: 0.4 }
        },
        cotton: {
            temperature: { optimal: [25, 35], high: 40, low: 18, impact: 0.8 },
            humidity: { optimal: [40, 60], high: 75, low: 30, impact: 0.5 },
            rainfall: { optimal: [30, 100], high: 200, low: 20, impact: 0.6 },
            windSpeed: { optimal: [5, 20], high: 30, low: 0, impact: 0.3 }
        },
        maize: {
            temperature: { optimal: [20, 30], high: 35, low: 15, impact: 0.7 },
            humidity: { optimal: [50, 70], high: 85, low: 35, impact: 0.5 },
            rainfall: { optimal: [75, 175], high: 250, low: 40, impact: 0.7 },
            windSpeed: { optimal: [0, 15], high: 25, low: 0, impact: 0.3 }
        },
        general: {
            temperature: { optimal: [20, 30], high: 35, low: 15, impact: 0.6 },
            humidity: { optimal: [50, 70], high: 85, low: 35, impact: 0.5 },
            rainfall: { optimal: [50, 150], high: 250, low: 25, impact: 0.6 },
            windSpeed: { optimal: [0, 15], high: 25, low: 0, impact: 0.3 }
        }
    };

    // Calculate weather impact on yield
    const calculateWeatherImpact = useCallback((weather, crop) => {
        const factors = weatherFactors[crop] || weatherFactors.general;
        let totalImpact = 1.0;
        const impacts = [];

        Object.entries(factors).forEach(([factor, config]) => {
            let value = 0;
            let impact = 1.0;

            switch (factor) {
                case 'temperature':
                    value = weather.temperature || weather.main?.temp || 25;
                    break;
                case 'humidity':
                    value = weather.humidity || weather.main?.humidity || 60;
                    break;
                case 'rainfall':
                    value = weather.rainfall || weather.rain?.['1h'] || 0;
                    break;
                case 'windSpeed':
                    value = weather.windSpeed || (weather.wind?.speed * 3.6) || 10;
                    break;
            }

            // Calculate impact based on optimal ranges
            if (value >= config.optimal[0] && value <= config.optimal[1]) {
                impact = 1.0; // Optimal conditions
                impacts.push({ factor, value, impact: 'optimal', effect: 1.0 });
            } else if (value >= config.high) {
                // Too high - negative impact
                const excess = value - config.high;
                impact = 1.0 - (excess * config.impact / 100);
                impacts.push({ factor, value, impact: 'too high', effect: Math.max(0.3, impact) });
            } else if (value <= config.low) {
                // Too low - negative impact
                const deficit = config.low - value;
                impact = 1.0 - (deficit * config.impact / 100);
                impacts.push({ factor, value, impact: 'too low', effect: Math.max(0.3, impact) });
            } else {
                // Suboptimal but acceptable
                const distance = Math.min(
                    Math.abs(value - config.optimal[0]),
                    Math.abs(value - config.optimal[1])
                );
                impact = 1.0 - (distance * config.impact / 200);
                impacts.push({ factor, value, impact: 'suboptimal', effect: Math.max(0.5, impact) });
            }

            totalImpact *= impact;
        });

        return { totalImpact, impacts };
    }, []);

    // Predict yield based on current conditions
    const predictYield = useCallback((weather, crop) => {
        const baseYield = baseYields[crop] || baseYields.general;
        const { totalImpact, impacts } = calculateWeatherImpact(weather, crop);
        
        const predictedYield = baseYield * totalImpact;
        const yieldVariation = ((predictedYield - baseYield) / baseYield) * 100;
        
        return {
            baseYield: Math.round(baseYield * 100) / 100,
            predictedYield: Math.round(predictedYield * 100) / 100,
            yieldVariation: Math.round(yieldVariation * 10) / 10,
            confidence: calculateConfidence(impacts),
            factors: impacts,
            rating: getYieldRating(yieldVariation)
        };
    }, [calculateWeatherImpact]);

    // Calculate confidence level
    const calculateConfidence = (impacts) => {
        const optimalCount = impacts.filter(i => i.impact === 'optimal').length;
        const totalFactors = impacts.length;
        
        const optimalRatio = optimalCount / totalFactors;
        
        if (optimalRatio >= 0.75) return 'high';
        if (optimalRatio >= 0.5) return 'medium';
        return 'low';
    };

    // Get yield rating
    const getYieldRating = (variation) => {
        if (variation > 10) return 'excellent';
        if (variation > 0) return 'good';
        if (variation > -10) return 'fair';
        return 'poor';
    };

    // Generate seasonal yield forecast
    const generateSeasonalForecast = useCallback((crop) => {
        if (!historicalData || historicalData.length < 30) return [];

        const forecast = [];
        const baseYieldValue = baseYields[crop] || baseYields.general;
        
        // Simulate seasonal progression (next 90 days)
        for (let day = 0; day < 90; day += 7) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + day);
            
            // Generate realistic weather patterns for the season
            const seasonalFactor = Math.sin((day / 90) * Math.PI * 2);
            const temp = 25 + seasonalFactor * 10 + (Math.random() - 0.5) * 5;
            const humidity = 60 + seasonalFactor * 15 + (Math.random() - 0.5) * 10;
            const rainfall = Math.max(0, 50 + seasonalFactor * 30 + (Math.random() - 0.5) * 20);
            const windSpeed = 10 + (Math.random() - 0.5) * 10;
            
            const weather = { temperature: temp, humidity, rainfall, windSpeed };
            const prediction = predictYield(weather, crop);
            
            forecast.push({
                date: futureDate.toISOString().split('T')[0],
                week: Math.floor(day / 7) + 1,
                predictedYield: prediction.predictedYield,
                variation: prediction.yieldVariation,
                rating: prediction.rating,
                confidence: prediction.confidence,
                weather: {
                    temperature: Math.round(temp),
                    humidity: Math.round(humidity),
                    rainfall: Math.round(rainfall),
                    windSpeed: Math.round(windSpeed)
                }
            });
        }
        
        return forecast;
    }, [historicalData, predictYield]);

    // Analyze yield trends from historical data
    const analyzeYieldTrends = useCallback(() => {
        if (!historicalData || historicalData.length < 14) return null;

        const yieldPredictions = historicalData.map(day => {
            const weather = {
                temperature: day.temperature,
                humidity: day.humidity,
                rainfall: day.rainfall,
                windSpeed: day.windSpeed
            };
            return predictYield(weather, cropType);
        });

        const recentPredictions = yieldPredictions.slice(7);
        const olderPredictions = yieldPredictions.slice(14, 7);

        const recentAvg = recentPredictions.reduce((sum, p) => sum + p.predictedYield, 0) / recentPredictions.length;
        const olderAvg = olderPredictions.reduce((sum, p) => sum + p.predictedYield, 0) / olderPredictions.length;

        const trend = recentAvg - olderAvg;
        const trendPercent = (trend / olderAvg) * 100;

        return {
            currentAverage: Math.round(recentAvg * 100) / 100,
            previousAverage: Math.round(olderAvg * 100) / 100,
            trend: Math.round(trend * 100) / 100,
            trendPercent: Math.round(trendPercent * 10) / 10,
            direction: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
            bestYield: Math.round(Math.max(...yieldPredictions.map(p => p.predictedYield)) * 100) / 100,
            worstYield: Math.round(Math.min(...yieldPredictions.map(p => p.predictedYield)) * 100) / 100
        };
    }, [historicalData, predictYield, cropType]);

    // Generate optimization recommendations
    const generateRecommendations = useCallback((prediction) => {
        if (!prediction || !prediction.factors) return [];

        const recommendations = [];

        prediction.factors.forEach(factor => {
            switch (factor.factor) {
                case 'temperature':
                    if (factor.impact === 'too high') {
                        recommendations.push({
                            type: 'warning',
                            category: 'temperature',
                            message: `Temperature too high (${factor.value}°C). Consider shade nets or increased irrigation.`,
                            priority: 'high',
                            potentialImprovement: '15-25%'
                        });
                    } else if (factor.impact === 'too low') {
                        recommendations.push({
                            type: 'warning',
                            category: 'temperature',
                            message: `Temperature too low (${factor.value}°C). Consider mulching or windbreaks.`,
                            priority: 'medium',
                            potentialImprovement: '10-20%'
                        });
                    }
                    break;

                case 'humidity':
                    if (factor.impact === 'too high') {
                        recommendations.push({
                            type: 'warning',
                            category: 'humidity',
                            message: `Humidity too high (${factor.value}%). Improve air circulation to prevent diseases.`,
                            priority: 'high',
                            potentialImprovement: '10-15%'
                        });
                    } else if (factor.impact === 'too low') {
                        recommendations.push({
                            type: 'info',
                            category: 'humidity',
                            message: `Humidity low (${factor.value}%). Consider irrigation during cooler hours.`,
                            priority: 'medium',
                            potentialImprovement: '5-10%'
                        });
                    }
                    break;

                case 'rainfall':
                    if (factor.impact === 'too high') {
                        recommendations.push({
                            type: 'warning',
                            category: 'rainfall',
                            message: `Excessive rainfall (${factor.value}mm). Ensure proper drainage.`,
                            priority: 'high',
                            potentialImprovement: '20-30%'
                        });
                    } else if (factor.impact === 'too low') {
                        recommendations.push({
                            type: 'info',
                            category: 'rainfall',
                            message: `Insufficient rainfall (${factor.value}mm). Schedule irrigation.`,
                            priority: 'medium',
                            potentialImprovement: '15-25%'
                        });
                    }
                    break;

                case 'windSpeed':
                    if (factor.impact === 'too high') {
                        recommendations.push({
                            type: 'warning',
                            category: 'wind',
                            message: `High winds (${factor.value}km/h). Consider windbreaks or staggered planting.`,
                            priority: 'medium',
                            potentialImprovement: '5-15%'
                        });
                    }
                    break;
            }
        });

        // Add general recommendations based on overall prediction
        if (prediction.yieldVariation < -15) {
            recommendations.push({
                type: 'critical',
                category: 'overall',
                message: 'Significant yield reduction expected. Review all farming practices.',
                priority: 'high',
                potentialImprovement: '25-40%'
            });
        } else if (prediction.yieldVariation > 15) {
            recommendations.push({
                type: 'success',
                category: 'overall',
                message: 'Excellent yield potential. Maintain current practices.',
                priority: 'low',
                potentialImprovement: 'Maintain current levels'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }, []);

    // Initialize predictions
    useEffect(() => {
        setIsLoading(true);

        try {
            if (currentWeather && cropType) {
                const currentPrediction = predictYield(currentWeather, cropType);
                const seasonalForecast = generateSeasonalForecast(cropType);
                const trends = analyzeYieldTrends();
                const recs = generateRecommendations(currentPrediction);

                setPredictions([currentPrediction]);
                setFactors(currentPrediction.factors);
                setRecommendations(recs);

                // Store additional data for comprehensive analysis
                setPredictions(prev => ({
                    current: prev[0],
                    seasonal: seasonalForecast,
                    trends: trends
                }));
            }
        } catch (error) {
            console.error('Error generating yield predictions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentWeather, cropType, predictYield, generateSeasonalForecast, analyzeYieldTrends, generateRecommendations]);

    return {
        predictions,
        factors,
        recommendations,
        isLoading,
        predictYield,
        generateSeasonalForecast,
        analyzeYieldTrends,
        generateRecommendations
    };
};

export default useYieldPrediction;
