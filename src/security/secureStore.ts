/**
 * Secure localStorage wrapper — transparent encrypt for sensitive keys.
 * After init, sync helpers use an in-memory plaintext cache (WebCrypto is async-only).
 */

import { SENSITIVE_LOCAL_KEYS } from "./storageRegistry";
import {
  isVaultCiphertext,
  unlockVault,
  vaultDecryptString,
  vaultEncryptString,
} from "./vault";
import { safeJsonParse } from "./safeJson";

const sensitive = new Set<string>(SENSITIVE_LOCAL_KEYS);
const memory = new Map<string, string>();

let ready = false;

export async function initSecureStore(): Promise<void> {
  try {
    await unlockVault();
    ready = true;
    await migrateSensitiveKeys();
  } catch {
    ready = false;
  }
}

export function isSecureStoreReady(): boolean {
  return ready;
}

async function migrateSensitiveKeys(): Promise<void> {
  for (const key of SENSITIVE_LOCAL_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      if (isVaultCiphertext(raw)) {
        const plain = await vaultDecryptString(raw);
        memory.set(key, plain);
        continue;
      }
      memory.set(key, raw);
      if (ready) {
        const enc = await vaultEncryptString(raw);
        localStorage.setItem(key, enc);
      }
    } catch {
      /* leave as-is */
    }
  }
}

async function persistEncrypted(key: string, plain: string): Promise<void> {
  memory.set(key, plain);
  if (sensitive.has(key) && ready) {
    try {
      const enc = await vaultEncryptString(plain);
      localStorage.setItem(key, enc);
      return;
    } catch {
      /* fall through */
    }
  }
  localStorage.setItem(key, plain);
}

/** Sync read after bootstrap (uses memory for encrypted keys). */
export function secureGetItemSync(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  if (isVaultCiphertext(raw)) {
    // Not yet migrated into memory — treat as unavailable until async init
    return null;
  }
  return raw;
}

export function secureSetItemSync(key: string, value: string): void {
  memory.set(key, value);
  if (sensitive.has(key) && ready) {
    void persistEncrypted(key, value);
    return;
  }
  localStorage.setItem(key, value);
}

export function secureRemoveItem(key: string): void {
  memory.delete(key);
  localStorage.removeItem(key);
}

/** Clear in-memory plaintext cache (call during wipe). */
export function clearSecureStoreMemory(): void {
  memory.clear();
  ready = false;
}

export async function secureGetItem(key: string): Promise<string | null> {
  if (memory.has(key)) return memory.get(key)!;
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  if (isVaultCiphertext(raw)) {
    try {
      const plain = await vaultDecryptString(raw);
      memory.set(key, plain);
      return plain;
    } catch {
      return null;
    }
  }
  if (sensitive.has(key) && ready) {
    memory.set(key, raw);
    void persistEncrypted(key, raw);
  }
  return raw;
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  await persistEncrypted(key, value);
}

export async function secureGetJson<T>(key: string): Promise<T | null> {
  const raw = await secureGetItem(key);
  if (raw === null) return null;
  try {
    return safeJsonParse<T>(raw);
  } catch {
    return null;
  }
}

export async function secureSetJson(key: string, value: unknown): Promise<void> {
  await secureSetItem(key, JSON.stringify(value));
}

export function secureGetJsonSync<T>(key: string): T | null {
  const raw = secureGetItemSync(key);
  if (raw === null) return null;
  try {
    return safeJsonParse<T>(raw);
  } catch {
    return null;
  }
}

export function secureSetJsonSync(key: string, value: unknown): void {
  secureSetItemSync(key, JSON.stringify(value));
}
