# Threat model

## Assets

- Display names, Island progress, Family Room member names, learning analytics
- Optional GitHub email if Spark auth is used (minimize / encrypt)
- Simulated banking state (not real bank credentials)

## Trust boundaries

| Zone | Trust |
|------|-------|
| Browser JS (same origin) | **Hostile** if XSS lands — can call WebCrypto |
| localStorage disk dump | **Protected** by AES-GCM device vault for sensitive keys |
| Pasted Family Room / backup JSON | **Untrusted** — Zod + safe JSON + re-key on import |
| GitHub Pages CDN | Public static assets only |
| Future API/DB | Trusted only after auth + TLS + server-side validation |

## Controls (now)

1. **Device vault** — non-extractable AES-GCM key in IndexedDB; sensitive keys ciphertext in localStorage
2. **Safe JSON** — size/depth limits; reject `__proto__` / `constructor`
3. **Schema validation** — Family Rooms, progress backups
4. **CSP** (production build meta) — default-src self; no object/frame
5. **XSS hygiene** — no user strings via `innerHTML`; React text / `textContent`
6. **RBAC** — parents denied all-student access until verified links exist
7. **Hard wipe** — `eraseAllUserData()` clears dual stores + vault key

## Out of scope until backend

- Multi-device secret sync
- True Family Room auth (codes are local labels)
- Server-side RLS / KMS
- HTTP-only security headers (need Cloudflare/Workers in front of Pages)

## Honest limit

Client encryption **does not** stop XSS. CSP + validated imports + minimal DOM APIs reduce XSS risk; a future backend is required for multi-user secrecy.
