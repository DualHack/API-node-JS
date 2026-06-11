const express = require('express');
const { postSmsReportHandler } = require('../controllers/smsController');

const router = express.Router();

router.post('/sms/report', postSmsReportHandler);

module.exports = router;
