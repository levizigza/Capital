import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './components/ErrorFallback'
import { DevErrorOverlay } from './components/DevErrorOverlay'
import { InputProvider } from '@/input'

import "./main.css"

// Dev/preview: drop any stale service worker so an old Capital build cannot mask updates.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => void reg.unregister())
  })
}

// Production (incl. GitHub Pages): register SW under BASE_URL so /Capital/ works.
// On activate / controller change, reload once so stale Vite chunks never stick.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  let reloading = false;
  const reloadOnce = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener("controllerchange", reloadOnce);
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "CAPITAL_SW_ACTIVATED") reloadOnce();
  });
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    void navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((reg) => {
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              nw.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((err) => console.log("SW registration failed:", err));
  });
}

const isPixelPreview =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("pixelPreview") === "1";

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">Error: Root element not found</h1>';
} else {
  try {
    const root = createRoot(rootElement);

    if (isPixelPreview) {
      import("@/pixel/tools/SpritePreviewTool").then(({ default: SpritePreviewTool }) => {
        root.render(
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <SpritePreviewTool />
          </ErrorBoundary>
        );
      });
    } else {
      root.render(
        <ErrorBoundary 
          FallbackComponent={ErrorFallback}
          onError={(error, info) => {
            console.error('[ErrorBoundary] Caught error:', error);
            console.error('[ErrorBoundary] Component stack:', info.componentStack);
          }}
        >
          <InputProvider>
            <App />
          </InputProvider>
          {import.meta.env.DEV ? <DevErrorOverlay /> : null}
        </ErrorBoundary>
      );
    }
  } catch (error) {
    console.error('[ERROR] Failed to render App:', error);
    rootElement.innerHTML = `<h1 style="color: red; text-align: center; margin-top: 50px;">Error: ${error}</h1>`;
  }
}
