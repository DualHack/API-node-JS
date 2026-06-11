const express = require('express');
const reportRoutes = require('./reportRoutes');
const phoneRoutes = require('./phoneRoutes');
const syncRoutes = require('./syncRoutes');

const router = express.Router();

router.use('/api', reportRoutes);
router.use('/api', phoneRoutes);
router.use('/api/sync', syncRoutes);

router.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AngoSec API root',
  });
});

router.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AngoSec API is running' });
});

module.exports = router;
