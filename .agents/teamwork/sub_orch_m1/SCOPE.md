# Scope: Milestone 1 — Dual Persistence & Database Sync

## Architecture
- Dual persistence across Vercel Blob and Cloud Firestore (`dilsnap-a72fb`) via `firebase-admin` using `serviceAccountKey.json`.
- Modern modular imports (`firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth`) for `firebase-admin` v14.
- Runtime support for `@opentelemetry/api`.
- Resilient non-blocking synchronization (`Promise.allSettled`) in `store.ts` and `firestoreSync.ts` for:
  - `hosts`
  - `coinPackages`
  - `gifts`
  - `systemConfig`
  - `users`
  - `callSessions`, `walletTransactions`, `paymentOrders`
- Clean `npm run build` with 0 TypeScript/compilation errors.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Modern Firebase Admin SDK Config | Refactor `firebaseAdmin.ts` to use modular `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth` imports for v14 compatibility | M1 | survey_1, survey_2 |
| 2 | Add `@opentelemetry/api` dependency | Install missing dependency required by `@google-cloud/firestore` v9.4.0 | M1 | survey_1 |
| 3 | Cloud Firestore Sync Adapter | Create resilient Firestore synchronization layer for collections `hosts`, `coinPackages`, `gifts`, `systemConfig`, `users` | M1 | survey_1 |
| 4 | Dual Persistence in `store.ts` | Wire `store.ts` mutations to persist to both Vercel Blob and Cloud Firestore using `Promise.allSettled` | M1 | survey_1, survey_2 |
| 5 | Verify TypeScript Build (`npm run build`) | Ensure `npm run build` succeeds with 0 TypeScript and bundling errors | M1 | survey_1, survey_2, survey_3 |

## Interface Contracts
- `firestoreSync.ts`:
  - `syncHostToFirestore(host: Host): Promise<void>`
  - `syncPackageToFirestore(pkg: CoinPackage): Promise<void>`
  - `deletePackageFromFirestore(pkgId: string): Promise<void>`
  - `syncGiftToFirestore(gift: Gift): Promise<void>`
  - `deleteGiftFromFirestore(giftId: string): Promise<void>`
  - `syncConfigToFirestore(config: SystemConfig): Promise<void>`
  - `syncUserToFirestore(user: User): Promise<void>`
- `store.ts`:
  - Calls `persistState()` (Vercel Blob) and `firestoreSync` methods concurrently on all create/update/delete operations.
  - Safe error handling: any Firestore API permission error (e.g. 403 SERVICE_DISABLED) or network error is logged and does not crash the request or block Blob persistence.
