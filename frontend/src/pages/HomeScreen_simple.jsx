import React from 'react';

const HomeScreen = ({ setScreen, setTab, isDarkMode, isEnglish, setSelectedCrop, setIsVoiceOpen }) => {
    console.log('HomeScreen rendering with props:', { setScreen, setTab, isDarkMode, isEnglish, setSelectedCrop, setIsVoiceOpen });
    
    return (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', color: isDarkMode ? '#ffffff' : '#000000', minHeight: '100vh' }}>
            <h1>Home Screen - Working!</h1>
            <p>Dark Mode: {isDarkMode ? 'Yes' : 'No'}</p>
            <p>English: {isEnglish ? 'Yes' : 'No'}</p>
            <button 
                onClick={() => {
                    console.log('Weather Risk Analysis button clicked!');
                    console.log('Setting screen to weather-risk-demo');
                    setScreen('weather-risk-demo');
                }}
                style={{ 
                    padding: '15px 30px', 
                    backgroundColor: '#2E7D32', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginTop: '20px'
                }}
            >
                Weather Risk Analysis
            </button>
        </div>
    );

    const weatherTranslations = {
        'clear sky': 'स्वच्छ आकाश',
        'few clouds': 'थोडे ढग',
        'scattered clouds': 'विखुरलेले ढग',
        'broken clouds': 'ढगाळ वातावरण',
        'shower rain': 'पावसाच्या सरी',
        'rain': 'पाऊस',
        'thunderstorm': 'विजांसह पाऊस',
        'snow': 'बर्फवृष्टी',
        'mist': 'धुके',
        'haze': 'धुके / धुरके',
        'overcast clouds': 'पूर्णतः ढगाळ',
        'light rain': 'हल्का पाऊस',
        'moderate rain': 'मध्यम पाऊस',
        'heavy intensity rain': 'मुसळधार पाऊस'
    };

    const translateWeather = (desc) => {
        if (isEn) return desc;
        const lowerDesc = desc.toLowerCase();
        return weatherTranslations[lowerDesc] || desc;
    };

    React.useEffect(() => {
        // Set default weather data immediately to prevent loading
        setWeather({
            temperature: 28,
            humidity: 55,
            windspeed: 10,
            description: 'few clouds',
            descriptionMR: 'thode dhag',
            location: 'Pune, Maharashtra',
            timestamp: Date.now()
        });
        return; // Skip weather fetching
        
        const fetchWeather = async () => {
            const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
            const CACHE_KEY = 'agri_weather_data';
            const CACHE_TIME_KEY = 'agri_weather_timestamp';
            const CACHE_LOC_KEY = 'agri_weather_location';

            const getPosition = () => {
                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        enableHighAccuracy: true,
                        maximumAge: 0
                    });
                });
            };

            let lat = 18.5204;
            let lon = 73.8567;
            let locationName = isEn ? "Pune, Maharashtra" : "पुणे, महाराष्ट्र";

            try {
                const pos = await getPosition();
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
                locationName = isEn ? "Your Location" : "तुमचे ठिकाण";
            } catch (err) {
                console.warn("Location access denied. Using Pune as default.");
            }

            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
                const cachedLoc = JSON.parse(localStorage.getItem(CACHE_LOC_KEY) || '{}');
                const now = Date.now();

                const isSameLocation = cachedLoc.lat && Math.abs(cachedLoc.lat - lat) < 0.005 &&
                    cachedLoc.lon && Math.abs(cachedLoc.lon - lon) < 0.005;

                // Cache for 2 minutes for a more real-time feel
                if (cachedData && cachedTime && isSameLocation && (now - parseInt(cachedTime) < 120000)) {
                    setWeather(JSON.parse(cachedData));
                    return;
                }
            } catch (e) { }

            try {
                // Prioritize the user provided key for genuine real-time data
                const ACTIVE_KEY = "d7d71b6cbcb8eec1002e93051825b17b";

                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ACTIVE_KEY}&units=metric`);

                if (response.status === 401) {
                    throw new Error("API Key activation pending");
                }

                if (!response.ok) throw new Error("Weather service busy");

                const data = await response.json();
                if (data.main) {
                    const englishDesc = data.weather[0].description;

                    const weatherInfo = {
                        temperature: Math.round(data.main.temp),
                        humidity: data.main.humidity,
                        windspeed: Math.round(data.wind.speed * 3.6),
                        description: englishDesc,
                        descriptionMR: translateWeather(englishDesc),
                        location: data.name || locationName,
                        timestamp: Date.now()
                    };

                    localStorage.setItem(CACHE_KEY, JSON.stringify(weatherInfo));
                    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                    localStorage.setItem(CACHE_LOC_KEY, JSON.stringify({ lat, lon }));

                    setWeather(weatherInfo);
                }
            } catch (err) {
                // Silently fallback if key is not working yet
                try {
                    const fallbackRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData.current) {
                        setWeather({
                            temperature: Math.round(fallbackData.current.temperature_2m),
                            humidity: Math.round(fallbackData.current.relative_humidity_2m),
                            windspeed: Math.round(fallbackData.current.wind_speed_10m),
                            description: 'Live (Reliable)',
                            descriptionMR: isEn ? 'Live (Reliable)' : 'थेट डेटा',
                            location: locationName,
                            timestamp: Date.now()
                        });
                    }
                } catch (fallbackErr) { }
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 120000);
        return () => clearInterval(interval);
    }, [isEn]);

    const getRiskFactor = () => {
        if (!weather) return { level: isEn ? 'Low' : 'कमी', value: 20, color: '#10b981' };
        let score = 20; // base score
        if (weather.temperature > 38) score += 45;
        else if (weather.temperature > 32) score += 25;

        if (weather.humidity > 85) score += 20;
        else if (weather.humidity > 70) score += 10;

        if (weather.windspeed > 25) score += 10;

        score = Math.min(score, 100);

        if (score < 40) return { level: isEn ? 'Low' : 'कमी', value: score, color: '#10b981' };
        if (score < 75) return { level: isEn ? 'Medium' : 'मध्यम', value: score, color: '#f59e0b' };
        return { level: isEn ? 'High' : 'जास्त', value: score, color: '#ef4444' };
    };

    const getDiseaseRisk = () => {
        if (!weather) return null;
        const { temperature, humidity } = weather;

        if (humidity > 80) {
            if (temperature >= 15 && temperature <= 25) {
                return {
                    title: isEn ? 'High Fungal Risk' : 'बुरशीजन्य रोगाचा मोठा धोका',
                    desc: isEn ? 'Conditions ideal for Downy Mildew. Monitor leaves for spots.' : 'केवडा (Downy Mildew) रोगासाठी पोषक वातावरण. पानांवरील ठिपके तपासा.',
                    type: 'fungal'
                };
            } else if (temperature > 25) {
                return {
                    title: isEn ? 'Bacterial Risk Alert' : 'जीवाणूजन्य रोगाचा इशारा',
                    desc: isEn ? 'High humidity and warmth may cause Bacterial Spot. Ensure ventilation.' : 'जास्त आर्द्रता आणि उष्णतेमुळे जीवाणूजन्य ठिपके (Bacterial Spot) पडू शकतात.',
                    type: 'bacterial'
                };
            }
        } else if (temperature > 35) {
            return {
                title: isEn ? 'Heat Stress Warning' : 'उष्णतेचा ताण (Heat Stress)',
                desc: isEn ? 'Extreme heat can cause wilting. Increase irrigation frequency.' : 'अति उष्णतेमुळे पिके कोमेजून जाऊ शकतात. पाण्याची पाळी वाढवा.',
                type: 'heat'
            };
        }
        return {
            title: isEn ? 'Stable Environment' : 'स्थिर वातावरण',
            desc: isEn ? 'Weather is currently stable for most Rabi crops.' : 'पाने आणि फुलांची वाढ होण्यासाठी सध्याचे हवामान पोषक आहे.',
            type: 'stable'
        };
    };

    const risk = getRiskFactor();
    const diseaseRisk = getDiseaseRisk();
    const topCrop = cropData[0]; // Highest match score (Jowar - 95%)

    const getTTSText = () => {
        let text = isEn ? "Home Overview. " : "होम ओव्हरव्ह्यू. ";
        text += isEn ? "Current Season: Rabi. " : "सध्याचा हंगाम: रब्बी. ";
        if (weather) {
            text += isEn
                ? `Weather in ${weather.location} is ${weather.description} with ${weather.temperature} degrees.`
                : `${weather.location} मधील हवामान ${weather.descriptionMR} असून तापमान ${weather.temperature} अंश आहे.`;
        }
        text += diseaseRisk
            ? (isEn ? `Alert: ${diseaseRisk.title}. ${diseaseRisk.desc}` : `इशारा: ${diseaseRisk.title}. ${diseaseRisk.desc}`)
            : (isEn ? "Alert: Analyzing conditions." : "इशारा: परिस्थितीचे विश्लेषण करत आहे.");
        return text;
    };

    return (
        <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="app-shell home-shell" style={{ background: 'transparent' }}>
                <div style={{
                    background: isDarkMode ? '#111827' : 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                    width: '100%',
                    margin: '0 auto 40px',
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    border: isDarkMode ? '1px solid #374151' : 'none',
                    paddingBottom: '96px',
                    position: 'relative'
                }} className="pb-24">

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="season-chip bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm" style={{ margin: 0 }}>
                            {isEn ? 'Rabi Season - Feb 2026' : 'रब्बी हंगाम - फेब्रुवारी 2026'}
                        </div>
                        <TTSButton textToRead={getTTSText()} isDarkMode={isDarkMode} />
                    </div>

                    <div className="my-4">
                        <MarketTicker isEnglish={isEn} isDarkMode={isDarkMode} />
                    </div>

                    <div className="weather-card" style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', margin: '0 0 20px', padding: '20px', boxShadow: 'none', border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', background: isDarkMode ? '#1f2937' : 'transparent', borderRadius: '16px' }}>
                        {weather ? (
                            <>
                                <div className="weather-header">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={16} />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{weather.location}</span>
                                        </div>
                                        <div className="weather-temp">{weather.temperature}°C</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', textTransform: 'capitalize' }}>
                                            {isEn ? weather.description : weather.descriptionMR}
                                        </div>
                                    </div>
                                    <Sun size={64} color="#ffd54f" />
                                </div>
                                <div className="weather-stats">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Droplets size={16} />
                                        <span style={{ fontWeight: 600 }}>
                                            {isEn ? 'Humidity' : 'आर्द्रता'}: {weather.humidity}%
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Wind size={16} />
                                        <span style={{ fontWeight: 600 }}>{isEn ? 'Wind' : 'वारा'} {weather.windspeed} km/h</span>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{isEn ? 'Real-time update' : 'रिअल-टाइम अपडेट'}</span>
                                        <span>{new Date(weather.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', fontWeight: 700 }}>{isEn ? 'Loading weather...' : 'हवामान लोड होत आहे...'}</div>
                        )}
                    </div>

                    {/* Weather Risk Analysis Button */}
                    <div className="weather-risk-card" style={{ 
                        color: isDarkMode ? '#f3f4f6' : '#1f2937', 
                        margin: '0 0 20px', 
                        padding: '20px', 
                        boxShadow: 'none', 
                        border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', 
                        background: isDarkMode ? '#1f2937' : 'transparent', 
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }} onClick={() => setScreen('weather-risk-demo')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <TrendingUp size={20} color="#2E7D32" />
                                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                                        {isEn ? 'Weather Risk Analysis' : 'havaamAna jokhim vivaraNa'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', lineHeight: '1.4' }}>
                                    {isEn 
                                        ? 'Get AI-powered disease, pest, and stress risk analysis with 5-day forecasting' 
                                        : 'AI- powered rog, kIt, AnA dushkaNa jokhim vivaraNa 5- divasa peshkasha saThi'
                                    }
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        background: '#2E7D32', 
                                        color: 'white', 
                                        padding: '4px 8px', 
                                        borderRadius: '12px',
                                        fontWeight: 500
                                    }}>
                                        {isEn ? 'NEW' : 'nOvIna'}
                                    </span>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        background: isDarkMode ? '#374151' : '#f3f4f6', 
                                        color: isDarkMode ? '#d1d5db' : '#6b7280', 
                                        padding: '4px 8px', 
                                        borderRadius: '12px',
                                        fontWeight: 500
                                    }}>
                                        {isEn ? 'AI Powered' : 'AI- powered'}
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>
                                AI
                            </div>
                        </div>
                    </div>

                    <div className={`alert-card ${diseaseRisk?.type === 'stable' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-100 dark:border-green-950' : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-100 dark:border-yellow-950'}`} style={{ margin: '0 0 20px', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className={`p-2 ${diseaseRisk?.type === 'stable' ? 'bg-green-100 dark:bg-green-800/40' : 'bg-yellow-100 dark:bg-yellow-800/40'} rounded-lg`}>
                            <AlertTriangle size={20} className={diseaseRisk?.type === 'stable' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'} />
                        </div>
                        <div>
                            <div className="marathi font-bold text-gray-900 dark:text-white">
                                {diseaseRisk ? diseaseRisk.title : (isEn ? 'Weather Analysis Loading...' : 'हवामान विश्लेषण लोड होत आहे...')}
                            </div>
                            <div className="english-sub  text-sm">
                                {diseaseRisk ? diseaseRisk.desc : (isEn ? 'Please wait while we analyze risks.' : 'कृपया विश्लेषण होईपर्यंत प्रतीक्षा करा.')}
                            </div>
                        </div>
                    </div>

                    <div className="insight-grid grid grid-cols-2 gap-4" style={{ margin: '0 0 20px' }}>
                        <div className="insight-card bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700" onClick={() => { setSelectedCrop(topCrop); setScreen('crop-detail'); }} style={{ cursor: 'pointer' }}>
                                <div className="insight-card-text font-bold" style={{ fontSize: '1rem' }}>
                                    {isEn ? topCrop.englishName : topCrop.marathiName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>
                                {isEn ? topCrop.marathiName : topCrop.englishName}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: isDarkMode ? '#9ca3af' : '#1e293b', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                                    {isEn ? `Price: ${topCrop.price}` : `दर: ${topCrop.price}`}
                                </div>
                                <div style={{ opacity: 0.9 }}>
                                    {isEn ? `Match: ${topCrop.matchScore}%` : `जुळणी: ${topCrop.matchScore}%`}
                                </div>
                            </div>
                        </div>
                        <div className="insight-card bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="insight-card-text" style={{ fontSize: '1rem' }}>
                                {isEn ? 'Risk Level' : 'जोखीम पातळी'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>
                                {isEn ? 'जोखीम पातळी' : 'Risk Level'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                                <span className="insight-card-text">{risk.level}</span>
                                <span className="insight-card-text">{risk.value}%</span>
                            </div>
                            <div className="progress-bar-container bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div className="progress-bar h-full" style={{ width: `${risk.value}%`, background: risk.color }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-300 shadow-sm border border-green-100 dark:border-green-950" style={{ margin: '0 0 24px', padding: '20px', borderRadius: '24px', display: 'flex', gap: '16px' }}>
                        <div style={{ background: 'var(--primary-dark)', padding: '10px', borderRadius: '12px', alignSelf: 'flex-start', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lightbulb size={24} color="white" />
                        </div>
                        <div>
                            <div className="marathi font-bold" style={{ marginBottom: '4px', fontSize: '0.95rem' }}>
                                {isEn ? 'Increase the use of organic fertilizers to improve soil texture.' : 'सेंद्रिय खतांचा वापर वाढवा आणि जमिनीचा पोत सुधारा.'}
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setScreen('feedback')}
                        style={{
                            background: isDarkMode ? '#1f2937' : 'white',
                            margin: '0 0 24px',
                            padding: '20px',
                            borderRadius: '24px',
                            display: 'flex',
                            gap: '16px',
                            border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ background: 'rgba(233, 30, 99, 0.1)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquareQuote size={24} color="#E91E63" />
                        </div>
                        <div>
                            <div className="marathi font-bold" style={{ marginBottom: '2px', fontSize: '0.95rem' }}>
                                {isEn ? 'Share Your Experience' : 'तुमचा अनुभव शेअर करा'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                                {isEn ? 'Did you make a profit with our suggestions?' : 'आमच्या शिफारशींमुळे तुम्हाला नफा झाला का?'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setScreen('scanner')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-md flex items-center gap-3 transition-all w-full"
                        style={{ margin: '0 0 24px' }}
                    >
                        <span className="text-2xl">🔍</span>
                        <div className="text-left">
                            <p className="font-bold">
                                {isEnglish ? 'Crop Disease Scanner' : 'पीक रोग स्कॅनर'}
                            </p>
                            <p className="text-sm opacity-80">
                                {isEnglish ? 'Detect disease from a leaf photo' : 'पानाचा फोटो घेऊन रोग तपासा'}
                            </p>
                        </div>
                    </button>

                    <button className="cta-btn" onClick={() => { setScreen('recommendations'); setTab('crops'); }}>
                        <div className="marathi" style={{ fontSize: '1.2rem' }}>
                            {isEn ? 'Get Crop Recommendations' : 'पीक शिफारसी मिळवा'}
                        </div>
                    </button>
                </div>
            </Motion.div>
        </>
    );
};

export default HomeScreen;
