/**
 * Offline Storage Layer
 * 
 * Uses localStorage to persist data when offline.
 * Data is synced to server when connection is restored.
 */

const STORAGE_KEYS = {
  journalQueue: 'clarityflow_journal_queue',
  taskQueue: 'clarityflow_task_queue',
  habitQueue: 'clarityflow_habit_queue',
  lastSync: 'clarityflow_last_sync',
  isOnline: 'clarityflow_is_online',
};

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'toggle';
  entity: 'journal' | 'task' | 'habit';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

// Check online status
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

// Listen to online/offline events
export function onOnlineChange(callback: (online: boolean) => void) {
  if (typeof window === 'undefined') return;
  
  const updateStatus = () => {
    const online = isOnline();
    localStorage.setItem(STORAGE_KEYS.isOnline, String(online));
    callback(online);
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  // Initial check
  updateStatus();
  
  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  };
}

// Get online status from storage
export function getIsOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEYS.isOnline) !== 'false';
}

// Queue management
export function addToQueue(operation: SyncOperation): void {
  if (typeof window === 'undefined') return;
  
  const queue = getQueue();
  queue.push(operation);
  localStorage.setItem(STORAGE_KEYS.journalQueue, JSON.stringify(queue));
}

function getQueue(): SyncOperation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.journalQueue);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getQueueSize(): number {
  return getQueue().length;
}

export function clearSyncedOperations(entity: string): void {
  if (typeof window === 'undefined') return;
  
  const queue = getQueue().filter(op => op.entity !== entity);
  localStorage.setItem(STORAGE_KEYS.journalQueue, JSON.stringify(queue));
}

export function markSynced(operationId: string, entity: string): void {
  if (typeof window === 'undefined') return;
  
  const queue = getQueue()
    .filter(op => !(op.id === operationId && op.entity === entity));
  localStorage.setItem(STORAGE_KEYS.journalQueue, JSON.stringify(queue));
}

// Last sync timestamp
export function setLastSyncTime(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.lastSync, Date.now().toString());
}

export function getLastSyncTime(): number | null {
  if (typeof window === 'undefined') return null;
  const time = localStorage.getItem(STORAGE_KEYS.lastSync);
  return time ? parseInt(time, 10) : null;
}

// Offline data storage (separate from sync queue)
export function storeOfflineData(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`clarityflow_offline_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to store offline data:', e);
  }
}

export function getOfflineData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(`clarityflow_offline_${key}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearOfflineData(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`clarityflow_offline_${key}`);
}
