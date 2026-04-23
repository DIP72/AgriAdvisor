/**
 * Weather Risk Scoring Engine
 * Advanced agricultural risk analysis and prediction system
 */

class RiskEngine {
    constructor() {
        // Disease risk thresholds based on agricultural research
        this.diseaseThresholds = {
            fungal: {
                tempMin: 15, tempMax: 30, humidityMin: 70, humidityMax: 95,
                windMax: 10, rainMin: 2
            },
            bacterial: {
                tempMin: 18, tempMax: 32, humidityMin: 80, humidityMax: 100,
                windMax: 15, rainMin: 1
            },
            viral: {
                tempMin: 20, tempMax: 35, humidityMin: 60, humidityMax: 90,
                windMax: 25, rainMin: 0
            }
        };

        // Pest activity conditions
        this.pestConditions = {
            aphids: { tempMin: 15, tempMax: 28, humidityMin: 40, humidityMax: 70 },
            whiteflies: { tempMin: 20, tempMax: 32, humidityMin: 50, humidityMax: 80 },
            borers: { tempMin: 18, tempMax: 30, humidityMin: 60, humidityMax: 85 },
            mites: { tempMin: 25, tempMax: 35, humidityMin: 30, humidityMax: 60 }
        };

        // Crop-specific risk factors
        this.cropRiskFactors = {
            rice: { disease: 'fungal', pest: 'borers', humiditySensitive: true },
            wheat: { disease: 'fungal', pest: 'aphids', humiditySensitive: true },
            cotton: { disease: 'bacterial', pest: 'whiteflies', humiditySensitive: false },
            soybean: { disease: 'viral', pest: 'mites', humiditySensitive: false },
            maize: { disease: 'fungal', pest: 'borers', humiditySensitive: true },
            pulses: { disease: 'bacterial', pest: 'aphids', humiditySensitive: true },
            sugarcane: { disease: 'fungal', pest: 'borers', humiditySensitive: true },
            vegetables: { disease: 'viral', pest: 'whiteflies', humiditySensitive: false }
        };
    }

    /**
     * Calculate comprehensive risk score for current conditions
     */
    calculateRiskScore(weatherData, cropType = 'general') {
        const { temperature, humidity, windSpeed, rainfall, pressure } = weatherData;
        
        // Base risk calculation
        const diseaseRisk = this.calculateDiseaseRisk(weatherData, cropType);
        const pestRisk = this.calculatePestRisk(weatherData, cropType);
        const stressRisk = this.calculateStressRisk(weatherData);
        
        // Combined risk score (0-100)
        const totalRisk = Math.round(
            (diseaseRisk.overall * 0.4) + 
            (pestRisk.overall * 0.3) + 
            (stressRisk.overall * 0.3)
        );

        return {
            overall: totalRisk,
            disease: diseaseRisk,
            pest: pestRisk,
            stress: stressRisk,
            timestamp: new Date().toISOString(),
            recommendations: this.generateRecommendations(diseaseRisk, pestRisk, stressRisk, cropType)
        };
    }

