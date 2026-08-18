import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface FocusModeProps {
  onExit: () => void;
  children: ReactNode;
}

export function FocusMode({ onExit, children }: FocusModeProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
      <button
        onClick={onExit}
        aria-label="Keluar dari mode fokus"
        className="absolute right-5 top-5 rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
      >
        <X className="h-6 w-6" />
      </button>
      {children}
    </div>
  );
}