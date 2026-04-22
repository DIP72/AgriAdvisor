require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const http = require('http');
const { Server } = require('socket.io');
const RiskAlertService = require('./services/riskAlertService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Risk Alert Service
const riskAlertService = new RiskAlertService(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for now to avoid CORS issues during dev
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('AgriAdvisor API is running...');
});

// Models
const CommunityPost = require('./models/CommunityPost');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const cropRoutes = require('./routes/crops');
const trendRoutes = require('./routes/trends');
const syncRoutes = require('./routes/sync');
const ttsRoutes = require('./routes/tts');
const feedbackRoutes = require('./routes/feedback');
const weatherRiskRoutes = require('./routes/weatherRisk');
const cropOptimizationRoutes = require('./routes/cropOptimization');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/weather-risk', weatherRiskRoutes);
app.use('/api/crop-optimization', cropOptimizationRoutes);

// Detailed recommendation route
const { generateRecommendations } = require('./services/scoringEngine');
const { getRealTimeWeather } = require('./services/weatherService');

app.post('/api/recommend-crops', async (req, res) => {
    try {
        const weather = await getRealTimeWeather(req.body.lat, req.body.lon);
        const recommendations = await generateRecommendations(req.body, weather);
        res.json({ weather, ...recommendations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch all community posts
app.get('/api/community/posts', async (req, res) => {
    try {
        const posts = await CommunityPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a community post via REST API
app.post('/api/community/post', async (req, res) => {
    console.log('📩 Received community post request:', req.body);
    try {
        const { content, authorId, authorName, location, clientId } = req.body;

        if (!content || !authorId) {
            console.warn('⚠️ Missing required fields:', { content, authorId });
            return res.status(400).json({ error: 'Missing required fields: content and authorId' });
        }

        const newPost = new CommunityPost({
            content,
            authorId,
            authorName: authorName || 'शेतकरी मित्र',
            location: location || 'गावाकडून',
            clientId
        });

        await newPost.save();
        console.log('✅ Post saved to DB:', newPost._id);

        const broadcastData = {
            ...newPost.toObject(),
            user: newPost.authorName,
            timestamp: newPost.createdAt
        };

        // Emit via Socket.IO for real-time update
        io.emit('receiveMessage', broadcastData);

        // Global notification event
        io.emit('community:newActivity', {
            type: 'post',
            authorId: String(newPost.authorId),
            authorName: newPost.authorName,
            content: newPost.content,
            timestamp: newPost.createdAt,
            _id: newPost._id
        });

        return res.status(201).json(newPost);
    } catch (err) {
        console.error('❌ Error creating post:', err);
        return res.status(500).json({ error: 'Database save failed: ' + err.message });
    }
});

// JSON error handler for 404s — MUST be after all route definitions
app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    next();
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('sendMessage', async (data, callback) => {
        const { room, message, userId, user, location, clientId } = data;

        try {
            const newPost = new CommunityPost({
                content: message,
                authorId: userId,
                authorName: user || 'शेतकरी मित्र',
                location: location || 'गावाकडून',
                clientId
            });
            await newPost.save();

            const broadcastData = {
                ...newPost.toObject(),
                user: newPost.authorName,
                timestamp: newPost.createdAt
            };

            // Broadcast to all connected users
            io.to(room).emit('receiveMessage', broadcastData);

            // Global notification event (broadcast to everyone connected)
            io.emit('community:newActivity', {
                type: 'message',
                authorId: String(newPost.authorId),
                authorName: newPost.authorName,
                content: newPost.content,
                timestamp: newPost.createdAt,
                _id: newPost._id
            });

            if (callback) callback({ success: true, data: broadcastData });
        } catch (err) {
            console.error('Error saving post:', err);
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI or MONGODB_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.warn('⚠️ Server will continue running without database connection.');
    });

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
