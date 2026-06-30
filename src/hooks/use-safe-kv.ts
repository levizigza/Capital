import { useState, useCallback } from "react";

/**
 * Drop-in replacement for @github/spark's useKV hook.
 * Uses localStorage so the app works in local dev without Spark auth.
 * API: `const [value, setValue] = useKV<T>(key, defaultValue)`
 */

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`kv_${key}`);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    // ignore corrupt data
  }
  return fallback;
}

function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`kv_${key}`, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function useKV<T>(
  key: string,
  defaultValue: T
): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValueState] = useState<T>(() => readLocal(key, defaultValue));

  const setValue = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const next = typeof v === "function" ? (v as (prev: T) => T)(prev) : v;
        writeLocal(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, setValue];
}
