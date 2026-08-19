import { NavLink } from "react-router";
import { LayoutDashboard, BookOpen, CheckSquare, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "~/lib/cn";
import { useCreateStore } from "~/features/shared/createStore";

const leftItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/journal", label: "Journal", icon: BookOpen },
];

const rightItems = [
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof LayoutDashboard }) {
  return (
    <NavLink
      to={to}
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
          <Icon className={cn("h-6 w-6", isActive && "fill-blue-600/10")} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function BottomNav({ onMore }: { onMore: () => void }) {
  const setOpen = useCreateStore((s) => s.setOpen);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 lg:hidden"
      aria-label="Navigasi utama"
    >
      <div className="flex items-stretch">
        {leftItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Center raised add button (between Journal and Tasks) */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Tambah"
          className="relative flex flex-1 flex-col items-center"
        >
          <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700">
            <Plus className="h-7 w-7" />
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">Tambah</span>
        </button>

        {rightItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

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