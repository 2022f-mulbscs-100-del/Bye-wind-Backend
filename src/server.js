const app = require('./app');
const { env, prisma } = require('./config');
const logger = require('./shared/utils/logger');

const PORT = env.port;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅  Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀  Server running on http://localhost:${PORT}`);
      logger.info(`📡  API base path: ${env.apiPrefix}`);
      logger.info(`🌍  Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    logger.error('❌  Failed to start server', error);
    process.exit(1);
  }
}

// ── Graceful shutdown ───────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`\n${signal} received — shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
