import { Button } from "~/components/ui/Button";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatDate, todayStr } from "~/lib/date";
import { useAuthStore } from "~/stores/auth";
import { SnapshotCard } from "./components/SnapshotCard";
import { StreakTracker } from "./components/StreakTracker";
import { QuickActions } from "./components/QuickActions";
import { WeeklyCharts } from "./components/WeeklyCharts";
import { WeeklyReview } from "./components/WeeklyReview";
import { AnalyticsChart } from "./components/AnalyticsChart";
import { StatsSummary } from "./components/StatsSummary";
import { useDashboard, useRefreshDashboard } from "./hooks";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const refresh = useRefreshDashboard();
  const { data, isLoading, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Selamat datang, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 sm:mt-1 dark:text-gray-400">
            {formatDate(todayStr())} — teruskan progress 1% setiap hari.
          </p>
        </div>
        <Button variant="secondary" onClick={refresh} loading={isRefetching} className="shrink-0">
          Muat Ulang
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SnapshotCard today={data!.today} onRefresh={refresh} />
          <StreakTracker streaks={data!.streaks} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <WeeklyCharts week={data!.week} />
        </div>
      </div>

      <AnalyticsChart moodTrend={data!.moodTrend} />
      <StatsSummary stats={data!.stats} />
      <WeeklyReview />
    </div>
  );
}
