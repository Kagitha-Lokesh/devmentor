import { useAchievementsStore } from '../../presentation/store/useAchievementsStore';
import { useBookmarksStore } from '../../presentation/store/useBookmarksStore';
import { useCalendarStore } from '../../presentation/store/useCalendarStore';
import { useDownloadsStore } from '../../presentation/store/useDownloadsStore';
import { useExportsStore } from '../../presentation/store/useExportsStore';
import { useNotesStore } from '../../presentation/store/useNotesStore';
import { useSearchStore } from '../../presentation/store/useSearchStore';
import { useTimelineStore } from '../../presentation/store/useTimelineStore';
import { useUiStore } from '../../presentation/store/useUiStore';
import { useUserStore } from '../../presentation/store/useUserStore';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';

export class GlobalStateResetService {
  static async resetAll(uid) {
    console.info(`[GlobalStateResetService] Starting cleanup pipeline for user: ${uid}`);

    // 1. Reset Zustand Stores
    try {
      useAchievementsStore.getState().reset();
      useBookmarksStore.getState().reset();
      useCalendarStore.getState().reset();
      useDownloadsStore.getState().reset();
      useExportsStore.getState().reset();
      useNotesStore.getState().reset();
      useSearchStore.getState().reset();
      useTimelineStore.getState().reset();
      useUiStore.getState().reset();
      useUserStore.getState().reset();
    } catch (err) {
      console.warn('[GlobalStateResetService] Zustand stores reset warning:', err);
    }

    // 2. Clear Active Timeouts/Intervals (timers check)
    // Clear typical window timer ranges to prevent stray callbacks
    try {
      const maxTimerId = window.setTimeout(() => {}, 0);
      for (let i = 0; i <= maxTimerId; i++) {
        window.clearTimeout(i);
        window.clearInterval(i);
      }
    } catch {}

    if (!uid) return;

    // 3. Clear LocalStorage user-scoped caches selectively
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes(`_${uid}`) || key.startsWith(`assistant_pref_${uid}`))) {
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.warn('[GlobalStateResetService] LocalStorage cleanup warning:', err);
    }

    // 4. Clear IndexedDB user-scoped keys
    try {
      const userStores = [
        'notes',
        'bookmarks',
        'timeline',
        'calendar',
        'downloads',
        'exports',
        'assistantHistory',
        'conversationDrafts',
        'projectProgress',
        'achievements',
        'revisionHistory',
        'offlineReviews',
        'offlineSessions',
        'sessionDrafts'
      ];

      const dbInstance = await localDB.open();
      if (dbInstance) {
        for (const storeName of userStores) {
          if (!dbInstance.objectStoreNames.contains(storeName)) continue;
          
          await new Promise((resolve) => {
            const tx = dbInstance.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.getAllKeys();
            
            req.onsuccess = () => {
              const keys = req.result || [];
              const deletePromises = keys
                .filter(k => typeof k === 'string' && k.startsWith(`${uid}_`))
                .map(k => store.delete(k));
              
              tx.oncomplete = () => resolve();
              tx.onerror = () => resolve();
            };
            req.onerror = () => resolve();
          });
        }
      }
    } catch (err) {
      console.warn('[GlobalStateResetService] IndexedDB keys cleanup warning:', err);
    }

    // 5. Reset Active Sync Queue context
    try {
      syncQueue.clearDebounceTimers();
      syncQueue.setUid(null);
    } catch {}
  }
}

export default GlobalStateResetService;
