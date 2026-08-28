const jwt = require('jsonwebtoken');
const { fail } = require('../utils/apiResponse');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return fail(res, 'Authentication required. Missing bearer token.', 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return fail(res, 'Invalid or expired token.', 401);
  }
}

module.exports = { requireAuth };
