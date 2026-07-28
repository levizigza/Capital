# Data storage & database plan

## Today (Vite + GitHub Pages)

Pages can only host **static files**. A traditional app database cannot run on Pages alone.

| Layer | Technology | Role |
|-------|------------|------|
| UI | React + Vite | Client |
| Encrypted local DB | IndexedDB key + localStorage ciphertext | Sensitive user data at rest |
| Logical adapter | `LocalEncryptedDb` in `src/security/db.ts` | Stable API for saves/users |
| Spark KV | Workbench / mock | Island save on some hosts |

Sensitive keys (profiles, family rooms, backups, analytics, auth) are listed in `SENSITIVE_LOCAL_KEYS` and encrypted after boot.

## Tomorrow (when userbase needs sync)

Recommended path (pick one; keep `UserDatabase` interface):

1. **Cloudflare Workers + D1 / Durable Objects** — fits static frontends, edge auth
2. **Supabase** — Postgres + RLS + Auth
3. **Firebase Auth + Firestore** — fast mobile sync

Requirements for any remote DB:

- TLS only; no secrets in `VITE_*`
- Auth (OIDC / magic link / parent PIN)
- Server Zod validation of every write
- Per-user row encryption or envelope encryption
- Family Rooms become **server-issued join tokens**, not paste JSON
- Audit log + hard delete for PIPEDA/COPPA

Wire-up: `setUserDatabase(new RemoteUserDb(baseUrl))` after auth ships — Harbor UI unchanged.

## What Vite is

Vite is the **build/dev tool**, not a database. It bundles the SPA. Persistence is browser storage now, remote DB later.
