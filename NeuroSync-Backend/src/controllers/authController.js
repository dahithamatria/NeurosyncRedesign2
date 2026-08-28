const prisma = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');
const {
  hashPassword,
  comparePassword,
  signToken,
  toPublicUser,
  generateResetToken,
  hashResetToken,
} = require('../services/authService');

// POST /api/auth/register
// Mirrors Signup.jsx: name, email, password, confirmPassword (checked in
// the route's zod schema). Creates the user plus a default settings row.
async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return fail(res, 'An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      settings: { create: {} }, // defaults from schema.prisma
    },
  });

  const token = signToken(user.id);
  return ok(res, { token, user: toPublicUser(user) }, 201);
}

// POST /api/auth/login
// Mirrors Login.jsx's email + password check, but against the database
// with a hashed password instead of localStorage plaintext.
async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return fail(res, 'Incorrect email or password. Please try again.', 401);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return fail(res, 'Incorrect email or password. Please try again.', 401);
  }

  const token = signToken(user.id);
  return ok(res, { token, user: toPublicUser(user) });
}

// POST /api/auth/logout
// JWTs are stateless, so there's nothing to invalidate server-side in this
// simple setup. This endpoint exists so the frontend has a symmetrical call
// to make; the real logout is the client discarding its token.
async function logout(req, res) {
  return ok(res, { message: 'Logged out. Discard the token on the client.' });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { settings: true, personalization: true },
  });
  if (!user) return fail(res, 'User not found.', 404);
  return ok(res, { user: toPublicUser(user) });
}

// POST /api/auth/forgot-password
// Always responds with a generic success message so the endpoint can't be
// used to enumerate registered emails. In dev (no email provider configured)
// the raw reset token is included in the response so the flow is testable.
async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  const genericResponse = {
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  if (!user) return ok(res, genericResponse);

  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    update: { tokenHash: hash, expiresAt },
    create: { userId: user.id, tokenHash: hash, expiresAt },
  });

  // TODO: send `raw` via an email provider. No provider is configured yet,
  // so it's echoed back here only when not running in production.
  const devPayload = process.env.NODE_ENV === 'production' ? {} : { devResetToken: raw };

  return ok(res, { ...genericResponse, ...devPayload });
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  const { token, password } = req.body;
  const tokenHash = hashResetToken(token);

  const record = await prisma.passwordResetToken.findFirst({ where: { tokenHash } });
  if (!record || record.expiresAt < new Date()) {
    return fail(res, 'This reset link is invalid or has expired.', 400);
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return ok(res, { message: 'Password updated. You can now log in.' });
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
