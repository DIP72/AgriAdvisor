/**
 * Crop Optimization Service
 * Provides intelligent farming recommendations based on weather, risk analysis, and crop data
 */

class CropOptimizer {
    constructor() {
        // Optimal planting windows for Maharashtra crops
        this.plantingWindows = {
            kharif: {
                start: { month: 6, day: 15 }, // June 15
                end: { month: 7, day: 31 },   // July 31
                crops: ['rice', 'cotton', 'soybean', 'maize', 'pulses']
            },
            rabi: {
                start: { month: 10, day: 1 },  // October 1
                end: { month: 11, day: 30 },  // November 30
                crops: ['wheat', 'gram', 'mustard', 'barley', 'peas']
            },
            summer: {
                start: { month: 2, day: 15 },  // February 15
                end: { month: 3, day: 31 },   // March 31
                crops: ['vegetables', 'fruits', 'sugarcane', 'groundnut']
            }
        };

        // Irrigation optimization factors
        this.irrigationFactors = {
            temperature: { high: 35, low: 15 },
            humidity: { high: 80, low: 40 },
            rainfall: { sufficient: 5, light: 2 }
        };

        // Fertilizer application timing
        this.fertilizerSchedule = {
            nitrogen: { growth_stages: ['seedling', 'vegetative'], interval: 21 },
            phosphorus: { growth_stages: ['planting', 'early_growth'], interval: 45 },
            potassium: { growth_stages: ['vegetative', 'flowering'], interval: 30 }
        };
    }

    /**
     * Generate comprehensive crop optimization recommendations
     */
    generateOptimizationRecommendations(weatherData, riskAnalysis, cropInfo, farmInfo) {
        const recommendations = {
            planting: this.getPlantingRecommendations(weatherData, riskAnalysis, cropInfo),
            irrigation: this.getIrrigationRecommendations(weatherData, riskAnalysis, cropInfo),
            fertilization: this.getFertilizationRecommendations(weatherData, cropInfo),
            pestManagement: this.getPestManagementRecommendations(riskAnalysis, cropInfo),
            diseaseManagement: this.getDiseaseManagementRecommendations(riskAnalysis, cropInfo),
            harvesting: this.getHarvestingRecommendations(weatherData, cropInfo),
            general: this.getGeneralRecommendations(weatherData, riskAnalysis, cropInfo, farmInfo)
        };

        return {
            recommendations,
            priority: this.prioritizeRecommendations(recommendations),
            timeline: this.generateActionTimeline(recommendations),
            estimatedBenefits: this.calculateEstimatedBenefits(recommendations, cropInfo)
        };
    }

    /**
     * Get planting recommendations
     */
    getPlantingRecommendations(weatherData, riskAnalysis, cropInfo) {
        const recommendations = [];
        const { temperature, humidity, rainfall } = weatherData;
        const currentMonth = new Date().getMonth() + 1;

        // Check if current conditions are suitable for planting
        const optimalTemp = cropInfo.temperature_min_c <= temperature && temperature <= cropInfo.temperature_max_c;
        const optimalHumidity = cropInfo.humidity_min_percent <= humidity && humidity <= cropInfo.humidity_max_percent;

        if (optimalTemp && optimalHumidity && riskAnalysis.overall < 50) {
            recommendations.push({
                action: 'Proceed with planting',
                reason: 'Current weather conditions are optimal',
                priority: 'high',
                timing: 'immediately',
                confidence: 90
            });
        } else if (riskAnalysis.overall > 70) {
            recommendations.push({
                action: 'Delay planting',
                reason: `High risk conditions (${riskAnalysis.overall}% risk score)`,
                priority: 'high',
                timing: 'wait for better conditions',
                confidence: 85
            });
        } else {
            recommendations.push({
                action: 'Consider protective measures before planting',
                reason: 'Suboptimal conditions',
                priority: 'medium',
                timing: 'within 3-5 days',
                confidence: 70
            });
        }

        // Planting window recommendations
        const suitableSeasons = this.getSuitablePlantingSeasons(cropInfo.crop_name_english);
        suitableSeasons.forEach(season => {
            const window = this.plantingWindows[season];
            if (window) {
                recommendations.push({
                    action: `Optimal planting window: ${season} season`,
                    reason: `Best time for ${cropInfo.crop_name_english} cultivation`,
                    priority: 'medium',
                    timing: `${window.start.month}/${window.start.day} - ${window.end.month}/${window.end.day}`,
                    confidence: 80
                });
            }
        });

        return recommendations;
    }

