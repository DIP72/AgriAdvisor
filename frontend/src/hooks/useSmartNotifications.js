import { useState, useEffect, useCallback } from 'react';

const useSmartNotifications = (user, riskData, userLocation) => {
    const [notifications, setNotifications] = useState([]);
    const [alertPreferences, setAlertPreferences] = useState({
        push: true,
        sms: false,
        email: false,
        diseaseRisk: true,
        pestRisk: true,
        stressRisk: true,
        irrigationAlerts: true,
        fertilizerAlerts: true,
        harvestAlerts: true,
        dailySummary: true,
        extremeWeather: true
    });
    const [notificationHistory, setNotificationHistory] = useState([]);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Request notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setIsSubscribed(permission === 'granted');
            return permission === 'granted';
        }
        return false;
    };

    // Create smart notification based on risk data
    const createSmartNotification = useCallback((riskData, alertType = 'risk') => {
        if (!riskData || !user) return;

        const alerts = [];
        const currentHour = new Date().getHours();

        // High-risk condition alerts
        if (riskData.current?.risk?.overall > 70) {
            alerts.push({
                id: Date.now() + Math.random(),
                type: 'critical',
                title: 'High Risk Alert',
                message: `Critical risk level (${riskData.current.risk.overall}%) detected for your ${riskData.cropType || 'crops'}. Take immediate protective measures.`,
                priority: 'high',
                category: 'risk',
                timestamp: new Date().toISOString(),
                actionRequired: true,
                recommendations: riskData.current?.recommendations || []
            });
        }

        // Disease risk alerts
        if (riskData.current?.risk?.disease?.overall > 60 && alertPreferences.diseaseRisk) {
            alerts.push({
                id: Date.now() + Math.random() + 1,
                type: 'warning',
                title: 'Disease Risk Warning',
                message: `High disease risk (${riskData.current.risk.disease.overall}%) detected. Monitor crops closely and consider preventive treatments.`,
                priority: 'medium',
                category: 'disease',
                timestamp: new Date().toISOString(),
                actionRequired: true,
                riskLevel: riskData.current.risk.disease.overall
            });
        }

        // Pest risk alerts
        if (riskData.current?.risk?.pest?.overall > 60 && alertPreferences.pestRisk) {
            alerts.push({
                id: Date.now() + Math.random() + 2,
                type: 'warning',
                title: 'Pest Activity Alert',
                message: `Increased pest activity risk (${riskData.current.risk.pest.overall}%). Check for signs of infestation.`,
                priority: 'medium',
                category: 'pest',
                timestamp: new Date().toISOString(),
                actionRequired: true,
                pestType: riskData.current.risk.pest.pestType
            });
        }

        // Optimal timing alerts
        if (riskData.current?.risk?.spraying?.overall < 20 && alertPreferences.fertilizerAlerts) {
            alerts.push({
                id: Date.now() + Math.random() + 3,
                type: 'opportunity',
                title: 'Optimal Spraying Conditions',
                message: 'Perfect conditions for pesticide application. Low drift risk detected.',
                priority: 'low',
                category: 'opportunity',
                timestamp: new Date().toISOString(),
                actionRequired: false,
                timeWindow: 'Next 4 hours'
            });
        }

        // Irrigation alerts
        if (riskData.current?.risk?.irrigation?.overall > 50 && alertPreferences.irrigationAlerts) {
            alerts.push({
                id: Date.now() + Math.random() + 4,
                type: 'info',
                title: 'Irrigation Needed',
                message: 'High irrigation demand detected. Schedule watering accordingly.',
                priority: 'medium',
                category: 'irrigation',
                timestamp: new Date().toISOString(),
                actionRequired: true
            });
        }

        // Time-based alerts
        if (currentHour >= 6 && currentHour <= 8) {
            alerts.push({
                id: Date.now() + Math.random() + 5,
                type: 'info',
                title: 'Morning Farming Update',
                message: 'Good morning! Check today\'s weather conditions and risk levels before starting field activities.',
                priority: 'low',
                category: 'daily',
                timestamp: new Date().toISOString(),
                actionRequired: false
            });
        }

        return alerts;
    }, [alertPreferences, user]);

    // Send push notification
    const sendPushNotification = async (notification) => {
        if (!isSubscribed || !alertPreferences.push) return;

        try {
            const notificationOptions = {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id,
                requireInteraction: notification.priority === 'high',
                actions: notification.actionRequired ? [
                    {
                        action: 'view-details',
                        title: 'View Details'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss'
                    }
                ] : []
            };

            const pushNotification = new Notification(notification.title, notificationOptions);
            
            pushNotification.onclick = () => {
                // Navigate to weather risk dashboard
                window.location.href = '/weather-risk';
                pushNotification.close();
            };

            return true;
        } catch (error) {
            console.error('Push notification error:', error);
            return false;
        }
    };

    // Simulate SMS alert (in real app, this would call backend API)
    const sendSMSAlert = async (notification) => {
        if (!alertPreferences.sms || !user?.phone) return;

        // Simulate SMS sending
        console.log('SMS Alert Sent:', {
            to: user.phone,
            message: `[AgriAdvisor] ${notification.title}: ${notification.message}`
        });

        return true;
    };

    // Simulate email alert (in real app, this would call backend API)
    const sendEmailAlert = async (notification) => {
        if (!alertPreferences.email || !user?.email) return;

        // Simulate email sending
        console.log('Email Alert Sent:', {
            to: user.email,
            subject: `[AgriAdvisor] ${notification.title}`,
            message: notification.message
        });

        return true;
    };

    // Process and send notifications
    const processNotifications = useCallback(async () => {
        if (!riskData) return;

        const newAlerts = createSmartNotification(riskData);
        
        for (const alert of newAlerts) {
            // Add to notifications list
            setNotifications(prev => [alert, ...prev].slice(0, 50));
            
            // Add to history
            setNotificationHistory(prev => [alert, ...prev].slice(0, 100));
            
            // Send based on preferences
            if (alertPreferences.push) {
                await sendPushNotification(alert);
            }
            
            if (alert.priority === 'high' || alert.type === 'critical') {
                if (alertPreferences.sms) {
                    await sendSMSAlert(alert);
                }
                if (alertPreferences.email) {
                    await sendEmailAlert(alert);
                }
            }
        }
    }, [riskData, createSmartNotification, alertPreferences]);

    // Update alert preferences
    const updateAlertPreferences = (newPreferences) => {
        setAlertPreferences(prev => ({ ...prev, ...newPreferences }));
        localStorage.setItem('alertPreferences', JSON.stringify({ ...alertPreferences, ...newPreferences }));
    };

    // Clear notifications
    const clearNotifications = () => {
        setNotifications([]);
    };

    // Dismiss specific notification
    const dismissNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    // Get notification statistics
    const getNotificationStats = () => {
        const stats = {
            total: notificationHistory.length,
            today: notificationHistory.filter(n => {
                const today = new Date().toDateString();
                const notifDate = new Date(n.timestamp).toDateString();
                return today === notifDate;
            }).length,
            critical: notificationHistory.filter(n => n.type === 'critical').length,
            warnings: notificationHistory.filter(n => n.type === 'warning').length,
            opportunities: notificationHistory.filter(n => n.type === 'opportunity').length
        };

        return stats;
    };

    // Load preferences from localStorage
    useEffect(() => {
        const savedPreferences = localStorage.getItem('alertPreferences');
        if (savedPreferences) {
            try {
                setAlertPreferences(JSON.parse(savedPreferences));
            } catch (error) {
                console.error('Error loading alert preferences:', error);
            }
        }

        // Request notification permission
        requestNotificationPermission();
    }, []);

    // Process notifications when risk data changes
    useEffect(() => {
        if (riskData) {
            processNotifications();
        }
    }, [riskData, processNotifications]);

    return {
        notifications,
        notificationHistory,
        alertPreferences,
        isSubscribed,
        stats: getNotificationStats(),
        updateAlertPreferences,
        clearNotifications,
        dismissNotification,
        requestNotificationPermission,
        sendPushNotification
    };
};

export default useSmartNotifications;
