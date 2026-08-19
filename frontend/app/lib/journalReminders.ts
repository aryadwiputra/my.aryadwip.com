// Journal reminder scheduler — local notifications for morning/evening journaling.
// Uses Web Notification API (permission already requested via Settings).

const REMINDER_KEY = "clarityflow_journal_reminders"; // { morning?: "HH:MM", evening?: "HH:MM" }
const FIRED_KEY = "clarityflow_journal_reminders_fired"; // { "morning-2026-08-19": true }

export interface JournalReminders {
  morning?: string;
  evening?: string;
}

export function loadReminders(): JournalReminders {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    return raw ? (JSON.parse(raw) as JournalReminders) : {};
  } catch {
    return {};
  }
}

export function saveReminders(r: JournalReminders) {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function wasFired(slot: string): boolean {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return Boolean(map[`${slot}-${todayKey()}`]);
  } catch {
    return false;
  }
}

function markFired(slot: string) {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[`${slot}-${todayKey()}`] = true;
    // Keep only last 7 days
    const keys = Object.keys(map);
    const cutoff = Date.now() - 7 * 86400000;
    for (const k of keys) {
      const d = new Date(k.slice(k.indexOf("-") + 1));
      if (d.getTime() < cutoff) delete map[k];
    }
    localStorage.setItem(FIRED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function notify(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon.svg" });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Check every minute whether a reminder is due. Called from a setInterval in AppShell.
 */
export function checkJournalReminders() {
  if (typeof window === "undefined") return;
  const reminders = loadReminders();
  if (!reminders.morning && !reminders.evening) return;

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (reminders.morning && hhmm === reminders.morning && !wasFired("morning")) {
    markFired("morning");
    notify("🌅 Journal Pagi", "5 menit untuk mengatur niat harimu — sebelum scroll, tulis dulu.");
  }
  if (reminders.evening && hhmm === reminders.evening && !wasFired("evening")) {
    markFired("evening");
    notify("🌙 Journal Malam", "Refleksi singkat hari ini — apa yang berjalan baik? Tutup harimu di sini.");
  }
}
