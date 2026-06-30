import { useEffect, useMemo, useRef, useState } from "react";

type OverlayErrorEntry = {
  id: string;
  timestamp: number;
  type: "error" | "unhandledrejection" | "console.error" | "console.warn";
  message: string;
  stack?: string;
};

function safeStringify(value: unknown): string {
  try {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.message;
    return JSON.stringify(value);
  } catch {
    try {
      return String(value);
    } catch {
      return "(unserializable)";
    }
  }
}

function formatConsoleArgs(args: unknown[]): { message: string; stack?: string } {
  const stack = args.find(a => a instanceof Error && typeof (a as Error).stack === "string") as Error | undefined;
  const message = args
    .map(a => {
      if (a instanceof Error) return a.message;
      return safeStringify(a);
    })
    .join(" ");

  return { message, stack: stack?.stack };
}

export function DevErrorOverlay() {
  const [entries, setEntries] = useState<OverlayErrorEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [filter, setFilter] = useState("");
  const originalConsole = useRef<{ error?: typeof console.error; warn?: typeof console.warn }>({});

  const filteredEntries = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => {
      const hay = `${e.type} ${e.message} ${e.stack || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [entries, filter]);

  const styles = useMemo(() => {
    return {
      container: {
        position: "fixed" as const,
        right: 12,
        bottom: 12,
        width: 560,
        maxWidth: "calc(100vw - 24px)",
        zIndex: 9990,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        fontSize: 12,
        color: "#fff",
        pointerEvents: "none" as const,
      },
      interactive: {
        pointerEvents: "auto" as const,
      },
      header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "10px 12px",
        background: "rgba(15, 23, 42, 0.92)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        borderBottom: "none",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      },
      title: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
      },
      badge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 6px",
        borderRadius: 999,
        background: entries.length ? "#dc2626" : "#16a34a",
        fontWeight: 700,
        lineHeight: "18px",
      },
      actions: {
        display: "flex",
        gap: 8,
        alignItems: "center",
      },
      button: {
        appearance: "none" as const,
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(2, 6, 23, 0.65)",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: 8,
        cursor: "pointer",
      },
      panel: {
        border: "1px solid rgba(148, 163, 184, 0.25)",
        borderTop: "none",
        background: "rgba(2, 6, 23, 0.85)",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: "auto",
        maxHeight: "60vh",
      },
      controls: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
      },
      input: {
        flex: 1,
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        borderRadius: 8,
        padding: "6px 10px",
        color: "#fff",
        outline: "none",
      },
      entry: {
        padding: "10px 12px",
        borderTop: "1px solid rgba(148, 163, 184, 0.12)",
        whiteSpace: "pre-wrap" as const,
        wordBreak: "break-word" as const,
      },
      entryMeta: {
        opacity: 0.9,
        marginBottom: 6,
      },
      entryMessage: {
        fontWeight: 700,
      },
      entryStack: {
        marginTop: 8,
        opacity: 0.95,
      },
      hint: {
        opacity: 0.75,
      },
    };
  }, [entries.length]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const addEntry = (partial: Omit<OverlayErrorEntry, "id" | "timestamp">) => {
      setEntries(prev => {
        const next: OverlayErrorEntry[] = [
          {
            ...partial,
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            timestamp: Date.now(),
          },
          ...prev,
        ];

        return next.slice(0, 50);
      });
    };

    const onError = (event: ErrorEvent) => {
      if (!isEnabled) return;
      const message = event.message || safeStringify(event.error);
      const stack = event.error instanceof Error ? event.error.stack : undefined;
      addEntry({ type: "error", message, stack });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isEnabled) return;
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : safeStringify(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      addEntry({ type: "unhandledrejection", message, stack });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        setIsOpen(open => !open);
      }
    };

    const patchConsole = () => {
      if (originalConsole.current.error || originalConsole.current.warn) return;

      originalConsole.current.error = console.error;
      originalConsole.current.warn = console.warn;

      console.error = (...args: unknown[]) => {
        if (isEnabled) {
          const { message, stack } = formatConsoleArgs(args);
          addEntry({ type: "console.error", message, stack });
        }
        originalConsole.current.error?.apply(console, args as never);
      };

      console.warn = (...args: unknown[]) => {
        if (isEnabled) {
          const { message, stack } = formatConsoleArgs(args);
          addEntry({ type: "console.warn", message, stack });
        }
        originalConsole.current.warn?.apply(console, args as never);
      };
    };

    const unpatchConsole = () => {
      if (originalConsole.current.error) console.error = originalConsole.current.error;
      if (originalConsole.current.warn) console.warn = originalConsole.current.warn;
      originalConsole.current = {};
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("keydown", onKeyDown);
    patchConsole();

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("keydown", onKeyDown);
      unpatchConsole();
    };
  }, [isEnabled]);

  if (!import.meta.env.DEV) return null;

  const exportText = () => {
    const lines = entries
      .slice()
      .reverse()
      .map(e => {
        const head = `[${new Date(e.timestamp).toISOString()}] ${e.type}: ${e.message}`;
        return e.stack ? `${head}\n${e.stack}` : head;
      });
    return lines.join("\n\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText());
    } catch {
      return;
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.header, ...styles.interactive }}>
        <div style={styles.title}>
          <span>Dev Errors</span>
          <span style={styles.badge}>{entries.length}</span>
          <span style={styles.hint}>(Ctrl+Shift+E)</span>
        </div>
        <div style={styles.actions}>
          <button
            type="button"
            style={styles.button}
            onClick={() => setIsEnabled(v => !v)}
            title={isEnabled ? "Disable capture" : "Enable capture"}
          >
            {isEnabled ? "Capture: on" : "Capture: off"}
          </button>
          <button type="button" style={styles.button} onClick={handleCopy} title="Copy all">
            Copy
          </button>
          <button type="button" style={styles.button} onClick={() => setEntries([])} title="Clear">
            Clear
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={() => setIsOpen(open => !open)}
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div style={{ ...styles.panel, ...styles.interactive }}>
          <div style={styles.controls}>
            <input
              style={styles.input}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter (type, message, stack)"
              aria-label="Filter dev errors"
            />
          </div>

          {filteredEntries.length === 0 ? (
            <div style={styles.entry}>{entries.length === 0 ? "No runtime errors captured yet." : "No matches."}</div>
          ) : (
            filteredEntries.map(e => (
              <div key={e.id} style={styles.entry}>
                <div style={styles.entryMeta}>
                  [{new Date(e.timestamp).toLocaleTimeString()}] {e.type}
                </div>
                <div style={styles.entryMessage}>{e.message}</div>
                {e.stack ? <div style={styles.entryStack}>{e.stack}</div> : null}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
