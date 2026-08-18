import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "~/lib/cn";
import { useToastStore, type ToastKind } from "~/lib/toast";

const styles: Record<ToastKind, string> = {
  success: "border-green-200 bg-white dark:border-green-800 dark:bg-gray-900",
  error: "border-red-200 bg-white dark:border-red-800 dark:bg-gray-900",
  info: "border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-900",
};

const icons: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-gray-800 shadow-lg dark:text-gray-100",
            styles[t.kind],
          )}
        >
          {icons[t.kind]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}