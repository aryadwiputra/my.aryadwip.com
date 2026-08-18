import { Flame } from "lucide-react";
import { Card } from "~/components/ui/Card";
import type { DashboardData, Streak } from "~/lib/types";

interface StreakTrackerProps {
  streaks: DashboardData["streaks"];
}

function StreakRow({ label, streak, icon }: { label: string; streak: Streak; icon: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-orange-200/60 bg-orange-50 p-3 dark:border-orange-800/40 dark:bg-orange-950/20">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{streak.current}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">(maks {streak.longest})</span>
      </div>
    </div>
  );
}

export function StreakTracker({ streaks }: StreakTrackerProps) {
  return (
    <Card title="Streak" description="Hari berturut-turut tanpa terputus.">
      <div className="space-y-2">
        <StreakRow label="Journaling" streak={streaks.journal} icon="📓" />
        <StreakRow label="Task harian" streak={streaks.task} icon="✅" />
        <StreakRow label="Sesi fokus" streak={streaks.focus} icon="⏱️" />
      </div>
    </Card>
  );
}