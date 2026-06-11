const express = require('express');
const { getSyncPhonesHandler } = require('../controllers/phoneController');

const router = express.Router();

router.get('/phones', getSyncPhonesHandler);

module.exports = router;
