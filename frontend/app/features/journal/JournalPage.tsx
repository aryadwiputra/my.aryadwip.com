import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { formatDate, todayStr } from "~/lib/date";
import type { Journal, JournalSlot } from "~/lib/types";
import { JournalForm } from "./components/JournalForm";
import { JournalList } from "./components/JournalList";
import { StreakCounter } from "./components/StreakCounter";
import { useJournals, useJournalStreaks } from "./hooks";

export default function JournalPage() {
  const { data: journals = [], isLoading } = useJournals();
  const { data: streaks, isLoading: streaksLoading } = useJournalStreaks();

  const today = todayStr();
  const [slot, setSlot] = useState<JournalSlot>("morning");
  const [activeId, setActiveId] = useState<string | null>(null);

  const todayEntry = journals.find((j) => j.date === today && j.slot === slot);
  const activeJournal: Journal | null = activeId
    ? journals.find((j) => j.id === activeId) ?? null
    : todayEntry ?? null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Journal</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(today)} — pagi untuk niat, malam untuk refleksi.
          </p>
        </div>
      </div>

      <StreakCounter
        current={streaks?.current ?? 0}
        longest={streaks?.longest ?? 0}
        loading={streaksLoading}
      />

      {activeJournal && activeJournal.date !== today && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <span>Mengedit journal {formatDate(activeJournal.date)}.</span>
          <Button variant="ghost" size="sm" onClick={() => setActiveId(null)}>
            Kembali ke hari ini
          </Button>
        </div>
      )}

      <JournalForm
        key={`${activeJournal?.id ?? "new"}-${slot}`}
        journal={activeJournal}
        slot={slot}
        onSlotChange={(s) => {
          setSlot(s);
          setActiveId(null);
        }}
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Riwayat Journal</h2>
        <JournalList
          journals={journals}
          activeId={activeId}
          onSelect={(j) => {
            setActiveId(j.id);
            setSlot(j.slot);
          }}
        />
      </section>
    </div>
  );
}
