const { db } = require("../db");
const { computeStreaks } = require("./streaks");
const { lastNDays } = require("./dates");

const getBadgeByKey = db.prepare("SELECT * FROM badges WHERE key = ?");
const alreadyUnlocked = db.prepare(
  "SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?"
);
const unlockStmt = db.prepare(
  "INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)"
);

function unlock(userId, key) {
  const badge = getBadgeByKey.get(key);
  if (!badge) return null;
  if (alreadyUnlocked.get(userId, badge.id)) return null;
  unlockStmt.run(userId, badge.id);
  return badge;
}

/**
 * Re-evaluate every badge rule for a user. Cheap enough to run after any
 * write (habit toggle, journal save, goal change) since datasets are small.
 * Returns the list of newly-unlocked badges.
 */
function evaluateBadges(userId) {
  const newlyUnlocked = [];
  const record = (key) => {
    const badge = unlock(userId, key);
    if (badge) newlyUnlocked.push(badge);
  };

  // --- Streak badges: best streak across all of the user's habits ---
  const habits = db.prepare("SELECT id, category FROM habits WHERE user_id = ?").all(userId);
  let bestOverall = 0;
  for (const h of habits) {
    const dates = db
      .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1")
      .all(h.id)
      .map((r) => r.date);
    const { best } = computeStreaks(dates);
    bestOverall = Math.max(bestOverall, best);
  }
  if (bestOverall >= 7) record("streak_7");
  if (bestOverall >= 14) record("streak_14");
  if (bestOverall >= 30) record("streak_30");

  // --- Mindful month: any "Mindfulness" category habit done 30 days straight ---
  for (const h of habits.filter((h) => (h.category || "").toLowerCase().includes("mindful"))) {
    const dates = db
      .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1")
      .all(h.id)
      .map((r) => r.date);
    const { current, best } = computeStreaks(dates);
    if (Math.max(current, best) >= 30) record("mindful_month");
  }

  // --- Perfect week: every active habit done every day for the last 7 days ---
  if (habits.length > 0) {
    const week = lastNDays(7);
    const allDone = habits.every((h) => {
      const rows = db
        .prepare(
          `SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1 AND date IN (${week
            .map(() => "?")
            .join(",")})`
        )
        .all(h.id, ...week);
      return rows.length === 7;
    });
    if (allDone) record("perfect_week");
  }

  // --- Journal badges ---
  const journalCount = db
    .prepare("SELECT COUNT(*) AS c FROM journal_entries WHERE user_id = ?")
    .get(userId).c;
  if (journalCount >= 1) record("journal_1");
  if (journalCount >= 10) record("journal_10");
  if (journalCount >= 50) record("journal_50");

  // --- Goal badges ---
  const goalCount = db.prepare("SELECT COUNT(*) AS c FROM goals WHERE user_id = ?").get(userId).c;
  if (goalCount >= 1) record("goal_first");
  const completedGoals = db
    .prepare("SELECT COUNT(*) AS c FROM goals WHERE user_id = ? AND completed = 1")
    .get(userId).c;
  if (completedGoals >= 1) record("goal_finished");

  // --- Early riser: 5+ habit completions logged before 8am local server time ---
  const habitIds = habits.map((h) => h.id);
  if (habitIds.length > 0) {
    const earlyCount = db
      .prepare(
        `SELECT COUNT(*) AS c FROM habit_logs
         WHERE done = 1 AND habit_id IN (${habitIds.map(() => "?").join(",")})
         AND CAST(strftime('%H', logged_at) AS INTEGER) < 8`
      )
      .get(...habitIds).c;
    if (earlyCount >= 5) record("early_riser");
  }

  // --- Data curious: 10+ analytics endpoint hits ---
  const analyticsHits =
    db.prepare("SELECT count FROM usage_counters WHERE user_id = ? AND key = 'analytics_views'").get(userId)
      ?.count || 0;
  if (analyticsHits >= 10) record("data_curious");

  return newlyUnlocked;
}

/** Bump a named per-user usage counter (used for the "data curious" badge). */
function bumpCounter(userId, key) {
  db.prepare(
    `INSERT INTO usage_counters (user_id, key, count) VALUES (?, ?, 1)
     ON CONFLICT(user_id, key) DO UPDATE SET count = count + 1`
  ).run(userId, key);
}

module.exports = { evaluateBadges, unlock, bumpCounter };
