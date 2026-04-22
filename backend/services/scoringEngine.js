const fs = require('fs');
const path = require('path');
const riskEngine = require('./riskEngine');

/**
 * Enhanced Scoring Engine
 * Ranks crops from the dataset based on farm info, real-time weather, and risk analysis.
 */
async function generateRecommendations(farmInfo, weather, riskAnalysis = null) {
    try {
        const datasetPath = path.join(__dirname, '../../maharashtra_full_crop_dataset_15.json');
        const rawData = fs.readFileSync(datasetPath, 'utf8');
        const allCrops = JSON.parse(rawData);

        const { soilType, plantingSeason, location } = farmInfo;
        const { temperature, humidity, windSpeed, rainfall } = weather;

        // Get risk analysis if not provided
        const risks = riskAnalysis || riskEngine.calculateRiskScore(weather, 'general');

        const scoredCrops = allCrops.map(crop => {
            let score = 50; // Base score
            let riskFactors = [];
            let recommendations = [];

            // 1. Season Match (Weight: 20)
            if (plantingSeason && crop.season.toLowerCase().includes(plantingSeason.toLowerCase())) {
                score += 20;
                riskFactors.push('Season match');
            }

            // 2. Soil Match (Weight: 15)
            if (soilType && crop.suitable_soils.toLowerCase().includes(soilType.toLowerCase())) {
                score += 15;
                riskFactors.push('Soil compatible');
            }

            // 3. Weather Optimization (Weight: 15)
            // If current weather is within ideal range, boost score
            if (temperature >= crop.temperature_min_c && temperature <= crop.temperature_max_c) {
                score += 8;
                riskFactors.push('Optimal temperature');
            } else {
                score -= 5;
                recommendations.push('Temperature stress - consider protective measures');
            }

            if (humidity >= crop.humidity_min_percent && humidity <= crop.humidity_max_percent) {
                score += 7;
                riskFactors.push('Optimal humidity');
            } else {
                score -= 3;
                recommendations.push('Humidity stress - adjust irrigation');
            }

            // 4. Risk-Based Scoring (Weight: 25)
            const cropRiskScore = calculateCropSpecificRisk(crop, risks, weather);
            score += cropRiskScore.scoreAdjustment;
            riskFactors.push(...cropRiskScore.factors);
            recommendations.push(...cropRiskScore.recommendations);

            // 5. Water Requirement Match (Weight: 10)
            const waterScore = calculateWaterScore(crop, rainfall, humidity);
            score += waterScore.score;
            riskFactors.push(...waterScore.factors);
            recommendations.push(...waterScore.recommendations);

            // 6. Disease Resistance Bonus (Weight: 10)
            const diseaseBonus = calculateDiseaseResistance(crop, risks.disease);
            score += diseaseBonus.score;
            riskFactors.push(...diseaseBonus.factors);

            // 7. Pest Resistance Bonus (Weight: 5)
            const pestBonus = calculatePestResistance(crop, risks.pest);
            score += pestBonus.score;
            riskFactors.push(...pestBonus.factors);

            return {
                id: crop.crop_name_english.toLowerCase(),
                nameEn: crop.crop_name_english,
                nameMr: crop.crop_name_marathi,
                matchScore: Math.max(0, Math.min(score, 100)),
                season: crop.season,
                duration: crop.duration_days,
                waterReq: crop.water_requirement,
                tags: [crop.season.split(',')[0], crop.water_requirement + ' Water'],
                image: getCropImage(crop.crop_name_english),
                riskFactors: riskFactors,
                recommendations: recommendations,
                riskLevel: getRiskLevel(score),
                weatherRisk: {
                    disease: risks.disease.overall,
                    pest: risks.pest.overall,
                    stress: risks.stress.overall,
                    overall: risks.overall
                }
            };
        });

        // Sort by score descending and return top 5
        const topCrops = scoredCrops
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        return {
            recommendations: topCrops,
            count: topCrops.length,
            weatherRisk: risks,
            analysis: {
                totalCrops: allCrops.length,
                averageScore: Math.round(topCrops.reduce((sum, crop) => sum + crop.matchScore, 0) / topCrops.length),
                riskLevel: getOverallRiskLevel(risks.overall),
                recommendations: generateOverallRecommendations(risks, topCrops)
            }
        };

    } catch (err) {
        console.error('[ScoringEngine] Error:', err.message);
        return { recommendations: [], error: err.message };
    }
}

