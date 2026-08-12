function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00Z");
  const db_ = new Date(b + "T00:00:00Z");
  return Math.round((db_ - da) / 86400000);
}

function isWeekend(dateStr) {
  const day = new Date(dateStr + "T00:00:00Z").getUTCDay();
  return day === 0 || day === 6;
}

function lastNDays(n, endDate = todayISO()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endDate, -i));
  return out;
}

module.exports = { todayISO, toISO, addDays, daysBetween, isWeekend, lastNDays };
