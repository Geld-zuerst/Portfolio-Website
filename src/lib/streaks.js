const { addDays, todayISO } = require("./dates");

/**
 * Given a sorted-ascending list of ISO date strings on which a habit was
 * completed, compute the current streak (consecutive days ending today or
 * yesterday) and the best streak ever recorded.
 */
function computeStreaks(doneDates) {
  const set = new Set(doneDates);
  if (set.size === 0) return { current: 0, best: 0 };

  // Best streak: scan chronologically for the longest consecutive run.
  const sorted = [...set].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
  }

  // Current streak: walk backwards from today (or yesterday, so a habit
  // not yet logged today doesn't immediately zero out the streak).
  const today = todayISO();
  let cursor = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, best };
}

module.exports = { computeStreaks };
