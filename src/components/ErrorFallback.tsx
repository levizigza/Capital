import { Warning, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

async function hardRecover() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("cache_bust", String(Date.now()));
  window.location.replace(url.toString());
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const staleChunk =
    /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed/i.test(
      error.message,
    );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Warning className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-slate-800">
            {staleChunk ? "Update needed" : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-slate-600">
            {staleChunk ? (
              <p>
                An old cached build is stuck. Tap <strong>Reload fresh</strong> to clear it and load
                the latest Capital.
              </p>
            ) : (
              <p>An error occurred while running the application.</p>
            )}
            <p className="mt-2 rounded bg-slate-100 p-2 font-mono text-xs">{error.message}</p>
          </div>
          <Button
            onClick={() => {
              if (staleChunk) void hardRecover();
              else resetErrorBoundary();
            }}
            className="w-full"
            variant="outline"
            aria-label={staleChunk ? "Reload fresh" : "Try again"}
          >
            <ArrowCounterClockwise className="mr-2 h-4 w-4" />
            {staleChunk ? "Reload fresh" : "Try Again"}
          </Button>
          {!staleChunk ? (
            <Button onClick={() => void hardRecover()} className="w-full" variant="ghost">
              Clear cache & reload
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