    /**
     * Get irrigation recommendations
     */
    getIrrigationRecommendations(weatherData, riskAnalysis, cropInfo) {
        const recommendations = [];
        const { temperature, humidity, rainfall } = weatherData;
        const waterReq = cropInfo.water_requirement.toLowerCase();

        // High temperature irrigation
        if (temperature > 35) {
            recommendations.push({
                action: 'Increase irrigation frequency',
                reason: 'High temperature increases water stress',
                priority: 'high',
                timing: 'daily',
                amount: '20-30% more than usual',
                confidence: 85
            });
        }

        // Low humidity irrigation
        if (humidity < 40 && rainfall < 2) {
            recommendations.push({
                action: 'Supplemental irrigation needed',
                reason: 'Low humidity and insufficient rainfall',
                priority: 'high',
                timing: 'every 2-3 days',
                confidence: 80
            });
        }

        // Crop-specific water requirements
        if (waterReq.includes('high')) {
            if (rainfall < 3) {
                recommendations.push({
                    action: 'Ensure adequate water supply',
                    reason: 'High water requirement crop with low rainfall',
                    priority: 'high',
                    timing: 'regular monitoring',
                    confidence: 90
                });
            }
        } else if (waterReq.includes('low')) {
            if (rainfall > 5) {
                recommendations.push({
                    action: 'Reduce irrigation',
                    reason: 'Low water requirement crop with sufficient rainfall',
                    priority: 'medium',
                    timing: 'weekly adjustment',
                    confidence: 75
                });
            }
        }

        // Disease risk irrigation adjustment
        if (riskAnalysis.disease.overall > 60) {
            recommendations.push({
                action: 'Adjust irrigation to reduce disease risk',
                reason: 'High disease risk - avoid overwatering',
                priority: 'medium',
                timing: 'immediate',
                method: 'Morning irrigation, avoid evening watering',
                confidence: 80
            });
        }

        return recommendations;
    }

    /**
     * Get fertilization recommendations
     */
    getFertilizationRecommendations(weatherData, cropInfo) {
        const recommendations = [];
        const { temperature, humidity } = weatherData;

        // Temperature-based fertilizer application
        if (temperature > 30) {
            recommendations.push({
                action: 'Apply fertilizers during cooler parts of the day',
                reason: 'High temperature can cause fertilizer burn',
                priority: 'medium',
                timing: 'early morning or late evening',
                confidence: 75
            });
        }

        // Humidity-based fertilizer adjustment
        if (humidity > 80) {
            recommendations.push({
                action: 'Reduce nitrogen application',
                reason: 'High humidity increases disease risk with excess nitrogen',
                priority: 'medium',
                timing: 'next application',
                adjustment: 'reduce by 20-30%',
                confidence: 70
            });
        }

        // Growth stage-based fertilization
        const growthStage = this.estimateGrowthStage(cropInfo);
        if (growthStage) {
            recommendations.push({
                action: `Apply ${growthStage} stage fertilizers`,
                reason: 'Crop is in critical growth phase',
                priority: 'high',
                timing: 'within 7 days',
                nutrients: this.getRequiredNutrients(growthStage),
                confidence: 85
            });
        }

        return recommendations;
    }

    /**
     * Get pest management recommendations
     */
    getPestManagementRecommendations(riskAnalysis, cropInfo) {
        const recommendations = [];

        if (riskAnalysis.pest.overall > 70) {
            recommendations.push({
                action: 'Implement integrated pest management (IPM)',
                reason: 'High pest activity risk detected',
                priority: 'high',
                timing: 'immediately',
                methods: ['monitoring', 'biological controls', 'targeted chemical application'],
                confidence: 90
            });

            recommendations.push({
                action: 'Increase field monitoring frequency',
                reason: 'High pest pressure expected',
                priority: 'high',
                timing: 'daily inspection',
                focus: riskAnalysis.pest.pestType,
                confidence: 85
            });
        } else if (riskAnalysis.pest.overall > 50) {
            recommendations.push({
                action: 'Prepare preventive pest control measures',
                reason: 'Moderate pest risk',
                priority: 'medium',
                timing: 'within 3-5 days',
                confidence: 75
            });
        }

        // Crop-specific pest recommendations
        const cropPestVulnerabilities = this.getCropPestVulnerabilities(cropInfo.crop_name_english);
        cropPestVulnerabilities.forEach(vulnerability => {
            recommendations.push({
                action: `Monitor for ${vulnerability.pest}`,
                reason: `${cropInfo.crop_name_english} is susceptible to ${vulnerability.pest}`,
                priority: vulnerability.severity === 'high' ? 'high' : 'medium',
                timing: vulnerability.monitoringFrequency,
                prevention: vulnerability.preventionMethods,
                confidence: 80
            });
        });

        return recommendations;
    }

