const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

const router = express.Router();

const simplifySchema = z.object({
  text: z.string().min(1, 'Text is required.'),
  level: z.enum(['basic', 'plus', 'smart']).optional(),
});

const summarizeSchema = z.object({
  text: z.string().min(1, 'Text is required.'),
});

// Not currently called by the redesigned frontend (see aiService.js for why),
// but kept behind auth like every other data-bearing route.
router.use(requireAuth);
router.post('/simplify', validate(simplifySchema), asyncHandler(aiController.simplify));
router.post('/summarize', validate(summarizeSchema), asyncHandler(aiController.summarize));

module.exports = router;
