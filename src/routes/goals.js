const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { evaluateBadges } = require("../lib/badges");

const router = express.Router();
router.use(requireAuth);

function ownGoal(id, userId) {
  return db.prepare("SELECT * FROM goals WHERE id = ? AND user_id = ?").get(id, userId);
}

function serializeGoal(goal) {
  const milestones = db
    .prepare("SELECT * FROM milestones WHERE goal_id = ? ORDER BY sort_order ASC, id ASC")
    .all(goal.id);

  return {
    id: goal.id,
    name: goal.name,
    category: goal.category,
    catColor: goal.cat_color,
    progress: goal.progress,
    targetDate: goal.target_date,
    completed: !!goal.completed,
    createdAt: goal.created_at,
    milestones: milestones.map((m) => ({ id: m.id, label: m.label, done: !!m.done })),
  };
}

// GET /api/goals
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC")
    .all(req.userId);
  res.json({ goals: rows.map(serializeGoal) });
});

// POST /api/goals
router.post("/", (req, res) => {
  const {
    name,
    category = "Personal",
    catColor = "current",
    progress = 0,
    targetDate = null,
    milestones = [],
  } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const info = db
    .prepare(
      "INSERT INTO goals (user_id, name, category, cat_color, progress, target_date) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(req.userId, name, category, catColor, progress, targetDate);

  const goalId = info.lastInsertRowid;
  const insertMilestone = db.prepare(
    "INSERT INTO milestones (goal_id, label, done, sort_order) VALUES (?, ?, ?, ?)"
  );
  milestones.forEach((m, i) => {
    const label = typeof m === "string" ? m : m.label;
    const done = typeof m === "object" && m.done ? 1 : 0;
    if (label) insertMilestone.run(goalId, label, done, i);
  });

  evaluateBadges(req.userId);
  const goal = db.prepare("SELECT * FROM goals WHERE id = ?").get(goalId);
  res.status(201).json({ goal: serializeGoal(goal) });
});

// PATCH /api/goals/:id
router.patch("/:id", (req, res) => {
  const goal = ownGoal(req.params.id, req.userId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  const fieldMap = {
    name: "name",
    category: "category",
    catColor: "cat_color",
    progress: "progress",
    targetDate: "target_date",
    completed: "completed",
  };
  const updates = {};
  for (const [bodyKey, col] of Object.entries(fieldMap)) {
    if (req.body && bodyKey in req.body) {
      updates[col] = bodyKey === "completed" ? (req.body[bodyKey] ? 1 : 0) : req.body[bodyKey];
    }
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = Object.keys(updates)
    .map((k) => `${k} = @${k}`)
    .join(", ");
  db.prepare(`UPDATE goals SET ${setClause} WHERE id = @id`).run({ ...updates, id: goal.id });

  evaluateBadges(req.userId);
  const updated = db.prepare("SELECT * FROM goals WHERE id = ?").get(goal.id);
  res.json({ goal: serializeGoal(updated) });
});

// DELETE /api/goals/:id
router.delete("/:id", (req, res) => {
  const goal = ownGoal(req.params.id, req.userId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  db.prepare("DELETE FROM goals WHERE id = ?").run(goal.id);
  res.status(204).end();
});

// POST /api/goals/:id/milestones  { label }
router.post("/:id/milestones", (req, res) => {
  const goal = ownGoal(req.params.id, req.userId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  const { label } = req.body || {};
  if (!label) return res.status(400).json({ error: "label is required" });

  const count = db.prepare("SELECT COUNT(*) AS c FROM milestones WHERE goal_id = ?").get(goal.id).c;
  db.prepare("INSERT INTO milestones (goal_id, label, sort_order) VALUES (?, ?, ?)").run(
    goal.id,
    label,
    count
  );
  res.status(201).json({ goal: serializeGoal(goal) });
});

// PATCH /api/goals/:id/milestones/:milestoneId  { label?, done? }
router.patch("/:id/milestones/:milestoneId", (req, res) => {
  const goal = ownGoal(req.params.id, req.userId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  const milestone = db
    .prepare("SELECT * FROM milestones WHERE id = ? AND goal_id = ?")
    .get(req.params.milestoneId, goal.id);
  if (!milestone) return res.status(404).json({ error: "Milestone not found" });

  const updates = {};
  if (req.body && "label" in req.body) updates.label = req.body.label;
  if (req.body && "done" in req.body) updates.done = req.body.done ? 1 : 0;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }
  const setClause = Object.keys(updates)
    .map((k) => `${k} = @${k}`)
    .join(", ");
  db.prepare(`UPDATE milestones SET ${setClause} WHERE id = @id`).run({
    ...updates,
    id: milestone.id,
  });

  evaluateBadges(req.userId);
  const fresh = db.prepare("SELECT * FROM goals WHERE id = ?").get(goal.id);
  res.json({ goal: serializeGoal(fresh) });
});

// DELETE /api/goals/:id/milestones/:milestoneId
router.delete("/:id/milestones/:milestoneId", (req, res) => {
  const goal = ownGoal(req.params.id, req.userId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  db.prepare("DELETE FROM milestones WHERE id = ? AND goal_id = ?").run(
    req.params.milestoneId,
    goal.id
  );
  const fresh = db.prepare("SELECT * FROM goals WHERE id = ?").get(goal.id);
  res.json({ goal: serializeGoal(fresh) });
});

module.exports = router;
