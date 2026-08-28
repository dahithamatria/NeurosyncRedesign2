const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

const settingsSchema = z.object({
  darkMode: z.boolean().optional(),
  dyslexicFont: z.boolean().optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  lineSpacing: z.string().optional(),
  letterSpacing: z.string().optional(),
  highContrast: z.boolean().optional(),
  reduceMotion: z.boolean().optional(),
  readingRuler: z.boolean().optional(),
});

router.use(requireAuth);
router.get('/', asyncHandler(settingsController.getSettings));
router.put('/', validate(settingsSchema), asyncHandler(settingsController.updateSettings));

module.exports = router;
