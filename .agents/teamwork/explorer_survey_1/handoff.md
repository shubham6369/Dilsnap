# Handoff Report — Survey Explorer 1 (Persistence & Database Layer)

## 1. Observation

1. **Current Storage Implementation (`dilsnap-admin/src/lib/store.ts`)**:
   - `store.ts` manages a monolithic in-memory state object (`state: DatabaseSchema`, lines 289–315) pre-seeded with 6 hosts (`lst_101` to `lst_106`), 4 users (`usr_001` to `usr_004`), 5 coin packages, and 6 virtual gifts.
   - Persistence is handled strictly via `persistState()` (`store.ts:324–339`), which uploads a JSON snapshot to Vercel Blob:
     ```typescript
     await put('dilsnap_db.json', JSON.stringify(state), {
       access: 'public',
       addRandomSuffix: false,
       allowOverwrite: true,
     });
     ```
   - Hydration (`store.ts:341–398`) queries `list({ prefix: 'dilsnap_db.json' })` and fetches the remote blob.
   - If `process.env.BLOB_READ_WRITE_TOKEN` is unset, `persistState()` returns without doing anything and hydration uses in-memory seeds.

2. **Cloud Firestore Status (`dilsnap-admin/src/lib/firebaseAdmin.ts`)**:
   - `dilsnap-admin/serviceAccountKey.json` exists and is configured for project `dilsnap-a72fb` with client email `firebase-adminsdk-fbsvc@dilsnap-a72fb.iam.gserviceaccount.com`.
   - `src/lib/firebaseAdmin.ts` defines `getFirebaseAdmin()`, `getFirestoreDb()`, and `getFirebaseAuth()`.
   - **Grep check**: `grep_search` across `dilsnap-admin` confirmed `getFirestoreDb` is called in `firebaseAdmin.ts` line 43, and nowhere else in the codebase. Cloud Firestore is not wired to `store.ts` or any API route.

3. **Next.js TypeScript Build Error (`npm run build`)**:
   - Running `cd dilsnap-admin && npm run build` exited with code 1:
     ```
     src/lib/firebaseAdmin.ts(5,24): error TS2724: '".../firebase-admin/lib/index"' has no exported member named 'app'. Did you mean 'App'?
     src/lib/firebaseAdmin.ts(7,43): error TS2724: '".../firebase-admin/lib/index"' has no exported member named 'app'. Did you mean 'App'?
     src/lib/firebaseAdmin.ts(8,13): error TS2339: Property 'apps' does not exist on type...
     src/lib/firebaseAdmin.ts(17,27): error TS2339: Property 'credential' does not exist on type...
     src/lib/firebaseAdmin.ts(43,41): error TS2694: Namespace '.../firebase-admin/lib/index' has no exported member 'firestore'.
     src/lib/firebaseAdmin.ts(45,16): error TS2339: Property 'firestore' does not exist on type...
     Failed to type check.
     ```
   - `package.json` installs `"firebase-admin": "^14.5.0"`. `firebaseAdmin.ts` uses legacy v9 namespaced syntax rather than modular v14 subpath imports (`firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth`).

4. **Missing Runtime Dependency (`@opentelemetry/api`)**:
   - Running node script importing `firebase-admin/firestore` produced verbatim error:
     ```
     Error: Cannot find module '@opentelemetry/api'
     Require stack:
     - C:\Users\hp\Desktop\dilsnap\dilsnap-admin\node_modules\@google-cloud\firestore\build\src\telemetry\enabled-trace-util.js
     - C:\Users\hp\Desktop\dilsnap\dilsnap-admin\node_modules\@google-cloud\firestore\build\src\index.js
     - C:\Users\hp\Desktop\dilsnap\dilsnap-admin\node_modules\firebase-admin\lib\firestore\index.js
     ```
   - `@google-cloud/firestore` v9.4.0 lists `"@opentelemetry/api": "^1.9.0"` in its dependencies, but it is absent from `dilsnap-admin/package.json` and `node_modules`.

5. **Google Cloud Service Account & Firestore API Status**:
   - Live RSA-SHA256 OAuth2 assertion test against Google OAuth endpoint (`https://oauth2.googleapis.com/token`) succeeded:
     `Google OAuth Token Status: 200`, `access_token` granted (`expires_in: 3599`).
   - Querying Google Cloud Firestore API endpoint (`https://firestore.googleapis.com/v1/projects/dilsnap-a72fb/databases`) returned HTTP 403:
     ```json
     {
       "error": {
         "code": 403,
         "message": "Cloud Firestore API has not been used in project dilsnap-a72fb before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=dilsnap-a72fb then retry.",
         "status": "PERMISSION_DENIED"
       }
     }
     ```

