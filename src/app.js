require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./router/apiRouter');
const db = require('./config/db');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');
const scheduleHourlyJob = require('./config/cronJob')
const { updateData } = require('./services/externalApiService');
const AsteroidModel = require('./models/AsteroidModel');
const app = express();
db();
app.use(express.json());
app.use(securityHeaders);
app.use(cors({
    origin: process.env.ALLOWED_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(rateLimiter);
app.use(require('./middleware/logging'));
app.use('/api', apiRouter);

app.use(errorHandler);

// scheduleHourlyJob();

setTimeout(async () => {
    console.log('Running initial job 5 seconds after server start...');
    try {
        await updateData({ AsteroidModel: AsteroidModel });
        // await scheduleHourlyJob();
    } catch (error) {
        console.error('Error running initial job:', error);
    }
}, 5000);

module.exports = app;
