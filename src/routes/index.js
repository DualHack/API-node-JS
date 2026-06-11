const express = require('express');
const reportRoutes = require('./reportRoutes');
const phoneRoutes = require('./phoneRoutes');
const syncRoutes = require('./syncRoutes');
const smsRoutes = require('./smsRoutes');
const ussdRoutes = require('./ussdRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

router.use('/api', reportRoutes);
router.use('/api', phoneRoutes);
router.use('/api/sync', syncRoutes);
router.use('/api', smsRoutes);
router.use('/api', ussdRoutes);
router.use('/api', analyticsRoutes);

router.get('/api/routes', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AngoSec API root',
    routes: [
      'GET /api/health',
      'POST /api/reports',
      'GET /api/phones/:phone',
      'GET /api/phones/top/reported',
      'GET /api/sync/phones',
      'POST /api/sms/report',
      'POST /api/ussd',
      'GET /api/analytics/summary',
    ],
  });
});

router.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AngoSec API is running' });
});

module.exports = router;
