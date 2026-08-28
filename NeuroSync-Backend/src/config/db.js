const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance across the app (and across
// nodemon hot-reloads in dev) to avoid exhausting DB connections.
const prisma = global.__neurosyncPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__neurosyncPrisma = prisma;
}

module.exports = prisma;
