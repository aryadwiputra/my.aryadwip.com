import { Trophy, ShieldCheck } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/cn";
import type { GamificationData } from "~/lib/types";

export function GamificationCard({ data }: { data: GamificationData }) {
  const earned = data.badges.filter((b) => b.earned);
  const locked = data.badges.filter((b) => !b.earned);
  const nextLabel = data.nextLevelXp
    ? `${data.xp}/${data.nextLevelXp} XP`
    : `${data.xp} XP · Level maks`;

  return (
    <Card title="Progress" description={`Level ${data.level} — ${data.title}`}>
      <div className="space-y-4">
        {/* XP bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              <Trophy className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
              {data.xp} XP
            </span>
            <span className="text-gray-500 dark:text-gray-400">{nextLabel}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
              style={{ width: `${Math.min(data.progress * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* No-scroll streak */}
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            Hari bebas doomscroll
          </span>
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            {data.noScrollStreak} 🔥
          </span>
        </div>

        {/* Insight */}
        {data.insight && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
            💡 {data.insight.message}
          </p>
        )}

        {/* Badges */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Badge ({earned.length}/{data.badges.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {earned.map((b) => (
              <span
                key={b.id}
                title={b.name}
                className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
              >
                {b.icon} {b.name}
              </span>
            ))}
            {locked.map((b) => (
              <span
                key={b.id}
                title={`${b.name} (belum) — ${b.name}`}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                  "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
                )}
              >
                {b.icon} 🔒
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
