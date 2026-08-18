import { useAuthStore } from "~/stores/auth";
import { Badge } from "~/components/ui/Badge";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Selamat datang kembali, <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>. Berikut snapshot aktivitas Anda hari ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card value="0" label="Task selesai hari ini" />
        <Card value="0m" label="Fokus hari ini" />
        <Card value="0" label="Journal streak" />
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <Badge>UI Shell Active</Badge>
        <p className="mt-3 text-sm">
          Konten dashboard disediakan di Sprint 07 (Dashboard &amp; Analytics).
        </p>
      </div>
    </div>
  );
}

function Card({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}