require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

require("./db"); // ensures schema + badge catalog are created on boot

const authRoutes = require("./routes/auth");
const habitsRoutes = require("./routes/habits");
const goalsRoutes = require("./routes/goals");
const journalRoutes = require("./routes/journal");
const analyticsRoutes = require("./routes/analytics");
const insightsRoutes = require("./routes/insights");
const achievementsRoutes = require("./routes/achievements");
const settingsRoutes = require("./routes/settings");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "flowlaytics-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ error: "That value already exists" });
  }
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Flowlaytics API listening on http://localhost:${PORT}`);
});
