import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "~/lib/cn";
import { isOnline, onOnlineChange, getQueueSize } from "~/lib/offlineStorage";
import { api } from "~/lib/api";

export function SyncIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onOnlineChange((online) => {
      setOnline(online);
      if (online) {
        setQueueSize(getQueueSize());
      }
    });
    return unsubscribe;
  }, []);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      // Trigger cache refresh
      await api("/api/dashboard");
      setQueueSize(0);
    } catch {
      // Ignore sync errors
    } finally {
      setSyncing(false);
    }
  }

  if (online && queueSize === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-lg lg:hidden",
        online
          ? "bg-green-600 text-white"
          : "bg-orange-500 text-white",
      )}
    >
      {online ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>{queueSize > 0 ? `${queueSize} item menunggu sync` : "Online"}</span>
          {queueSize > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="ml-1 rounded-full p-1 hover:bg-white/20"
            >
              <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
            </button>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline - data tersimpan lokal</span>
        </>
      )}
    </div>
  );
}