    /**
     * Calculate disease risk based on weather conditions
     */
    calculateDiseaseRisk(weatherData, cropType) {
        const { temperature, humidity, windSpeed, rainfall } = weatherData;
        const cropFactor = this.cropRiskFactors[cropType] || { disease: 'fungal' };
        const diseaseType = cropFactor.disease;
        const threshold = this.diseaseThresholds[diseaseType];

        let riskScore = 0;
        let riskFactors = [];

        // Temperature risk
        if (temperature >= threshold.tempMin && temperature <= threshold.tempMax) {
            const tempRisk = this.calculateLinearRisk(
                temperature, threshold.tempMin, threshold.tempMax, 40
            );
            riskScore += tempRisk;
            riskFactors.push(`Temperature ${Math.round(tempRisk)}%`);
        }

        // Humidity risk (most critical for diseases)
        if (humidity >= threshold.humidityMin) {
            const humidityRisk = this.calculateLinearRisk(
                humidity, threshold.humidityMin, threshold.humidityMax, 50
            );
            riskScore += humidityRisk;
            riskFactors.push(`Humidity ${Math.round(humidityRisk)}%`);
        }

        // Wind risk (lower wind = higher disease spread)
        if (windSpeed <= threshold.windMax) {
            const windRisk = Math.round((1 - windSpeed / threshold.windMax) * 10);
            riskScore += windRisk;
            riskFactors.push(`Low wind ${windRisk}%`);
        }

        // Rain risk
        if (rainfall >= threshold.rainMin) {
            const rainRisk = Math.min(rainfall * 5, 20);
            riskScore += rainRisk;
            riskFactors.push(`Rain ${Math.round(rainRisk)}%`);
        }

        return {
            overall: Math.min(Math.round(riskScore), 100),
            type: diseaseType,
            factors: riskFactors,
            severity: this.getSeverityLevel(riskScore)
        };
    }

    /**
     * Calculate pest activity risk
     */
    calculatePestRisk(weatherData, cropType) {
        const { temperature, humidity } = weatherData;
        const cropFactor = this.cropRiskFactors[cropType] || { pest: 'aphids' };
        const pestType = cropFactor.pest;
        const conditions = this.pestConditions[pestType];

        let riskScore = 0;
        let riskFactors = [];

        // Temperature suitability for pests
        if (temperature >= conditions.tempMin && temperature <= conditions.tempMax) {
            const tempRisk = this.calculateLinearRisk(
                temperature, conditions.tempMin, conditions.tempMax, 50
            );
            riskScore += tempRisk;
            riskFactors.push(`Temperature favorable ${Math.round(tempRisk)}%`);
        }

        // Humidity suitability
        if (humidity >= conditions.humidityMin && humidity <= conditions.humidityMax) {
            const humidityRisk = this.calculateLinearRisk(
                humidity, conditions.humidityMin, conditions.humidityMax, 50
            );
            riskScore += humidityRisk;
            riskFactors.push(`Humidity favorable ${Math.round(humidityRisk)}%`);
        }

        return {
            overall: Math.min(Math.round(riskScore), 100),
            pestType: pestType,
            factors: riskFactors,
            severity: this.getSeverityLevel(riskScore)
        };
    }

    /**
     * Calculate environmental stress risk
     */
    calculateStressRisk(weatherData) {
        const { temperature, humidity, rainfall } = weatherData;
        let riskScore = 0;
        let riskFactors = [];

        // Heat stress (>35°C)
        if (temperature > 35) {
            const heatRisk = Math.min((temperature - 35) * 10, 40);
            riskScore += heatRisk;
            riskFactors.push(`Heat stress ${Math.round(heatRisk)}%`);
        }

        // Cold stress (<10°C)
        if (temperature < 10) {
            const coldRisk = Math.min((10 - temperature) * 8, 30);
            riskScore += coldRisk;
            riskFactors.push(`Cold stress ${Math.round(coldRisk)}%`);
        }

        // Drought stress (low humidity, no rain)
        if (humidity < 40 && rainfall < 1) {
            const droughtRisk = Math.min((40 - humidity) * 1.5, 30);
            riskScore += droughtRisk;
            riskFactors.push(`Drought risk ${Math.round(droughtRisk)}%`);
        }

        // Waterlogging risk (high humidity + high rain)
        if (humidity > 85 && rainfall > 5) {
            const waterlogRisk = Math.min((humidity - 85) + (rainfall - 5) * 3, 25);
            riskScore += waterlogRisk;
            riskFactors.push(`Waterlogging ${Math.round(waterlogRisk)}%`);
        }

        return {
            overall: Math.min(Math.round(riskScore), 100),
            factors: riskFactors,
            severity: this.getSeverityLevel(riskScore)
        };
    }

