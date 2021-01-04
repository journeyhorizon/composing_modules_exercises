const express = require('express');
const router = express.Router();

router.use(express.text());

router.use('/events', require('./events'));

module.exports = router;
