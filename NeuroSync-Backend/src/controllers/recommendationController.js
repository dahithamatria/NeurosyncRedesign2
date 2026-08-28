const { ok, fail } = require('../utils/apiResponse');
const { getSupportLevel, getRecommendedExtension, EXTENSIONS } = require('../utils/recommendation');

// GET /api/recommendations?percent=72
// Lets the frontend ask the backend "given this score, what's the support
// level and recommended extension?" instead of duplicating the thresholds
// in two places. ExtensionRecommendation.jsx and Result.jsx currently
// compute this client-side via utils/recommendation.js; this endpoint
// exposes the exact same logic so it can eventually be the single source
// of truth, without requiring the frontend datasets to move server-side.
async function getRecommendation(req, res) {
  const percent = Number(req.query.percent);
  if (Number.isNaN(percent) || percent < 0 || percent > 100) {
    return fail(res, 'Query param "percent" must be a number between 0 and 100.', 422);
  }

  const support = getSupportLevel(percent);
  const extension = getRecommendedExtension(percent);
  return ok(res, { ...support, extension });
}

// GET /api/recommendations/extensions
// Returns the full Basic/Plus/Smart mapping, e.g. to render a comparison
// table without hard-coding it a third time in a new client.
async function listExtensions(req, res) {
  return ok(res, { extensions: EXTENSIONS });
}

module.exports = { getRecommendation, listExtensions };