/**
 * Calculate crop-specific risk score adjustment
 */
function calculateCropSpecificRisk(crop, risks, weather) {
    let scoreAdjustment = 0;
    let factors = [];
    let recommendations = [];

    // Map crop types to risk categories
    const cropRiskMap = {
        'rice': { disease: 'fungal', pest: 'borers', humiditySensitive: true },
        'wheat': { disease: 'fungal', pest: 'aphids', humiditySensitive: true },
        'cotton': { disease: 'bacterial', pest: 'whiteflies', humiditySensitive: false },
        'soybean': { disease: 'viral', pest: 'mites', humiditySensitive: false },
        'maize': { disease: 'fungal', pest: 'borers', humiditySensitive: true },
        'pulses': { disease: 'bacterial', pest: 'aphids', humiditySensitive: true },
        'sugarcane': { disease: 'fungal', pest: 'borers', humiditySensitive: true },
        'tomato': { disease: 'viral', pest: 'whiteflies', humiditySensitive: false },
        'potato': { disease: 'fungal', pest: 'aphids', humiditySensitive: true },
        'onion': { disease: 'bacterial', pest: 'thrips', humiditySensitive: false }
    };

    const cropName = crop.crop_name_english.toLowerCase();
    const riskProfile = cropRiskMap[cropName] || { disease: 'fungal', pest: 'aphids', humiditySensitive: true };

    // Disease risk adjustment
    if (risks.disease.type === riskProfile.disease) {
        if (risks.disease.overall > 70) {
            scoreAdjustment -= 15;
            recommendations.push(`High ${riskProfile.disease} disease risk - consider resistant varieties`);
        } else if (risks.disease.overall > 50) {
            scoreAdjustment -= 8;
            recommendations.push(`Moderate ${riskProfile.disease} disease risk - monitor closely`);
        } else {
            scoreAdjustment += 5;
            factors.push('Low disease risk');
        }
    }

    // Pest risk adjustment
    if (risks.pest.pestType === riskProfile.pest) {
        if (risks.pest.overall > 70) {
            scoreAdjustment -= 10;
            recommendations.push(`High ${riskProfile.pest} activity risk - implement IPM`);
        } else if (risks.pest.overall > 50) {
            scoreAdjustment -= 5;
            recommendations.push(`Moderate ${riskProfile.pest} risk - increased monitoring`);
        } else {
            scoreAdjustment += 3;
            factors.push('Low pest pressure');
        }
    }

    // Stress risk adjustment
    if (risks.stress.overall > 60) {
        scoreAdjustment -= 8;
        recommendations.push('Environmental stress - provide additional care');
    } else if (risks.stress.overall < 30) {
        scoreAdjustment += 5;
        factors.push('Favorable growing conditions');
    }

    return { scoreAdjustment, factors, recommendations };
}

/**
 * Calculate water requirement score
 */
function calculateWaterScore(crop, rainfall, humidity) {
    let score = 0;
    let factors = [];
    let recommendations = [];

    const waterReq = crop.water_requirement.toLowerCase();
    
    if (waterReq.includes('low')) {
        if (rainfall < 2 && humidity < 50) {
            score = 8;
            factors.push('Low water requirement matches dry conditions');
        } else {
            score = 5;
            factors.push('Low water requirement');
        }
    } else if (waterReq.includes('medium')) {
        if (rainfall >= 2 && rainfall <= 5) {
            score = 8;
            factors.push('Medium water requirement matches rainfall');
        } else if (rainfall < 2) {
            score = 2;
            recommendations.push('Irrigation needed for medium water requirement');
        } else {
            score = 5;
            factors.push('Medium water requirement');
        }
    } else if (waterReq.includes('high')) {
        if (rainfall > 5 || humidity > 70) {
            score = 8;
            factors.push('High water requirement matches conditions');
        } else {
            score = 1;
            recommendations.push('Insufficient water for high requirement crop');
        }
    }

    return { score, factors, recommendations };
}

