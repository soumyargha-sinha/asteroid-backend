const express = require('express');
const asteroidController = require('../../controllers/asteroids');
const router = express.Router();

router.get('/', asteroidController.fetchAsteroids);

module.exports = router;
