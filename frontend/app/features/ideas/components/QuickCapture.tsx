import { useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { toastError, toastSuccess } from "~/lib/toast";
import { useQuickCaptureStore } from "../quickCaptureStore";
import { useCaptureIdea } from "../hooks";

export function QuickCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const capture = useCaptureIdea();
  const text = useQuickCaptureStore((s) => s.text);
  const setText = useQuickCaptureStore((s) => s.setText);
  const submitting = useQuickCaptureStore((s) => s.submitting);
  const setSubmitting = useQuickCaptureStore((s) => s.setSubmitting);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await capture.mutateAsync(text.trim());
      toastSuccess("Ide ditangkap ✨");
      setText("");
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menangkap ide");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tangkap Ide Cepat" size="sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          autoFocus
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis ide yang muncul tiba-tiba..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={submitting} disabled={!text.trim()}>
            Tangkap
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Global quick-capture: Ctrl/Cmd+K shortcut + desktop FAB. */
export function QuickCaptureGlobal() {
  const open = useQuickCaptureStore((s) => s.open);
  const setOpen = useQuickCaptureStore((s) => s.setOpen);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <QuickCapture open={open} onClose={() => setOpen(false)} />
      <button
        onClick={() => setOpen(true)}
        aria-label="Tangkap ide cepat"
        title="Tangkap ide (Ctrl+K)"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 lg:flex"
      >
        <Lightbulb className="h-6 w-6" />
      </button>
    </>
  );
}