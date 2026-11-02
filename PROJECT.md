# Project: DilSnap Production-Ready Backend & Admin Panel

## Architecture
- **Framework**: Next.js 16 (App Router) with TypeScript and Tailwind CSS v4.
- **Client (Mobile)**: Flutter App in `lib/` communicating via REST endpoints `https://dilsnap-admin.vercel.app/api/*`.
- **Admin Panel**: Next.js application in `dilsnap-admin/` hosting admin pages and backend API routes.
- **Dual Persistence Architecture**:
  - **Storage Target 1 (Vercel Blob)**: JSON snapshot (`dilsnap_db.json`) for fast full-database cold start hydration and global backup.
  - **Storage Target 2 (Cloud Firestore)**: Firebase Admin SDK (`firebase-admin` v14) authenticated via `serviceAccountKey.json` (`dilsnap-a72fb`). Granular collections:
    - `hosts`: Host profiles, online status, pricing, bio, tags.
    - `coinPackages`: Coin purchase bundles, pricing, bonuses, active state.
    - `gifts`: Virtual gifts, coin costs, category, icons/animations.
    - `systemConfig`: Global config, maintenance mode, commission rates, notices.
    - `users`: User profiles, wallets, bans, device metadata.
    - `callSessions`: Real-time call records, duration, coin burn logs.
    - `walletTransactions`: Detailed credit/debit audit ledger.
    - `paymentOrders`: Cashfree payment order tracking.
  - **Resilient Dual-Sync**: Updates execute in in-memory state and trigger non-blocking concurrent sync (`Promise.allSettled`) to Vercel Blob and Cloud Firestore with graceful error logging so operational API uptime is preserved even under cloud permission or network failures.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Modern Firebase Admin SDK Config | Refactor `firebaseAdmin.ts` to use modular `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth` imports for v14 compatibility | M1 | survey_1, survey_2 |
| 2 | Add `@opentelemetry/api` dependency | Install missing dependency required by `@google-cloud/firestore` v9.4.0 | M1 | survey_1 |
| 3 | Cloud Firestore Sync Adapter | Create resilient Firestore synchronization layer for collections `hosts`, `coinPackages`, `gifts`, `systemConfig`, `users` | M1 | survey_1 |
| 4 | Dual Persistence in `store.ts` | Wire `store.ts` mutations to persist to both Vercel Blob and Cloud Firestore using `Promise.allSettled` | M1 | survey_1, survey_2 |
| 5 | Verify TypeScript Build (`npm run build`) | Ensure `npm run build` succeeds with 0 TypeScript and bundling errors | M1 | survey_1, survey_2, survey_3 |
| 6 | Fix `/api/config` HTTP methods | Add `POST` handler to `src/app/api/config/route.ts` matching Settings and Broadcast pages | M2 | survey_2, survey_3 |
| 7 | User Ban API (`/api/users/[id]`) | Implement `PATCH /api/users/[id]` route with dual persistence for user bans and profile updates | M2 | survey_2, survey_3 |
| 8 | Coin Packages CRUD API (`/api/packages/[id]`) | Implement `PATCH` and `DELETE` handlers for package editing and deletion | M2 | survey_2, survey_3 |
| 9 | Virtual Gifts CRUD API (`/api/gifts/[id]`) | Implement `PATCH` and `DELETE` handlers for gift editing and deletion | M2 | survey_2, survey_3 |
| 10 | Security & Validation Hardening | Add HMAC verification to Cashfree webhook and guards on wallet endpoints | M2 | survey_2 |
| 11 | Complete API Test Suite Coverage | Expand `test/routes.test.mjs` to test all 22+ API endpoints | M2 | survey_2 |
| 12 | Dedicated Analytics Page (`/analytics`) | Create `src/app/analytics/page.tsx` with revenue trends, call analytics, and host leaderboards | M3 | survey_3 |
| 13 | Dedicated Gifts Page (`/gifts`) | Create `src/app/gifts/page.tsx` with dedicated gifts management and CRUD actions | M3 | survey_3 |
| 14 | Navigation & Sidebar Update | Register `/analytics` and `/gifts` in `src/components/Sidebar.tsx` | M3 | survey_3 |
| 15 | Users Page Ban Persistence | Connect `users/page.tsx` ban button to `PATCH /api/users/[id]` with real state sync | M3 | survey_3 |
| 16 | Packages & Gifts Edit/Delete UI | Add Edit and Delete modals/buttons in `monetization/page.tsx` and `gifts/page.tsx` | M3 | survey_3 |
| 17 | UI Polish: Modern Toast & Modals | Replace browser-blocking `alert()` and `confirm()` with custom toasts and confirm dialogs | M3 | survey_3 |
| 18 | Dashboard Polish & Skeletons | Remove fake fallback numbers; add proper loading skeletons and empty states | M3 | survey_3 |
| 19 | Header Maintenance Sync | Fetch `/api/config` on Header mount to keep maintenance mode banner in sync | M3 | survey_3 |
| 20 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite verifying all user flows and backend endpoints | E2E | user_request |
| 21 | Final E2E Pass & Hardening | Pass 100% of E2E tests, zero errors on `npm test` and `npm run build` | M-Final | user_request |
| 22 | Git Commit & Push | Stage all changes, commit with detailed log, and push to main branch | M-Final | user_request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Independent opaque-box test suite for backend API routes and data contracts | none | DONE |
| M1 | Dual Persistence & Database Sync | Fix `firebaseAdmin.ts`, install `@opentelemetry/api`, wire dual persistence (Vercel Blob + Firestore `dilsnap-a72fb`), green `next build` | none | DONE |
| M2 | Backend API Routes & Tests | Add `POST /api/config`, `[id]` routes for users, packages, gifts, webhook security, 100% route tests | M1 | DONE |
| M3 | Admin Panel Pages & UI Polish | Dedicated `/analytics` & `/gifts`, edit/delete UI, persist user bans, toast/modals, loading skeletons | M2 | DONE |
| M-Final | Verification, Hardening & Git Push | 100% E2E test pass, zero error build & test validation, commit and push to main | E2E, M3 | PLANNED |

