"use client";

import { useSyncExternalStore } from "react";

// Saved places live in this browser only: no account, nothing on the server.
// Stored as a JSON array of place ids, newest first.
const KEY = "savedPlaces";
const EMPTY: number[] = [];
const listeners = new Set<() => void>();

// Parsed once per stored string, so the snapshot stays referentially stable
let cache: { raw: string | null; ids: number[] } = { raw: null, ids: EMPTY };

function read(): number[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Blocked storage (private mode, site data off): nothing saved
  }
  if (raw === cache.raw) return cache.ids;
  let ids = EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) {
      ids = parsed.filter((id): id is number => Number.isInteger(id));
    }
  } catch {
    // Corrupt value: treat as empty, the next save overwrites it
  }
  cache = { raw, ids };
  return ids;
}

function write(ids: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Can't persist; the button just won't stick
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Saves made in another tab
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleSaved(id: number) {
  const ids = read();
  write(ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids]);
}

// Saved ids, newest first. Empty on the server and during hydration.
export function useSaved(): number[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
