import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/cn";
import type { DashboardData } from "~/lib/types";

interface StatsSummaryProps {
  stats: DashboardData["stats"];
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <Card title="Ringkasan" description="Aktivitas total">
      <div className="space-y-4">
        {/* Completion rate with progress bar */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Task selesai</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {stats.completedTasks}/{stats.totalTasks} ({stats.completionRate}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
              style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MiniStat value={String(stats.totalSessions)} label="Sesi fokus" emoji="⏱️" />
          <MiniStat value={`${stats.totalFocusMinutes}m`} label="Menit fokus" emoji="🎯" />
          <MiniStat value={String(stats.totalJournals)} label="Journal" emoji="📓" />
        </div>
      </div>
    </Card>
  );
}

function MiniStat({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-2 text-center dark:border-gray-800 dark:bg-gray-900">
      <span className="text-lg">{emoji}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}
