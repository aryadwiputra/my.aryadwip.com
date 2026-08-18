import { Flame } from "lucide-react";
import { Skeleton } from "~/components/ui/Skeleton";

interface StreakCounterProps {
  current: number;
  longest: number;
  loading?: boolean;
}

export function StreakCounter({ current, longest, loading }: StreakCounterProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-4 rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-950/30">
        <Flame className="h-8 w-8 text-orange-500" />
        <div>
          <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{current} hari</p>
          <p className="text-sm text-orange-700 dark:text-orange-300">Streak saat ini</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <Flame className="h-8 w-8 text-gray-400" />
        <div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{longest} hari</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Streak terpanjang</p>
        </div>
      </div>
    </div>
  );
}