    /**
     * Get disease management recommendations
     */
    getDiseaseManagementRecommendations(riskAnalysis, cropInfo) {
        const recommendations = [];

        if (riskAnalysis.disease.overall > 70) {
            recommendations.push({
                action: 'Apply preventive fungicide',
                reason: `High ${riskAnalysis.disease.type} disease risk`,
                priority: 'high',
                timing: 'within 24-48 hours',
                type: riskAnalysis.disease.type,
                confidence: 85
            });

            recommendations.push({
                action: 'Improve field ventilation',
                reason: 'Reduce humidity around plants',
                priority: 'medium',
                timing: 'immediately',
                methods: ['proper spacing', 'pruning', 'weed control'],
                confidence: 75
            });
        } else if (riskAnalysis.disease.overall > 50) {
            recommendations.push({
                action: 'Monitor for disease symptoms',
                reason: 'Moderate disease risk',
                priority: 'medium',
                timing: 'every 2-3 days',
                focus: riskAnalysis.disease.type,
                confidence: 70
            });
        }

        // Resistant variety recommendations
        if (riskAnalysis.disease.overall > 60) {
            recommendations.push({
                action: 'Consider disease-resistant varieties for next planting',
                reason: 'High disease pressure in current conditions',
                priority: 'low',
                timing: 'next season',
                alternatives: this.getResistantVarieties(cropInfo.crop_name_english, riskAnalysis.disease.type),
                confidence: 80
            });
        }

        return recommendations;
    }

    /**
     * Get harvesting recommendations
     */
    getHarvestingRecommendations(weatherData, cropInfo) {
        const recommendations = [];
        const { temperature, humidity, rainfall } = weatherData;

        // Avoid harvesting during rain
        if (rainfall > 5) {
            recommendations.push({
                action: 'Delay harvesting',
                reason: 'Heavy rainfall can damage crops and reduce quality',
                priority: 'high',
                timing: 'wait for dry weather',
                confidence: 90
            });
        }

        // Optimal harvesting conditions
        if (temperature < 30 && humidity < 70 && rainfall < 2) {
            recommendations.push({
                action: 'Optimal harvesting conditions',
                reason: 'Dry weather with moderate temperature',
                priority: 'medium',
                timing: 'proceed with harvesting',
                confidence: 85
            });
        }

        // Post-harvest recommendations
        recommendations.push({
            action: 'Prepare post-harvest storage',
            reason: 'Proper storage prevents losses',
            priority: 'medium',
            timing: 'before harvest',
            requirements: this.getStorageRequirements(cropInfo.crop_name_english),
            confidence: 80
        });

        return recommendations;
    }

    /**
     * Get general recommendations
     */
    getGeneralRecommendations(weatherData, riskAnalysis, cropInfo, farmInfo) {
        const recommendations = [];

        // Overall risk assessment
        if (riskAnalysis.overall > 70) {
            recommendations.push({
                action: 'High vigilance required',
                reason: 'Overall risk level is high',
                priority: 'high',
                timing: 'immediate',
                actions: ['increased monitoring', 'protective measures', 'contingency planning'],
                confidence: 85
            });
        } else if (riskAnalysis.overall < 30) {
            recommendations.push({
                action: 'Favorable conditions',
                reason: 'Low overall risk',
                priority: 'low',
                timing: 'continue normal operations',
                confidence: 80
            });
        }

        // Soil health recommendations
        recommendations.push({
            action: 'Maintain soil health',
            reason: 'Healthy soil improves crop resilience',
            priority: 'medium',
            timing: 'ongoing',
            practices: ['crop rotation', 'organic matter addition', 'soil testing'],
            confidence: 75
        });

        return recommendations;
    }

