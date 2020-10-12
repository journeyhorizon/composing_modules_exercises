const express = require('express');
const router = express.Router();

router.use('/api', require('./flexApi'));
router.use('/auth', require('./flexApi/auth'));

module.exports = router;


