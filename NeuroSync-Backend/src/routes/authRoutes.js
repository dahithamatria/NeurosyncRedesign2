const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// A tighter limiter on auth routes specifically, since these are the
// most common brute-force / credential-stuffing target.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/logout', requireAuth, asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

module.exports = router;
