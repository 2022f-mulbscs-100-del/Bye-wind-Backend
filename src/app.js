const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const { env } = require('./config');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { captureAuditContext } = require('./middlewares/auditLogger.middleware');
const v1Routes = require('./routes/v1.routes');
const ApiError = require('./shared/utils/ApiError');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.isDev ? 'dev' : 'combined'));

app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Static files (local uploads in dev)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Audit context capture (attaches req.auditContext)
app.use(captureAuditContext);

// ── Swagger UI ──────────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Restaurant API Docs',
    swaggerOptions: {
      persistAuthorization: true,   // token stays across page reloads
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
    },
  })
);

// ── Health Check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────────────
app.use(env.apiPrefix, v1Routes);

// ── 404 Handler ─────────────────────────────────────────────────────
app.use((req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// ── Global Error Handler (must be last) ─────────────────────────────
app.use(errorHandler);

module.exports = app;
