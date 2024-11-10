const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true,
});
redisClient.connect().then(data => console.log('Redis connected.')).catch(console.error);

const redisRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  },
  store: {
    incr: (key, cb) => {
      redisClient.incr(key, (err, count) => {
        if (err) return cb(err);
        redisClient.expire(key, 15 * 60);
        cb(null, count);
      });
    },
    resetKey: (key) => redisClient.del(key),
  },
});

module.exports = redisRateLimit;
