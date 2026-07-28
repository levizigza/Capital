/**
 * Device vault — AES-GCM at rest for sensitive local data.
 *
 * Threat model (honest):
 * - Protects against casual disk inspection, shared-device snooping, and
 *   offline copies of localStorage dumps without the device key material.
 * - Does NOT protect against XSS in the same origin (page JS can use the key).
 * - Multi-user / cloud secrecy requires a real authenticated backend (see db/).
 */

const IDB_NAME = "capital_vault_v1";
const IDB_STORE = "keys";
const DEVICE_KEY_ID = "device_aes_gcm";
const ENC_PREFIX = "capital_enc_v1:";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cachedKey: CryptoKey | null = null;
let unlockPromise: Promise<CryptoKey> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

async function idbGet(key: string): Promise<CryptoKey | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve((req.result as CryptoKey | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IDB get failed"));
  });
}

async function idbPut(key: string, value: CryptoKey): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("IDB put failed"));
  });
}

async function createDeviceKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  await idbPut(DEVICE_KEY_ID, key);
  return key;
}

/** Load or create the non-extractable device key (call once at boot). */
export async function unlockVault(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  if (unlockPromise) return unlockPromise;
  unlockPromise = (async () => {
    if (typeof indexedDB === "undefined" || typeof crypto === "undefined" || !crypto.subtle) {
      throw new Error("WebCrypto / IndexedDB unavailable");
    }
    let key = await idbGet(DEVICE_KEY_ID);
    if (!key) key = await createDeviceKey();
    cachedKey = key;
    return key;
  })();
  try {
    return await unlockPromise;
  } finally {
    unlockPromise = null;
  }
}

export function isVaultUnlocked(): boolean {
  return cachedKey !== null;
}

function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

function b64ToBytes(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export async function vaultEncryptString(plaintext: string): Promise<string> {
  const key = cachedKey ?? (await unlockVault());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return ENC_PREFIX + bytesToB64(combined);
}

export async function vaultDecryptString(blob: string): Promise<string> {
  if (!blob.startsWith(ENC_PREFIX)) {
    throw new Error("Not a vault ciphertext");
  }
  const key = cachedKey ?? (await unlockVault());
  const combined = b64ToBytes(blob.slice(ENC_PREFIX.length));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return decoder.decode(plain);
}

export function isVaultCiphertext(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(ENC_PREFIX);
}

export async function vaultEncryptJson(value: unknown): Promise<string> {
  return vaultEncryptString(JSON.stringify(value));
}

export async function vaultDecryptJson<T>(blob: string): Promise<T> {
  const json = await vaultDecryptString(blob);
  return JSON.parse(json) as T;
}

/** Wipe device key material (caller must also clear ciphertext). */
export async function destroyVaultKey(): Promise<void> {
  cachedKey = null;
  if (typeof indexedDB === "undefined") return;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(IDB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("IDB delete failed"));
    req.onblocked = () => resolve();
  });
}
