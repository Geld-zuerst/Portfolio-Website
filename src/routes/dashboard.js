const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { computeStreaks } = require("../lib/streaks");
const { todayISO, lastNDays } = require("../lib/dates");

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard/summary
// One call to feed the whole dashboard: today's habits, goals overview,
// recent journal entries, and a momentum (7-day completion) chart.
router.get("/summary", (req, res) => {
  const userId = req.userId;
  const today = todayISO();

  const habits = db
    .prepare("SELECT * FROM habits WHERE user_id = ? AND archived = 0 ORDER BY created_at ASC")
    .all(userId);

  const todayHabits = habits.map((h) => {
    const doneDates = db
      .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1")
      .all(h.id)
      .map((r) => r.date);
    const { current } = computeStreaks(doneDates);
    return {
      id: h.id,
      name: h.name,
      streak: current,
      done: doneDates.includes(today),
    };
  });

  const goals = db.prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC").all(userId);
  const goalsProgress = goals.map((g) => ({
    id: g.id,
    name: g.name,
    progress: g.progress,
    catColor: g.cat_color,
  }));

  const recentJournal = db
    .prepare("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 3")
    .all(userId)
    .map((e) => ({
      id: e.id,
      date: e.date,
      mood: e.mood,
      title: e.title,
      body: e.body,
      tags: JSON.parse(e.tags || "[]"),
    }));

  // Momentum chart: overall completion % for each of the last 7 days.
  const week = lastNDays(7);
  const habitIds = habits.map((h) => h.id);
  let momentum;
  if (habitIds.length === 0) {
    momentum = week.map((d) => ({ date: d, pct: 0 }));
  } else {
    const placeholders = habitIds.map(() => "?").join(",");
    const rows = db
      .prepare(
        `SELECT date, COUNT(*) AS c FROM habit_logs
         WHERE done = 1 AND habit_id IN (${placeholders}) AND date IN (${week.map(() => "?").join(",")})
         GROUP BY date`
      )
      .all(...habitIds, ...week);
    const byDate = new Map(rows.map((r) => [r.date, r.c]));
    momentum = week.map((d) => ({
      date: d,
      pct: Math.round(((byDate.get(d) || 0) / habitIds.length) * 100),
    }));
  }

  const doneToday = todayHabits.filter((h) => h.done).length;

  res.json({
    date: today,
    todayHabits,
    todayCompletion: {
      done: doneToday,
      total: todayHabits.length,
      pct: todayHabits.length ? Math.round((doneToday / todayHabits.length) * 100) : 0,
    },
    goalsProgress,
    activeGoalCount: goals.filter((g) => !g.completed).length,
    recentJournal,
    momentum,
  });
});

module.exports = router;
