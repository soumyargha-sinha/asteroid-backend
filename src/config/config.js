require('dotenv').config();
module.exports = {
  port: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DEBUG: process.env.MONGO_DEBUG,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PORT: process.env.REDIS_PORT,
  EXTERNAL_API_URL: process.env.EXTERNAL_API_URL,
  RETRY_STRATEGY: process.env.RETRY_STRATEGY
};