    /**
     * Generate 5-day risk forecast
     */
    generateForecast(currentWeather, forecastData, cropType = 'general') {
        const forecast = [];
        const baseRisk = this.calculateRiskScore(currentWeather, cropType);

        for (let i = 0; i < Math.min(forecastData.length, 5); i++) {
            const dayData = forecastData[i];
            const dayRisk = this.calculateRiskScore(dayData, cropType);
            
            // Calculate trend
            let trend = 'stable';
            if (i > 0) {
                const prevRisk = forecast[i - 1].overall;
                if (dayRisk.overall > prevRisk + 10) trend = 'increasing';
                else if (dayRisk.overall < prevRisk - 10) trend = 'decreasing';
            }

            forecast.push({
                day: i + 1,
                date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
                ...dayRisk,
                trend,
                confidence: Math.max(85 - (i * 10), 50) // Confidence decreases over time
            });
        }

        return {
            current: baseRisk,
            forecast,
            summary: this.generateForecastSummary(forecast)
        };
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(diseaseRisk, pestRisk, stressRisk, cropType) {
        const recommendations = [];
        const overallRisk = Math.max(diseaseRisk.overall, pestRisk.overall, stressRisk.overall);

        // High-priority recommendations
        if (diseaseRisk.overall > 70) {
            recommendations.push({
                priority: 'high',
                type: 'disease',
                action: `Apply preventive fungicide immediately - ${diseaseRisk.type} disease risk critical`,
                timing: 'within 24 hours'
            });
        }

        if (pestRisk.overall > 70) {
            recommendations.push({
                priority: 'high',
                type: 'pest',
                action: `Monitor for ${pestRisk.pestType} activity - consider pest control measures`,
                timing: 'within 48 hours'
            });
        }

        if (stressRisk.overall > 70) {
            recommendations.push({
                priority: 'high',
                type: 'stress',
                action: 'Implement stress mitigation - adjust irrigation or provide shade',
                timing: 'immediately'
            });
        }

        // Medium-priority recommendations
        if (overallRisk > 50 && overallRisk <= 70) {
            recommendations.push({
                priority: 'medium',
                type: 'monitoring',
                action: 'Increase field monitoring frequency - check crops daily',
                timing: 'starting today'
            });
        }

        // Low-priority recommendations
        if (overallRisk <= 30) {
            recommendations.push({
                priority: 'low',
                type: 'maintenance',
                action: 'Normal farming activities - continue regular monitoring',
                timing: 'as scheduled'
            });
        }

        return recommendations;
    }

    /**
     * Helper function to calculate linear risk
     */
    calculateLinearRisk(value, min, max, maxRisk) {
        if (value < min || value > max) return 0;
        const range = max - min;
        const position = (value - min) / range;
        return Math.round(position * maxRisk);
    }

    /**
     * Get severity level based on risk score
     */
    getSeverityLevel(riskScore) {
        if (riskScore >= 80) return 'critical';
        if (riskScore >= 60) return 'high';
        if (riskScore >= 40) return 'moderate';
        if (riskScore >= 20) return 'low';
        return 'minimal';
    }

    /**
     * Generate forecast summary
     */
    generateForecastSummary(forecast) {
        const avgRisk = Math.round(
            forecast.reduce((sum, day) => sum + day.overall, 0) / forecast.length
        );
        
        const maxRisk = Math.max(...forecast.map(day => day.overall));
        const increasingDays = forecast.filter(day => day.trend === 'increasing').length;
        
        return {
            averageRisk: avgRisk,
            peakRisk: maxRisk,
            trend: increasingDays > 2 ? 'deteriorating' : increasingDays > 0 ? 'variable' : 'stable',
            recommendation: avgRisk > 60 ? 'high vigilance required' : 
                           avgRisk > 40 ? 'increased monitoring' : 'normal conditions'
        };
    }
}

module.exports = new RiskEngine();
