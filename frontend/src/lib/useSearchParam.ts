"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useSearchParam(name: string) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);
  const getSnapshot = useCallback(() => new URLSearchParams(window.location.search).get(name) ?? "", [name]);
  const getServerSnapshot = useCallback(() => "", []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
