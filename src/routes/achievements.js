const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { evaluateBadges } = require("../lib/badges");

const router = express.Router();
router.use(requireAuth);

// GET /api/achievements
router.get("/", (req, res) => {
  evaluateBadges(req.userId);

  const rows = db
    .prepare(
      `SELECT b.id, b.key, b.icon, b.title, b.desc,
              ub.unlocked_at AS unlockedAt
       FROM badges b
       LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = ?
       ORDER BY b.id ASC`
    )
    .all(req.userId);

  const badges = rows.map((r) => ({
    id: r.id,
    key: r.key,
    icon: r.icon,
    title: r.title,
    desc: r.desc,
    locked: !r.unlockedAt,
    unlockedAt: r.unlockedAt || null,
  }));

  res.json({
    badges,
    unlockedCount: badges.filter((b) => !b.locked).length,
    totalCount: badges.length,
  });
});

module.exports = router;
