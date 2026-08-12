const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { lastNDays, isWeekend } = require("../lib/dates");
const { bumpCounter, evaluateBadges } = require("../lib/badges");

const router = express.Router();
router.use(requireAuth);

// Track analytics usage for the "Data Curious" badge, once per request.
router.use((req, res, next) => {
  bumpCounter(req.userId, "analytics_views");
  evaluateBadges(req.userId);
  next();
});

// GET /api/analytics/consistency?days=30
// Per-habit completion percentage over the window — powers the bar chart.
router.get("/consistency", (req, res) => {
  const days = Number(req.query.days || 30);
  const range = lastNDays(days);
  const habits = db
    .prepare("SELECT * FROM habits WHERE user_id = ? AND archived = 0")
    .all(req.userId);

  const bars = habits.map((h) => {
    const doneSet = new Set(
      db
        .prepare(
          `SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1 AND date IN (${range
            .map(() => "?")
            .join(",")})`
        )
        .all(h.id, ...range)
        .map((r) => r.date)
    );
    const pct = range.length ? Math.round((doneSet.size / range.length) * 100) : 0;
    return { habitId: h.id, label: h.name, pct };
  });

  res.json({ days, bars });
});

// GET /api/analytics/trend?days=30
// Overall daily completion rate across all active habits — powers the line chart.
router.get("/trend", (req, res) => {
  const days = Number(req.query.days || 30);
  const range = lastNDays(days);
  const habits = db
    .prepare("SELECT id FROM habits WHERE user_id = ? AND archived = 0")
    .all(req.userId);
  const habitIds = habits.map((h) => h.id);

  if (habitIds.length === 0) {
    return res.json({ days, points: range.map((d) => ({ date: d, pct: 0 })) });
  }

  const placeholders = habitIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT date, COUNT(*) AS c FROM habit_logs
       WHERE done = 1 AND habit_id IN (${placeholders}) AND date IN (${range.map(() => "?").join(",")})
       GROUP BY date`
    )
    .all(...habitIds, ...range);
  const byDate = new Map(rows.map((r) => [r.date, r.c]));

  const points = range.map((d) => ({
    date: d,
    pct: Math.round(((byDate.get(d) || 0) / habitIds.length) * 100),
  }));

  res.json({ days, points });
});

// GET /api/analytics/donut?by=mood|category
// Distribution breakdown — powers the donut chart. Defaults to journal mood mix.
router.get("/donut", (req, res) => {
  const by = req.query.by === "category" ? "category" : "mood";

  if (by === "mood") {
    const rows = db
      .prepare(
        "SELECT mood AS key, COUNT(*) AS count FROM journal_entries WHERE user_id = ? GROUP BY mood"
      )
      .all(req.userId);
    return res.json({ by, slices: rows });
  }

  const rows = db
    .prepare(
      "SELECT category AS key, COUNT(*) AS count FROM habits WHERE user_id = ? AND archived = 0 GROUP BY category"
    )
    .all(req.userId);
  res.json({ by, slices: rows });
});

// GET /api/analytics/weekend-vs-weekday?days=60
// Supporting data for the "weekends are your lowest completion days" insight.
router.get("/weekend-vs-weekday", (req, res) => {
  const days = Number(req.query.days || 60);
  const range = lastNDays(days);
  const habits = db
    .prepare("SELECT id FROM habits WHERE user_id = ? AND archived = 0")
    .all(req.userId);
  const habitIds = habits.map((h) => h.id);

  const weekdayDates = range.filter((d) => !isWeekend(d));
  const weekendDates = range.filter((d) => isWeekend(d));

  function completionRate(dates) {
    if (habitIds.length === 0 || dates.length === 0) return 0;
    const placeholders = habitIds.map(() => "?").join(",");
    const count = db
      .prepare(
        `SELECT COUNT(*) AS c FROM habit_logs WHERE done = 1 AND habit_id IN (${placeholders}) AND date IN (${dates
          .map(() => "?")
          .join(",")})`
      )
      .get(...habitIds, ...dates).c;
    return Math.round((count / (habitIds.length * dates.length)) * 100);
  }

  res.json({
    weekdayPct: completionRate(weekdayDates),
    weekendPct: completionRate(weekendDates),
  });
});

module.exports = router;
