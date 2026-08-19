import type { FocusSession } from "~/lib/types";

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * #10 Focus streak — consecutive days (ending today or yesterday) with at least
 * one completed focus session. Returns current streak length.
 */
export function computeFocusStreak(sessions: FocusSession[]): number {
  const doneDays = new Set(
    sessions
      .filter((s) => s.status === "completed")
      .map((s) => dayKey(s.startedAt)),
  );
  if (doneDays.size === 0) return 0;

  const dates = [...doneDays].map((d) => new Date(d + "T00:00:00")).sort((a, b) => a.getTime() - b.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dayKey(today.getTime());
  const yesterday = new Date(today.getTime() - 86400000);

  // Streak counts backward from today; if today has no session, allow streak
  // to start from yesterday.
  let anchor = doneDays.has(todayKey) ? today : yesterday;
  let streak = 0;
  while (doneDays.has(dayKey(anchor.getTime()))) {
    streak++;
    anchor = new Date(anchor.getTime() - 86400000);
  }
  return streak;
}

/**
 * #11 Deep Work Score — 0..100 quality metric combining focus volume and
 * consistency over the last 7 days.
 */
export function computeDeepWorkScore(sessions: FocusSession[]): number {
  const weekStart = Date.now() - 6 * 86400000;
  const weekDone = sessions.filter(
    (s) => s.status === "completed" && s.startedAt >= weekStart,
  );
  if (weekDone.length === 0) return 0;

  // Total focus minutes this week.
  const totalMinutes = weekDone.reduce((sum, s) => {
    const ended = s.endedAt ?? Date.now();
    return sum + Math.max(0, (ended - s.startedAt) / 60000);
  }, 0);

  // Volume score: scale up to ~120 min/day ideal => 840 min/week for full.
  const volume = Math.min(totalMinutes / 840, 1) * 50;

  // Consistency: fraction of the last 7 days that had at least one session.
  const days = new Set(weekDone.map((s) => dayKey(s.startedAt))).size;
  const consistency = Math.min(days / 7, 1) * 50;

  return Math.round(volume + consistency);
}

export function focusStreakLabel(streak: number): string {
  if (streak <= 0) return "Belum ada streak";
  if (streak === 1) return "🔥 1 hari fokus";
  return `🔥 ${streak} hari beruntun fokus`;
}
