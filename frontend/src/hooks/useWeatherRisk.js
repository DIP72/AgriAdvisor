import { useState, useEffect } from 'react';

const useWeatherRisk = (userLocation, cropType = 'general') => {
    const [riskData, setRiskData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connected, setConnected] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Fetch real weather data from OpenWeatherMap API
    useEffect(() => {
        if (!userLocation) return;

        const fetchWeatherData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use the API key from environment or fallback
                const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '669bb3aebebfb11c8ba58b45a0efe970';
                
                // Fetch current weather
                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${API_KEY}&units=metric`
                );

                if (!weatherResponse.ok) {
                    throw new Error(`Weather API error: ${weatherResponse.status}`);
                }

                const weatherData = await weatherResponse.json();

                // Fetch 5-day forecast
                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${API_KEY}&units=metric`
                );

                if (!forecastResponse.ok) {
                    throw new Error(`Forecast API error: ${forecastResponse.status}`);
                }

                const forecastData = await forecastResponse.json();

                // Calculate real risk scores based on actual weather data
                const riskAnalysis = calculateRiskScores(weatherData, cropType);
                
                // Process forecast data
                const processedForecast = forecastData.list.slice(0, 5).map(item => ({
                    date: item.dt_txt,
                    temperature: item.main.temp,
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed * 3.6, // Convert m/s to km/h
                    rainfall: item.rain?.['3h'] || 0,
                    description: item.weather[0].description,
                    risk: calculateRiskScores(item, cropType).overall
                }));

                const locationName = userLocation ? 
                    `${weatherData.name || 'Your Location'} (${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)})` : 
                    "Unknown Location";

                // Validate that we received real data
                const isRealData = weatherData && weatherData.main && weatherData.weather && weatherData.name;
                
                if (!isRealData) {
                    console.warn('Received invalid weather data:', weatherData);
                    throw new Error('Invalid weather data received from API');
                }

                const realData = {
                    current: {
                        temperature: Math.round(weatherData.main.temp),
                        humidity: weatherData.main.humidity,
                        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
                        rainfall: weatherData.rain?.['1h'] || 0,
                        pressure: weatherData.main.pressure,
                        source: "OpenWeatherMap API",
                        location: locationName,
                        description: weatherData.weather[0].description,
                        risk: riskAnalysis,
                        timestamp: new Date().toISOString(),
                        apiTimestamp: new Date(weatherData.dt * 1000).toISOString(), // API timestamp
                        coordinates: {
                            lat: weatherData.coord.lat,
                            lon: weatherData.coord.lon
                        },
                        weatherId: weatherData.weather[0].id,
                        isReal: true
                    },
                    forecast: {
                        current: riskAnalysis,
                        forecast: processedForecast,
                        source: "OpenWeatherMap API",
                        isReal: true
                    },
                    summary: {
                        averageRisk: processedForecast.reduce((sum, day) => sum + day.risk, 0) / processedForecast.length,
                        peakRisk: Math.max(...processedForecast.map(day => day.risk)),
                        trend: getRiskTrend(processedForecast),
                        recommendation: getRecommendation(riskAnalysis.overall),
                        isReal: true
                    }
                };

                // Log real data verification
                console.log('=== REAL WEATHER DATA VERIFICATION ===');
                console.log('API Source:', realData.current.source);
                console.log('Location:', realData.current.location);
                console.log('Coordinates:', realData.current.coordinates);
                console.log('Temperature:', realData.current.temperature, '°C');
                console.log('Humidity:', realData.current.humidity, '%');
                console.log('Wind Speed:', realData.current.windSpeed, 'km/h');
                console.log('Rainfall:', realData.current.rainfall, 'mm');
                console.log('Description:', realData.current.description);
                console.log('API Timestamp:', realData.current.apiTimestamp);
                console.log('Data is REAL:', realData.current.isReal);
                console.log('Risk Analysis Based on Real Data:', realData.current.risk);
                console.log('=========================================');

                setRiskData(realData);
                setLastUpdate(new Date());
                setConnected(true);

            } catch (err) {
                console.error('Error fetching weather data:', err);
                setError(err.message);
                setConnected(false);
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();

        // Refresh every 30 minutes
        const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
        return () => clearInterval(interval);

    }, [userLocation, cropType]);

    // Calculate real risk scores based on weather data
    const calculateRiskScores = (weatherData, cropType) => {
        const temp = weatherData.main?.temp || 0;
        const humidity = weatherData.main?.humidity || 0;
        const windSpeed = (weatherData.wind?.speed || 0) * 3.6; // Convert to km/h
        const rainfall = weatherData.rain?.['1h'] || 0;

        console.log('Risk Analysis Calculation:');
        console.log('Input weather data:', { temp, humidity, windSpeed, rainfall, cropType });

        let overallRisk = 0;
        let pestRisk = 0;
        let stressRisk = 0;
        let irrigationRisk = 0;
        let fertilizerRisk = 0;
        let harvestRisk = 0;
        let storageRisk = 0;
        let plantingRisk = 0;
        let sprayingRisk = 0;

        // 1. Enhanced Disease Risk Calculation - Real-Time Weather-Based Disease Analysis
        console.log('=== REAL-TIME DISEASE RISK ANALYSIS ===');
        console.log('Current Weather Conditions:', { temp, humidity, windSpeed, rainfall, cropType });

        // Disease Risk Factors Based on Real Weather Conditions
        let diseaseRiskScore = 0;
        let diseaseFactors = [];
        let diseaseType = 'general';
        let diseaseSeverity = 'low';

        // Temperature-based disease risk (real-time analysis)
        if (temp >= 25 && temp <= 30) {
            // Optimal temperature range for many fungal diseases
            diseaseRiskScore += 30;
            diseaseFactors.push(`Optimal fungal disease temperature: ${temp}°C`);
            diseaseType = 'fungal';
        } else if (temp > 30 && temp <= 35) {
            // High temperature promotes bacterial diseases
            diseaseRiskScore += 25;
            diseaseFactors.push(`High temp bacterial risk: ${temp}°C`);
            diseaseType = 'bacterial';
        } else if (temp < 15) {
            // Low temperature favors certain fungal diseases
            diseaseRiskScore += 20;
            diseaseFactors.push(`Low temp fungal risk: ${temp}°C`);
            diseaseType = 'fungal';
        } else if (temp > 35) {
            // Extreme heat can cause heat stress diseases
            diseaseRiskScore += 15;
            diseaseFactors.push(`Heat stress disease risk: ${temp}°C`);
            diseaseType = 'stress';
        }

        // Humidity-based disease risk (real-time analysis)
        if (humidity >= 80) {
            // High humidity is critical for fungal disease development
            diseaseRiskScore += 35;
            diseaseFactors.push(`Critical fungal humidity: ${humidity}%`);
            diseaseType = 'fungal';
        } else if (humidity >= 65 && humidity < 80) {
            // Moderate-high humidity favors disease spread
            diseaseRiskScore += 25;
            diseaseFactors.push(`High disease humidity: ${humidity}%`);
            if (diseaseType === 'general') diseaseType = 'fungal';
        } else if (humidity >= 50 && humidity < 65) {
            // Moderate humidity - some disease risk
            diseaseRiskScore += 15;
            diseaseFactors.push(`Moderate disease humidity: ${humidity}%`);
        } else if (humidity < 30) {
            // Low humidity can cause stress-related diseases
            diseaseRiskScore += 10;
            diseaseFactors.push(`Low humidity stress: ${humidity}%`);
            diseaseType = 'stress';
        }

        // Rainfall-based disease risk (real-time analysis)
        if (rainfall > 10) {
            // Heavy rainfall creates ideal conditions for fungal diseases
            diseaseRiskScore += 30;
            diseaseFactors.push(`Heavy rain fungal spread: ${rainfall}mm`);
            diseaseType = 'fungal';
        } else if (rainfall > 5 && rainfall <= 10) {
            // Moderate rainfall increases disease risk
            diseaseRiskScore += 20;
            diseaseFactors.push(`Rain disease spread: ${rainfall}mm`);
            if (diseaseType === 'general') diseaseType = 'fungal';
        } else if (rainfall > 0 && rainfall <= 5) {
            // Light rain can spread fungal spores
            diseaseRiskScore += 10;
            diseaseFactors.push(`Light rain spore spread: ${rainfall}mm`);
        }

        // Wind-based disease risk (real-time analysis)
        if (windSpeed > 20) {
            // High winds can spread disease spores over long distances
            diseaseRiskScore += 15;
            diseaseFactors.push(`Wind spore dispersal: ${windSpeed}km/h`);
        } else if (windSpeed < 5) {
            // Low wind allows fungal spores to settle
            diseaseRiskScore += 10;
            diseaseFactors.push(`Low wind spore settlement: ${windSpeed}km/h`);
        }

        // Crop-specific disease risk (real-time analysis)
        if (cropType === 'rice') {
            // Rice is highly susceptible to fungal diseases in humid conditions
            if (humidity >= 70 && temp >= 25 && temp <= 30) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Rice blast conditions - optimal fungal environment');
                diseaseType = 'fungal';
            }
            if (rainfall > 5) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Rice bacterial leaf blight risk - high rainfall');
                diseaseType = 'bacterial';
            }
            if (temp > 32) {
                diseaseRiskScore += 20;
                diseaseFactors.push('Rice sheath blight risk - high temperature');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'wheat') {
            // Wheat susceptible to rust in moderate temperatures
            if (temp >= 15 && temp <= 25 && humidity >= 60) {
                diseaseRiskScore += 40;
                diseaseFactors.push('Wheat rust conditions - moderate temperature & humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 2 && rainfall <= 8) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Wheat septoria tritici blotch - moderate rainfall');
            }
            if (temp < 10 && humidity > 70) {
                diseaseRiskScore += 20;
                diseaseFactors.push('Wheat snow mold risk - cold & humid');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'cotton') {
            // Cotton susceptible to fungal diseases in warm, humid conditions
            if (temp >= 25 && temp <= 32 && humidity >= 60) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Cotton boll rot conditions - warm & humid');
                diseaseType = 'fungal';
            }
            if (humidity > 80 && temp > 28) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Cotton alternaria leaf spot - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 10) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Cotton bacterial blight - heavy rainfall');
                diseaseType = 'bacterial';
            }
        } else if (cropType === 'maize') {
            // Maize susceptible to fungal diseases in warm, humid conditions
            if (temp >= 20 && temp <= 30 && humidity >= 65) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Maize northern leaf blight risk - warm & humid');
                diseaseType = 'fungal';
            }
            if (temp > 30 && humidity > 70) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Maize southern leaf blight - hot & humid');
                diseaseType = 'fungal';
            }
            if (rainfall > 8) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Maize common rust - high rainfall');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'sugarcane') {
            // Sugarcane disease risk
            if (humidity > 75 && temp > 25) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Sugarcane red rot - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 15) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Sugarcane smut - heavy rainfall');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'pulses') {
            // Pulses disease risk
            if (humidity > 70 && temp > 25) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Pulse powdery mildew - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 5) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Pulse bacterial blight - moderate rainfall');
                diseaseType = 'bacterial';
            }
        } else if (cropType === 'groundnut') {
            // Groundnut disease risk
            if (humidity > 80 && temp > 28) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Groundnut leaf spot - very high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 10) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Groundnut rust - heavy rainfall');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'soybean') {
            // Soybean disease risk
            if (humidity > 70 && temp > 22) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Soybean phytophthora root rot - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 8) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Soybean bacterial pustule - moderate rainfall');
                diseaseType = 'bacterial';
            }
        } else if (cropType === 'turmeric') {
            // Turmeric disease risk
            if (humidity > 80 && temp > 25) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Turmeric leaf blotch - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 12) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Turmeric rhizome rot - heavy rainfall');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'chilli') {
            // Chilli disease risk
            if (humidity > 75 && temp > 25) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Chilli leaf curl virus - high humidity');
                diseaseType = 'viral';
            }
            if (rainfall > 6) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Chilli bacterial spot - moderate rainfall');
                diseaseType = 'bacterial';
            }
        } else if (cropType === 'tomato') {
            // Tomato disease risk
            if (humidity > 80 && temp > 22) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Tomato early blight - high humidity');
                diseaseType = 'fungal';
            }
            if (temp > 28 && humidity > 70) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Tomato bacterial wilt - hot & humid');
                diseaseType = 'bacterial';
            }
        } else if (cropType === 'onion') {
            // Onion disease risk
            if (humidity > 70 && temp > 20) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Onion purple blotch - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 8) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Onion downy mildew - moderate rainfall');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'potato') {
            // Potato disease risk
            if (humidity > 75 && temp > 18) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Potato late blight - high humidity');
                diseaseType = 'fungal';
            }
            if (temp > 25 && humidity > 70) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Potato early blight - warm & humid');
                diseaseType = 'fungal';
            }
        } else if (cropType === 'banana') {
            // Banana disease risk
            if (humidity > 85 && temp > 25) {
                diseaseRiskScore += 35;
                diseaseFactors.push('Banana sigatoka disease - very high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 15) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Banana bacterial wilt - heavy rainfall');
                diseaseType = 'bacterial';
            }
        } else if (cropType === 'mango') {
            // Mango disease risk
            if (humidity > 70 && temp > 25) {
                diseaseRiskScore += 30;
                diseaseFactors.push('Mango anthracnose - high humidity');
                diseaseType = 'fungal';
            }
            if (rainfall > 10) {
                diseaseRiskScore += 25;
                diseaseFactors.push('Mango powdery mildew - moderate rainfall');
                diseaseType = 'fungal';
            }
        } else {
            // General crop disease risk
            if (humidity > 70 && temp > 20) {
                diseaseRiskScore += 20;
                diseaseFactors.push('General fungal disease conditions');
                diseaseType = 'fungal';
            }
            if (rainfall > 5) {
                diseaseRiskScore += 15;
                diseaseFactors.push('General bacterial disease risk');
            }
        }

        // Calculate disease severity based on real-time conditions
        if (diseaseRiskScore >= 70) {
            diseaseSeverity = 'critical';
        } else if (diseaseRiskScore >= 50) {
            diseaseSeverity = 'high';
        } else if (diseaseRiskScore >= 30) {
            diseaseSeverity = 'moderate';
        } else {
            diseaseSeverity = 'low';
        }

        // Cap disease risk at 100
        diseaseRiskScore = Math.min(100, diseaseRiskScore);

        console.log('Disease Risk Analysis Results:');
        console.log('Disease Risk Score:', diseaseRiskScore);
        console.log('Disease Type:', diseaseType);
        console.log('Disease Severity:', diseaseSeverity);
        console.log('Disease Factors:', diseaseFactors);
        console.log('=====================================');

        // 2. Crop-specific risk calculations for all 10 parameters
        if (cropType === 'rice') {
            // Rice-specific risk calculations
            if (temp > 35) {
                overallRisk += 25;
                pestRisk += 30;  // Rice pests thrive in heat
                stressRisk += 35;
                irrigationRisk += 40;  // Rice needs more water
                sprayingRisk += 25;
                fertilizerRisk += 20;
                harvestRisk += 15;
                storageRisk += 25;
                plantingRisk += 10;
            } else if (temp < 15) {
                overallRisk += 20;
                pestRisk += 15;
                stressRisk += 40;
                irrigationRisk += 20;
                sprayingRisk += 10;
                storageRisk += 30;
            }
            
            if (humidity > 80) {
                overallRisk += 30;
                pestRisk += 25;  // High humidity increases pest risk
                storageRisk += 40;  // Storage issues in high humidity
                harvestRisk += 20;
            }
            
            if (rainfall > 10) {
                overallRisk += 25;
                irrigationRisk += 5;  // Less irrigation needed
                harvestRisk += 35;  // Harvest issues in heavy rain
                sprayingRisk += 30;
                storageRisk += 25;
            } else if (rainfall < 2) {
                irrigationRisk += 45;  // High irrigation need
                stressRisk += 30;
            }
            
        } else if (cropType === 'wheat') {
            // Wheat-specific risk calculations
            if (temp > 30) {
                overallRisk += 30;
                pestRisk += 20;
                stressRisk += 40;
                irrigationRisk += 35;
                sprayingRisk += 25;
                fertilizerRisk += 15;
                harvestRisk += 20;
                storageRisk += 20;
            } else if (temp < 10) {
                overallRisk += 25;
                stressRisk += 45;
                irrigationRisk += 15;
                storageRisk += 35;
            }
            
            if (humidity > 75) {
                overallRisk += 25;
                pestRisk += 20;
                storageRisk += 30;
                harvestRisk += 25;
            }
            
            if (rainfall > 8) {
                overallRisk += 20;
                irrigationRisk += 10;
                harvestRisk += 30;
                sprayingRisk += 25;
            }
            
        } else if (cropType === 'cotton') {
            // Cotton-specific risk calculations
            if (temp > 35) {
                overallRisk += 35;
                pestRisk += 25;  // Cotton pests love heat
                stressRisk += 30;
                irrigationRisk += 30;
                sprayingRisk += 35;  // More spraying needed
                fertilizerRisk += 20;
                harvestRisk += 25;
            } else if (temp < 18) {
                overallRisk += 30;
                stressRisk += 40;
                irrigationRisk += 20;
                plantingRisk += 25;
            }
            
            if (humidity > 70) {
                overallRisk += 25;
                pestRisk += 30;
                storageRisk += 35;
                harvestRisk += 20;
            }
            
            if (rainfall > 12) {
                overallRisk += 30;
                harvestRisk += 40;
                sprayingRisk += 35;
                storageRisk += 25;
            }
            
        } else if (cropType === 'maize') {
            // Maize-specific risk calculations
            if (temp > 35) {
                overallRisk += 30;
                pestRisk += 25;
                stressRisk += 35;
                irrigationRisk += 35;
                sprayingRisk += 30;
                fertilizerRisk += 20;
                harvestRisk += 20;
            } else if (temp < 15) {
                overallRisk += 25;
                stressRisk += 40;
                irrigationRisk += 20;
                plantingRisk += 20;
            }
            
            if (humidity > 75) {
                overallRisk += 20;
                pestRisk += 25;
                storageRisk += 30;
            }
            
            if (rainfall > 10) {
                overallRisk += 25;
                irrigationRisk += 15;
                harvestRisk += 30;
                sprayingRisk += 25;
            } else if (rainfall < 3) {
                irrigationRisk += 40;
                stressRisk += 25;
            }
            
        } else if (cropType === 'sugarcane') {
            // Sugarcane-specific risk calculations
            if (temp > 35) {
                overallRisk += 25;
                pestRisk += 20;
                stressRisk += 30;
                irrigationRisk += 40;  // High water needs
                sprayingRisk += 25;
                harvestRisk += 15;
            }
            
            if (humidity > 80) {
                overallRisk += 20;
                pestRisk += 25;
                storageRisk += 35;
            }
            
            if (rainfall > 15) {
                overallRisk += 25;
                irrigationRisk += 10;
                harvestRisk += 35;
                sprayingRisk += 30;
            } else if (rainfall < 5) {
                irrigationRisk += 45;
                stressRisk += 30;
            }
            
        } else if (cropType === 'pulses') {
            // Pulses-specific risk calculations
            if (temp > 32) {
                overallRisk += 30;
                pestRisk += 25;
                stressRisk += 35;
                irrigationRisk += 25;
                sprayingRisk += 20;
                fertilizerRisk += 15;
            } else if (temp < 12) {
                overallRisk += 25;
                stressRisk += 40;
                irrigationRisk += 15;
            }
            
            if (humidity > 70) {
                overallRisk += 20;
                pestRisk += 20;
                storageRisk += 25;
            }
            
            if (rainfall > 8) {
                overallRisk += 20;
                irrigationRisk += 10;
                harvestRisk += 25;
                sprayingRisk += 20;
            } else if (rainfall < 2) {
                irrigationRisk += 35;
                stressRisk += 25;
            }
            
        } else if (cropType === 'tomato') {
            // Tomato-specific risk calculations
            if (temp > 32) {
                overallRisk += 35;
                pestRisk += 30;
                stressRisk += 40;
                irrigationRisk += 35;
                sprayingRisk += 35;
                fertilizerRisk += 25;
                harvestRisk += 25;
            } else if (temp < 15) {
                overallRisk += 30;
                stressRisk += 45;
                irrigationRisk += 20;
                plantingRisk += 25;
            }
            
            if (humidity > 80) {
                overallRisk += 30;
                pestRisk += 25;
                storageRisk += 40;
                harvestRisk += 25;
            }
            
            if (rainfall > 10) {
                overallRisk += 25;
                irrigationRisk += 10;
                harvestRisk += 35;
                sprayingRisk += 30;
                storageRisk += 30;
            }
            
        } else if (cropType === 'potato') {
            // Potato-specific risk calculations
            if (temp > 28) {
                overallRisk += 30;
                pestRisk += 25;
                stressRisk += 35;
                irrigationRisk += 30;
                sprayingRisk += 30;
                fertilizerRisk += 20;
                harvestRisk += 20;
            } else if (temp < 12) {
                overallRisk += 25;
                stressRisk += 40;
                irrigationRisk += 15;
                storageRisk += 30;
            }
            
            if (humidity > 75) {
                overallRisk += 25;
                pestRisk += 20;
                storageRisk += 35;
                harvestRisk += 25;
            }
            
            if (rainfall > 8) {
                overallRisk += 20;
                irrigationRisk += 10;
                harvestRisk += 30;
                sprayingRisk += 25;
            }
            
        } else {
            // Default/General crop risk calculations
            if (temp > 35) {
                overallRisk += 25;
                pestRisk += 20;
                stressRisk += 35;
                irrigationRisk += 30;
                sprayingRisk += 25;
            } else if (temp < 15) {
                overallRisk += 20;
                pestRisk += 15;
                stressRisk += 30;
                irrigationRisk += 20;
                sprayingRisk += 15;
            }
            
            if (humidity > 80) {
                overallRisk += 20;
                pestRisk += 15;
                storageRisk += 25;
            }
            
            if (rainfall > 10) {
                overallRisk += 20;
                irrigationRisk += 10;
                harvestRisk += 25;
                sprayingRisk += 20;
            } else if (rainfall < 2) {
                irrigationRisk += 35;
                stressRisk += 20;
            }
        }

        // 3. Wind-based risk calculations (crop-specific adjustments)
        if (windSpeed > 25) {
            overallRisk += 15;
            stressRisk += 25;
            sprayingRisk += 35;
            harvestRisk += 20;
            if (cropType === 'cotton') {
                harvestRisk += 15;  // Cotton bolls affected by wind
            }
        } else if (windSpeed > 15) {
            overallRisk += 10;
            stressRisk += 15;
            sprayingRisk += 20;
        } else if (windSpeed < 5) {
            overallRisk += 5;
            sprayingRisk += 10;
            if (cropType === 'rice') {
                diseaseRiskScore += 10;  // Low wind helps fungal diseases
            }
        }

        // 4. Time-based risk calculations (current hour)
        const currentHour = new Date().getHours();
        if (currentHour >= 11 && currentHour <= 15) {
            // Peak heat hours
            stressRisk += 20;
            sprayingRisk += 15;
            if (cropType === 'tomato' || cropType === 'cotton') {
                stressRisk += 10;  // Heat-sensitive crops
            }
        } else if (currentHour >= 6 && currentHour <= 10) {
            // Morning hours - good for most activities
            plantingRisk -= 10;
            sprayingRisk -= 5;
        } else if (currentHour >= 16 && currentHour <= 18) {
            // Evening hours
            harvestRisk -= 10;
            fertilizerRisk -= 5;
        }

        // Cap all risks at 100%
        overallRisk = Math.min(100, overallRisk);
        pestRisk = Math.min(100, pestRisk);
        stressRisk = Math.min(100, stressRisk);
        irrigationRisk = Math.min(100, irrigationRisk);
        fertilizerRisk = Math.min(100, fertilizerRisk);
        harvestRisk = Math.min(100, harvestRisk);
        storageRisk = Math.min(100, storageRisk);
        plantingRisk = Math.min(100, plantingRisk);
        sprayingRisk = Math.min(100, sprayingRisk);

        console.log('Final risk scores:', {
            overall: Math.round(overallRisk),
            disease: Math.round(diseaseRiskScore),
            pest: Math.round(pestRisk),
            stress: Math.round(stressRisk),
            irrigation: Math.round(irrigationRisk),
            fertilizer: Math.round(fertilizerRisk),
            harvest: Math.round(harvestRisk),
            storage: Math.round(storageRisk),
            planting: Math.round(plantingRisk),
            spraying: Math.round(sprayingRisk)
        });

        return {
            overall: Math.round(overallRisk),
            disease: {
                overall: Math.round(diseaseRiskScore),
                type: diseaseType,
                factors: diseaseFactors,
                severity: diseaseSeverity
            },
            pest: {
                overall: Math.round(pestRisk),
                pestType: pestRisk > 50 ? "borers" : pestRisk > 25 ? "aphids" : "mites",
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'pest', cropType),
                severity: getSeverity(pestRisk)
            },
            stress: {
                overall: Math.round(stressRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'stress', cropType),
                severity: getSeverity(stressRisk)
            },
            irrigation: {
                overall: Math.round(irrigationRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'irrigation', cropType),
                severity: getSeverity(irrigationRisk)
            },
            fertilizer: {
                overall: Math.round(fertilizerRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'fertilizer', cropType),
                severity: getSeverity(fertilizerRisk)
            },
            harvest: {
                overall: Math.round(harvestRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'harvest', cropType),
                severity: getSeverity(harvestRisk)
            },
            storage: {
                overall: Math.round(storageRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'storage', cropType),
                severity: getSeverity(storageRisk)
            },
            planting: {
                overall: Math.round(plantingRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'planting', cropType),
                severity: getSeverity(plantingRisk)
            },
            spraying: {
                overall: Math.round(sprayingRisk),
                factors: getRiskFactors(temp, humidity, rainfall, windSpeed, 'spraying', cropType),
                severity: getSeverity(sprayingRisk)
            },
            recommendations: getRecommendations(overallRisk, diseaseRiskScore, pestRisk, stressRisk, irrigationRisk, fertilizerRisk, harvestRisk, storageRisk, plantingRisk, sprayingRisk, cropType)
        };
    };

    const getRiskFactors = (temp, humidity, rainfall, windSpeed, riskType, cropType = 'general') => {
        const factors = [];
        
        // Crop-specific risk factors
        if (cropType === 'rice') {
            if (riskType === 'irrigation') {
                if (rainfall < 2) factors.push('Rice requires flooding irrigation');
                if (temp > 35) factors.push('High evaporation increases water needs');
                if (humidity < 40) factors.push('Low humidity increases irrigation demand');
            } else if (riskType === 'pest') {
                if (temp > 30) factors.push('Brown planthopper activity increases');
                if (humidity > 70) factors.push('Rice hispa beetle thrives in humidity');
                if (rainfall > 5) factors.push('Rice stem borer breeding conditions');
            } else if (riskType === 'stress') {
                if (temp > 35) factors.push('Rice heat stress affects grain filling');
                if (humidity < 40) factors.push('Low humidity causes leaf rolling');
                if (rainfall < 2) factors.push('Drought stress reduces tillering');
            } else if (riskType === 'harvest') {
                if (rainfall > 10) factors.push('Heavy rain delays rice harvesting');
                if (windSpeed > 20) factors.push('Strong wind causes grain shattering');
                if (humidity > 80) factors.push('High humidity affects grain quality');
            } else if (riskType === 'storage') {
                if (humidity > 75) factors.push('High humidity causes grain spoilage');
                if (temp > 30) factors.push('High temperature promotes pest activity');
                if (rainfall > 5) factors.push('Moisture content too high for storage');
            }
        } else if (cropType === 'wheat') {
            if (riskType === 'irrigation') {
                if (temp > 30) factors.push('Wheat needs more water in heat');
                if (rainfall < 3) factors.push('Dry conditions require irrigation');
                if (humidity < 30) factors.push('Low humidity increases water stress');
            } else if (riskType === 'pest') {
                if (temp > 25) factors.push('Aphid population increases in warmth');
                if (humidity > 70) factors.push('Wheat rust spores spread in humidity');
                if (rainfall > 5) factors.push('Armyworm breeding conditions');
            } else if (riskType === 'stress') {
                if (temp < 10) factors.push('Cold stress affects wheat development');
                if (temp > 32) factors.push('Heat stress reduces grain filling');
                if (humidity < 30) factors.push('Dry stress affects tillering');
            } else if (riskType === 'harvest') {
                if (rainfall > 8) factors.push('Rain delays wheat harvesting');
                if (windSpeed > 25) factors.push('Strong wind causes lodging');
                if (humidity > 75) factors.push('High humidity affects grain quality');
            } else if (riskType === 'storage') {
                if (humidity > 70) factors.push('High humidity causes fungal growth');
                if (temp > 25) factors.push('Warm storage promotes insect activity');
                if (rainfall > 5) factors.push('Moisture content too high');
            }
        } else if (cropType === 'cotton') {
            if (riskType === 'irrigation') {
                if (temp > 35) factors.push('Cotton needs frequent irrigation');
                if (rainfall < 3) factors.push('Dry conditions affect boll development');
                if (humidity < 40) factors.push('Low humidity affects flowering');
            } else if (riskType === 'pest') {
                if (temp > 28) factors.push('Bollworm activity increases in heat');
                if (humidity > 70) factors.push('Whitefly thrives in humidity');
                if (rainfall > 8) factors.push('Jassid breeding conditions');
            } else if (riskType === 'stress') {
                if (temp < 18) factors.push('Cold stress affects cotton growth');
                if (temp > 38) factors.push('Heat stress causes boll shedding');
                if (humidity < 30) factors.push('Dry stress affects boll retention');
            } else if (riskType === 'harvest') {
                if (rainfall > 12) factors.push('Heavy rain delays cotton picking');
                if (windSpeed > 20) factors.push('Wind affects cotton quality');
                if (humidity > 75) factors.push('High humidity affects fiber quality');
            } else if (riskType === 'storage') {
                if (humidity > 65) factors.push('Moisture affects cotton fiber');
                if (temp > 30) factors.push('Heat causes fiber degradation');
                if (rainfall > 5) factors.push('Moisture content too high');
            }
        } else if (cropType === 'maize') {
            if (riskType === 'irrigation') {
                if (temp > 32) factors.push('Maize needs more water in heat');
                if (rainfall < 3) factors.push('Dry conditions affect pollination');
                if (humidity < 40) factors.push('Low humidity affects tasseling');
            } else if (riskType === 'pest') {
                if (temp > 25) factors.push('Corn borer activity increases');
                if (humidity > 70) factors.push('Fall armyworm thrives in humidity');
                if (rainfall > 6) factors.push('Cutworm breeding conditions');
            } else if (riskType === 'stress') {
                if (temp < 15) factors.push('Cold stress affects germination');
                if (temp > 35) factors.push('Heat stress affects pollination');
                if (humidity < 35) factors.push('Dry stress affects silk emergence');
            } else if (riskType === 'harvest') {
                if (rainfall > 10) factors.push('Rain delays maize harvesting');
                if (windSpeed > 25) factors.push('Strong wind causes lodging');
                if (humidity > 75) factors.push('High humidity affects grain drying');
            } else if (riskType === 'storage') {
                if (humidity > 70) factors.push('High humidity causes fungal growth');
                if (temp > 25) factors.push('Warm storage promotes insect activity');
                if (rainfall > 5) factors.push('Moisture content too high');
            }
        } else if (cropType === 'tomato') {
            if (riskType === 'irrigation') {
                if (temp > 30) factors.push('Tomato needs consistent irrigation');
                if (rainfall < 2) factors.push('Dry conditions cause fruit cracking');
                if (humidity < 40) factors.push('Low humidity affects fruit set');
            } else if (riskType === 'pest') {
                if (temp > 25) factors.push('Whitefly activity increases');
                if (humidity > 75) factors.push('Early blight thrives in humidity');
                if (rainfall > 5) factors.push('Fruit fly breeding conditions');
            } else if (riskType === 'stress') {
                if (temp < 15) factors.push('Cold stress affects flowering');
                if (temp > 32) factors.push('Heat stress causes flower drop');
                if (humidity < 35) factors.push('Dry stress affects fruit development');
            } else if (riskType === 'harvest') {
                if (rainfall > 8) factors.push('Rain affects tomato quality');
                if (windSpeed > 20) factors.push('Wind damages tomato plants');
                if (humidity > 75) factors.push('High humidity affects fruit ripening');
            } else if (riskType === 'storage') {
                if (humidity > 70) factors.push('High humidity causes spoilage');
                if (temp > 20) factors.push('Warm storage accelerates ripening');
                if (rainfall > 5) factors.push('Moisture content too high');
            }
        } else {
            // Generic risk factors for other crops
            if (riskType === 'irrigation') {
                if (temp > 35) factors.push(`High temperature ${Math.round(temp)}°C increases water needs`);
                if (rainfall < 2) factors.push(`Low rainfall ${rainfall}mm requires irrigation`);
                if (humidity < 40) factors.push(`Low humidity ${humidity}% increases irrigation demand`);
            } else if (riskType === 'pest') {
                if (temp > 30) factors.push(`High temperature ${Math.round(temp)}°C increases pest activity`);
                if (humidity > 70) factors.push(`High humidity ${humidity}% promotes pest breeding`);
                if (rainfall > 5) factors.push(`Moderate rainfall ${rainfall}mm creates breeding conditions`);
            } else if (riskType === 'stress') {
                if (temp > 35) factors.push(`Heat stress at ${Math.round(temp)}°C`);
                if (temp < 15) factors.push(`Cold stress at ${Math.round(temp)}°C`);
                if (humidity < 30) factors.push(`Dry stress with ${humidity}% humidity`);
            } else if (riskType === 'harvest') {
                if (rainfall > 10) factors.push(`Heavy rain ${rainfall}mm delays harvesting`);
                if (windSpeed > 20) factors.push(`Strong wind ${Math.round(windSpeed)}km/h affects harvest`);
                if (humidity > 75) factors.push(`High humidity ${humidity}% affects quality`);
            } else if (riskType === 'storage') {
                if (humidity > 70) factors.push(`High humidity ${humidity}% causes spoilage`);
                if (temp > 25) factors.push(`High temperature ${Math.round(temp)}°C promotes pests`);
                if (rainfall > 5) factors.push(`Moisture content too high`);
            }
        }
        
        return factors.length > 0 ? factors : ['Normal conditions'];
    };

    const getSeverity = (score) => {
        if (score >= 70) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 30) return 'moderate';
        return 'low';
    };

    const getRecommendations = (overall, disease, pest, stress, irrigation, fertilizer, harvest, storage, planting, spraying, cropType) => {
        const recommendations = [];
        
        // Crop-specific recommendations
        if (cropType === 'rice') {
            // Rice-specific recommendations
            if (overall > 60) {
                recommendations.push('High overall risk - implement integrated pest management for rice');
            }
            
            if (disease > 50) {
                recommendations.push('Monitor for rice blast and bacterial leaf blight - apply fungicides preventively');
            }
            
            if (pest > 50) {
                recommendations.push('Check for brown planthopper and rice hispa beetle - use pheromone traps');
            }
            
            if (stress > 50) {
                recommendations.push('Increase irrigation frequency and apply foliar nutrients to reduce heat stress');
            }
            
            if (irrigation > 50) {
                recommendations.push('Maintain 2-3 cm standing water in rice fields during critical growth stages');
            } else if (irrigation < 20) {
                recommendations.push('Conserve water - rice is in vegetative stage');
            }
            
            if (fertilizer > 50) {
                recommendations.push('Avoid nitrogen application during high temperature - split application recommended');
            }
            
            if (harvest > 50) {
                recommendations.push('Delay harvesting until weather improves - avoid grain quality loss');
            }
            
            if (storage > 50) {
                recommendations.push('Dry rice to 13% moisture content and use hermetic storage');
            }
            
            if (planting > 50) {
                recommendations.push('Delay rice transplanting - wait for favorable conditions');
            }
            
            if (spraying > 50) {
                recommendations.push('Avoid pesticide spraying - high wind and humidity cause drift');
            }
            
        } else if (cropType === 'wheat') {
            // Wheat-specific recommendations
            if (overall > 60) {
                recommendations.push('High overall risk - implement crop rotation and disease monitoring');
            }
            
            if (disease > 50) {
                recommendations.push('Monitor for wheat rust and septoria - apply resistant varieties');
            }
            
            if (pest > 50) {
                recommendations.push('Check for aphids and armyworms - use biological controls');
            }
            
            if (stress > 50) {
                recommendations.push('Apply anti-stress compounds and adjust irrigation schedule');
            }
            
            if (irrigation > 50) {
                recommendations.push('Increase irrigation during booting and grain filling stages');
            }
            
            if (fertilizer > 50) {
                recommendations.push('Avoid top-dressing during heat stress - use split application');
            }
            
            if (harvest > 50) {
                recommendations.push('Delay harvesting until moisture content is optimal');
            }
            
            if (storage > 50) {
                recommendations.push('Ensure proper aeration and temperature control in wheat storage');
            }
            
            if (planting > 50) {
                recommendations.push('Delay wheat sowing - wait for favorable soil moisture');
            }
            
            if (spraying > 50) {
                recommendations.push('Avoid fungicide application - poor absorption in current conditions');
            }
            
        } else if (cropType === 'cotton') {
            // Cotton-specific recommendations
            if (overall > 60) {
                recommendations.push('High overall risk - implement Bt cotton and IPM practices');
            }
            
            if (disease > 50) {
                recommendations.push('Monitor for cotton boll rot and alternaria - apply fungicides');
            }
            
            if (pest > 50) {
                recommendations.push('Check for bollworm and whitefly - use integrated pest management');
            }
            
            if (stress > 50) {
                recommendations.push('Apply potassium nitrate and adjust irrigation to reduce boll shedding');
            }
            
            if (irrigation > 50) {
                recommendations.push('Provide frequent irrigation during flowering and boll development');
            }
            
            if (fertilizer > 50) {
                recommendations.push('Avoid nitrogen application during boll development');
            }
            
            if (harvest > 50) {
                recommendations.push('Delay cotton picking until weather improves');
            }
            
            if (storage > 50) {
                recommendations.push('Maintain proper moisture content and temperature in cotton storage');
            }
            
            if (planting > 50) {
                recommendations.push('Delay cotton sowing - wait for optimal soil temperature');
            }
            
            if (spraying > 50) {
                recommendations.push('Avoid pesticide application - high temperature causes phytotoxicity');
            }
            
        } else if (cropType === 'maize') {
            // Maize-specific recommendations
            if (overall > 60) {
                recommendations.push('High overall risk - implement crop rotation and resistant varieties');
            }
            
            if (disease > 50) {
                recommendations.push('Monitor for northern leaf blight and common rust - apply fungicides');
            }
            
            if (pest > 50) {
                recommendations.push('Check for corn borer and fall armyworm - use biological controls');
            }
            
            if (stress > 50) {
                recommendations.push('Apply anti-transpirants and ensure proper irrigation');
            }
            
            if (irrigation > 50) {
                recommendations.push('Provide adequate irrigation during tasseling and grain filling');
            }
            
            if (fertilizer > 50) {
                recommendations.push('Avoid nitrogen application during silking - apply at V6 stage');
            }
            
            if (harvest > 50) {
                recommendations.push('Delay maize harvesting until moisture content is optimal');
            }
            
            if (storage > 50) {
                recommendations.push('Ensure proper drying and aeration in maize storage');
            }
            
            if (planting > 50) {
                recommendations.push('Delay maize sowing - wait for optimal soil conditions');
            }
            
            if (spraying > 50) {
                recommendations.push('Avoid pesticide application during tasseling');
            }
            
        } else if (cropType === 'tomato') {
            // Tomato-specific recommendations
            if (overall > 60) {
                recommendations.push('High overall risk - implement crop rotation and resistant varieties');
            }
            
            if (disease > 50) {
                recommendations.push('Monitor for early blight and leaf spot - apply copper fungicides');
            }
            
            if (pest > 50) {
                recommendations.push('Check for whitefly and fruit fly - use yellow sticky traps');
            }
            
            if (stress > 50) {
                recommendations.push('Apply calcium nitrate and provide consistent irrigation');
            }
            
            if (irrigation > 50) {
                recommendations.push('Maintain consistent soil moisture to prevent fruit cracking');
            }
            
            if (fertilizer > 50) {
                recommendations.push('Avoid excessive nitrogen - focus on potassium and calcium');
            }
            
            if (harvest > 50) {
                recommendations.push('Delay tomato harvesting until weather improves');
            }
            
            if (storage > 50) {
                recommendations.push('Store tomatoes at 12-15°C with proper ventilation');
            }
            
            if (planting > 50) {
                recommendations.push('Delay tomato transplanting - wait for favorable conditions');
            }
            
            if (spraying > 50) {
                recommendations.push('Avoid pesticide application during flowering');
            }
            
        } else {
            // Generic recommendations for other crops
            if (overall > 60) {
                recommendations.push('High overall risk - implement protective measures');
            }
            
            if (disease > 50) {
                recommendations.push('Monitor for disease symptoms and apply preventive treatments');
            }
            
            if (pest > 50) {
                recommendations.push('Check for pest activity and implement control measures');
            }
            
            if (stress > 50) {
                recommendations.push('Consider irrigation and stress management practices');
            }
            
            if (irrigation > 50) {
                recommendations.push('High irrigation demand - schedule watering accordingly');
            } else if (irrigation < 20) {
                recommendations.push('Low irrigation needs - conserve water');
            }
            
            if (fertilizer > 50) {
                recommendations.push('Avoid fertilizer application - high risk of burn');
            }
            
            if (harvest > 50) {
                recommendations.push('Delay harvesting - unfavorable conditions');
            }
            
            if (storage > 50) {
                recommendations.push('Improve storage conditions to prevent spoilage');
            }
            
            if (planting > 50) {
                recommendations.push('Delay planting - unfavorable conditions');
            }
            
            if (spraying > 50) {
                recommendations.push('Avoid pesticide application - poor effectiveness');
            }
        }
        
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour <= 10) {
            recommendations.push('Morning hours - ideal for field activities');
        } else if (currentHour >= 11 && currentHour <= 15) {
            recommendations.push('Peak heat hours - minimize field work');
        } else if (currentHour >= 16 && currentHour <= 18) {
            recommendations.push('Evening hours - good for harvesting');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Favorable conditions for crop growth and field activities');
        }
        
        return recommendations;
    };

    const getRiskTrend = (forecastData) => {
        if (forecastData.length < 2) return 'stable';
        
        const firstHalf = forecastData.slice(0, Math.floor(forecastData.length / 2));
        const secondHalf = forecastData.slice(Math.floor(forecastData.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, day) => sum + day.risk, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, day) => sum + day.risk, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 10) return 'increasing';
        if (secondAvg < firstAvg - 10) return 'decreasing';
        return 'stable';
    };

    const getRecommendation = (riskScore) => {
        if (riskScore > 70) return 'High risk - take preventive action';
        if (riskScore > 50) return 'Moderate risk - monitor conditions';
        if (riskScore > 30) return 'Low risk - normal vigilance';
        return 'Favorable conditions';
    };

    const activeAlertsCount = alerts.length;

    return {
        riskData,
        alerts,
        loading,
        error,
        connected,
        lastUpdate,
        activeAlertsCount,
        refreshRisk: () => console.log('Refresh risk data'),
        clearAlerts: () => setAlerts([])
    };
};

export default useWeatherRisk;
