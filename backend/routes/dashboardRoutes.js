const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard/counts', dashboardController.getCounts);

module.exports = router;