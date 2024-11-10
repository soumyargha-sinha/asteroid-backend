const cron = require('node-cron');
const mongoose = require('mongoose');
const { updateData } = require('../services/externalApiService');
const AsteroidModel = require('../models/AsteroidModel');

const scheduleHourlyJob = () => {
    console.log(`Cron job scheduled | ${new Date()}`);
    // cron.schedule('0 * * * *', async () => { // every hour
    // cron.schedule('*/1 * * * *', async () => { // every minute
    cron.schedule('0 */12 * * *', async () => { // every 12 hours
        console.log('Running scheduled job');
        try {
            const jobDone = await updateData({ AsteroidModel: AsteroidModel });
            jobDone ? console.log(`Scheduled job completed successfully | ${new Date()}`) : console.log(`Scheduled job failed | ${new Date()}`);
        } catch (error) {
            console.log(`Error | ${new Date()}`);
            console.error('Error running scheduled job:', error);
        }
    });
};

module.exports = scheduleHourlyJob;
