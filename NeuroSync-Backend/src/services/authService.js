const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Strip sensitive fields before sending a user back to the client.
function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

// Used for the forgot-password flow: generate a raw token to email/return
// in dev, but only ever store its hash.
function generateResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

function hashResetToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  toPublicUser,
  generateResetToken,
  hashResetToken,
};
