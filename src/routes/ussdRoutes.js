const express = require('express');
const { postUssdHandler } = require('../controllers/ussdController');

const router = express.Router();

router.post('/ussd', postUssdHandler);

module.exports = router;
