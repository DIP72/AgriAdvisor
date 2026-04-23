/**
 * Real-time Risk Alert Service
 * Handles Socket.io connections and real-time weather risk updates
 */

class RiskAlertService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // userId -> socket info
        this.userLocations = new Map(); // userId -> location data
        this.alertHistory = new Map(); // userId -> alert history
        this.updateInterval = null;
        
        this.setupSocketHandlers();
        this.startRealTimeUpdates();
    }

    /**
     * Setup Socket.io event handlers
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`[RiskAlert] User connected: ${socket.id}`);

            // Handle user authentication
            socket.on('authenticate', (data) => {
                this.handleAuthentication(socket, data);
            });

            // Handle location updates
            socket.on('location-update', (data) => {
                this.handleLocationUpdate(socket, data);
            });

            // Handle crop type updates
            socket.on('crop-type-update', (data) => {
                this.handleCropTypeUpdate(socket, data);
            });

            // Handle manual risk refresh
            socket.on('refresh-risk', (data) => {
                this.handleManualRefresh(socket, data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });
        });
    }

    /**
     * Handle user authentication
     */
    async handleAuthentication(socket, data) {
        try {
            const { token, userId } = data;
            
            // Validate token (simplified - in production, use proper JWT validation)
            if (!token || !userId) {
                socket.emit('auth-error', { message: 'Invalid authentication data' });
                return;
            }

            // Store user connection
            this.connectedUsers.set(userId, {
                socketId: socket.id,
                socket: socket,
                authenticated: true,
                connectedAt: new Date()
            });

            socket.userId = userId;
            socket.emit('authenticated', { success: true });
            
            console.log(`[RiskAlert] User ${userId} authenticated`);

            // Send initial risk data if location is available
            const location = this.userLocations.get(userId);
            if (location) {
                await this.sendRiskUpdate(userId, location);
            }

        } catch (error) {
            console.error('[RiskAlert] Authentication error:', error);
            socket.emit('auth-error', { message: 'Authentication failed' });
        }
    }

    /**
     * Handle location updates
     */
    async handleLocationUpdate(socket, data) {
        try {
            const { lat, lon, cropType = 'general' } = data;
            const userId = socket.id; // Use socket.id as userId

            // Remove authentication check - allow all users

            // Update user location
            this.userLocations.set(userId, {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                cropType,
                updatedAt: new Date()
            });

            console.log(`[RiskAlert] Location updated for user ${userId}: ${lat}, ${lon}`);

            // Send immediate risk update
            await this.sendRiskUpdate(userId, { lat, lon, cropType });

        } catch (error) {
            console.error('[RiskAlert] Location update error:', error);
            socket.emit('error', { message: 'Failed to update location' });
        }
    }

    /**
     * Handle crop type updates
     */
    async handleCropTypeUpdate(socket, data) {
        try {
            const { cropType } = data;
            const userId = socket.id; // Use socket.id as userId

            // Remove authentication check - allow all users

            // Update crop type in location data
            const location = this.userLocations.get(userId);
            if (location) {
                location.cropType = cropType;
                location.updatedAt = new Date();

                // Send updated risk analysis
                await this.sendRiskUpdate(userId, location);
            }

        } catch (error) {
            console.error('[RiskAlert] Crop type update error:', error);
            socket.emit('error', { message: 'Failed to update crop type' });
        }
    }

    /**
     * Handle manual risk refresh
     */
    async handleManualRefresh(socket, data) {
        try {
            const userId = socket.id; // Use socket.id as userId
            const location = this.userLocations.get(userId);

            if (!location) {
                socket.emit('error', { message: 'No location data available' });
                return;
            }

            await this.sendRiskUpdate(userId, location);

        } catch (error) {
            console.error('[RiskAlert] Manual refresh error:', error);
            socket.emit('error', { message: 'Failed to refresh risk data' });
        }
    }

    /**
     * Send risk update to specific user
     */
    async sendRiskUpdate(userId, location) {
        try {
            const userConnection = this.connectedUsers.get(userId);
            if (!userConnection || !userConnection.authenticated) {
                return;
            }

            const { getWeatherAnalysis } = require('./weatherService');
            const riskAnalysis = await getWeatherAnalysis(location.lat, location.lon, location.cropType);

            // Check for high-priority alerts
            const highPriorityAlerts = this.extractHighPriorityAlerts(riskAnalysis);

            // Send risk update
            userConnection.socket.emit('risk-update', {
                type: 'risk-analysis',
                data: riskAnalysis,
                timestamp: new Date().toISOString(),
                hasAlerts: highPriorityAlerts.length > 0
            });

            // Send separate alerts if any
            if (highPriorityAlerts.length > 0) {
                this.sendAlerts(userId, highPriorityAlerts, riskAnalysis);
            }

            // Store in alert history
            this.updateAlertHistory(userId, riskAnalysis);

        } catch (error) {
            console.error(`[RiskAlert] Failed to send risk update to user ${userId}:`, error);
            const userConnection = this.connectedUsers.get(userId);
            if (userConnection) {
                userConnection.socket.emit('error', { message: 'Failed to get risk analysis' });
            }
        }
    }

    /**
     * Extract high-priority alerts
     */
    extractHighPriorityAlerts(riskAnalysis) {
        const alerts = [];

        // Current high-priority recommendations
        const currentAlerts = riskAnalysis.current.risk.recommendations.filter(
            rec => rec.priority === 'high'
        );

        currentAlerts.forEach(alert => {
            alerts.push({
                type: 'current',
                severity: 'high',
                message: alert.action,
                category: alert.type,
                timing: alert.timing,
                timestamp: new Date().toISOString()
            });
        });

        // Forecast alerts for next 48 hours
        const nextTwoDays = riskAnalysis.forecast.forecast.slice(0, 2);
        nextTwoDays.forEach((day, index) => {
            if (day.overall > 70) {
                alerts.push({
                    type: 'forecast',
                    severity: day.severity,
                    message: `Day ${day.day + 1}: ${day.severity.toUpperCase()} risk predicted (${day.overall}%)`,
                    category: 'forecast',
                    timing: `in ${index + 1} day(s)`,
                    timestamp: new Date().toISOString()
                });
            }
        });

        return alerts;
    }

    /**
     * Send alerts to user
     */
    sendAlerts(userId, alerts, riskAnalysis) {
        const userConnection = this.connectedUsers.get(userId);
        if (!userConnection) return;

        userConnection.socket.emit('risk-alert', {
            type: 'alert-broadcast',
            alerts: alerts,
            riskLevel: riskAnalysis.current.risk.overall,
            timestamp: new Date().toISOString()
        });

        console.log(`[RiskAlert] Sent ${alerts.length} alerts to user ${userId}`);
    }

    /**
     * Update alert history
     */
    updateAlertHistory(userId, riskAnalysis) {
        if (!this.alertHistory.has(userId)) {
            this.alertHistory.set(userId, []);
        }

        const history = this.alertHistory.get(userId);
        history.push({
            timestamp: new Date().toISOString(),
            riskScore: riskAnalysis.current.risk.overall,
            severity: riskAnalysis.current.risk.severity,
            alerts: this.extractHighPriorityAlerts(riskAnalysis)
        });

        // Keep only last 24 hours of history
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const filteredHistory = history.filter(entry => 
            new Date(entry.timestamp) > oneDayAgo
        );

        this.alertHistory.set(userId, filteredHistory);
    }

    /**
     * Start real-time updates (every 30 minutes)
     */
    startRealTimeUpdates() {
        // Update every 30 minutes
        this.updateInterval = setInterval(async () => {
            await this.broadcastUpdates();
        }, 30 * 60 * 1000); // 30 minutes

        console.log('[RiskAlert] Real-time updates started (30-minute intervals)');
    }

    /**
     * Broadcast updates to all connected users
     */
    async broadcastUpdates() {
        console.log(`[RiskAlert] Broadcasting updates to ${this.connectedUsers.size} users`);

        for (const [userId, location] of this.userLocations) {
            await this.sendRiskUpdate(userId, location);
        }
    }

    /**
     * Handle user disconnection
     */
    handleDisconnection(socket) {
        const userId = socket.userId;
        
        if (userId) {
            this.connectedUsers.delete(userId);
            this.userLocations.delete(userId);
            console.log(`[RiskAlert] User ${userId} disconnected`);
        }

        console.log(`[RiskAlert] Connection closed: ${socket.id}`);
    }

    /**
     * Get connection statistics
     */
    getStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            activeLocations: this.userLocations.size,
            uptime: process.uptime(),
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Graceful shutdown
     */
    shutdown() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.connectedUsers.clear();
        this.userLocations.clear();
        this.alertHistory.clear();
        
        console.log('[RiskAlert] Service shutdown complete');
    }
}

module.exports = RiskAlertService;
