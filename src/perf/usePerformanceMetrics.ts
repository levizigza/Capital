import { useCallback, useEffect, useState } from "react";

import { perfMonitor, type PerfSnapshot } from "./PerformanceMonitor";

const STORAGE_KEY = "capital:perf-overlay";

export function usePerformanceMetrics(): PerfSnapshot {
  const [snapshot, setSnapshot] = useState<PerfSnapshot>(() => perfMonitor.getSnapshot());

  useEffect(() => {
    perfMonitor.start();
    return perfMonitor.subscribe(setSnapshot);
  }, []);

  return snapshot;
}

export function usePerformanceOverlayVisible(): [boolean, () => void] {
  const defaultVisible = import.meta.env.DEV;

  const [visible, setVisible] = useState(() => {
    if (typeof sessionStorage === "undefined") return defaultVisible;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "0") return false;
    if (stored === "1") return true;
    return defaultVisible;
  });

  const toggle = useCallback(() => {
    setVisible((v) => {
      const next = !v;
      sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Backquote" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return [visible, toggle];
}
