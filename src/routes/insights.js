const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { lastNDays, isWeekend, daysBetween, todayISO } = require("../lib/dates");
const { computeStreaks } = require("../lib/streaks");

const router = express.Router();
router.use(requireAuth);

// GET /api/insights
// Every insight here is derived from the user's real data rather than
// canned copy — if there isn't enough data yet for a rule, it's skipped.
router.get("/", (req, res) => {
  const userId = req.userId;
  const insights = [];
  const habits = db.prepare("SELECT * FROM habits WHERE user_id = ? AND archived = 0").all(userId);

  // 1. Most consistent habit over the last 30 days.
  if (habits.length > 0) {
    const range = lastNDays(30);
    let top = null;
    for (const h of habits) {
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
      const pct = Math.round((doneSet.size / range.length) * 100);
      if (!top || pct > top.pct) top = { habit: h, pct };
    }
    if (top && top.pct > 0) {
      insights.push({
        id: "top-consistency",
        title: `"${top.habit.name}" is your most consistent habit`,
        body: `Over the last 30 days you completed it ${top.pct}% of the time — your strongest habit right now.`,
        stat: `${top.pct}% completion`,
      });
    }
  }

  // 2. Highest current streak.
  if (habits.length > 0) {
    let topStreak = null;
    for (const h of habits) {
      const dates = db
        .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND done = 1")
        .all(h.id)
        .map((r) => r.date);
      const { current } = computeStreaks(dates);
      if (current > 0 && (!topStreak || current > topStreak.current)) {
        topStreak = { habit: h, current };
      }
    }
    if (topStreak) {
      insights.push({
        id: "top-streak",
        title: `"${topStreak.habit.name}" is on a ${topStreak.current}-day streak`,
        body: `Keep it going — this is your longest active streak right now.`,
        stat: `${topStreak.current} day streak`,
      });
    }
  }

  // 3. Weekend vs weekday completion.
  if (habits.length > 0) {
    const range = lastNDays(60);
    const habitIds = habits.map((h) => h.id);
    const placeholders = habitIds.map(() => "?").join(",");
    function rate(dates) {
      if (dates.length === 0) return null;
      const count = db
        .prepare(
          `SELECT COUNT(*) AS c FROM habit_logs WHERE done = 1 AND habit_id IN (${placeholders}) AND date IN (${dates
            .map(() => "?")
            .join(",")})`
        )
        .get(...habitIds, ...dates).c;
      return Math.round((count / (habitIds.length * dates.length)) * 100);
    }
    const weekday = rate(range.filter((d) => !isWeekend(d)));
    const weekend = rate(range.filter((d) => isWeekend(d)));
    if (weekday !== null && weekend !== null && weekday - weekend >= 10) {
      insights.push({
        id: "weekend-dip",
        title: "Weekends are your lowest completion days",
        body: `Weekday completion runs at ${weekday}%, compared to ${weekend}% on weekends — a ${
          weekday - weekend
        } point gap.`,
        stat: `${weekend}% weekend rate`,
      });
    }
  }

  // 4. Goal pace: is the user on track to hit target dates?
  const goals = db
    .prepare("SELECT * FROM goals WHERE user_id = ? AND completed = 0 AND target_date IS NOT NULL")
    .all(userId);
  for (const g of goals) {
    const daysLeft = daysBetween(todayISO(), g.target_date);
    if (daysLeft <= 0) continue;
    const daysSinceCreated = Math.max(1, daysBetween(g.created_at.slice(0, 10), todayISO()));
    const paceNeeded = (100 - g.progress) / daysLeft;
    const paceSoFar = g.progress / daysSinceCreated;
    if (paceSoFar > 0) {
      const onPace = paceSoFar >= paceNeeded * 0.85;
      insights.push({
        id: `goal-pace-${g.id}`,
        title: onPace
          ? `You're on pace for "${g.name}"`
          : `"${g.name}" may need a push to hit its target`,
        body: onPace
          ? `At your current rate of progress you're tracking to reach 100% before ${g.target_date}.`
          : `At your current rate of progress, you may fall short of ${g.target_date} unless you pick up the pace.`,
        stat: `${g.progress}% complete, ${daysLeft} days left`,
      });
    }
  }

  // 5. Journal mood vs habit completion correlation (simple same-day check).
  const moodRows = db
    .prepare("SELECT date, mood FROM journal_entries WHERE user_id = ? ORDER BY date DESC LIMIT 30")
    .all(userId);
  if (moodRows.length >= 5 && habits.length > 0) {
    const moodScore = { danger: 1, warn: 2, current: 3, ember: 3, success: 4 };
    const habitIds = habits.map((h) => h.id);
    const placeholders = habitIds.map(() => "?").join(",");
    let withHabitsTotal = 0,
      withHabitsCount = 0,
      withoutHabitsTotal = 0,
      withoutHabitsCount = 0;
    for (const row of moodRows) {
      const score = moodScore[row.mood] ?? 3;
      const completedThatDay = db
        .prepare(
          `SELECT COUNT(*) AS c FROM habit_logs WHERE done = 1 AND habit_id IN (${placeholders}) AND date = ?`
        )
        .get(...habitIds, row.date).c;
      if (completedThatDay > 0) {
        withHabitsTotal += score;
        withHabitsCount += 1;
      } else {
        withoutHabitsTotal += score;
        withoutHabitsCount += 1;
      }
    }
    if (withHabitsCount > 0 && withoutHabitsCount > 0) {
      const avgWith = withHabitsTotal / withHabitsCount;
      const avgWithout = withoutHabitsTotal / withoutHabitsCount;
      const diff = Math.round((avgWith - avgWithout) * 10) / 10;
      if (Math.abs(diff) >= 0.3) {
        insights.push({
          id: "mood-habit-correlation",
          title:
            diff > 0
              ? "Your mood tracks with habit completion"
              : "Your mood dips on days with more habits done",
          body: `Journal entries written on days with at least one habit completed average ${avgWith.toFixed(
            1
          )}/4 on mood, versus ${avgWithout.toFixed(1)}/4 on days without.`,
          stat: `${diff > 0 ? "+" : ""}${diff} avg mood`,
        });
      }
    }
  }

  res.json({ insights });
});

module.exports = router;
