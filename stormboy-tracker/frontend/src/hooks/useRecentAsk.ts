import { useCallback, useEffect, useState } from 'react';

// Recent-prompts + recent-views tracking, backed by localStorage.
// Replaces the v2 hashchange listener with react-router-aware tracking
// (see useRouteTracker in AppShell).

const LS_RECENT_PROMPTS = 'v3-ask-recent-prompts';
const LS_RECENT_VIEWS = 'v3-ask-recent-views';

export interface RecentPromptEntry {
  id: string;
  label: string;
  ts: number;
}

export interface RecentViewEntry {
  tab: string;
  ts: number;
}

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (_) {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* ignore quota / private-mode failures */
  }
}

// Lightweight pub-sub so multiple hooks stay in sync when one writes.
const listeners = new Set<() => void>();
function notify() { listeners.forEach((cb) => cb()); }

export function recordRecentPrompt(id: string, label: string): void {
  const list = lsGet<RecentPromptEntry[]>(LS_RECENT_PROMPTS, []);
  const next: RecentPromptEntry[] = [
    { id, label, ts: Date.now() },
    ...list.filter((x) => x.id !== id),
  ].slice(0, 12);
  lsSet(LS_RECENT_PROMPTS, next);
  notify();
}

export function recordRecentView(tab: string): void {
  if (!tab) return;
  const list = lsGet<RecentViewEntry[]>(LS_RECENT_VIEWS, []);
  const next: RecentViewEntry[] = [
    { tab, ts: Date.now() },
    ...list.filter((x) => x.tab !== tab),
  ].slice(0, 8);
  lsSet(LS_RECENT_VIEWS, next);
  notify();
}

function useLocalStorageSubscription<T>(read: () => T): T {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    const cb = () => setValue(read());
    listeners.add(cb);
    // Also watch storage events from other tabs
    const storageCb = () => setValue(read());
    window.addEventListener('storage', storageCb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', storageCb);
    };
  }, [read]);
  return value;
}

export function useRecentPrompts(): RecentPromptEntry[] {
  return useLocalStorageSubscription(useCallback(
    () => lsGet<RecentPromptEntry[]>(LS_RECENT_PROMPTS, []),
    [],
  ));
}

export function useRecentViews(): RecentViewEntry[] {
  return useLocalStorageSubscription(useCallback(
    () => lsGet<RecentViewEntry[]>(LS_RECENT_VIEWS, []),
    [],
  ));
}
