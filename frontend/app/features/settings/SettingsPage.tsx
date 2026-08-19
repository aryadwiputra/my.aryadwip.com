import { useState } from "react";
import { Download, Trash2, Bell } from "lucide-react";
import { useAuthStore } from "~/stores/auth";
import { useThemeStore, type Theme } from "~/lib/theme";
import { logout } from "~/lib/authService";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { cn } from "~/lib/cn";
import { toastError, toastSuccess } from "~/lib/toast";
import { requestNotificationPermission } from "~/lib/reminders";
import { loadReminders, saveReminders, type JournalReminders } from "~/lib/journalReminders";
import { downloadJson, useChangePassword, useDeleteAccount, useExportData } from "./hooks";

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "system", label: "Sistem" },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const exportMutation = useExportData();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reminders, setReminders] = useState<JournalReminders>(() =>
    typeof window !== "undefined" ? loadReminders() : {},
  );
  const [notifStatus, setNotifStatus] = useState<string>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );

  function updateReminder(slot: "morning" | "evening", value: string) {
    const next = { ...reminders, [slot]: value || undefined };
    setReminders(next);
    saveReminders(next);
  }

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifStatus("granted");
      toastSuccess("Notifikasi diaktifkan");
    } else {
      setNotifStatus("denied");
      toastError("Izin notifikasi ditolak. Aktifkan di pengaturan browser.");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toastSuccess("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal mengubah password");
    }
  }

  async function handleExport() {
    try {
      const data = await exportMutation.mutateAsync();
      downloadJson(data);
      toastSuccess("Data berhasil diekspor");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal mengekspor data");
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Yakin hapus akun? Seluruh data akan dihapus permanen.")) return;
    if (!confirm("Konfirmasi terakhir: tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await deleteAccount.mutateAsync();
      await logout();
      window.location.assign("/login");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menghapus akun");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola profil, tampilan, dan data akun.
        </p>
      </div>

      <Card title="Profil">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </Card>

      <Card title="Tampilan">
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition",
                theme === t.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:border-blue-500 dark:border-gray-700 dark:text-gray-200",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Notifikasi">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Reminder task due</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dapatkan notifikasi saat ada task yang jatuh tempo hari ini.
              </p>
            </div>
            {notifStatus === "granted" ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                Aktif
              </span>
            ) : notifStatus === "denied" ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                Diblokir
              </span>
            ) : (
              <Button variant="secondary" onClick={handleEnableNotifications}>
                <Bell className="h-4 w-4" /> Aktifkan
              </Button>
            )}
          </div>

          {/* Journal reminders */}
          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Reminder Journal</p>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Notifikasi pengingat menulis journal pagi & malam (perlu izin notifikasi aktif).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">🌅 Pagi</span>
                <input
                  type="time"
                  value={reminders.morning ?? ""}
                  onChange={(e) => updateReminder("morning", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">🌙 Malam</span>
                <input
                  type="time"
                  value={reminders.evening ?? ""}
                  onChange={(e) => updateReminder("evening", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {reminders.morning || reminders.evening
                ? "Reminder aktif. Browser harus terbuka agar notifikasi muncul."
                : "Atur jam untuk mengaktifkan pengingat journal."}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Ganti Password">
        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input
            type="password"
            label="Password saat ini"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            type="password"
            label="Password baru (min. 8 karakter)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" loading={changePassword.isPending}>
            Ubah Password
          </Button>
        </form>
      </Card>

      <Card title="Data & Akun">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Ekspor data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Unduh semua journal, task, idea, note, dan sesi dalam format JSON.
              </p>
            </div>
            <Button variant="secondary" onClick={handleExport} loading={exportMutation.isPending}>
              <Download className="h-4 w-4" /> Ekspor
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Hapus akun</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hapus akun beserta seluruh data secara permanen.
              </p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleteAccount.isPending}>
              <Trash2 className="h-4 w-4" /> Hapus Akun
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}