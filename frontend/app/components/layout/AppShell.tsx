import { useState, useEffect } from "react";
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
  Repeat,
  Search,
  CalendarDays,
} from "lucide-react";
import { useAuthStore } from "~/stores/auth";
import { logout } from "~/lib/authService";
import { NavItem, type NavItemDef } from "./NavItem";
import { ThemeToggle } from "./ThemeToggle";
import { BottomNav } from "./BottomNav";
import { MoreSheet } from "./MoreSheet";
import { CreateSheet } from "~/features/shared/CreateSheet";
import { QuickCaptureGlobal } from "~/features/ideas/components/QuickCapture";
import { SearchModal } from "~/features/search/SearchModal";
import { SyncIndicator } from "./SyncIndicator";
import { GlobalTimer } from "./GlobalTimer";
import { checkDueTasks } from "~/lib/reminders";
import { checkJournalReminders } from "~/lib/journalReminders";

const nav: NavItemDef[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: "/journal", label: "Journal", icon: <BookOpen className="h-5 w-5" /> },
  { to: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
  { to: "/ideas", label: "Ideas", icon: <Lightbulb className="h-5 w-5" /> },
  { to: "/notes", label: "Notes", icon: <StickyNote className="h-5 w-5" /> },
  { to: "/habits", label: "Habits", icon: <Repeat className="h-5 w-5" /> },
  { to: "/calendar", label: "Kalender", icon: <CalendarDays className="h-5 w-5" /> },
  { to: "/timer", label: "Focus Timer", icon: <Timer className="h-5 w-5" /> },
  { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/journal": "Journal",
  "/tasks": "Tasks",
  "/ideas": "Ideas",
  "/notes": "Notes",
  "/habits": "Habits",
  "/calendar": "Kalender",
  "/timer": "Focus Timer",
  "/settings": "Settings",
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">Niat</span>
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
            onClick={() => (window as any).__claritySearch?.()}
            aria-label="Cari"
            title="Cari (Ctrl+K atau /)"
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Search className="h-4 w-4" /> Cari
          </button>
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
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    // Expose search toggle globally for sidebar button
    (window as any).__claritySearch = () => setSearchOpen(true);
    return () => {
      window.removeEventListener("keydown", onKey);
      delete (window as any).__claritySearch;
    };
  }, []);

  // Fallback: if onRehydrateStorage never fired (e.g. empty localStorage),
  // mark hydrated after mount anyway so we don't get stuck on a spinner.
  useEffect(() => {
    if (!hydrated) {
      useAuthStore.getState().setHydrated(true);
    }
  }, [hydrated]);

  // Check for due tasks once on load (after auth is ready).
  useEffect(() => {
    if (hydrated && user) {
      checkDueTasks();
    }
  }, [hydrated, user]);

  // Journal reminder scheduler — check every minute while logged in.
  useEffect(() => {
    if (!hydrated || !user) return;
    checkJournalReminders();
    const id = setInterval(checkJournalReminders, 60_000);
    return () => clearInterval(id);
  }, [hydrated, user]);

  // IMPORTANT: Only redirect after hydration. On SSR/first paint the store is
  // not rehydrated from localStorage yet, so `user` is always null — redirecting
  // then sends users to /login and (after hydrate) to /dashboard on every refresh.
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const title = pageTitles[location.pathname] ?? "Niat";

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
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Cari"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Search className="h-5 w-5" />
          </button>
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
      <CreateSheet />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SyncIndicator />
      <GlobalTimer />

      <QuickCaptureGlobal />
    </div>
  );
}