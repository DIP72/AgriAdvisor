const express = require('express');
const router = express.Router();
const { getWeatherAnalysis } = require('../services/weatherService');
const { authenticateToken } = require('../middleware/auth');

/**
 * Get current weather risk analysis
 * GET /api/weather-risk/current
 */
router.get('/current', async (req, res) => {
    try {
        const { lat, lon, cropType } = req.query;
        
        // Default coordinates (Pune, Maharashtra) if not provided
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';

        console.log(`[WeatherRisk] Analysis requested for ${crop} at ${latitude}, ${longitude}`);
        
        const analysis = await getWeatherAnalysis(latitude, longitude, crop);
        
        res.json({
            success: true,
            data: analysis,
            message: 'Weather risk analysis retrieved successfully'
        });

    } catch (error) {
        console.error('[WeatherRisk] Analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get weather risk analysis',
            error: error.message
        });
    }
});

/**
 * Get 5-day risk forecast
 * GET /api/weather-risk/forecast
 */
router.get('/forecast', async (req, res) => {
    try {
        const { lat, lon, cropType } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';

        console.log(`[WeatherRisk] Forecast requested for ${crop} at ${latitude}, ${longitude}`);
        
        const analysis = await getWeatherAnalysis(latitude, longitude, crop);
        
        res.json({
            success: true,
            data: analysis.forecast,
            message: 'Weather risk forecast retrieved successfully'
        });

    } catch (error) {
        console.error('[WeatherRisk] Forecast error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get weather risk forecast',
            error: error.message
        });
    }
});

/**
 * Get crop-specific risk recommendations
 * GET /api/weather-risk/recommendations
 */
router.get('/recommendations', async (req, res) => {
    try {
        const { lat, lon, cropType } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';

        console.log(`[WeatherRisk] Recommendations requested for ${crop} at ${latitude}, ${longitude}`);
        
        const analysis = await getWeatherAnalysis(latitude, longitude, crop);
        
        res.json({
            success: true,
            data: {
                current: analysis.current.risk.recommendations,
                forecast: analysis.forecast.forecast.map(day => ({
                    day: day.day,
                    date: day.date,
                    recommendations: day.recommendations,
                    risk: day.overall
                })),
                summary: analysis.forecast.summary
            },
            message: 'Risk recommendations retrieved successfully'
        });

    } catch (error) {
        console.error('[WeatherRisk] Recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get risk recommendations',
            error: error.message
        });
    }
});

/**
 * Get risk alerts for high-priority warnings
 * GET /api/weather-risk/alerts
 */
router.get('/alerts', async (req, res) => {
    try {
        const { lat, lon, cropType } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';

        console.log(`[WeatherRisk] Alerts requested for ${crop} at ${latitude}, ${longitude}`);
        
        const analysis = await getWeatherAnalysis(latitude, longitude, crop);
        
        // Filter for high-priority alerts
        const currentAlerts = analysis.current.risk.recommendations.filter(rec => rec.priority === 'high');
        const forecastAlerts = analysis.forecast.forecast
            .filter(day => day.overall > 70)
            .map(day => ({
                day: day.day,
                date: day.date,
                risk: day.overall,
                severity: day.severity,
                recommendations: day.recommendations.filter(rec => rec.priority === 'high')
            }));

        res.json({
            success: true,
            data: {
                current: currentAlerts,
                forecast: forecastAlerts,
                hasAlerts: currentAlerts.length > 0 || forecastAlerts.length > 0
            },
            message: 'Risk alerts retrieved successfully'
        });

    } catch (error) {
        console.error('[WeatherRisk] Alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get risk alerts',
            error: error.message
        });
    }
});

/**
 * Get comparison with previous week
 * GET /api/weather-risk/comparison
 */
router.get('/comparison', async (req, res) => {
    try {
        const { lat, lon, cropType } = req.query;
        
        const latitude = parseFloat(lat) || 18.5204;
        const longitude = parseFloat(lon) || 73.8567;
        const crop = cropType || 'general';

        console.log(`[WeatherRisk] Comparison requested for ${crop} at ${latitude}, ${longitude}`);
        
        const analysis = await getWeatherAnalysis(latitude, longitude, crop);
        
        // Simulate previous week data (in production, this would come from database)
        const previousWeekRisk = Math.round(analysis.current.risk.overall * 0.8 + Math.random() * 20);
        const riskChange = analysis.current.risk.overall - previousWeekRisk;
        const trend = riskChange > 10 ? 'increasing' : riskChange < -10 ? 'decreasing' : 'stable';

        res.json({
            success: true,
            data: {
                current: analysis.current.risk.overall,
                previousWeek: previousWeekRisk,
                change: riskChange,
                trend: trend,
                percentage: Math.round((riskChange / previousWeekRisk) * 100)
            },
            message: 'Risk comparison retrieved successfully'
        });

    } catch (error) {
        console.error('[WeatherRisk] Comparison error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get risk comparison',
            error: error.message
        });
    }
});

module.exports = router;
