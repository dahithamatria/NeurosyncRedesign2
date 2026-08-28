const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(dashboardController.getDashboard));

module.exports = router;
