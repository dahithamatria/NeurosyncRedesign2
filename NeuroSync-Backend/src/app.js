require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { ok } = require('./utils/apiResponse');

const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const personalizationRoutes = require('./routes/personalizationRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// Only the configured frontend origin is allowed. FRONTEND_URL defaults to
// the Vite dev server port used by react-app.
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// A generous global limiter; auth routes have their own tighter one.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
