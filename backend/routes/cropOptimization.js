const express = require('express');
const router = express.Router();
const { getWeatherAnalysis } = require('../services/weatherService');
const cropOptimizer = require('../services/cropOptimizer');
const { authenticateToken } = require('../middleware/auth');

/**
 * Get comprehensive crop optimization recommendations
 * GET /api/crop-optimization/recommendations
 */
router.get('/recommendations', async (req, res) => {
    try {
        const { lat, lon, cropType, cropInfo, farmInfo } = req.query;
        
        // Parse and validate parameters
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';
        
        let parsedCropInfo = {};
        let parsedFarmInfo = {};
        
        // Parse crop info if provided
        if (cropInfo) {
            try {
                parsedCropInfo = typeof cropInfo === 'string' ? JSON.parse(cropInfo) : cropInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid cropInfo format, using defaults');
            }
        }
        
        // Parse farm info if provided
        if (farmInfo) {
            try {
                parsedFarmInfo = typeof farmInfo === 'string' ? JSON.parse(farmInfo) : farmInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid farmInfo format, using defaults');
            }
        }

        console.log(`[CropOptimization] Recommendations requested for ${crop} at ${latitude}, ${longitude}`);
        
        // Get comprehensive weather analysis
        const weatherAnalysis = await getWeatherAnalysis(latitude, longitude, crop);
        
        // Generate optimization recommendations
        const optimizationData = cropOptimizer.generateOptimizationRecommendations(
            weatherAnalysis.current,
            weatherAnalysis.current.risk,
            parsedCropInfo,
            parsedFarmInfo
        );
        
        res.json({
            success: true,
            data: {
                weather: weatherAnalysis,
                optimization: optimizationData,
                location: {
                    lat: latitude,
                    lon: longitude,
                    name: weatherAnalysis.location.name
                },
                cropType: crop,
                timestamp: new Date().toISOString()
            },
            message: 'Crop optimization recommendations retrieved successfully'
        });

    } catch (error) {
        console.error('[CropOptimization] Recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get crop optimization recommendations',
            error: error.message
        });
    }
});

/**
 * Get planting optimization specifically
 * GET /api/crop-optimization/planting
 */
router.get('/planting', async (req, res) => {
    try {
        const { lat, lon, cropType, cropInfo } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';
        
        let parsedCropInfo = {};
        if (cropInfo) {
            try {
                parsedCropInfo = typeof cropInfo === 'string' ? JSON.parse(cropInfo) : cropInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid cropInfo format');
            }
        }

        const weatherAnalysis = await getWeatherAnalysis(latitude, longitude, crop);
        const plantingRecs = cropOptimizer.getPlantingRecommendations(
            weatherAnalysis.current,
            weatherAnalysis.current.risk,
            parsedCropInfo
        );
        
        res.json({
            success: true,
            data: {
                recommendations: plantingRecs,
                currentConditions: weatherAnalysis.current,
                riskLevel: weatherAnalysis.current.risk.severity,
                optimalWindow: plantingRecs.filter(rec => rec.priority === 'high'),
                timestamp: new Date().toISOString()
            },
            message: 'Planting recommendations retrieved successfully'
        });

    } catch (error) {
        console.error('[CropOptimization] Planting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get planting recommendations',
            error: error.message
        });
    }
});

/**
 * Get irrigation optimization
 * GET /api/crop-optimization/irrigation
 */
router.get('/irrigation', async (req, res) => {
    try {
        const { lat, lon, cropType, cropInfo } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';
        
        let parsedCropInfo = {};
        if (cropInfo) {
            try {
                parsedCropInfo = typeof cropInfo === 'string' ? JSON.parse(cropInfo) : cropInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid cropInfo format');
            }
        }

        const weatherAnalysis = await getWeatherAnalysis(latitude, longitude, crop);
        const irrigationRecs = cropOptimizer.getIrrigationRecommendations(
            weatherAnalysis.current,
            weatherAnalysis.current.risk,
            parsedCropInfo
        );
        
        res.json({
            success: true,
            data: {
                recommendations: irrigationRecs,
                currentWeather: weatherAnalysis.current,
                waterRequirement: parsedCropInfo.water_requirement || 'medium',
                urgency: irrigationRecs.filter(rec => rec.priority === 'high').length,
                timestamp: new Date().toISOString()
            },
            message: 'Irrigation recommendations retrieved successfully'
        });

    } catch (error) {
        console.error('[CropOptimization] Irrigation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get irrigation recommendations',
            error: error.message
        });
    }
});

/**
 * Get action timeline for the next week
 * GET /api/crop-optimization/timeline
 */
