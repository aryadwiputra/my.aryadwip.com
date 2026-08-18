import { Navigate } from "react-router";
import { useAuthStore } from "~/stores/auth";
import { logout } from "~/lib/authService";

/**
 * Minimal protected route so the auth flow (login -> redirect) is verifiable
 * end-to-end. This is only a stub — S02 replaces it with the full UI shell,
 * sidebar navigation, and shared layout.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500">Selamat datang kembali, {user.name}</p>
        </div>
        <button
          onClick={() => logout().then(() => window.location.assign("/login"))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Keluar
        </button>
      </header>
      <div className="p-6">
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Konten dashboard akan diisi pada Sprint 02 (UI Shell) &amp; S07 (Dashboard).
        </div>
      </div>
    </main>
  );
}