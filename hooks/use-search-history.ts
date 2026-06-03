import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@mingo:search-history-users:v1";
const MAX_ITEMS = 10;

/** Đại diện 1 user đã được mở từ màn search — đủ data để render lại không cần fetch. */
export interface SearchHistoryUser {
  id: string;
  name?: string;
  avatar?: string;
  /** Timestamp (ms) — phục vụ sort & expire nếu sau này cần. */
  searchedAt: number;
}

function parseHistory(raw: string | null): SearchHistoryUser[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (it): it is SearchHistoryUser =>
          !!it && typeof it === "object" && typeof it.id === "string" && it.id.length > 0
      )
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Quản lý lịch sử user đã được tap từ màn search. Persist trong AsyncStorage.
 * - `add`  : đẩy lên đầu, dedupe theo `id`, giữ tối đa MAX_ITEMS
 * - `remove`: xoá 1 item theo id
 * - `clear`: xoá toàn bộ
 */
export function useSearchHistory() {
  const [items, setItems] = useState<SearchHistoryUser[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled) setItems(parseHistory(raw));
      } catch (e) {
        console.error("[search-history] load failed", e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: SearchHistoryUser[]) => {
    setItems(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("[search-history] persist failed", e);
    }
  }, []);

  const add = useCallback(
    async (user: Omit<SearchHistoryUser, "searchedAt">) => {
      if (!user.id) return;
      const entry: SearchHistoryUser = { ...user, searchedAt: Date.now() };
      const deduped = items.filter((it) => it.id !== entry.id);
      const next = [entry, ...deduped].slice(0, MAX_ITEMS);
      await persist(next);
    },
    [items, persist]
  );

  const remove = useCallback(
    async (id: string) => {
      const next = items.filter((it) => it.id !== id);
      await persist(next);
    },
    [items, persist]
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { items, hydrated, add, remove, clear };
}
