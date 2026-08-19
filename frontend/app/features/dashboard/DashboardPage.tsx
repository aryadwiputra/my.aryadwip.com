import { Button } from "~/components/ui/Button";
import { Skeleton } from "~/components/ui/Skeleton";
import { RefreshCw, Plus, Timer, BookOpen } from "lucide-react";
import { formatDate, todayStr } from "~/lib/date";
import { useAuthStore } from "~/stores/auth";
import { useNavigate } from "react-router";
import { TodayHero } from "./components/TodayHero";
import { WeeklyCharts } from "./components/WeeklyCharts";
import { WeeklyReview } from "./components/WeeklyReview";
import { AnalyticsChart } from "./components/AnalyticsChart";
import { StatsSummary } from "./components/StatsSummary";
import { useDashboard, useRefreshDashboard } from "./hooks";
import { useGamification } from "./gamificationHooks";
import { GamificationCard } from "./components/GamificationCard";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const refresh = useRefreshDashboard();
  const { data, isLoading, isRefetching } = useDashboard();
  const { data: gamification } = useGamification();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-40 lg:col-span-2" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 sm:mt-1 dark:text-gray-400">
            {formatDate(todayStr())} — teruskan progress 1% setiap hari.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={refresh}
          loading={isRefetching}
          className="shrink-0"
          aria-label="Muat ulang"
          title="Muat ulang"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Today hero — focus on actions today */}
      <TodayHero today={data!.today} streaks={data!.streaks} onRefresh={refresh} />

      {/* Insight — charts + stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyCharts week={data!.week} />
          <AnalyticsChart moodTrend={data!.moodTrend} />
        </div>
        <div className="space-y-6">
          <QuickMini onNavigate={navigate} />
          {gamification && <GamificationCard data={gamification} />}
          <StatsSummary stats={data!.stats} />
        </div>
      </div>

      <WeeklyReview />
    </div>
  );
}

// Compact quick actions (replaces the old big grid) — small, unobtrusive chips.
function QuickMini({ onNavigate }: { onNavigate: (to: string) => void }) {
  const items = [
    { to: "/journal", label: "Journal", icon: BookOpen },
    { to: "/tasks", label: "Task", icon: Plus },
    { to: "/timer", label: "Fokus", icon: Timer },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Cepat:</span>
      {items.map((i) => (
        <button
          key={i.to}
          onClick={() => onNavigate(i.to)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-blue-400"
        >
          <i.icon className="h-3.5 w-3.5" /> {i.label}
        </button>
      ))}
    </div>
  );
}
