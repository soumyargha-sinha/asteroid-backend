const redis = require('redis');
const config = require('./config');

const client = redis.createClient({
  host: config.REDIS_URL,
  port: config.REDIS_PORT,
});

client.on('error', (err) => console.error('Redis connection error:', err));
client.on('connect', () => console.log('Redis connected'));

module.exports = client;
