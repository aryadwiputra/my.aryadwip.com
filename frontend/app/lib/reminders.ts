import { api } from "~/lib/api";
import type { Task } from "~/lib/types";

const REMINDER_KEY = "clarityflow_reminder_last_check";

/**
 * Check for tasks due today and show a browser notification.
 * Called on app load and periodically.
 */
export async function checkDueTasks(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const res = await api<{ tasks: Task[] }>("/api/tasks");
    const today = new Date().toISOString().slice(0, 10);
    const dueToday = res.tasks.filter(
      (t) => t.status !== "completed" && t.dueDate === today,
    );

    if (dueToday.length === 0) return;

    // Avoid duplicate notifications within the same session
    const lastCheck = localStorage.getItem(REMINDER_KEY);
    const now = Date.now();
    if (lastCheck && now - parseInt(lastCheck, 10) < 60 * 60 * 1000) return;
    localStorage.setItem(REMINDER_KEY, String(now));

    const title = dueToday.length === 1
      ? `Task due hari ini: ${dueToday[0].title}`
      : `${dueToday.length} task due hari ini`;
    const body = dueToday
      .slice(0, 3)
      .map((t) => `• ${t.title}`)
      .join("\n");

    new Notification(title, { body, icon: "/icon.svg" });
  } catch {
    // Ignore errors (offline, etc.)
  }
}

/**
 * Request notification permission (called from a user gesture).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}
