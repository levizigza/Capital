import { useEffect, useRef } from "react";
import { Warning, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  autoRecoverStaleChunkOnce,
  hardRecoverFromStaleBuild,
  isStaleChunkError,
} from "@/lib/hardRecover";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const staleChunk = isStaleChunkError(error.message);
  const autoStarted = useRef(false);

  // Don't make players hunt for "Reload fresh" — clear SW/caches and boot current build.
  useEffect(() => {
    if (!staleChunk || autoStarted.current) return;
    autoStarted.current = true;
    autoRecoverStaleChunkOnce(error.message);
  }, [staleChunk, error.message]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Warning className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-slate-800">
            {staleChunk ? "Updating Capital…" : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-slate-600">
            {staleChunk ? (
              <p>
                An old build was stuck in the cache. Clearing it and loading the latest version
                automatically…
              </p>
            ) : (
              <p>An error occurred while running the application.</p>
            )}
            <p className="mt-2 rounded bg-slate-100 p-2 font-mono text-xs">{error.message}</p>
          </div>
          <Button
            onClick={() => {
              if (staleChunk) void hardRecoverFromStaleBuild("manual");
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
            <Button
              onClick={() => void hardRecoverFromStaleBuild("manual")}
              className="w-full"
              variant="ghost"
            >
              Clear cache & reload
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
