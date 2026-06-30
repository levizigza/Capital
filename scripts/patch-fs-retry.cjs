/**
 * Monkey-patches fs.promises.readFile (and the sync variant) with
 * automatic retry logic.  Loaded via node --require before Vite starts,
 * so every file read in the process — including Vite internals — gets
 * transparent retries for OneDrive "UNKNOWN: unknown error, read" failures.
 */
"use strict";

const fsp = require("fs/promises");
const fs  = require("fs");

const MAX_RETRIES = 12;
const BASE_DELAY  = 500;     // ms — scales by attempt number

function isTransient(err) {
  const m = err && err.message ? err.message : "";
  return m.includes("UNKNOWN") || m.includes("unknown error");
}

// ── Async: fs.promises.readFile ────────────────────────────────
const origReadFile = fsp.readFile;
fsp.readFile = async function patchedReadFile(...args) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await origReadFile.apply(fsp, args);
    } catch (err) {
      if (isTransient(err) && attempt < MAX_RETRIES) {
        const delay = Math.min(BASE_DELAY * (attempt + 1), 3000);
        if (attempt === 0) {
          const file = typeof args[0] === "string" ? args[0] : "(handle)";
          console.log(`[patch-fs-retry] Retrying read: ${file}`);
        }
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
};

// ── Sync: fs.readFileSync ──────────────────────────────────────
const origReadFileSync = fs.readFileSync;
fs.readFileSync = function patchedReadFileSync(...args) {
  for (let attempt = 0; ; attempt++) {
    try {
      return origReadFileSync.apply(fs, args);
    } catch (err) {
      if (isTransient(err) && attempt < MAX_RETRIES) {
        const waitMs = BASE_DELAY * (attempt + 1);
        const end = Date.now() + waitMs;
        while (Date.now() < end) { /* busy-wait for sync context */ }
        continue;
      }
      throw err;
    }
  }
};

// ── Async: fs.promises.open → FileHandle.readFile ──────────────
// The actual error originates from readFileHandle (node:internal/fs/promises)
// which is called by FileHandle.prototype.readFile.  We patch open() to
// retry the ENTIRE open+readFile sequence on transient failure.
const origOpen = fsp.open;
fsp.open = async function patchedOpen(...args) {
  for (let attempt = 0; ; attempt++) {
    try {
      const handle = await origOpen.apply(fsp, args);
      let origHandleReadFile = handle.readFile.bind(handle);
      let origClose = handle.close.bind(handle);

      handle.readFile = async function patchedHandleReadFile(...readArgs) {
        for (let rAttempt = 0; ; rAttempt++) {
          try {
            return await origHandleReadFile(...readArgs);
          } catch (err) {
            if (isTransient(err) && rAttempt < MAX_RETRIES) {
              const delay = Math.min(BASE_DELAY * (rAttempt + 1), 3000);
              if (rAttempt === 0) {
                const file = typeof args[0] === "string" ? args[0] : "(handle)";
                console.log(`[patch-fs-retry] Retrying handle.readFile: ${file}`);
              }
              // Close stale handle, re-open, and retry
              try { await origClose(); } catch {}
              const newHandle = await origOpen.apply(fsp, args);
              origHandleReadFile = newHandle.readFile.bind(newHandle);
              handle.close = newHandle.close.bind(newHandle);
              handle.fd = newHandle.fd;
              await new Promise((r) => setTimeout(r, delay));
              continue;
            }
            throw err;
          }
        }
      };

      return handle;
    } catch (err) {
      if (isTransient(err) && attempt < MAX_RETRIES) {
        const delay = Math.min(BASE_DELAY * (attempt + 1), 3000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
};

console.log("[patch-fs-retry] OneDrive resilience patches applied");
