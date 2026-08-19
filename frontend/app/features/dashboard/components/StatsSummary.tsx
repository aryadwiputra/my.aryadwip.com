import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/cn";
import type { DashboardData } from "~/lib/types";

const statItems = [
  { label: "Total Tasks", value: "totalTasks", icon: "📋", color: "text-blue-600" },
  { label: "Selesai", value: "completedTasks", icon: "✅", color: "text-green-600" },
  { label: "Completion Rate", value: "completionRate", suffix: "%", icon: "📊", color: "text-purple-600" },
  { label: "Sesi Fokus", value: "totalSessions", icon: "⏱️", color: "text-amber-600" },
  { label: "Menit Fokus", value: "totalFocusMinutes", suffix: "m", icon: "🎯", color: "text-rose-600" },
  { label: "Journal", value: "totalJournals", icon: "📓", color: "text-indigo-600" },
  { label: "Habits", value: "totalHabits", icon: "🔁", color: "text-teal-600" },
];

export function StatsSummary({ stats }: { stats: DashboardData["stats"] }) {
  return (
    <Card title="Statistik" description="Ringkasan aktivitas">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {statItems.map((item) => {
          const value = stats[item.value as keyof typeof stats];
          return (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={cn("mt-1 text-xl font-semibold text-gray-900 dark:text-white")}>
                {value ?? 0}{item.suffix}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
