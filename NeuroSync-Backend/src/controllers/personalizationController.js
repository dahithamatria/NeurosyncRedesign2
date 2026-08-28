const prisma = require('../config/db');
const { ok } = require('../utils/apiResponse');

// GET /api/personalization
// Lets the frontend check "has this user already filled out the intake
// form" instead of the old localStorage `neurosync_profile_<email>` check.
async function getProfile(req, res) {
  const profile = await prisma.personalizationProfile.findUnique({ where: { userId: req.userId } });
  return ok(res, { profile: profile || null });
}

// PUT /api/personalization
// Mirrors Personalize.jsx's fields exactly: age, gender, education,
// nativeLanguage, readingFrequency, glasses, diagnosedDyslexia.
async function upsertProfile(req, res) {
  const data = { ...req.body };
  if (data.age !== undefined) data.age = Number(data.age);

  const profile = await prisma.personalizationProfile.upsert({
    where: { userId: req.userId },
    update: data,
    create: { userId: req.userId, ...data },
  });

  return ok(res, { profile });
}

module.exports = { getProfile, upsertProfile };
