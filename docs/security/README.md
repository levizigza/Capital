# Capital Security

Capital is a **Vite SPA on GitHub Pages**. There is **no private server database today**. Security is **local-first encryption + validated imports + CSP + hard wipe**, with a DB adapter ready for a future authenticated backend.

| Doc | Purpose |
|-----|---------|
| [threat-model.md](./threat-model.md) | What we protect against (and what we cannot) |
| [data-and-database.md](./data-and-database.md) | Storage map + future DB plan |
| [runbook.md](./runbook.md) | Wipe, CSP, incidents |

## Code

- `src/security/` — vault, secure store, schemas, erase, DB adapter
- Production CSP injected at build (`vite.config.ts` → `capitalCspPlugin`)
- Console: `__CAPITAL_SECURITY__.eraseAllUserData()`

Legacy claims in root `SECURITY.md` are outdated; this folder is the source of truth.
