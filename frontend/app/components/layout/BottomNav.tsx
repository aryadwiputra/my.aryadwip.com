import { NavLink } from "react-router";
import { LayoutDashboard, BookOpen, CheckSquare, Lightbulb, MoreHorizontal } from "lucide-react";
import { cn } from "~/lib/cn";
import { useQuickCaptureStore } from "~/features/ideas/quickCaptureStore";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
];

export function BottomNav({ onMore }: { onMore: () => void }) {
  const setOpen = useQuickCaptureStore((s) => s.setOpen);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 lg:hidden"
      aria-label="Navigasi utama"
    >
      <div className="flex items-stretch">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-6 w-6", isActive && "fill-blue-600/10")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {/* Center raised add-idea button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Tambah ide"
          className="relative flex flex-1 flex-col items-center"
        >
          <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700">
            <Lightbulb className="h-7 w-7" />
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">Ide</span>
        </button>

        <button
          onClick={onMore}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <MoreHorizontal className="h-6 w-6" />
          More
        </button>
      </div>
    </nav>
  );
}