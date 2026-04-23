import { useState, useEffect, useCallback } from 'react';

const useAlertScheduler = (user, alertPreferences) => {
    const [scheduledAlerts, setScheduledAlerts] = useState([]);
    const [activeSchedules, setActiveSchedules] = useState([]);

    // Default alert schedules
    const defaultSchedules = [
        {
            id: 'morning-update',
            name: 'Morning Farming Update',
            time: '06:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            type: 'daily',
            enabled: true,
            message: 'Good morning! Check today\'s weather conditions and risk levels before starting field activities.',
            category: 'daily'
        },
        {
            id: 'evening-summary',
            name: 'Evening Risk Summary',
            time: '18:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            type: 'daily',
            enabled: true,
            message: 'Daily risk summary and tomorrow\'s farming recommendations.',
            category: 'daily'
        },
        {
            id: 'weekly-forecast',
            name: 'Weekly Weather Forecast',
            time: '08:00',
            days: ['monday'],
            type: 'weekly',
            enabled: true,
            message: 'Weekly weather forecast and risk trends for optimal planning.',
            category: 'forecast'
        },
        {
            id: 'extreme-weather',
            name: 'Extreme Weather Alert',
            type: 'conditional',
            enabled: true,
            conditions: {
                temperature: { operator: '>', value: 40 },
                windSpeed: { operator: '>', value: 30 },
                rainfall: { operator: '>', value: 50 }
            },
            message: 'Extreme weather conditions detected. Take immediate protective measures.',
            category: 'critical'
        },
        {
            id: 'optimal-planting',
            name: 'Optimal Planting Conditions',
            type: 'conditional',
            enabled: true,
            conditions: {
                temperature: { operator: 'between', min: 20, max: 30 },
                humidity: { operator: 'between', min: 40, max: 70 },
                windSpeed: { operator: '<', value: 15 }
            },
            message: 'Optimal conditions detected for planting activities.',
            category: 'opportunity'
        },
        {
            id: 'irrigation-reminder',
            name: 'Irrigation Reminder',
            time: '07:00',
            days: ['tuesday', 'thursday', 'saturday'],
            type: 'recurring',
            enabled: true,
            message: 'Check soil moisture and irrigation needs for optimal crop health.',
            category: 'irrigation'
        }
    ];

    // Load saved schedules
    useEffect(() => {
        const savedSchedules = localStorage.getItem('alertSchedules');
        if (savedSchedules) {
            try {
                setScheduledAlerts(JSON.parse(savedSchedules));
            } catch (error) {
                console.error('Error loading alert schedules:', error);
                setScheduledAlerts(defaultSchedules);
            }
        } else {
            setScheduledAlerts(defaultSchedules);
        }
    }, []);

    // Save schedules to localStorage
    const saveSchedules = useCallback((schedules) => {
        setScheduledAlerts(schedules);
        localStorage.setItem('alertSchedules', JSON.stringify(schedules));
    }, []);

    // Check if schedule should trigger now
    const shouldTriggerSchedule = useCallback((schedule, currentWeather = null) => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const scheduleTime = schedule.time.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0);

        // Check if it's the right time (within 1 minute window)
        const timeMatch = Math.abs(currentTime - scheduleTime) <= 1;

        // Check if it's the right day
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayMatch = !schedule.days || schedule.days.includes(dayMap[currentDay]);

        // Check if schedule is enabled
        const enabled = schedule.enabled && alertPreferences[schedule.category] !== false;

        // Check conditional schedules
        if (schedule.type === 'conditional' && currentWeather) {
            const conditionsMet = checkConditions(schedule.conditions, currentWeather);
            return enabled && conditionsMet;
        }

        return enabled && timeMatch && dayMatch;
    }, [alertPreferences]);

    // Check if weather conditions meet schedule requirements
    const checkConditions = (conditions, weather) => {
        if (!conditions || !weather) return true;

        for (const [key, condition] of Object.entries(conditions)) {
            const weatherValue = getWeatherValue(key, weather);
            
            if (condition.operator === '>') {
                if (weatherValue <= condition.value) return false;
            } else if (condition.operator === '<') {
                if (weatherValue >= condition.value) return false;
            } else if (condition.operator === 'between') {
                if (weatherValue < condition.min || weatherValue > condition.max) return false;
            }
        }

        return true;
    };

    // Get weather value by key
    const getWeatherValue = (key, weather) => {
        switch (key) {
            case 'temperature':
                return weather.current?.temperature || weather.main?.temp || 0;
            case 'humidity':
                return weather.current?.humidity || weather.main?.humidity || 0;
            case 'windSpeed':
                return weather.current?.windSpeed || (weather.wind?.speed * 3.6) || 0;
            case 'rainfall':
                return weather.current?.rainfall || weather.rain?.['1h'] || 0;
            default:
                return 0;
        }
    };

    // Create alert from schedule
    const createAlertFromSchedule = useCallback((schedule) => {
        return {
            id: `schedule-${schedule.id}-${Date.now()}`,
            type: schedule.category === 'critical' ? 'critical' : 'info',
            title: schedule.name,
            message: schedule.message,
            priority: schedule.category === 'critical' ? 'high' : 'medium',
            category: schedule.category,
            timestamp: new Date().toISOString(),
            scheduled: true,
            scheduleId: schedule.id
        };
    }, []);

    // Check and trigger scheduled alerts
    const checkScheduledAlerts = useCallback((currentWeather = null) => {
        const triggeredAlerts = [];

        scheduledAlerts.forEach(schedule => {
            if (shouldTriggerSchedule(schedule, currentWeather)) {
                const alert = createAlertFromSchedule(schedule);
                triggeredAlerts.push(alert);
                
                // Add to active schedules tracking
                setActiveSchedules(prev => [
                    ...prev.filter(s => s.id !== schedule.id),
                    { ...schedule, lastTriggered: new Date().toISOString() }
                ]);
            }
        });

        return triggeredAlerts;
    }, [scheduledAlerts, shouldTriggerSchedule, createAlertFromSchedule]);

    // Add new schedule
    const addSchedule = useCallback((newSchedule) => {
        const scheduleWithId = {
            ...newSchedule,
            id: newSchedule.id || `custom-${Date.now()}`,
            enabled: newSchedule.enabled !== false
        };

        saveSchedules([...scheduledAlerts, scheduleWithId]);
    }, [scheduledAlerts, saveSchedules]);

    // Update schedule
    const updateSchedule = useCallback((scheduleId, updates) => {
        const updatedSchedules = scheduledAlerts.map(schedule =>
            schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
        );
        saveSchedules(updatedSchedules);
    }, [scheduledAlerts, saveSchedules]);

    // Delete schedule
    const deleteSchedule = useCallback((scheduleId) => {
        const updatedSchedules = scheduledAlerts.filter(schedule => schedule.id !== scheduleId);
        saveSchedules(updatedSchedules);
        setActiveSchedules(prev => prev.filter(s => s.id !== scheduleId));
    }, [scheduledAlerts, saveSchedules]);

    // Toggle schedule
    const toggleSchedule = useCallback((scheduleId) => {
        const schedule = scheduledAlerts.find(s => s.id === scheduleId);
        if (schedule) {
            updateSchedule(scheduleId, { enabled: !schedule.enabled });
        }
    }, [scheduledAlerts, updateSchedule]);

    // Get next scheduled alerts
    const getNextScheduledAlerts = useCallback(() => {
        const now = new Date();
        const nextAlerts = [];

        scheduledAlerts.forEach(schedule => {
            if (!schedule.enabled) return;

            if (schedule.type === 'conditional') return; // Skip conditional for next alerts

            const scheduleTime = schedule.time.split(':');
            const nextAlert = new Date(now);
            nextAlert.setHours(parseInt(scheduleTime[0]), parseInt(scheduleTime[1]), 0, 0);

            // If the time has passed today, schedule for tomorrow
            if (nextAlert <= now) {
                nextAlert.setDate(nextAlert.getDate() + 1);
            }

            // Check if it's a scheduled day
            if (schedule.days) {
                const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = dayMap[nextAlert.getDay()];
                
                if (!schedule.days.includes(targetDay)) {
                    // Find next valid day
                    for (let i = 1; i <= 7; i++) {
                        const checkDate = new Date(nextAlert);
                        checkDate.setDate(checkDate.getDate() + i);
                        const checkDay = dayMap[checkDate.getDay()];
                        
                        if (schedule.days.includes(checkDay)) {
                            nextAlert.setDate(checkDate.getDate());
                            break;
                        }
                    }
                }
            }

            nextAlerts.push({
                ...schedule,
                nextTrigger: nextAlert.toISOString(),
                timeUntil: nextAlert - now
            });
        });

        return nextAlerts.sort((a, b) => a.timeUntil - b.timeUntil);
    }, [scheduledAlerts]);

    // Get schedule statistics
    const getScheduleStats = useCallback(() => {
        const stats = {
            total: scheduledAlerts.length,
            enabled: scheduledAlerts.filter(s => s.enabled).length,
            disabled: scheduledAlerts.filter(s => !s.enabled).length,
            daily: scheduledAlerts.filter(s => s.type === 'daily').length,
            weekly: scheduledAlerts.filter(s => s.type === 'weekly').length,
            conditional: scheduledAlerts.filter(s => s.type === 'conditional').length,
            recurring: scheduledAlerts.filter(s => s.type === 'recurring').length,
            activeToday: activeSchedules.filter(s => {
                const today = new Date().toDateString();
                const lastTriggered = new Date(s.lastTriggered).toDateString();
                return today === lastTriggered;
            }).length
        };

        return stats;
    }, [scheduledAlerts, activeSchedules]);

    // Reset to default schedules
    const resetToDefaults = useCallback(() => {
        saveSchedules(defaultSchedules);
        setActiveSchedules([]);
    }, [saveSchedules]);

    // Auto-check schedules every minute
    useEffect(() => {
        const interval = setInterval(() => {
            // This would be called by the main app with current weather data
            // checkScheduledAlerts(currentWeather);
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    return {
        scheduledAlerts,
        activeSchedules,
        nextAlerts: getNextScheduledAlerts(),
        stats: getScheduleStats(),
        checkScheduledAlerts,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        toggleSchedule,
        resetToDefaults
    };
};

export default useAlertScheduler;
