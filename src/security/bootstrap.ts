/**
 * Security bootstrap — unlock vault, migrate sensitive keys, expose wipe.
 */

import { initSecureStore } from "./secureStore";
import { eraseAllUserData } from "./storageRegistry";
import { getUserDatabase } from "./db";

let booted = false;

export async function bootstrapSecurity(): Promise<void> {
  if (booted) return;
  booted = true;
  await initSecureStore();
  try {
    (
      window as unknown as {
        __CAPITAL_SECURITY__?: {
          eraseAllUserData: typeof eraseAllUserData;
          dbKind: string;
        };
      }
    ).__CAPITAL_SECURITY__ = {
      eraseAllUserData,
      dbKind: getUserDatabase().kind,
    };
  } catch {
    /* ignore */
  }
}

export { eraseAllUserData, getUserDatabase };
