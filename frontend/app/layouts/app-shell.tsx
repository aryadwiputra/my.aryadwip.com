import { AppShell } from "~/components/layout/AppShell";
import { SkeletonCard } from "~/components/ui/Skeleton";

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 lg:pl-64 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}

export default function AppShellLayout() {
  return <AppShell />;
}