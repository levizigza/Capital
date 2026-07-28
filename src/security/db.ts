/**
 * Database adapter contract — local encrypted store now, remote later.
 *
 * Vite + GitHub Pages cannot host a private DB. When we add one
 * (Cloudflare Workers + D1 / Supabase / Postgres), implement RemoteUserDb
 * behind the same interface so UI does not change.
 */

export type UserRecord = {
  id: string;
  displayName: string;
  /** Never persist raw email without consent + encryption. */
  emailHash?: string;
  updatedAt: string;
};

export type SaveBlob = {
  userId: string;
  /** Opaque encrypted or schema-validated save payload */
  payload: unknown;
  revision: number;
  updatedAt: string;
};

export interface UserDatabase {
  readonly kind: "local" | "remote";
  getUser(id: string): Promise<UserRecord | null>;
  upsertUser(user: UserRecord): Promise<void>;
  getSave(userId: string): Promise<SaveBlob | null>;
  putSave(save: SaveBlob): Promise<void>;
  deleteUserData(userId: string): Promise<void>;
}

const USER_PREFIX = "capital_db_user_";
const SAVE_PREFIX = "capital_db_save_";

/**
 * LocalEncryptedDb — IndexedDB-backed logical DB using SecureStore keys.
 * Growth path: swap factory to RemoteUserDb when API exists.
 */
export class LocalEncryptedDb implements UserDatabase {
  readonly kind = "local" as const;

  async getUser(id: string): Promise<UserRecord | null> {
    const { secureGetJson } = await import("./secureStore");
    return secureGetJson<UserRecord>(USER_PREFIX + id);
  }

  async upsertUser(user: UserRecord): Promise<void> {
    const { secureSetJson } = await import("./secureStore");
    await secureSetJson(USER_PREFIX + user.id, {
      ...user,
      updatedAt: new Date().toISOString(),
    });
  }

  async getSave(userId: string): Promise<SaveBlob | null> {
    const { secureGetJson } = await import("./secureStore");
    return secureGetJson<SaveBlob>(SAVE_PREFIX + userId);
  }

  async putSave(save: SaveBlob): Promise<void> {
    const { secureSetJson } = await import("./secureStore");
    await secureSetJson(SAVE_PREFIX + save.userId, {
      ...save,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteUserData(userId: string): Promise<void> {
    const { secureRemoveItem } = await import("./secureStore");
    secureRemoveItem(USER_PREFIX + userId);
    secureRemoveItem(SAVE_PREFIX + userId);
  }
}

let activeDb: UserDatabase = new LocalEncryptedDb();

export function getUserDatabase(): UserDatabase {
  return activeDb;
}

/** Future: `setUserDatabase(new RemoteUserDb(apiBase))` after auth ships. */
export function setUserDatabase(db: UserDatabase): void {
  activeDb = db;
}
