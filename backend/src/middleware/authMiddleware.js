const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tank-pipeline-monitor-secret-2024';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied: no token provided' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Access denied: invalid or expired token' });
  }
};
