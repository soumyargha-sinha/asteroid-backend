const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/rateLimiter.log');

const logRateLimitExceeded = (req, res, next) => {
    if (res.statusCode === 429) {
        const logEntry = `${new Date().toISOString()} - Rate limit exceeded for IP: ${req.ip}\n`;
        fs.appendFileSync(logFilePath, logEntry, { flag: 'a' });
    }
    next();
};

module.exports = logRateLimitExceeded;
