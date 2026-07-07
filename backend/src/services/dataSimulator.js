/**
 * dataSimulator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates realistic-looking sensor readings for 5 tanks every 5 seconds.
 *
 * Algorithm: Random Walk with Mean Reversion
 * ──────────────────────────────────────────
 * Instead of pure random numbers, each value "walks" from its previous value:
 *
 *   new = current
 *       + (target − current) × meanReversionRate   ← gentle pull to normal
 *       + (Math.random() − 0.5) × stepSize × 2     ← random noise
 *
 * This produces smooth, believable trends — values drift and come back,
 * similar to real industrial sensors.
 *
 * Thresholds (trigger alerts):
 *   Temperature  : warning if < 15°C  or > 40°C
 *   Pressure     : danger  if > 5 bar
 *   Level        : warning if < 10%   or > 95%
 */

const { getDb } = require('../config/database');

// ── Threshold config ──────────────────────────────────────────────────────────
const THRESHOLDS = [
  { param: 'temperature',   min: 15,  max: 40, minSev: 'warning', maxSev: 'warning' },
  { param: 'pressure',      min: null, max: 5,  minSev: null,      maxSev: 'danger'  },
  { param: 'level_percent', min: 10,  max: 95, minSev: 'warning', maxSev: 'warning' },
];

// ── Physics constraints (absolute min/max for clamping) ───────────────────────
const PHYSICS = {
  temperature:   { min: 5,  max: 75 },
  pressure:      { min: 0,  max: 9  },
  level_percent: { min: 0,  max: 100 },
};

// ── Random walk config per parameter ─────────────────────────────────────────
const WALK_CONFIG = {
  temperature:   { target: 28,  step: 1.5,  reversion: 0.03 },
  pressure:      { target: 3.0, step: 0.25, reversion: 0.04 },
  level_percent: { target: 60,  step: 2.5,  reversion: 0.02 },
};

// ── Internal state: stores current value for each tank ───────────────────────
// Structure: { [tankId]: { temperature, pressure, level_percent } }
const tankStates = {};

/**
 * Random walk step with mean reversion.
 * @param {number} current  - current value
 * @param {number} target   - long-term mean to revert toward
 * @param {number} step     - max noise magnitude
 * @param {number} reversion - how strongly to pull toward target (0–1)
 * @param {number} physMin  - absolute minimum clamp
 * @param {number} physMax  - absolute maximum clamp
 */
function randomWalk(current, target, step, reversion, physMin, physMax) {
  const pull  = (target - current) * reversion;
  const noise = (Math.random() - 0.5) * step * 2;
  return Math.max(physMin, Math.min(physMax, current + pull + noise));
}

/**
 * Initialize tank states with realistic starting values near "normal" range.
 */
function initStates(tanks) {
  tanks.forEach(tank => {
    tankStates[tank.id] = {
      temperature:   25 + Math.random() * 8,   // 25–33°C
      pressure:      2  + Math.random() * 1.5, // 2–3.5 bar
      level_percent: 45 + Math.random() * 25,  // 45–70%
    };
  });
  console.log(`[Simulator] Initialized state for ${tanks.length} tanks`);
}

/**
 * Check if a reading breaches any threshold and insert alert rows.
 * Returns array of triggered alert objects.
 */
function checkThresholds(db, tankId, readings) {
  const triggered = [];
  const insertAlert = db.prepare(
    'INSERT INTO alerts (tank_id, parameter, value, threshold, severity) VALUES (?, ?, ?, ?, ?)'
  );

  for (const rule of THRESHOLDS) {
    const val = readings[rule.param];

    if (rule.max !== null && val > rule.max) {
      insertAlert.run(tankId, rule.param, +val.toFixed(3), rule.max, rule.maxSev);
      triggered.push({ param: rule.param, val, threshold: rule.max, sev: rule.maxSev });
    } else if (rule.min !== null && val < rule.min) {
      insertAlert.run(tankId, rule.param, +val.toFixed(3), rule.min, rule.minSev);
      triggered.push({ param: rule.param, val, threshold: rule.min, sev: rule.minSev });
    }
  }

  return triggered;
}

/**
 * Generate one round of readings for all tanks and persist to DB.
 */
function generateReadings() {
  const db = getDb();
  const tanks = db.prepare('SELECT id, name FROM tanks').all();

  if (tanks.length === 0) {
    console.warn('[Simulator] No tanks in DB — run `npm run migrate` first');
    return;
  }

  // Init state on first run
  if (Object.keys(tankStates).length === 0) {
    initStates(tanks);
  }

  const insertReading = db.prepare(
    'INSERT INTO sensor_readings (tank_id, temperature, pressure, level_percent) VALUES (?, ?, ?, ?)'
  );

  // Wrap in a transaction for atomic batch insert (much faster)
  const batchInsert = db.transaction(() => {
    tanks.forEach(tank => {
      const s = tankStates[tank.id];
      const cfg = WALK_CONFIG;
      const phy = PHYSICS;

      // Step each parameter
      s.temperature   = randomWalk(s.temperature,   cfg.temperature.target,   cfg.temperature.step,   cfg.temperature.reversion,   phy.temperature.min,   phy.temperature.max);
      s.pressure      = randomWalk(s.pressure,      cfg.pressure.target,      cfg.pressure.step,      cfg.pressure.reversion,      phy.pressure.min,      phy.pressure.max);
      s.level_percent = randomWalk(s.level_percent, cfg.level_percent.target, cfg.level_percent.step, cfg.level_percent.reversion, phy.level_percent.min, phy.level_percent.max);

      const reading = {
        temperature:   +s.temperature.toFixed(2),
        pressure:      +s.pressure.toFixed(3),
        level_percent: +s.level_percent.toFixed(1),
      };

      insertReading.run(tank.id, reading.temperature, reading.pressure, reading.level_percent);

      // Alert check
      const alerts = checkThresholds(db, tank.id, reading);
      if (alerts.length > 0) {
        const detail = alerts.map(a => `${a.param}=${a.val.toFixed(2)} (threshold: ${a.threshold}) [${a.sev}]`).join(' | ');
        console.warn(`[Simulator] ⚠  ${tank.name}: ${detail}`);
      }
    });
  });

  batchInsert();
  console.log(`[Simulator] ✓ ${new Date().toLocaleTimeString()} — readings saved for ${tanks.length} tanks`);
}

/**
 * Start the simulator loop.
 * @param {number} intervalMs - interval in milliseconds (default 5000)
 * @returns {NodeJS.Timeout} interval handle (for cleanup)
 */
function startSimulator(intervalMs = 5000) {
  console.log(`[Simulator] 🚀 Starting — generating data every ${intervalMs / 1000}s`);
  generateReadings(); // immediate first run
  return setInterval(generateReadings, intervalMs);
}

module.exports = { startSimulator };
