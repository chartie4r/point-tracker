export function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

/** Must be used after requireAuth. Allows only users with role "superadmin". */
export function requireSuperadmin(req, res, next) {
  if (req.session?.role === 'superadmin') {
    return next();
  }
  res.status(403).json({ error: 'Superadmin only' });
}

export function optionalAuth(req, res, next) {
  next();
}
