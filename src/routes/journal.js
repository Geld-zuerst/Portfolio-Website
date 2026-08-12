const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { todayISO } = require("../lib/dates");
const { evaluateBadges } = require("../lib/badges");

const router = express.Router();
router.use(requireAuth);

const VALID_MOODS = new Set(["success", "current", "warn", "ember", "danger"]);

function serialize(entry) {
  return {
    id: entry.id,
    date: entry.date,
    mood: entry.mood,
    title: entry.title,
    body: entry.body,
    tags: JSON.parse(entry.tags || "[]"),
    createdAt: entry.created_at,
  };
}

// GET /api/journal?limit=20&offset=0
router.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const offset = Number(req.query.offset || 0);
  const rows = db
    .prepare(
      "SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT ? OFFSET ?"
    )
    .all(req.userId, limit, offset);
  const total = db
    .prepare("SELECT COUNT(*) AS c FROM journal_entries WHERE user_id = ?")
    .get(req.userId).c;
  res.json({ entries: rows.map(serialize), total });
});

// GET /api/journal/:id
router.get("/:id", (req, res) => {
  const entry = db
    .prepare("SELECT * FROM journal_entries WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  res.json({ entry: serialize(entry) });
});

// POST /api/journal  { mood, title, body, tags: [], date? }
router.post("/", (req, res) => {
  const { mood = "current", title, body = "", tags = [], date = todayISO() } = req.body || {};
  if (!title) return res.status(400).json({ error: "title is required" });
  if (!VALID_MOODS.has(mood)) {
    return res.status(400).json({ error: `mood must be one of: ${[...VALID_MOODS].join(", ")}` });
  }

  const info = db
    .prepare(
      "INSERT INTO journal_entries (user_id, date, mood, title, body, tags) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(req.userId, date, mood, title, body, JSON.stringify(tags));

  const newlyUnlocked = evaluateBadges(req.userId);
  const entry = db.prepare("SELECT * FROM journal_entries WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ entry: serialize(entry), newlyUnlocked });
});

// PATCH /api/journal/:id
router.patch("/:id", (req, res) => {
  const entry = db
    .prepare("SELECT * FROM journal_entries WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!entry) return res.status(404).json({ error: "Entry not found" });

  const updates = {};
  if (req.body && "mood" in req.body) {
    if (!VALID_MOODS.has(req.body.mood)) {
      return res.status(400).json({ error: `mood must be one of: ${[...VALID_MOODS].join(", ")}` });
    }
    updates.mood = req.body.mood;
  }
  if (req.body && "title" in req.body) updates.title = req.body.title;
  if (req.body && "body" in req.body) updates.body = req.body.body;
  if (req.body && "date" in req.body) updates.date = req.body.date;
  if (req.body && "tags" in req.body) updates.tags = JSON.stringify(req.body.tags);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = Object.keys(updates)
    .map((k) => `${k} = @${k}`)
    .join(", ");
  db.prepare(`UPDATE journal_entries SET ${setClause} WHERE id = @id`).run({
    ...updates,
    id: entry.id,
  });

  const fresh = db.prepare("SELECT * FROM journal_entries WHERE id = ?").get(entry.id);
  res.json({ entry: serialize(fresh) });
});

// DELETE /api/journal/:id
router.delete("/:id", (req, res) => {
  const entry = db
    .prepare("SELECT * FROM journal_entries WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  db.prepare("DELETE FROM journal_entries WHERE id = ?").run(entry.id);
  res.status(204).end();
});

module.exports = router;
