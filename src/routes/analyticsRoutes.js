const express = require('express');
const { getAnalyticsSummaryHandler } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/analytics/summary', getAnalyticsSummaryHandler);

module.exports = router;
