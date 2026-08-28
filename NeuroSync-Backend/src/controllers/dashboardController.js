const prisma = require('../config/db');
const { ok } = require('../utils/apiResponse');
const { getRecommendedExtension } = require('../utils/recommendation');

// GET /api/dashboard
// Returns exactly what Dashboard.jsx needs to render its stat cards, the
// "Improvement Over Time" chart, and the history table — computed from
// real stored assessments instead of localStorage. If the user hasn't
// taken an assessment yet, this returns a clean empty state rather than
// invented numbers.
async function getDashboard(req, res) {
  const assessments = await prisma.assessment.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  });

  if (assessments.length === 0) {
    return ok(res, {
      hasHistory: false,
      assessmentsTaken: 0,
      latest: null,
      averageReadingSpeed: 0,
      recommendedExtension: null,
      chartData: [],
      history: [],
    });
  }

  const latest = assessments[assessments.length - 1];
  const averageReadingSpeed = Math.round(
    assessments.reduce((sum, a) => sum + (a.readingSpeed || 0), 0) / assessments.length
  );

  return ok(res, {
    hasHistory: true,
    assessmentsTaken: assessments.length,
    latest,
    averageReadingSpeed,
    recommendedExtension: getRecommendedExtension(latest.totalPercent),
    chartData: assessments.map((a) => ({ date: a.createdAt, totalPercent: a.totalPercent })),
    history: [...assessments].reverse(), // newest first, matching the current table
  });
}

module.exports = { getDashboard };