6. **API Route Method Mismatch & Missing Routes**:
   - `src/app/api/config/route.ts` only exports `GET` and `PATCH`. However, both `src/app/settings/page.tsx:42` and `src/app/broadcast/page.tsx:45` call `POST /api/config`, resulting in `405 Method Not Allowed`.
   - `src/app/api/users/[id]/route.ts`, `src/app/api/packages/[id]/route.ts`, and `src/app/api/gifts/[id]/route.ts` do not exist. In `src/app/users/page.tsx:73-79`, `handleToggleUserBan` only toggles client React state.

7. **Existing Tests**:
   - `npm test` in `dilsnap-admin` executes both `test/backend.test.mjs` (10 tests) and `test/routes.test.mjs` (14 assertions). Both passed 100%.

---

## 2. Logic Chain

1. From Observation 1, data is only persisted to Vercel Blob as a single monolithic JSON snapshot `dilsnap_db.json`, while API handlers query and mutate in-memory state in `store.ts`.
2. From Observation 2, `firebase-admin` is installed and a valid credential key exists for `dilsnap-a72fb`, but Firestore is never read from or written to by `store.ts`.
3. From Observation 3 and 4, simply writing `const db = getFirestoreDb(); db.collection('hosts').set(...)` will immediately fail:
   - TypeScript build fails because `firebaseAdmin.ts` uses legacy v9 namespaced API with `firebase-admin` v14.
   - Node runtime fails because `@opentelemetry/api` is missing in `node_modules`.
4. From Observation 5, even when authenticated with Google Cloud, Firestore API is currently disabled in GCP project `dilsnap-a72fb`. Therefore, any direct synchronous Firestore write that lacks resilient failure handling would throw an error and crash the entire HTTP route handler.
5. Therefore, dual persistence must be implemented with **failure isolation (circuit breaker / non-blocking writes)**:
   - Write to in-memory state (immediate).
   - Concurrently write to Vercel Blob (`dilsnap_db.json`) and Cloud Firestore (`dilsnap-a72fb`) via `Promise.allSettled`.
   - If Firestore returns `PERMISSION_DENIED / SERVICE_DISABLED` or network fails, log the error and gracefully proceed without breaking user requests or Vercel Blob persistence.
6. From Observation 6, fixing `POST /api/config` and adding missing `[id]` route handlers is necessary for settings, broadcast notices, user bans, package edits, and gift edits to persist.

---

## 3. Caveats

- The Cloud Firestore API in project `dilsnap-a72fb` requires a one-click enablement by the project owner in Google Cloud Console (`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=dilsnap-a72fb`). Our dual-persistence architecture is designed to handle this gracefully so the application continues to run flawlessly via Vercel Blob and in-memory storage while logging a clear warning until enabled.
- The Flutter mobile app (`lib/`) communicates with the backend via REST API (`https://dilsnap-admin.vercel.app/api/*`) rather than direct client-side Firestore SDK, meaning backend dual-persistence will immediately sync with the mobile app without requiring client app code changes.

---

## 4. Conclusion

1. **Dual Persistence Design**:
   - **Target A (Vercel Blob)**: Retain `put('dilsnap_db.json', JSON.stringify(state))` for fast full-database snapshotting and cold-start hydration.
   - **Target B (Cloud Firestore `dilsnap-a72fb`)**: Write granular document updates to collections `hosts`, `coinPackages`, `gifts`, `systemConfig`, `users`, `callSessions`, `walletTransactions`, `paymentOrders`.
2. **Prerequisites for Implementation**:
   - Fix `src/lib/firebaseAdmin.ts` imports to modular `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth`.
   - Add `"@opentelemetry/api": "^1.9.0"` to `dilsnap-admin/package.json` and run `npm install`.
   - Add `"firebase-admin"` to `serverExternalPackages` in `next.config.ts`.
   - Add `POST` handler to `src/app/api/config/route.ts` to match frontend Settings and Broadcast pages.
   - Create `src/app/api/users/[id]/route.ts` for ban/profile updates.
   - Create `src/app/api/packages/[id]/route.ts` and `src/app/api/gifts/[id]/route.ts` for edit/delete operations.
   - Implement `src/lib/firestoreSync.ts` with `try/catch` resilient writes to ensure 100% uptime even if Cloud Firestore API is temporarily disabled.

---

## 5. Verification Method

To independently verify all findings and test subsequent implementation:

1. **Verify Existing Tests**:
   ```pwsh
   cd c:\Users\hp\Desktop\dilsnap\dilsnap-admin
   npm test
   ```
   *Expected*: All 24 integration and route tests pass.

2. **Verify TypeScript Compilation & Next.js Build**:
   ```pwsh
   cd c:\Users\hp\Desktop\dilsnap\dilsnap-admin
   npm run build
   ```
   *Expected*: Next.js build succeeds with 0 type-check errors.

3. **Verify Google Cloud Service Account Authentication**:
   ```pwsh
   cd c:\Users\hp\Desktop\dilsnap\dilsnap-admin
   node -e "const sa = JSON.parse(require('fs').readFileSync('serviceAccountKey.json')); console.log(sa.project_id);"
   ```
   *Expected*: Prints `dilsnap-a72fb`.
