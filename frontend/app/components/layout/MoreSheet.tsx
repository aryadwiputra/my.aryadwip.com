import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Settings, Timer, X } from "lucide-react";
import { cn } from "~/lib/cn";

const items = [
  { to: "/timer", label: "Focus Timer", icon: Timer },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Menu</span>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-3">
          {items.map((item) => (
            <button
              key={item.to}
              onClick={() => {
                navigate(item.to);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}