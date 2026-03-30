const { PrismaClient } = require('@prisma/client');
const env = require('./env.config');

// ── Singleton Prisma Client ─────────────────────────────────────────
let prisma;

if (env.isProd) {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // Prevent hot-reload from creating multiple instances in dev
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

console.log('Database.js - Exporting Prisma Client:', prisma ? 'SUCCESS' : 'FAILED');

module.exports = prisma;
