const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(recommendationController.getRecommendation));
router.get('/extensions', asyncHandler(recommendationController.listExtensions));

module.exports = router;
