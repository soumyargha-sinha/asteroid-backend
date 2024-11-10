const { makeRetryRequest } = require('../utils/retry');
const config = require('../config/config');
const mongoose = require('mongoose');
const axios = require('axios');
const redis = require('redis');
const AsteroidModel = require('../models/AsteroidModel');
const { adjustDateByDays, mergeArrayWithoutDuplicates } = require('../utils/responseUtil');

let redisClient;

// Initialize the Redis client
const initializeRedisClient = async () => {
    redisClient = redis.createClient({ url: config.REDIS_URL });

    redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
        console.log('Redis client connected');
    });

    await redisClient.connect().catch(err => {
        console.error('Error connecting to Redis:', err);
        process.exit(1);
    });
};

// Fetch data from an external API
// const fetchDataFromExternalApi = async () => {
//     const response = await axios.get(config.EXTERNAL_API_URL);
//     return response.data;
// };
const fetchDataFromExternalApi = async (startDate, endDate) => {
    try {
        const apiUrl = config.EXTERNAL_API_URL.replace('start_date_placeholder', startDate).replace('end_date_placeholder', endDate);
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for ${startDate} to ${endDate}:`, error);
        throw error;
    }
};

async function updateMongoDbWithData(data, dbModels = { AsteroidModel: AsteroidModel }) {
    let updatedData = false;
    const session = await dbModels.AsteroidModel.startSession(); // New session for the mongodb transaction
    console.log('Scheduled job: DB session done');
    session.startTransaction(); // Start the mongodb transaction
    console.log('Scheduled job: Transaction started');
    try {
        // Remove existing data from db
        await dbModels.AsteroidModel.deleteMany({}, { session });
        console.log('Scheduled job: Data successfully removed from mongodb');

        // Remove existing data from redis and set both to []
        await redisClient.set('asteroids', JSON.stringify([]));
        console.log('Scheduled job: Data successfully removed from Redis');

        // Asteroid insertion promises to be called together
        const asteroidPromises = [];

        const asteroids = data.map(asteroid => ({
            ...asteroid,
            dateString: asteroid.close_approach_data[0].close_approach_date_full, // Store the date value as a string
        }));
        asteroidPromises.push(dbModels.AsteroidModel.insertMany(asteroids, { session }));

        // Execute asteroid data insertion statements
        await Promise.all(asteroidPromises);

        // const insertInBatches = async (data, batchSize, model, session) => {
        //     for (let i = 0; i < data.length; i += batchSize) {
        //         const batch = data.slice(i, i + batchSize);
        //         await model.insertMany(batch, { session });
        //     }
        // };

        // await insertInBatches(asteroids, 100, dbModels.AsteroidModel, session);


        // Commit the transaction
        await session.commitTransaction();
        console.log('Scheduled job: Data successfully updated in MongoDB. Transaction committed.');

        // Get the sorted asteroids list
        const insertedAsteroids = await dbModels.AsteroidModel.find({})
            // .populate('date')
            .sort({ 'close_approach_data.0.epoch_date_close_approach': 1 });

        // Store data in Redis
        await redisClient.set('asteroids', JSON.stringify(insertedAsteroids));

        // await redisClient.set('asteroids', JSON.stringify(insertedAsteroids.flat()));
        console.log('Scheduled job: Asteroids successfully stored in Redis');

        // Mark success
        updatedData = true;
    } catch (error) {
        console.error('Scheduled job: Error updating MongoDB or Redis with data:', error);
        // check if a transaction is running
        if (session.inTransaction()) {
            console.log('Scheduled job: Aborting transaction');
            await session.abortTransaction(); // Abort the transaction on error
        }
    } finally {
        console.log('Scheduled job: Ending the DB session');
        session.endSession(); // End the session
    }
    return updatedData;
}

// Call the external API and persist the data in MongoDB and Redis
const updateData = async (dbModels = { AsteroidModel: AsteroidModel }) => {
    let updatedData = false;
    const retryStrategy = process.env.RETRY_STRATEGY || 'exponential';
    try {
        initializeRedisClient(); // initialize the Redis client
        const today = new Date();
        // const response = await makeRetryRequest(fetchDataFromExternalApi, retryStrategy);
        // const data = Object.values(response.near_earth_objects).flat(); // Get the near earth objects data
        const [response1, response2] = await Promise.all([
            makeRetryRequest(() => fetchDataFromExternalApi(adjustDateByDays(today, -1), adjustDateByDays(today, 5)), retryStrategy),
            makeRetryRequest(() => fetchDataFromExternalApi(adjustDateByDays(today, 6), adjustDateByDays(today, 10)), retryStrategy),
        ]);
        const data1 = Object.values(response1.near_earth_objects).flat();
        const data2 = Object.values(response2.near_earth_objects).flat();
        const mergedAsteroidData = mergeArrayWithoutDuplicates(data1, data2);
        updatedData = await updateMongoDbWithData(mergedAsteroidData, dbModels); // Update MongoDB and Redis with the API response
    } catch (error) {
        console.error('Scheduled job: Failed to update data:', error);
    }
    return updatedData;
};

module.exports = {
    updateData,
};
