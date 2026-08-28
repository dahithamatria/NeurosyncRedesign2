const { fail } = require('../utils/apiResponse');

// Usage: router.post('/route', validate(schema), handler)
// `schema` is a Zod schema validated against req.body.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      return fail(res, message || 'Invalid request body.', 422);
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
