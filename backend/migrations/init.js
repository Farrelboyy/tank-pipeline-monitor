const { getDb, DB_PATH } = require('../src/config/database');
const bcrypt = require('bcryptjs');

console.log('🔧 Running database migration...');

function migrate() {
  const db = getDb();

  // ── Create all tables ───────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tanks (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT NOT NULL,
      location         TEXT NOT NULL,
      capacity_liters  REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tank_id        INTEGER NOT NULL,
      temperature    REAL NOT NULL,
      pressure       REAL NOT NULL,
      level_percent  REAL NOT NULL,
      recorded_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tank_id) REFERENCES tanks(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tank_id     INTEGER NOT NULL,
      parameter   TEXT NOT NULL,
      value       REAL NOT NULL,
      threshold   REAL NOT NULL,
      severity    TEXT NOT NULL CHECK(severity IN ('warning', 'danger')),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (tank_id) REFERENCES tanks(id)
    );

    CREATE INDEX IF NOT EXISTS idx_readings_tank   ON sensor_readings(tank_id);
    CREATE INDEX IF NOT EXISTS idx_readings_time   ON sensor_readings(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_tank     ON alerts(tank_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved_at);
  `);

  console.log('✓ Tables created');

  // ── Seed admin user ─────────────────────────────────────────────────────────
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingUser) {
    const hash = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('✓ Admin user created  [username: admin | password: admin]');
  } else {
    console.log('  Admin user already exists, skipped');
  }

  // ── Seed 5 tanks ────────────────────────────────────────────────────────────
  const tankCount = db.prepare('SELECT COUNT(*) AS c FROM tanks').get().c;
  if (tankCount === 0) {
    const insert = db.prepare(
      'INSERT INTO tanks (name, location, capacity_liters) VALUES (?, ?, ?)'
    );
    const tanks = [
      ['Tank A', 'Block-1 North',    50000],
      ['Tank B', 'Block-1 South',    75000],
      ['Tank C', 'Block-2 East',     60000],
      ['Tank D', 'Block-2 West',     45000],
      ['Tank E', 'Block-3 Central',  80000],
    ];
    tanks.forEach(t => insert.run(...t));
    console.log('✓ 5 tanks seeded (Tank A – E)');
  } else {
    console.log('  Tanks already exist, skipped');
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   DB file: ${DB_PATH}`);
  console.log(`\n   Next: run "npm run dev" to start the server\n`);
}

migrate();
