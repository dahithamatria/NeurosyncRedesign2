const { ok } = require('../utils/apiResponse');
const aiService = require('../services/aiService');

// POST /api/ai/simplify  { text, level }
async function simplify(req, res) {
  const { text, level } = req.body;
  const result = await aiService.simplify(text, level);
  return ok(res, { original: text, level: level || 'plus', ...result });
}

// POST /api/ai/summarize  { text }
async function summarize(req, res) {
  const { text } = req.body;
  const result = await aiService.summarize(text);
  return ok(res, result);
}

module.exports = { simplify, summarize };
