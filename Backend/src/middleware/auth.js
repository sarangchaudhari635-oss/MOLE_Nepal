const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

/**
 * Authentication middleware.
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches the decoded user payload to req.user.
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler)
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mole-dev-secret');

    // Optionally verify the user still exists in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, industry')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User account not found or has been deleted.' });
    }

    req.user = { ...decoded, ...user };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    next(err);
  }
}

/**
 * Optional auth middleware — attaches user if token present, but doesn't block.
 * Use for public routes that show extra info when logged in.
 */
async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mole-dev-secret');
      req.user = decoded;
    }
  } catch {
    // ignore auth errors for optional auth
  }
  next();
}

/**
 * Role-based authorization middleware.
 * Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.post('/admin', requireAuth, requireRole('agent'), handler)
 *
 * @param {...string} roles - Allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
