import { useSyncExternalStore } from "react";

// One overlay at a time (dialog, drawer or popover), opened from anywhere:
// openFlow("home.convert-review", { amount: "0.1" }) and rendered by <FlowHost />.
let current = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export function openFlow(name, props = {}) {
  current = { name, props };
  emit();
}

export function closeFlow() {
  current = null;
  emit();
}

// A tiny shared value (watchlist, hidden balances…) that several components read and update.
export function createStore(initial) {
  let value = initial;
  const subs = new Set();
  const store = {
    get: () => value,
    set: (next) => {
      value = typeof next === "function" ? next(value) : next;
      subs.forEach((l) => l());
    },
    subscribe: (l) => {
      subs.add(l);
      return () => subs.delete(l);
    },
  };
  store.use = () => useSyncExternalStore(store.subscribe, store.get);
  return store;
}

export function useFlow() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
