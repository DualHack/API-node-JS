const express = require('express');
const {
  getPhoneHandler,
  getTopReportedHandler,
} = require('../controllers/phoneController');

const router = express.Router();

router.get('/phones/:phone', getPhoneHandler);
router.get('/phones/top/reported', getTopReportedHandler);

module.exports = router;
