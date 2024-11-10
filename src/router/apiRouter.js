const express = require('express');
const asteroidV1Routes = require('../routes/v1/asteroids');

const router = express.Router();

router.use('/v1/asteroids', asteroidV1Routes);

module.exports = router;
