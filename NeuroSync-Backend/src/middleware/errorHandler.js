const { fail } = require('../utils/apiResponse');

function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// Express recognizes this as an error handler because it takes 4 args.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  // Prisma unique-constraint violation
  if (err.code === 'P2002') {
    return fail(res, `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists.`, 409);
  }

  // Prisma "record not found"
  if (err.code === 'P2025') {
    return fail(res, 'The requested record was not found.', 404);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;
  return fail(res, message, status);
}

module.exports = { notFound, errorHandler };
