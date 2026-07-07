const { getDb } = require('../config/database');

/**
 * GET /api/alerts
 * Returns active (unresolved) alerts, newest first.
 */
exports.getAlerts = (req, res) => {
  const db = getDb();

  const alerts = db.prepare(`
    SELECT
      a.id, a.tank_id, a.parameter, a.value,
      a.threshold, a.severity, a.created_at,
      t.name AS tank_name
    FROM alerts a
    JOIN tanks t ON a.tank_id = t.id
    WHERE a.resolved_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT 100
  `).all();

  res.json(alerts);
};