## Interface Contracts
### `store.ts` ↔ `firestoreSync.ts`
- Functions:
  - `syncHostToFirestore(host: Host): Promise<void>`
  - `syncPackageToFirestore(pkg: CoinPackage): Promise<void>`
  - `deletePackageFromFirestore(pkgId: string): Promise<void>`
  - `syncGiftToFirestore(gift: Gift): Promise<void>`
  - `deleteGiftFromFirestore(giftId: string): Promise<void>`
  - `syncConfigToFirestore(config: SystemConfig): Promise<void>`
  - `syncUserToFirestore(user: User): Promise<void>`
- Error contract: Functions catch all errors, log error details, and never throw uncaught exceptions to ensure dual persistence fault tolerance.

### Admin Frontend ↔ Backend API
- `PATCH /api/users/[id]`: Body: `{ isBanned?: boolean, ... }` -> Response: `{ success: true, user: User }`
- `POST /api/config`: Body: `Partial<SystemConfig>` -> Response: `{ success: true, config: SystemConfig }`
- `PATCH /api/packages/[id]`: Body: `Partial<CoinPackage>` -> Response: `{ success: true, package: CoinPackage }`
- `DELETE /api/packages/[id]`: Response: `{ success: true, id: string }`
- `PATCH /api/gifts/[id]`: Body: `Partial<Gift>` -> Response: `{ success: true, gift: Gift }`
- `DELETE /api/gifts/[id]`: Response: `{ success: true, id: string }`

## Code Layout
- `dilsnap-admin/src/lib/`:
  - `firebaseAdmin.ts`: Firebase Admin initialization with modular imports
  - `firestoreSync.ts`: Dual persistence synchronization helper
  - `store.ts`: In-memory + Vercel Blob + Firestore coordinator
  - `types.ts`: Data models and interface definitions
- `dilsnap-admin/src/app/api/`:
  - `config/route.ts`: GET, POST, PATCH
  - `users/route.ts`: GET
  - `users/[id]/route.ts`: GET, PATCH
  - `packages/route.ts`: GET, POST
  - `packages/[id]/route.ts`: GET, PATCH, DELETE
  - `gifts/route.ts`: GET, POST
  - `gifts/[id]/route.ts`: GET, PATCH, DELETE
- `dilsnap-admin/src/app/`:
  - `page.tsx`: Overview / Dashboard
  - `hosts/page.tsx`: Hosts management
  - `users/page.tsx`: Users & Wallets
  - `monetization/page.tsx`: Coin Packages
  - `gifts/page.tsx`: Dedicated Virtual Gifts management
  - `analytics/page.tsx`: Dedicated Analytics & Metrics
  - `settings/page.tsx`: System settings
  - `broadcast/page.tsx`: Broadcast notices
- `dilsnap-admin/src/components/`:
  - `Sidebar.tsx`: Navigation sidebar
  - `Header.tsx`: Admin header & maintenance indicator
  - `Toast.tsx`: Toast notifications
  - `ConfirmModal.tsx`: Styled confirmation modals
- `dilsnap-admin/test/`:
  - `backend.test.mjs`: Backend unit/integration tests
  - `routes.test.mjs`: API route tests
  - `e2e.test.mjs`: End-to-end opaque-box test suite