router.get('/timeline', async (req, res) => {
    try {
        const { lat, lon, cropType, cropInfo, farmInfo } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';
        
        let parsedCropInfo = {};
        let parsedFarmInfo = {};
        
        if (cropInfo) {
            try {
                parsedCropInfo = typeof cropInfo === 'string' ? JSON.parse(cropInfo) : cropInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid cropInfo format');
            }
        }
        
        if (farmInfo) {
            try {
                parsedFarmInfo = typeof farmInfo === 'string' ? JSON.parse(farmInfo) : farmInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid farmInfo format');
            }
        }

        const weatherAnalysis = await getWeatherAnalysis(latitude, longitude, crop);
        const optimizationData = cropOptimizer.generateOptimizationRecommendations(
            weatherAnalysis.current,
            weatherAnalysis.current.risk,
            parsedCropInfo,
            parsedFarmInfo
        );
        
        res.json({
            success: true,
            data: {
                timeline: optimizationData.timeline,
                priority: optimizationData.priority.slice(0, 10), // Top 10 priorities
                estimatedBenefits: optimizationData.estimatedBenefits,
                currentRisk: weatherAnalysis.current.risk.overall,
                timestamp: new Date().toISOString()
            },
            message: 'Action timeline retrieved successfully'
        });

    } catch (error) {
        console.error('[CropOptimization] Timeline error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get action timeline',
            error: error.message
        });
    }
});

/**
 * Get estimated benefits analysis
 * GET /api/crop-optimization/benefits
 */
router.get('/benefits', async (req, res) => {
    try {
        const { lat, lon, cropType, cropInfo, farmInfo } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';
        
        let parsedCropInfo = {};
        let parsedFarmInfo = {};
        
        if (cropInfo) {
            try {
                parsedCropInfo = typeof cropInfo === 'string' ? JSON.parse(cropInfo) : cropInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid cropInfo format');
            }
        }
        
        if (farmInfo) {
            try {
                parsedFarmInfo = typeof farmInfo === 'string' ? JSON.parse(farmInfo) : farmInfo;
            } catch (e) {
                console.warn('[CropOptimization] Invalid farmInfo format');
            }
        }

        const weatherAnalysis = await getWeatherAnalysis(latitude, longitude, crop);
        const optimizationData = cropOptimizer.generateOptimizationRecommendations(
            weatherAnalysis.current,
            weatherAnalysis.current.risk,
            parsedCropInfo,
            parsedFarmInfo
        );
        
        res.json({
            success: true,
            data: {
                benefits: optimizationData.estimatedBenefits,
                recommendationsCount: optimizationData.priority.length,
                highPriorityCount: optimizationData.priority.filter(rec => rec.priority === 'high').length,
                implementationCost: this.calculateImplementationCost(optimizationData.priority),
                roi: this.calculateROI(optimizationData.estimatedBenefits),
                timestamp: new Date().toISOString()
            },
            message: 'Benefits analysis retrieved successfully'
        });

    } catch (error) {
        console.error('[CropOptimization] Benefits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get benefits analysis',
            error: error.message
        });
    }
});

/**
 * Calculate implementation cost (helper function)
 */
function calculateImplementationCost(recommendations) {
    let totalCost = 0;
    
    recommendations.forEach(rec => {
        // Simple cost estimation based on priority and type
        if (rec.priority === 'high') {
            totalCost += 100; // Base cost for high priority
        } else if (rec.priority === 'medium') {
            totalCost += 50;
        } else {
            totalCost += 25;
        }
        
        // Add costs for specific types
        if (rec.action.toLowerCase().includes('fertilizer')) {
            totalCost += 80;
        } else if (rec.action.toLowerCase().includes('pesticide') || rec.action.toLowerCase().includes('fungicide')) {
            totalCost += 60;
        } else if (rec.action.toLowerCase().includes('irrigation')) {
            totalCost += 120;
        }
    });
    
    return totalCost;
}

/**
 * Calculate Return on Investment (helper function)
 */
function calculateROI(benefits) {
    // Simple ROI calculation
    const estimatedYieldValue = benefits.estimatedYieldIncrease * 1000; // Assume $1000 per 1% yield increase
    const estimatedCostSavings = benefits.estimatedCostSavings * 500;   // Assume $500 per 1% cost saving
    const totalBenefits = estimatedYieldValue + estimatedCostSavings;
    
    // Assume average implementation cost
    const implementationCost = 500;
    
    const roi = ((totalBenefits - implementationCost) / implementationCost) * 100;
    
    return {
        percentage: Math.round(roi),
        yieldValue: estimatedYieldValue,
        costSavings: estimatedCostSavings,
        totalBenefits: totalBenefits,
        implementationCost: implementationCost
    };
}

module.exports = router;
