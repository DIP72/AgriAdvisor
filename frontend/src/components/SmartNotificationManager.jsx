import React, { useState } from 'react';
import { Bell, BellOff, Settings, X, AlertTriangle, Info, CheckCircle, TrendingUp, Smartphone, Mail, MessageSquare } from 'lucide-react';
import useSmartNotifications from '../hooks/useSmartNotifications';

const SmartNotificationManager = ({ user, riskData, userLocation, isDarkMode, isEnglish }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    
    const {
        notifications,
        notificationHistory,
        alertPreferences,
        isSubscribed,
        stats,
        updateAlertPreferences,
        clearNotifications,
        dismissNotification,
        requestNotificationPermission,
        sendPushNotification
    } = useSmartNotifications(user, riskData, userLocation);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'critical': return <AlertTriangle size={16} color="#dc2626" />;
            case 'warning': return <AlertTriangle size={16} color="#f97316" />;
            case 'opportunity': return <TrendingUp size={16} color="#10b981" />;
            case 'info': return <Info size={16} color="#3b82f6" />;
            default: return <Bell size={16} color="#6b7280" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'critical': return '#dc2626';
            case 'warning': return '#f97316';
            case 'opportunity': return '#10b981';
            case 'info': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const handleSubscribe = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            // Test notification
            await sendPushNotification({
                id: 'test',
                title: 'Notifications Enabled',
                message: 'You will now receive smart farming alerts.',
                priority: 'low'
            });
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return isEnglish ? 'Just now' : 'Just now';
        if (diffMins < 60) return `${diffMins} ${isEnglish ? 'min ago' : 'min ago'}`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} ${isEnglish ? 'hour ago' : 'hour ago'}`;
        
        return date.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    style={{
                        background: isDarkMode ? '#374151' : '#f3f4f6',
                        border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    {isSubscribed ? <Bell size={18} color="#10b981" /> : <BellOff size={18} color="#6b7280" />}
                    <span style={{ fontSize: '14px', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                        {isEnglish ? 'Smart Alerts' : 'Smart Alerts'}
                    </span>
                    {notifications.length > 0 && (
                        <span style={{
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {notifications.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    width: '350px',
                    maxHeight: '500px',
                    background: isDarkMode ? '#1f2937' : 'white',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }}>
                            {isEnglish ? 'Smart Notifications' : 'Smart Notifications'}
                        </h3>
                        <button
                            onClick={() => setShowSettings(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                        </button>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {/* Subscription Status */}
                        {!isSubscribed ? (
                            <div style={{
                                padding: '16px',
                                textAlign: 'center',
                                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                            }}>
                                <BellOff size={32} color="#6b7280" style={{ marginBottom: '8px' }} />
                                <p style={{ margin: '8px 0', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                    {isEnglish ? 'Enable notifications for smart alerts' : 'Enable notifications for smart alerts'}
                                </p>
                                <button
                                    onClick={handleSubscribe}
                                    style={{
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isEnglish ? 'Enable Notifications' : 'Enable Notifications'}
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={16} color="#10b981" />
                                    <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                                        {isEnglish ? 'Notifications enabled' : 'Notifications enabled'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Alert Preferences */}
                        <div style={{ padding: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '14px' }}>
                                {isEnglish ? 'Alert Types' : 'Alert Types'}
                            </h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { key: 'diseaseRisk', label: isEnglish ? 'Disease Risk' : 'Disease Risk', icon: AlertTriangle },
                                    { key: 'pestRisk', label: isEnglish ? 'Pest Risk' : 'Pest Risk', icon: AlertTriangle },
                                    { key: 'stressRisk', label: isEnglish ? 'Stress Risk' : 'Stress Risk', icon: AlertTriangle },
                                    { key: 'irrigationAlerts', label: isEnglish ? 'Irrigation' : 'Irrigation', icon: Info },
                                    { key: 'fertilizerAlerts', label: isEnglish ? 'Fertilizer' : 'Fertilizer', icon: TrendingUp },
                                    { key: 'harvestAlerts', label: isEnglish ? 'Harvest' : 'Harvest', icon: Info },
                                    { key: 'dailySummary', label: isEnglish ? 'Daily Summary' : 'Daily Summary', icon: Bell }
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Icon size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                            <span style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                                {label}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={alertPreferences[key]}
                                            onChange={(e) => updateAlertPreferences({ [key]: e.target.checked })}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Methods */}
                        <div style={{ padding: '16px', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                            <h4 style={{ margin: '0 0 12px 0', color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '14px' }}>
                                {isEnglish ? 'Notification Methods' : 'Notification Methods'}
                            </h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Smartphone size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <span style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                            {isEnglish ? 'Push Notifications' : 'Push Notifications'}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={alertPreferences.push}
                                        onChange={(e) => updateAlertPreferences({ push: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MessageSquare size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <span style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                            {isEnglish ? 'SMS Alerts' : 'SMS Alerts'}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={alertPreferences.sms}
                                        onChange={(e) => updateAlertPreferences({ sms: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <span style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                            {isEnglish ? 'Email Alerts' : 'Email Alerts'}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={alertPreferences.email}
                                        onChange={(e) => updateAlertPreferences({ email: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recent Notifications */}
                        {notifications.length > 0 && (
                            <div style={{ padding: '16px', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '14px' }}>
                                        {isEnglish ? 'Recent Alerts' : 'Recent Alerts'}
                                    </h4>
                                    <button
                                        onClick={clearNotifications}
                                        style={{
                                            background: 'none',
                                            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                                        }}
                                    >
                                        {isEnglish ? 'Clear' : 'Clear'}
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {notifications.slice(0, 3).map(notification => (
                                        <div
                                            key={notification.id}
                                            style={{
                                                padding: '8px',
                                                backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                                                borderRadius: '6px',
                                                borderLeft: `3px solid ${getNotificationColor(notification.type)}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                {getNotificationIcon(notification.type)}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                                        {notification.title}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
                                                        {notification.message}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#9ca3af', marginTop: '4px' }}>
                                                        {formatTime(notification.timestamp)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => dismissNotification(notification.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <X size={14} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartNotificationManager;
