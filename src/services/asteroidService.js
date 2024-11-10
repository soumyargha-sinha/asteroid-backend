const Asteroid = require('../models/AsteroidModel');
const redis = require('redis');
const config = require('../config/config');

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

initializeRedisClient();

async function fetchAsteroidsByDateRange(startDate, endDate) {

  // Convert the date query strings to Date format
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Check if cached data is available
  const cachedData = await redisClient.get(`asteroids`);

  if (cachedData) {
    console.log('Cache responded with data');
    const asteroidData = JSON.parse(cachedData);
    const filteredAsteroids = asteroidData.filter(asteroid => {
      // Convert the dateString to date
      const asteroidDate = new Date(asteroid.dateString);
      // Check if the date falls between the range
      return asteroidDate >= startDateObj && asteroidDate <= endDateObj;
    });

    // Return the data if there's at least one item
    if (filteredAsteroids.length > 0) {
      // let countByDay;
      // countByDay = getAsteroidCountsByDayOfWeek(filteredAsteroids, countByDay);
      console.log('Cache is returning data');
      return { asteroids: filteredAsteroids, /* countByDay */ };
    }
  }

  console.log('Cache has empty dataset');
  console.log('Trying to fetch data from DB');

  // If data isn't found in cache, query the DB
  const asteroids = await Asteroid.find({
    dateString: { $gte: startDate, $lte: endDate }
  })
    // .populate('date')
    .sort({ "close_approach_data.0.close_approach_date_full": -1 });

  // If data is found, create aggregations
  // let countByDay;
  // countByDay = getAsteroidCountsByDayOfWeek(asteroids, countByDay);

  // todo: cache the data conditionally in Redis, if required.

  return {
    asteroids,
    /* countByDay */
  };
}

// function getDayOfWeek(dateString) {
//   const date = new Date(dateString);
//   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   return daysOfWeek[date.getUTCDay()];
// }

// function getAsteroidCountsByDayOfWeek(asteroids, countByDay) {
//   countByDay = asteroids.reduce((countStore, currentAsteroid) => {
//     if (!countStore) countStore = {};
//     const currentDayOfWeek = getDayOfWeek(currentAsteroid.dateString);
//     if (countStore[currentDayOfWeek])
//       countStore[currentDayOfWeek] += 1;
//     else
//       countStore[currentDayOfWeek] = 1;
//     return countStore;
//   }, countByDay);
//   return countByDay;
// }

module.exports = { fetchAsteroidsByDateRange };