/**
 * Calculate disease resistance bonus
 */
function calculateDiseaseResistance(crop, diseaseRisk) {
    let score = 0;
    let factors = [];

    // Some crops have natural resistance to certain conditions
    const resistantCrops = {
        'cotton': { drought: true, heat: true },
        'sugarcane': { flood: true, humidity: true },
        'pulses': { drought: true, low_fertility: true },
        'maize': { wind: true, heat: true }
    };

    const cropName = crop.crop_name_english.toLowerCase();
    const resistance = resistantCrops[cropName];

    if (resistance) {
        if (diseaseRisk.overall < 40) {
            score = 5;
            factors.push('Natural disease resistance');
        }
    }

    // General disease pressure bonus
    if (diseaseRisk.overall < 30) {
        score += 3;
        factors.push('Low disease pressure');
    } else if (diseaseRisk.overall > 70) {
        score -= 5;
        factors.push('High disease pressure');
    }

    return { score, factors };
}

/**
 * Calculate pest resistance bonus
 */
function calculatePestResistance(crop, pestRisk) {
    let score = 0;
    let factors = [];

    // Some crops have natural pest resistance
    const pestResistantCrops = {
        'onion': { insects: true, fungi: true },
        'garlic': { insects: true, nematodes: true },
        'marigold': { nematodes: true, insects: true },
        'chilli': { insects: true, fungi: true }
    };

    const cropName = crop.crop_name_english.toLowerCase();
    const resistance = pestResistantCrops[cropName];

    if (resistance) {
        score = 3;
        factors.push('Natural pest resistance');
    }

    // General pest pressure bonus
    if (pestRisk.overall < 30) {
        score += 2;
        factors.push('Low pest pressure');
    } else if (pestRisk.overall > 70) {
        score -= 3;
        factors.push('High pest pressure');
    }

    return { score, factors };
}

/**
 * Get risk level based on score
 */
function getRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'high';
    return 'very-high';
}

/**
 * Get overall risk level
 */
function getOverallRiskLevel(riskScore) {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'moderate';
    return 'low';
}

/**
 * Generate overall recommendations
 */
function generateOverallRecommendations(risks, topCrops) {
    const recommendations = [];

    if (risks.overall > 70) {
        recommendations.push({
            priority: 'high',
            type: 'general',
            message: 'High overall risk - consider delaying planting or choosing resistant varieties'
        });
    }

    if (risks.disease.overall > 60) {
        recommendations.push({
            priority: 'medium',
            type: 'disease',
            message: 'Elevated disease risk - prepare preventive measures'
        });
    }

    if (risks.pest.overall > 60) {
        recommendations.push({
            priority: 'medium',
            type: 'pest',
            message: 'Increased pest activity expected - implement monitoring'
        });
    }

    if (topCrops.length > 0 && topCrops[0].matchScore < 50) {
        recommendations.push({
            priority: 'medium',
            type: 'timing',
            message: 'Current conditions not ideal - consider waiting for better weather'
        });
    }

    return recommendations;
}

// Fallback helper for crop images
function getCropImage(name) {
    const images = {
        'Onion': 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=400',
        'Tomato': 'https://images.unsplash.com/photo-1591857172839-acdec0406fe0?auto=format&fit=crop&q=80&w=400',
        'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400',
        'Cotton': 'https://images.unsplash.com/photo-1594903323955-442d87e148e4?auto=format&fit=crop&q=80&w=400',
        'Soybean': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
        'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'
    };
    return images[name] || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400';
}

module.exports = { generateRecommendations };
