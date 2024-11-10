const { fetchAsteroidsByDateRange } = require('../services/asteroidService');

async function fetchAsteroids(req, res) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    // if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    //     return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    // }

    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(startDate)) || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(endDate))) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD HH:MM.' });
    }

    try {
        const asteroids = await fetchAsteroidsByDateRange(startDate, endDate);
        return res.status(200).json(asteroids);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching asteroid data', error });
    }
}

module.exports = { fetchAsteroids };
