const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function serialize(user, settings) {
  return {
    name: user.name,
    email: user.email,
    weekStart: settings.week_start,
    theme: settings.theme,
    defaultLanding: settings.default_landing,
    notifications: {
      dailyCheckin: !!settings.notif_daily_checkin,
      streakRisk: !!settings.notif_streak_risk,
      weeklySummary: !!settings.notif_weekly_summary,
      achievementUnlocked: !!settings.notif_achievement,
    },
  };
}

// GET /api/settings
router.get("/", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  let settings = db.prepare("SELECT * FROM settings WHERE user_id = ?").get(req.userId);
  if (!settings) {
    db.prepare("INSERT INTO settings (user_id) VALUES (?)").run(req.userId);
    settings = db.prepare("SELECT * FROM settings WHERE user_id = ?").get(req.userId);
  }
  res.json(serialize(user, settings));
});

// PATCH /api/settings
// Accepts any subset of: name, email, weekStart, theme, defaultLanding,
// notifications: { dailyCheckin, streakRisk, weeklySummary, achievementUnlocked }
router.patch("/", (req, res) => {
  const body = req.body || {};
  const userUpdates = {};
  if ("name" in body) userUpdates.name = body.name;
  if ("email" in body) userUpdates.email = body.email.toLowerCase();
  if (Object.keys(userUpdates).length > 0) {
    const setClause = Object.keys(userUpdates)
      .map((k) => `${k} = @${k}`)
      .join(", ");
    db.prepare(`UPDATE users SET ${setClause} WHERE id = @id`).run({
      ...userUpdates,
      id: req.userId,
    });
  }

  const settingsFieldMap = {
    weekStart: "week_start",
    theme: "theme",
    defaultLanding: "default_landing",
  };
  const settingsUpdates = {};
  for (const [bodyKey, col] of Object.entries(settingsFieldMap)) {
    if (bodyKey in body) settingsUpdates[col] = body[bodyKey];
  }
  if (body.notifications) {
    const n = body.notifications;
    if ("dailyCheckin" in n) settingsUpdates.notif_daily_checkin = n.dailyCheckin ? 1 : 0;
    if ("streakRisk" in n) settingsUpdates.notif_streak_risk = n.streakRisk ? 1 : 0;
    if ("weeklySummary" in n) settingsUpdates.notif_weekly_summary = n.weeklySummary ? 1 : 0;
    if ("achievementUnlocked" in n) settingsUpdates.notif_achievement = n.achievementUnlocked ? 1 : 0;
  }
  if (Object.keys(settingsUpdates).length > 0) {
    const setClause = Object.keys(settingsUpdates)
      .map((k) => `${k} = @${k}`)
      .join(", ");
    db.prepare(`UPDATE settings SET ${setClause} WHERE user_id = @id`).run({
      ...settingsUpdates,
      id: req.userId,
    });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  const settings = db.prepare("SELECT * FROM settings WHERE user_id = ?").get(req.userId);
  res.json(serialize(user, settings));
});

// GET /api/settings/export — dump everything for this user as JSON.
router.get("/export", (req, res) => {
  const userId = req.userId;
  const data = {
    user: db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").get(userId),
    settings: db.prepare("SELECT * FROM settings WHERE user_id = ?").get(userId),
    habits: db.prepare("SELECT * FROM habits WHERE user_id = ?").all(userId),
    habitLogs: db
      .prepare(
        `SELECT hl.* FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = ?`
      )
      .all(userId),
    goals: db.prepare("SELECT * FROM goals WHERE user_id = ?").all(userId),
    milestones: db
      .prepare(`SELECT m.* FROM milestones m JOIN goals g ON g.id = m.goal_id WHERE g.user_id = ?`)
      .all(userId),
    journalEntries: db.prepare("SELECT * FROM journal_entries WHERE user_id = ?").all(userId),
    unlockedBadges: db
      .prepare(
        `SELECT b.key, ub.unlocked_at FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = ?`
      )
      .all(userId),
  };
  res.setHeader("Content-Disposition", "attachment; filename=flowlaytics-export.json");
  res.json(data);
});

// DELETE /api/settings/account — permanently delete the user and all their data.
router.delete("/account", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.userId);
  res.status(204).end();
});

module.exports = router;
