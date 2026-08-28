const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const personalizationController = require('../controllers/personalizationController');

const router = express.Router();

const profileSchema = z.object({
  age: z.union([z.string(), z.number()]).optional(),
  gender: z.string().optional(),
  education: z.string().optional(),
  nativeLanguage: z.string().optional(),
  readingFrequency: z.string().optional(),
  glasses: z.string().optional(),
  diagnosedDyslexia: z.string().optional(),
});

router.use(requireAuth);
router.get('/', asyncHandler(personalizationController.getProfile));
router.put('/', validate(profileSchema), asyncHandler(personalizationController.upsertProfile));

module.exports = router;
