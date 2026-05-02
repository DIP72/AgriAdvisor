const https = require('https');
const riskEngine = require('./riskEngine');

/**
 * Enhanced Weather Service
 * Fetches real-time weather, forecast data, and calculates agricultural risks
 */

async function getRealTimeWeather(lat = 18.5204, lon = 73.8567) {
    const API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;

    return new Promise((resolve) => {
        if (!API_KEY || API_KEY === 'your_key_here' || !API_KEY) {
            console.warn('[WeatherService] No valid API key, using fallback');
            return resolve({ 
                temperature: 25, 
                humidity: 65, 
                windSpeed: 5,
                rainfall: 0,
                pressure: 1013,
                source: "fallback" 
            });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.main) {
                        resolve({
                            temperature: Math.round(parsed.main.temp),
                            humidity: parsed.main.humidity,
                            windSpeed: parsed.wind?.speed || 5,
                            rainfall: parsed.rain?.['1h'] || 0,
                            pressure: parsed.main.pressure || 1013,
                            source: "live",
                            location: parsed.name,
                            description: parsed.weather[0]?.description || 'clear'
                        });
                    } else {
                        throw new Error('Invalid response');
                    }
                } catch (e) {
                    console.warn('[WeatherService] API error, using fallback:', e.message);
                    resolve({ 
                        temperature: 25, 
                        humidity: 65, 
                        windSpeed: 5,
                        rainfall: 0,
                        pressure: 1013,
                        source: "fallback" 
                    });
                }
            });
        }).on('error', (err) => {
            console.warn(`[WeatherService] Request failed: ${err.message}`);
            resolve({ 
                temperature: 25, 
                humidity: 65, 
                windSpeed: 5,
                rainfall: 0,
                pressure: 1013,
                source: "fallback" 
            });
        });
    });
}

/**
 * Get 5-day weather forecast
 */
async function getWeatherForecast(lat = 18.5204, lon = 73.8567) {
    const API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;

    return new Promise((resolve) => {
        if (!API_KEY || API_KEY === 'your_key_here' || !API_KEY) {
            console.warn('[WeatherService] No valid API key for forecast, using fallback');
            return resolve(generateFallbackForecast());
        }

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.list) {
                        const forecast = parsed.list.map(item => ({
                            temperature: Math.round(item.main.temp),
                            humidity: item.main.humidity,
                            windSpeed: item.wind?.speed || 5,
                            rainfall: item.rain?.['3h'] || 0,
                            pressure: item.main.pressure || 1013,
                            datetime: item.dt_txt,
                            description: item.weather[0]?.description || 'clear'
                        }));
                        resolve(forecast);
                    } else {
                        throw new Error('Invalid forecast response');
                    }
                } catch (e) {
                    console.warn('[WeatherService] Forecast API error, using fallback:', e.message);
                    resolve(generateFallbackForecast());
                }
            });
        }).on('error', (err) => {
            console.warn(`[WeatherService] Forecast request failed: ${err.message}`);
            resolve(generateFallbackForecast());
        });
    });
}

/**
 * Get comprehensive weather analysis with risk scores
 */
async function getWeatherAnalysis(lat = 18.5204, lon = 73.8567, cropType = 'general') {
    try {
        // Get current weather and forecast in parallel
        const [currentWeather, forecast] = await Promise.all([
            getRealTimeWeather(lat, lon),
            getWeatherForecast(lat, lon)
        ]);

        // Calculate current risk
        const currentRisk = riskEngine.calculateRiskScore(currentWeather, cropType);

        // Generate forecast analysis
        const forecastAnalysis = riskEngine.generateForecast(currentWeather, forecast, cropType);

        return {
            current: {
                ...currentWeather,
                risk: currentRisk
            },
            forecast: forecastAnalysis,
            location: {
                lat,
                lon,
                name: currentWeather.location || 'Unknown Location'
            },
            cropType,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('[WeatherService] Analysis failed:', error);
        throw error;
    }
}

/**
 * Generate fallback forecast data
 */
function generateFallbackForecast() {
    const forecast = [];
    const baseTemp = 25;
    const baseHumidity = 65;

    for (let i = 0; i < 5; i++) {
        forecast.push({
            temperature: baseTemp + Math.round((Math.random() - 0.5) * 10),
            humidity: baseHumidity + Math.round((Math.random() - 0.5) * 20),
            windSpeed: 5 + Math.round(Math.random() * 10),
            rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 5) : 0,
            pressure: 1013 + Math.round((Math.random() - 0.5) * 20),
            datetime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
            description: ['clear', 'cloudy', 'partly cloudy'][Math.floor(Math.random() * 3)]
        });
    }

    return forecast;
}

module.exports = { 
    getRealTimeWeather, 
    getWeatherForecast, 
    getWeatherAnalysis 
};
