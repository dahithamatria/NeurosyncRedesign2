const prisma = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');

// GET /api/settings
// Backs PreferencesContext.jsx (darkMode, dyslexicFont, fontSize) plus the
// extra accessibility fields a Settings page would expose.
async function getSettings(req, res) {
  let settings = await prisma.userSettings.findUnique({ where: { userId: req.userId } });

  // Self-heal: a user created before settings existed, or via a future
  // import path, still gets sensible defaults instead of a 404.
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId: req.userId } });
  }

  return ok(res, { settings });
}

// PUT /api/settings
async function updateSettings(req, res) {
  const settings = await prisma.userSettings.upsert({
    where: { userId: req.userId },
    update: req.body,
    create: { userId: req.userId, ...req.body },
  });
  return ok(res, { settings });
}

module.exports = { getSettings, updateSettings };
