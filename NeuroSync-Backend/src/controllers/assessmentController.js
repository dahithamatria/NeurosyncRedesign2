const prisma = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');
const { getSupportLevel, getRecommendedExtension } = require('../utils/recommendation');

// POST /api/assessments
// Mirrors what Result.jsx currently pushes into history.js via
// saveAssessmentToHistory(). The quiz itself (paragraphs/questions/scoring)
// stays entirely client-side in utils/buildAssessment.js + utils/scoring.js —
// this endpoint just persists the finished result. Tier/support level/
// recommended extension are re-derived server-side from totalPercent rather
// than trusted from the client, so they can't be spoofed.
async function createAssessment(req, res) {
  const { totalCorrect, totalScored, totalPercent, categoryScores, readingSpeed, timeTakenSeconds } = req.body;

  const { tier, level } = getSupportLevel(totalPercent);
  const extension = getRecommendedExtension(totalPercent);

  const assessment = await prisma.assessment.create({
    data: {
      userId: req.userId,
      totalCorrect,
      totalScored,
      totalPercent,
      categoryScores,
      tier,
      supportLevel: level,
      recommendedExtension: extension.name,
      readingSpeed: readingSpeed || 0,
      timeTakenSeconds: timeTakenSeconds || 0,
    },
  });

  return ok(res, { assessment }, 201);
}

// GET /api/assessments
// Mirrors getAssessmentHistory() — newest last, same as the localStorage
// array the Dashboard chart currently expects.
async function listAssessments(req, res) {
  const assessments = await prisma.assessment.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  });
  return ok(res, { assessments });
}

// GET /api/assessments/:id
async function getAssessment(req, res) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!assessment) return fail(res, 'Assessment not found.', 404);
  return ok(res, { assessment });
}

module.exports = { createAssessment, listAssessments, getAssessment };
