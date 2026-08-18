import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Lightbulb,
  StickyNote,
  Timer,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "~/stores/auth";
import { logout } from "~/lib/authService";
import { NavItem, type NavItemDef } from "./NavItem";
import { ThemeToggle } from "./ThemeToggle";
import { BottomNav } from "./BottomNav";
import { MoreSheet } from "./MoreSheet";
import { QuickCaptureGlobal } from "~/features/ideas/components/QuickCapture";

const nav: NavItemDef[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: "/journal", label: "Journal", icon: <BookOpen className="h-5 w-5" /> },
  { to: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
  { to: "/ideas", label: "Ideas", icon: <Lightbulb className="h-5 w-5" /> },
  { to: "/notes", label: "Notes", icon: <StickyNote className="h-5 w-5" /> },
  { to: "/timer", label: "Focus Timer", icon: <Timer className="h-5 w-5" /> },
  { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/journal": "Journal",
  "/tasks": "Tasks",
  "/ideas": "Ideas",
  "/notes": "Notes",
  "/timer": "Focus Timer",
  "/settings": "Settings",
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">ClarityFlow</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => (
          <NavItem key={item.to} item={item} onClick={onNavigate} />
        ))}
      </nav>
      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
            {user?.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => logout().then(() => window.location.assign("/login"))}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const title = pageTitles[location.pathname] ?? "ClarityFlow";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile app-like header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 lg:hidden">
        <span className="text-base font-semibold text-gray-900 dark:text-white">{title}</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        </div>
      </header>

      {/* Mobile content (full width, padded for bottom nav) */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl p-4 pb-24 lg:p-8 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />

      <QuickCaptureGlobal />
    </div>
  );
}