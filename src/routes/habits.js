const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { computeStreaks } = require("../lib/streaks");
const { todayISO, lastNDays } = require("../lib/dates");
const { evaluateBadges } = require("../lib/badges");

const router = express.Router();
router.use(requireAuth);

function ownHabit(id, userId) {
  return db.prepare("SELECT * FROM habits WHERE id = ? AND user_id = ?").get(id, userId);
}

function serializeHabit(habit, { heatmapDays = 0 } = {}) {
  const doneRows = db
    .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1")
    .all(habit.id);
  const doneDates = doneRows.map((r) => r.date);
  const { current, best } = computeStreaks(doneDates);
  const doneToday = doneDates.includes(todayISO());

  const out = {
    id: habit.id,
    name: habit.name,
    category: habit.category,
    frequency: habit.frequency,
    icon: habit.icon,
    color: habit.color,
    archived: !!habit.archived,
    streak: current,
    best,
    doneToday,
    createdAt: habit.created_at,
  };

  if (heatmapDays > 0) {
    const days = lastNDays(heatmapDays);
    const doneSet = new Set(doneDates);
    out.heatmap = days.map((d) => ({ date: d, done: doneSet.has(d) }));
  }

  return out;
}

// GET /api/habits
router.get("/", (req, res) => {
  const includeArchived = req.query.includeArchived === "true";
  const heatmapDays = Number(req.query.heatmapDays || 0);
  const rows = db
    .prepare(
      `SELECT * FROM habits WHERE user_id = ? ${includeArchived ? "" : "AND archived = 0"} ORDER BY created_at ASC`
    )
    .all(req.userId);
  res.json({ habits: rows.map((h) => serializeHabit(h, { heatmapDays })) });
});

// POST /api/habits
router.post("/", (req, res) => {
  const { name, category = "Personal", frequency = "Daily", icon = "✅", color = "current" } =
    req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const info = db
    .prepare(
      "INSERT INTO habits (user_id, name, category, frequency, icon, color) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(req.userId, name, category, frequency, icon, color);

  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ habit: serializeHabit(habit, { heatmapDays: 30 }) });
});

// PATCH /api/habits/:id
router.patch("/:id", (req, res) => {
  const habit = ownHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Habit not found" });

  const fields = ["name", "category", "frequency", "icon", "color", "archived"];
  const updates = {};
  for (const f of fields) {
    if (req.body && f in req.body) updates[f] = f === "archived" ? (req.body[f] ? 1 : 0) : req.body[f];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = Object.keys(updates)
    .map((k) => `${k} = @${k}`)
    .join(", ");
  db.prepare(`UPDATE habits SET ${setClause} WHERE id = @id`).run({ ...updates, id: habit.id });

  const updated = db.prepare("SELECT * FROM habits WHERE id = ?").get(habit.id);
  res.json({ habit: serializeHabit(updated, { heatmapDays: 30 }) });
});

// DELETE /api/habits/:id
router.delete("/:id", (req, res) => {
  const habit = ownHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Habit not found" });
  db.prepare("DELETE FROM habits WHERE id = ?").run(habit.id);
  res.status(204).end();
});

// POST /api/habits/:id/toggle  { date?: "YYYY-MM-DD" }
router.post("/:id/toggle", (req, res) => {
  const habit = ownHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Habit not found" });

  const date = (req.body && req.body.date) || todayISO();
  const existing = db
    .prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?")
    .get(habit.id, date);

  if (existing) {
    if (existing.done) {
      db.prepare("DELETE FROM habit_logs WHERE id = ?").run(existing.id);
    } else {
      db.prepare("UPDATE habit_logs SET done = 1, logged_at = datetime('now') WHERE id = ?").run(
        existing.id
      );
    }
  } else {
    db.prepare("INSERT INTO habit_logs (habit_id, date, done) VALUES (?, ?, 1)").run(
      habit.id,
      date
    );
  }

  const newlyUnlocked = evaluateBadges(req.userId);
  const fresh = db.prepare("SELECT * FROM habits WHERE id = ?").get(habit.id);
  res.json({ habit: serializeHabit(fresh, { heatmapDays: 30 }), newlyUnlocked });
});

// GET /api/habits/:id/logs?days=90
router.get("/:id/logs", (req, res) => {
  const habit = ownHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Habit not found" });

  const days = Number(req.query.days || 90);
  const range = lastNDays(days);
  const doneSet = new Set(
    db
      .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1")
      .all(habit.id)
      .map((r) => r.date)
  );
  res.json({ logs: range.map((d) => ({ date: d, done: doneSet.has(d) })) });
});

module.exports = router;
