const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "flowlaytics.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL DEFAULT 'Monday',
  theme TEXT NOT NULL DEFAULT 'Paper (light)',
  default_landing TEXT NOT NULL DEFAULT 'Dashboard',
  notif_daily_checkin INTEGER NOT NULL DEFAULT 1,
  notif_streak_risk INTEGER NOT NULL DEFAULT 1,
  notif_weekly_summary INTEGER NOT NULL DEFAULT 0,
  notif_achievement INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Personal',
  frequency TEXT NOT NULL DEFAULT 'Daily',
  icon TEXT NOT NULL DEFAULT '✅',
  color TEXT NOT NULL DEFAULT 'current',
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 1,
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Personal',
  cat_color TEXT NOT NULL DEFAULT 'current',
  progress INTEGER NOT NULL DEFAULT 0,
  target_date TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'current',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  desc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS usage_counters (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
`);

// Static badge catalog — seeded once, keyed so re-runs are idempotent.
const BADGE_CATALOG = [
  { key: "streak_7", icon: "🔥", title: "7 Day Streak", desc: "Complete any habit 7 days in a row." },
  { key: "streak_14", icon: "🔥", title: "14 Day Streak", desc: "Complete any habit 14 days in a row." },
  { key: "streak_30", icon: "🔥", title: "30 Day Streak", desc: "Complete any habit 30 days in a row." },
  { key: "journal_1", icon: "📖", title: "First Chapter", desc: "Log your first journal entry." },
  { key: "journal_10", icon: "📚", title: "10 Entries", desc: "Write 10 journal entries." },
  { key: "journal_50", icon: "📚", title: "50 Entries", desc: "Write 50 journal entries." },
  { key: "goal_first", icon: "🎯", title: "First Goal Set", desc: "Create your first goal." },
  { key: "goal_finished", icon: "🏁", title: "Goal Finisher", desc: "Complete a goal end to end." },
  { key: "early_riser", icon: "🌅", title: "Early Riser", desc: "Log a habit completion before 8am, 5 times." },
  { key: "mindful_month", icon: "🧘", title: "Mindful Month", desc: "Complete a mindfulness-category habit every day for 30 days." },
  { key: "data_curious", icon: "📊", title: "Data Curious", desc: "Call the analytics endpoints 10 times." },
  { key: "perfect_week", icon: "👑", title: "Perfect Week", desc: "Complete every active habit, every day, for one week." },
];

const insertBadge = db.prepare(
  "INSERT OR IGNORE INTO badges (key, icon, title, desc) VALUES (@key, @icon, @title, @desc)"
);
const seedBadges = db.transaction((rows) => {
  for (const row of rows) insertBadge.run(row);
});
seedBadges(BADGE_CATALOG);

module.exports = { db, BADGE_CATALOG };
