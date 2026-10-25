"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * SSR-safe "is mounted" flag without setState-in-effect
 * (renders false on server, true on client after hydration)
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
