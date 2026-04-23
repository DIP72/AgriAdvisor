import { useState, useEffect, useCallback } from 'react';

const useCostSavings = (riskData, yieldPredictions, historicalData) => {
    const [savings, setSavings] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [roi, setRoi] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Cost parameters (per hectare per season)
    const costParameters = {
        rice: {
            seeds: 120,
            fertilizer: 150,
            pesticides: 80,
            irrigation: 200,
            labor: 300,
            equipment: 100,
            total: 850
        },
        wheat: {
            seeds: 100,
            fertilizer: 120,
            pesticides: 60,
            irrigation: 120,
            labor: 250,
            equipment: 80,
            total: 730
        },
        cotton: {
            seeds: 80,
            fertilizer: 180,
            pesticides: 120,
            irrigation: 150,
            labor: 350,
            equipment: 120,
            total: 1000
        },
        maize: {
            seeds: 90,
            fertilizer: 140,
            pesticides: 70,
            irrigation: 180,
            labor: 280,
            equipment: 90,
            total: 850
        },
        general: {
            seeds: 100,
            fertilizer: 140,
            pesticides: 80,
            irrigation: 160,
            labor: 290,
            equipment: 95,
            total: 865
        }
    };

    // Market prices (per ton)
    const marketPrices = {
        rice: 2500,
        wheat: 2200,
        cotton: 4500,
        maize: 2000,
        general: 2300
    };

    // Calculate potential savings from optimized resource usage
    const calculateResourceSavings = useCallback((riskData, cropType) => {
        if (!riskData || !riskData.current) return {};

        const costs = costParameters[cropType] || costParameters.general;
        const savings = {};
        const totalSavings = {};

        // Fertilizer savings based on weather conditions
        if (riskData.current.risk?.fertilizer) {
            const fertilizerRisk = riskData.current.risk.fertilizer.overall;
            
            if (fertilizerRisk < 30) {
                // Good conditions - optimal fertilizer use
                savings.fertilizer = {
                    current: costs.fertilizer,
                    optimized: costs.fertilizer * 0.9, // 10% reduction
                    saved: costs.fertilizer * 0.1,
                    reason: 'Optimal weather conditions reduce fertilizer requirements',
                    efficiency: 'high'
                };
            } else if (fertilizerRisk > 60) {
                // Poor conditions - avoid fertilizer application
                savings.fertilizer = {
                    current: costs.fertilizer,
                    optimized: costs.fertilizer * 0.3, // 70% reduction
                    saved: costs.fertilizer * 0.7,
                    reason: 'High risk of fertilizer burn - avoid application',
                    efficiency: 'very high'
                };
            } else {
                savings.fertilizer = {
                    current: costs.fertilizer,
                    optimized: costs.fertilizer * 0.8, // 20% reduction
                    saved: costs.fertilizer * 0.2,
                    reason: 'Moderate conditions - reduce application rate',
                    efficiency: 'medium'
                };
            }
        }

        // Irrigation savings based on weather conditions
        if (riskData.current.risk?.irrigation) {
            const irrigationRisk = riskData.current.risk.irrigation.overall;
            
            if (irrigationRisk < 20) {
                savings.irrigation = {
                    current: costs.irrigation,
                    optimized: costs.irrigation * 0.6, // 40% reduction
                    saved: costs.irrigation * 0.4,
                    reason: 'Low irrigation demand due to favorable weather',
                    efficiency: 'high'
                };
            } else if (irrigationRisk > 60) {
                savings.irrigation = {
                    current: costs.irrigation,
                    optimized: costs.irrigation * 1.2, // 20% increase
                    saved: -costs.irrigation * 0.2,
                    reason: 'High irrigation demand - increase watering',
                    efficiency: 'low'
                };
            } else {
                savings.irrigation = {
                    current: costs.irrigation,
                    optimized: costs.irrigation * 0.9, // 10% reduction
                    saved: costs.irrigation * 0.1,
                    reason: 'Moderate irrigation needs',
                    efficiency: 'medium'
                };
            }
        }

        // Pesticide savings based on weather conditions
        if (riskData.current.risk?.spraying) {
            const sprayingRisk = riskData.current.risk.spraying.overall;
            
            if (sprayingRisk < 20) {
                savings.pesticides = {
                    current: costs.pesticides,
                    optimized: costs.pesticides * 0.7, // 30% reduction
                    saved: costs.pesticides * 0.3,
                    reason: 'Ideal spraying conditions - maximize effectiveness',
                    efficiency: 'high'
                };
            } else if (sprayingRisk > 60) {
                savings.pesticides = {
                    current: costs.pesticides,
                    optimized: costs.pesticides * 0.2, // 80% reduction
                    saved: costs.pesticides * 0.8,
                    reason: 'High drift risk - avoid spraying',
                    efficiency: 'very high'
                };
            } else {
                savings.pesticides = {
                    current: costs.pesticides,
                    optimized: costs.pesticides * 0.8, // 20% reduction
                    saved: costs.pesticides * 0.2,
                    reason: 'Suboptimal conditions - reduce application',
                    efficiency: 'medium'
                };
            }
        }

        // Labor savings based on field conditions
        if (riskData.current.risk?.overall) {
            const overallRisk = riskData.current.risk.overall;
            
            if (overallRisk < 30) {
                savings.labor = {
                    current: costs.labor,
                    optimized: costs.labor * 0.9, // 10% reduction
                    saved: costs.labor * 0.1,
                    reason: 'Good conditions - efficient field operations',
                    efficiency: 'medium'
                };
            } else if (overallRisk > 70) {
                savings.labor = {
                    current: costs.labor,
                    optimized: costs.labor * 1.3, // 30% increase
                    saved: -costs.labor * 0.3,
                    reason: 'High risk - additional labor needed for protection',
                    efficiency: 'low'
                };
            }
        }

        // Calculate total savings
        totalSavings.current = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
        totalSavings.optimized = Object.values(savings).reduce((sum, saving) => sum + saving.optimized, 0);
        totalSavings.saved = Object.values(savings).reduce((sum, saving) => sum + (saving.saved || 0), 0);

        return { savings, totalSavings };
    }, []);

    // Calculate yield impact on revenue
    const calculateYieldImpact = useCallback((yieldPredictions, cropType) => {
        if (!yieldPredictions || !yieldPredictions.current) return {};

        const baseYield = yieldPredictions.current.baseYield;
        const predictedYield = yieldPredictions.current.predictedYield;
        const marketPrice = marketPrices[cropType] || marketPrices.general;

        const currentRevenue = baseYield * marketPrice;
        const predictedRevenue = predictedYield * marketPrice;
        const revenueChange = predictedRevenue - currentRevenue;
        const revenueChangePercent = (revenueChange / currentRevenue) * 100;

        return {
            baseYield,
            predictedYield,
            marketPrice,
            currentRevenue: Math.round(currentRevenue),
            predictedRevenue: Math.round(predictedRevenue),
            revenueChange: Math.round(revenueChange),
            revenueChangePercent: Math.round(revenueChangePercent * 10) / 10,
            rating: yieldPredictions.current.rating
        };
    }, []);

    // Calculate ROI
    const calculateROI = useCallback((savings, yieldImpact) => {
        if (!savings || !yieldImpact) return {};

        const totalInvestment = savings.totalSavings.current;
        const totalReturn = savings.totalSavings.optimized + yieldImpact.predictedRevenue;
        const netProfit = totalReturn - totalInvestment;
        const roiPercent = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

        return {
            investment: Math.round(totalInvestment),
            returns: Math.round(totalReturn),
            netProfit: Math.round(netProfit),
            roiPercent: Math.round(roiPercent * 10) / 10,
            paybackPeriod: roiPercent > 0 ? Math.round(12 / roiPercent) : null, // months
            efficiency: roiPercent > 20 ? 'excellent' : roiPercent > 10 ? 'good' : roiPercent > 0 ? 'fair' : 'poor'
        };
    }, []);

    // Generate cost-saving recommendations
    const generateRecommendations = useCallback((savings, yieldImpact, roi) => {
        if (!savings || !savings.savings) return [];

        const recommendations = [];

        Object.entries(savings.savings).forEach(([resource, data]) => {
            if (data.saved > 0) {
                recommendations.push({
                    type: 'savings',
                    category: resource,
                    priority: data.saved > 50 ? 'high' : 'medium',
                    title: `Optimize ${resource} usage`,
                    description: data.reason,
                    potentialSavings: Math.round(data.saved),
                    efficiency: data.efficiency,
                    action: data.saved > 50 ? 'Immediate action recommended' : 'Consider implementing'
                });
            } else if (data.saved < 0) {
                recommendations.push({
                    type: 'investment',
                    category: resource,
                    priority: Math.abs(data.saved) > 50 ? 'high' : 'medium',
                    title: `Increase ${resource} budget`,
                    description: data.reason,
                    additionalCost: Math.abs(Math.round(data.saved)),
                    reason: 'Required for optimal crop performance',
                    action: 'Budget adjustment needed'
                });
            }
        });

        // Add yield-based recommendations
        if (yieldImpact && yieldImpact.revenueChange > 0) {
            recommendations.push({
                type: 'opportunity',
                category: 'yield',
                priority: yieldImpact.revenueChangePercent > 10 ? 'high' : 'medium',
                title: 'Maximize yield potential',
                description: `Current conditions support ${yieldImpact.revenueChangePercent}% higher yield`,
                potentialRevenue: yieldImpact.revenueChange,
                action: 'Maintain optimal practices'
            });
        }

        // Sort by priority and potential impact
        recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            const impactA = a.potentialSavings || a.potentialRevenue || 0;
            const impactB = b.potentialSavings || b.potentialRevenue || 0;
            
            return impactB - impactA;
        });

        return recommendations.slice(0, 5); // Top 5 recommendations
    }, []);

    // Calculate historical cost trends
    const calculateCostTrends = useCallback((historicalData, cropType) => {
        if (!historicalData || historicalData.length < 14) return null;

        const recentData = historicalData.slice(7);
        const olderData = historicalData.slice(14, 7);

        const calculatePeriodCosts = (data) => {
            return data.map(day => {
                const costs = costParameters[cropType] || costParameters.general;
                let totalCost = costs.total;

                // Adjust costs based on risk conditions
                if (day.risks?.irrigation > 60) totalCost += costs.irrigation * 0.2; // 20% more irrigation
                if (day.risks?.fertilizer > 60) totalCost -= costs.fertilizer * 0.5; // 50% less fertilizer
                if (day.risks?.pest > 60) totalCost += costs.pesticides * 0.3; // 30% more pesticides

                return {
                    date: day.date,
                    totalCost: Math.round(totalCost),
                    riskLevel: day.risks.overall
                };
            });
        };

        const recentCosts = calculatePeriodCosts(recentData);
        const olderCosts = calculatePeriodCosts(olderData);

        const recentAvg = recentCosts.reduce((sum, c) => sum + c.totalCost, 0) / recentCosts.length;
        const olderAvg = olderCosts.reduce((sum, c) => sum + c.totalCost, 0) / olderCosts.length;

        const trend = recentAvg - olderAvg;
        const trendPercent = (trend / olderAvg) * 100;

        return {
            currentAverage: Math.round(recentAvg),
            previousAverage: Math.round(olderAvg),
            trend: Math.round(trend),
            trendPercent: Math.round(trendPercent * 10) / 10,
            direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            projectedMonthly: Math.round(recentAvg * 4.3), // Assuming monthly cropping
            projectedSeasonal: Math.round(recentAvg * 2) // Assuming 2 seasons per year
        };
    }, []);

    // Initialize calculations
    useEffect(() => {
        setIsLoading(true);

        try {
            const cropType = riskData?.cropType || 'general';
            
            // Calculate savings
            const resourceSavings = calculateResourceSavings(riskData, cropType);
            
            // Calculate yield impact
            const yieldImpact = calculateYieldImpact(yieldPredictions, cropType);
            
            // Calculate ROI
            const roiCalculations = calculateROI(resourceSavings, yieldImpact);
            
            // Generate recommendations
            const costRecommendations = generateRecommendations(resourceSavings, yieldImpact, roiCalculations);
            
            // Calculate cost trends
            const costTrends = calculateCostTrends(historicalData, cropType);

            setSavings(resourceSavings);
            setRoi(roiCalculations);
            setRecommendations(costRecommendations);

            // Store comprehensive data
            setSavings(prev => ({
                ...prev,
                yieldImpact,
                costTrends
            }));

        } catch (error) {
            console.error('Error calculating cost savings:', error);
        } finally {
            setIsLoading(false);
        }
    }, [riskData, yieldPredictions, historicalData, calculateResourceSavings, calculateYieldImpact, calculateROI, generateRecommendations, calculateCostTrends]);

    return {
        savings,
        roi,
        recommendations,
        isLoading,
        calculateResourceSavings,
        calculateYieldImpact,
        calculateROI,
        generateRecommendations
    };
};

export default useCostSavings;
