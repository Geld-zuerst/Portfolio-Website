require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db } = require("./db");
const { addDays, todayISO } = require("./lib/dates");

const DEMO_EMAIL = "maya@flowlaytics.app";
const DEMO_PASSWORD = "password123";

function run() {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(DEMO_EMAIL);
  if (existing) {
    console.log(`Demo user already exists (${DEMO_EMAIL}). Skipping seed.`);
    return;
  }

  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const userInfo = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run("Maya Chen", DEMO_EMAIL, hash);
  const userId = userInfo.lastInsertRowid;

  db.prepare("INSERT INTO settings (user_id) VALUES (?)").run(userId);

  const habitDefs = [
    { name: "Morning walk", category: "Health · Daily", icon: "🚶", color: "current", pDone: 0.85 },
    { name: "Read 20 minutes", category: "Mindfulness · Daily", icon: "📖", color: "ember", pDone: 0.7 },
    { name: "Drink 2L water", category: "Health · Daily", icon: "💧", color: "warn", pDone: 0.95 },
    { name: "Stretch before bed", category: "Mindfulness · Daily", icon: "🧘", color: "success", pDone: 0.45 },
    { name: "No phone after 10pm", category: "Work · Daily", icon: "📵", color: "violet", pDone: 0.6 },
    { name: "Write tomorrow's top 3", category: "Work · Weekdays", icon: "☀️", color: "current", pDone: 0.75 },
  ];

  const insertHabit = db.prepare(
    "INSERT INTO habits (user_id, name, category, icon, color) VALUES (?, ?, ?, ?, ?)"
  );
  const insertLog = db.prepare(
    "INSERT OR IGNORE INTO habit_logs (habit_id, date, done, logged_at) VALUES (?, ?, 1, ?)"
  );

  const today = todayISO();
  let seedRand = 42; // deterministic pseudo-random so seeding is reproducible
  function rand() {
    seedRand = (seedRand * 1103515245 + 12345) & 0x7fffffff;
    return (seedRand % 10000) / 10000;
  }

  for (const def of habitDefs) {
    const info = insertHabit.run(userId, def.name, def.category, def.icon, def.color);
    const habitId = info.lastInsertRowid;
    // 45 days of history, weighted by pDone, with a guaranteed recent streak.
    for (let i = 44; i >= 0; i--) {
      const date = addDays(today, -i);
      const guaranteedStreak = i <= 5 && rand() < def.pDone + 0.2;
      const hit = guaranteedStreak || rand() < def.pDone;
      if (hit) {
        const hour = String(6 + Math.floor(rand() * 14)).padStart(2, "0");
        insertLog.run(habitId, date, `${date} ${hour}:00:00`);
      }
    }
  }

  const goalDefs = [
    {
      name: "Run a half marathon",
      category: "Health",
      catColor: "current",
      progress: 62,
      targetDate: addDays(today, 40),
      milestones: [
        { label: "Complete 5k without stopping", done: true },
        { label: "Run 10k long run", done: true },
        { label: "Hit 15k long run", done: false },
      ],
    },
    {
      name: "Read 24 books this year",
      category: "Personal",
      catColor: "ember",
      progress: 38,
      targetDate: addDays(today, 170),
      milestones: [
        { label: "Finish 5 books (Q1)", done: true },
        { label: "Finish 12 books (Q2)", done: false },
        { label: "Finish 18 books (Q3)", done: false },
      ],
    },
    {
      name: "Launch side project",
      category: "Work",
      catColor: "success",
      progress: 81,
      targetDate: addDays(today, 19),
      milestones: [
        { label: "Ship landing page", done: true },
        { label: "Onboard 10 test users", done: true },
        { label: "Open public waitlist", done: false },
      ],
    },
    {
      name: "Save an emergency fund",
      category: "Finance",
      catColor: "warn",
      progress: 54,
      targetDate: addDays(today, 110),
      milestones: [
        { label: "Reach 1 month of expenses", done: true },
        { label: "Reach 3 months of expenses", done: false },
        { label: "Reach 6 months of expenses", done: false },
      ],
    },
  ];

  const insertGoal = db.prepare(
    "INSERT INTO goals (user_id, name, category, cat_color, progress, target_date) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertMilestone = db.prepare(
    "INSERT INTO milestones (goal_id, label, done, sort_order) VALUES (?, ?, ?, ?)"
  );
  for (const g of goalDefs) {
    const info = insertGoal.run(userId, g.name, g.category, g.catColor, g.progress, g.targetDate);
    g.milestones.forEach((m, i) => insertMilestone.run(info.lastInsertRowid, m.label, m.done ? 1 : 0, i));
  }

  const journalDefs = [
    { daysAgo: 1, mood: "success", title: "Long walk cleared my head", body: "Left the office a little early and walked the long way home. First evening in a while that felt unhurried. Want to make this a Tuesday habit.", tags: ["walk", "calm"] },
    { daysAgo: 3, mood: "warn", title: "Slow start, steady finish", body: "Woke up tired and almost skipped the morning routine. Pushed through anyway and got the project brief done before lunch. Small win, but it counts.", tags: ["work", "discipline"] },
    { daysAgo: 5, mood: "current", title: "Good conversation with an old friend", body: "Caught up over coffee for the first time in months. Reminded me how much better I feel when I actually make time for people instead of just habits.", tags: ["social", "gratitude"] },
    { daysAgo: 7, mood: "ember", title: "Rough night, better morning", body: "Didn't sleep well before the presentation, but it went fine anyway. Noting for next time: prep the night before, not the morning of.", tags: ["work", "sleep"] },
  ];
  const insertJournal = db.prepare(
    "INSERT INTO journal_entries (user_id, date, mood, title, body, tags) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const j of journalDefs) {
    insertJournal.run(userId, addDays(today, -j.daysAgo), j.mood, j.title, j.body, JSON.stringify(j.tags));
  }

  const { evaluateBadges } = require("./lib/badges");
  const unlocked = evaluateBadges(userId);

  console.log("Seeded demo account:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log(`  habits: ${habitDefs.length}, goals: ${goalDefs.length}, journal entries: ${journalDefs.length}`);
  console.log(`  badges unlocked on seed: ${unlocked.map((b) => b.title).join(", ") || "none"}`);
}

run();
