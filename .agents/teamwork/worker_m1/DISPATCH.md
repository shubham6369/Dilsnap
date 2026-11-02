## 2026-11-01T18:33:26Z
You are Worker Milestone 1 (Persistence & Database Sync).
Your working directory is: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m1\
The project root is: c:\Users\hp\Desktop\dilsnap
ORIGINAL_REQUEST.md is at: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md is at: c:\Users\hp\Desktop\dilsnap\PROJECT.md
SCOPE.md is at: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\sub_orch_m1\SCOPE.md
Explorer 1 handoff report is at: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\explorer_survey_1\handoff.md

MANDATORY FIRST STEP:
Read c:\Users\hp\Desktop\dilsnap\.agents\teamwork\ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_1/handoff.md before touching any code.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You own and may edit:
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\package.json
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\next.config.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\lib\firebaseAdmin.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\lib\firestoreSync.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\lib\store.ts
- Files in your working directory: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m1\
Do NOT edit any UI pages (under src/app/* except library code) or test files owned by other agents.

OBJECTIVE:
Implement 100% production-ready dual persistence across Vercel Blob and Cloud Firestore (`dilsnap-a72fb`):
1. Modernize `src/lib/firebaseAdmin.ts`:
   - Replace outdated v9 namespaced imports with modular `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth` compatible with `firebase-admin` v14.
   - Use `getApps()`, `initializeApp()`, `cert()`, `getFirestore()`, `getAuth()`.
   - Read service account from `dilsnap-admin/serviceAccountKey.json` with fallback to `process.env.FIREBASE_SERVICE_ACCOUNT`.
2. Dependencies:
   - Add `"@opentelemetry/api": "^1.9.0"` to `dilsnap-admin/package.json` dependencies and install.
   - Add `"firebase-admin"` to `serverExternalPackages` in `next.config.ts` if required for serverless bundling.
3. Create `src/lib/firestoreSync.ts`:
   - Implement resilient typed sync functions to write documents to Cloud Firestore (`dilsnap-a72fb`):
     - `syncHostToFirestore(host: Host)` -> collection `hosts`, doc `host.id`
     - `deleteHostFromFirestore(hostId: string)` -> doc `hostId`
     - `syncPackageToFirestore(pkg: CoinPackage)` -> collection `coinPackages`, doc `pkg.id`
     - `deletePackageFromFirestore(pkgId: string)` -> doc `pkgId`
     - `syncGiftToFirestore(gift: Gift)` -> collection `gifts`, doc `gift.id`
     - `deleteGiftFromFirestore(giftId: string)` -> doc `giftId`
     - `syncConfigToFirestore(config: SystemConfig)` -> collection `systemConfig`, doc `default`
     - `syncUserToFirestore(user: User)` -> collection `users`, doc `user.id`
     - `syncCallSessionToFirestore(session: CallSession)` -> collection `callSessions`, doc `session.id`
     - `syncWalletTxToFirestore(tx: WalletTransaction)` -> collection `walletTransactions`, doc `tx.id`
     - `syncPaymentOrderToFirestore(order: PaymentOrder)` -> collection `paymentOrders`, doc `order.id`
   - RESILIENCE REQUIREMENT: Wrap all Firestore calls in try/catch and log warnings/errors. If Firestore API returns 403 (e.g. API disabled in GCP) or network fails, it MUST NOT throw unhandled exceptions or break Vercel Blob persistence.
4. Integrate Dual Persistence in `src/lib/store.ts`:
   - Keep Vercel Blob JSON snapshotting in `persistState()`.
   - On mutations (`addHost`, `updateHost`, `deleteHost`, `addPackage`, `updatePackage`, `deletePackage`, `addGift`, `updateGift`, `deleteGift`, `updateConfig`, `updateUser`, `toggleUserBan`, `creditUserCoins`, `deductUserCoins`, `recordCallSession`), execute concurrent non-blocking dual-writes (`Promise.allSettled`).
5. Run Verification Commands:
   - Run `cd dilsnap-admin; npm run build` and ensure Next.js production build succeeds with 0 TypeScript and bundling errors!
   - Run `cd dilsnap-admin; npm test` and ensure all tests pass with 0 errors!
6. Document results and commands in `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m1\handoff.md`.
7. Notify the orchestrator via send_message when complete.
