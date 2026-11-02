# Progress Log - Explorer Survey 2 (API Routes & Backend Services)

Last visited: 2026-11-01T18:29:00Z

## Status
- [x] Read ORIGINAL_REQUEST.md
- [x] Initialize DISPATCH.md and BRIEFING.md
- [x] Discover repository structure & locate `dilsnap-admin`
- [x] Enumerate all files under `src/app/api/` (22 route files identified)
- [x] Analyze each route (methods, validation, params, responses, status codes)
- [x] Investigate auth/authorization mechanisms (middleware, tokens, sessions)
- [x] Inspect automated testing setup, test coverage, package.json scripts
- [x] Identify gaps, TODOs, mock data, security vulnerabilities
- [/] Compile detailed `analysis.md`
- [ ] Produce final `handoff.md` and message orchestrator

## Key Observations
- 22 API route endpoints under `src/app/api/`:
  - `analytics` (GET)
  - `auth/send-otp` (POST, OPTIONS)
  - `auth/verify-otp` (POST, OPTIONS)
  - `calls` (GET, OPTIONS)
  - `calls/start` (POST, OPTIONS)
  - `calls/pulse` (POST, OPTIONS)
  - `calls/end` (POST, OPTIONS)
  - `calls/terminate` (POST, OPTIONS)
  - `calls/signal` (GET, POST, OPTIONS)
  - `config` (GET, PATCH, OPTIONS) — CRITICAL: Settings & Broadcast pages send POST, which is missing (405)!
  - `gifts` (GET, POST, OPTIONS) — Missing PUT/PATCH/DELETE endpoints
  - `hosts` (GET, POST, OPTIONS)
  - `hosts/[id]` (GET, PATCH, DELETE, OPTIONS)
  - `packages` (GET, POST, OPTIONS) — Missing PUT/PATCH/DELETE endpoints
  - `payments/create-order` (POST, OPTIONS)
  - `payments/webhook` (POST, OPTIONS) — CRITICAL: No HMAC signature validation!
  - `user/profile` (GET, POST, PATCH, OPTIONS)
  - `users` (GET, OPTIONS)
  - `users/wallet` (POST, OPTIONS) — No auth check, open credit/debit
  - `wallet/balance` (GET, OPTIONS)
  - `wallet/credit` (POST, OPTIONS) — Unprotected coin credit
  - `wallet/deduct` (POST, OPTIONS)
- Test suite:
  - Custom runner via tsx: `node:assert/strict` in `test/backend.test.mjs` and `test/routes.test.mjs`
  - Passes 100% (24 assertions across 2 files)
  - Only 11 of 22 endpoints are covered in `routes.test.mjs` (50% endpoint coverage)
- Build failure (`npm run build`):
  - Fails during TypeScript check due to `src/lib/firebaseAdmin.ts` using legacy `import * as admin from 'firebase-admin'` incompatible with `firebase-admin` v14.
- Dual Persistence Gap:
  - `src/lib/store.ts` only writes to Vercel Blob and in-memory state; zero Firestore integration exists.
- Ban user action in Admin Panel (`src/app/users/page.tsx`):
  - Only toggles React state; no API endpoint exists to persist user bans.