    /**
     * Prioritize recommendations by importance and urgency
     */
    prioritizeRecommendations(recommendations) {
        const allRecs = [
            ...recommendations.planting,
            ...recommendations.irrigation,
            ...recommendations.fertilization,
            ...recommendations.pestManagement,
            ...recommendations.diseaseManagement,
            ...recommendations.harvesting,
            ...recommendations.general
        ];

        return allRecs.sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by confidence
            return b.confidence - a.confidence;
        });
    }

    /**
     * Generate action timeline
     */
    generateActionTimeline(recommendations) {
        const timeline = {
            immediate: [],
            today: [],
            this_week: [],
            next_week: [],
            ongoing: []
        };

        const allRecs = [
            ...recommendations.planting,
            ...recommendations.irrigation,
            ...recommendations.fertilization,
            ...recommendations.pestManagement,
            ...recommendations.diseaseManagement,
            ...recommendations.harvesting,
            ...recommendations.general
        ];

        allRecs.forEach(rec => {
            const timing = rec.timing.toLowerCase();
            
            if (timing.includes('immediate') || timing.includes('immediately')) {
                timeline.immediate.push(rec);
            } else if (timing.includes('today') || timing.includes('daily')) {
                timeline.today.push(rec);
            } else if (timing.includes('week') || timing.includes('3-5 days')) {
                timeline.this_week.push(rec);
            } else if (timing.includes('next') || timing.includes('7 days')) {
                timeline.next_week.push(rec);
            } else {
                timeline.ongoing.push(rec);
            }
        });

        return timeline;
    }

    /**
     * Calculate estimated benefits
     */
    calculateEstimatedBenefits(recommendations, cropInfo) {
        let yieldIncrease = 0;
        let costSavings = 0;
        let riskReduction = 0;

        // Calculate benefits based on recommendation types and priorities
        const allRecs = [
            ...recommendations.planting,
            ...recommendations.irrigation,
            ...recommendations.fertilization,
            ...recommendations.pestManagement,
            ...recommendations.diseaseManagement
        ];

        allRecs.forEach(rec => {
            if (rec.priority === 'high') {
                yieldIncrease += 5;
                costSavings += 3;
                riskReduction += 8;
            } else if (rec.priority === 'medium') {
                yieldIncrease += 2;
                costSavings += 1;
                riskReduction += 4;
            } else {
                yieldIncrease += 1;
                riskReduction += 2;
            }
        });

        return {
            estimatedYieldIncrease: Math.min(yieldIncrease, 25), // Cap at 25%
            estimatedCostSavings: Math.min(costSavings, 15),   // Cap at 15%
            estimatedRiskReduction: Math.min(riskReduction, 30), // Cap at 30%
            confidence: Math.round(allRecs.reduce((sum, rec) => sum + rec.confidence, 0) / allRecs.length)
        };
    }

    // Helper methods
    getSuitablePlantingSeasons(cropName) {
        const seasonMap = {
            'rice': ['kharif'],
            'wheat': ['rabi'],
            'cotton': ['kharif'],
            'soybean': ['kharif'],
            'maize': ['kharif', 'rabi'],
            'pulses': ['kharif', 'rabi'],
            'vegetables': ['summer'],
            'sugarcane': ['summer', 'kharif']
        };
        return seasonMap[cropName.toLowerCase()] || ['kharif'];
    }

    estimateGrowthStage(cropInfo) {
        // This would typically be based on planting date and crop duration
        // For now, return a simplified estimation
        const stages = ['seedling', 'vegetative', 'flowering', 'fruiting'];
        return stages[Math.floor(Math.random() * stages.length)];
    }

    getRequiredNutrients(growthStage) {
        const nutrientMap = {
            seedling: ['phosphorus', 'potassium'],
            vegetative: ['nitrogen', 'phosphorus'],
            flowering: ['phosphorus', 'potassium', 'micronutrients'],
            fruiting: ['potassium', 'calcium']
        };
        return nutrientMap[growthStage] || ['nitrogen', 'phosphorus', 'potassium'];
    }

    getCropPestVulnerabilities(cropName) {
        const vulnerabilityMap = {
            'rice': [
                { pest: 'stem borer', severity: 'high', monitoringFrequency: 'weekly', preventionMethods: ['crop rotation', 'resistant varieties'] },
                { pest: 'brown planthopper', severity: 'medium', monitoringFrequency: 'bi-weekly', preventionMethods: ['balanced fertilization'] }
            ],
            'cotton': [
                { pest: 'bollworm', severity: 'high', monitoringFrequency: 'weekly', preventionMethods: ['early detection', 'biological controls'] },
                { pest: 'whitefly', severity: 'medium', monitoringFrequency: 'weekly', preventionMethods: ['yellow sticky traps'] }
            ]
        };
        return vulnerabilityMap[cropName.toLowerCase()] || [];
    }

    getResistantVarieties(cropName, diseaseType) {
        // This would typically come from a database of resistant varieties
        return [
            `${cropName} Resistant Variety 1`,
            `${cropName} Resistant Variety 2`
        ];
    }

    getStorageRequirements(cropName) {
        const storageMap = {
            'rice': { temperature: 'cool, dry', humidity: '<12%', ventilation: 'good' },
            'wheat': { temperature: 'cool', humidity: '<13%', ventilation: 'moderate' },
            'vegetables': { temperature: 'cool', humidity: 'high', ventilation: 'excellent' }
        };
        return storageMap[cropName.toLowerCase()] || { temperature: 'cool, dry', humidity: '<15%', ventilation: 'good' };
    }
}

module.exports = new CropOptimizer();
