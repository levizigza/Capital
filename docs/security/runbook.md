# Security runbook

## Wipe all user data

```js
await window.__CAPITAL_SECURITY__.eraseAllUserData()
```

Or Settings → clear data (uses the same path).

## Verify encryption

1. Play / create a Family Room
2. DevTools → Application → Local Storage
3. Sensitive keys should start with `capital_enc_v1:` after first boot migration

## CSP break after deploy

CSP is build-only. If a CDN font/script fails:

1. Check browser console for CSP violations
2. Adjust `capitalCspPlugin` in `vite.config.ts`
3. If enabling `VITE_TELEMETRY_URL`, add that origin to `connect-src`

## Suspected XSS / poisoned SW

1. `VITE_KILL_SW=1` rebuild or unregister SW
2. Hard wipe via `__CAPITAL_SECURITY__`
3. Redeploy clean Pages build

## Parent/teacher data access

Until verified parent↔child links exist, `canAccessStudentData(..., 'parent', ...)` returns **false**. Do not re-enable blanket parent access.
