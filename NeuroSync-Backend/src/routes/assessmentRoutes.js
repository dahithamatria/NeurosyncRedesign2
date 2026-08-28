const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const assessmentController = require('../controllers/assessmentController');

const router = express.Router();

const categoryScoreSchema = z.object({
  correct: z.number(),
  total: z.number(),
  percent: z.number(),
});

const createAssessmentSchema = z.object({
  totalCorrect: z.number().int().min(0),
  totalScored: z.number().int().min(0),
  totalPercent: z.number().int().min(0).max(100),
  categoryScores: z.record(z.string(), categoryScoreSchema),
  readingSpeed: z.number().int().min(0).optional(),
  timeTakenSeconds: z.number().int().min(0).optional(),
});

router.use(requireAuth);
router.post('/', validate(createAssessmentSchema), asyncHandler(assessmentController.createAssessment));
router.get('/', asyncHandler(assessmentController.listAssessments));
router.get('/:id', asyncHandler(assessmentController.getAssessment));

module.exports = router;
