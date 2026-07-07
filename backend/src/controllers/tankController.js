const { getDb } = require('../config/database');

/**
 * GET /api/tanks
 * Returns all tanks with their most recent sensor reading.
 */
exports.getAllTanks = (req, res) => {
  const db = getDb();

  const tanks = db.prepare(`
    SELECT
      t.id, t.name, t.location, t.capacity_liters,
      sr.temperature, sr.pressure, sr.level_percent, sr.recorded_at
    FROM tanks t
    LEFT JOIN sensor_readings sr
      ON sr.id = (
        SELECT id FROM sensor_readings
        WHERE tank_id = t.id
        ORDER BY recorded_at DESC
        LIMIT 1
      )
    ORDER BY t.id
  `).all();

  res.json(tanks);
};

/**
 * GET /api/tanks/:id/current
 * Returns single tank info + latest reading.
 */
exports.getTankCurrent = (req, res) => {
  const db = getDb();
  const { id } = req.params;

  const tank = db.prepare('SELECT * FROM tanks WHERE id = ?').get(id);
  if (!tank) return res.status(404).json({ error: 'Tank not found' });

  const latest = db.prepare(`
    SELECT * FROM sensor_readings
    WHERE tank_id = ?
    ORDER BY recorded_at DESC
    LIMIT 1
  `).get(id);

  res.json({ ...tank, latest: latest || null });
};

/**
 * GET /api/tanks/:id/history?from=&to=&limit=
 * Returns chronological sensor readings for a tank, with optional date filter.
 */
exports.getTankHistory = (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { from, to, limit = 200 } = req.query;

  // Verify tank exists
  const tank = db.prepare('SELECT id, name FROM tanks WHERE id = ?').get(id);
  if (!tank) return res.status(404).json({ error: 'Tank not found' });

  let query = 'SELECT * FROM sensor_readings WHERE tank_id = ?';
  const params = [id];

  if (from) { query += ' AND recorded_at >= ?'; params.push(from); }
  if (to)   { query += ' AND recorded_at <= ?'; params.push(to);   }

  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(parseInt(limit, 10));

  const readings = db.prepare(query).all(...params);

  // Reverse so chart renders chronologically (oldest → newest)
  res.json({ tank, readings: readings.reverse() });
};
