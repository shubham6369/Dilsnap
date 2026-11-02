# DilSnap Persistence & Database Layer Architecture Survey

**Investigator**: Survey Explorer 1 (Focus: Persistence & Database Layer)  
**Date**: 2026-11-01  
**Target Repository**: `dilsnap-admin` & DilSnap Backend Services  
**Firebase Project**: `dilsnap-a72fb`  
**Blob Storage**: `@vercel/blob` (`dilsnap_db.json`)  

---

## Executive Summary

The persistence architecture of DilSnap currently relies on an **in-memory database engine** with **asynchronous single-snapshot backups to Vercel Blob** (`dilsnap_db.json`). While the repository contains a valid Google Service Account key (`dilsnap-admin/serviceAccountKey.json`) and a `firebaseAdmin.ts` module for project `dilsnap-a72fb`, **Cloud Firestore is currently completely unhooked from the active application lifecycle**: `getFirestoreDb()` is never invoked, no collections exist or are written to, and three critical roadblocks prevent Firestore from functioning out of the box:
1. **TypeScript compilation failure**: `src/lib/firebaseAdmin.ts` uses legacy v9/v10 compat syntax incompatible with `firebase-admin` 14.5.0, causing `next build` to fail type checking with 11 errors.
2. **Missing runtime dependency**: `@google-cloud/firestore` 9.4.0 requires `@opentelemetry/api`, which is absent from `package.json` and `node_modules`, resulting in `Error: Cannot find module '@opentelemetry/api'` when importing firestore.
3. **Cloud API Status**: Live verification using OAuth JWT assertion confirms that the service account credentials are 100% valid (`OAuth 200 OK`), but Google Cloud reports: `"Cloud Firestore API has not been used in project dilsnap-a72fb before or it is disabled"`.

To achieve production-grade dual persistence/synchronization (writing to both Vercel Blob and Cloud Firestore `dilsnap-a72fb`) without risking downtime, the architecture must implement a **dual-write coordinator** with **resilient failure isolation (circuit-breaker / non-blocking writes)**.

---

## 1. Current Persistence Inventory & State Mapping

### 1.1 Where Data is Currently Saved

| Storage Layer | Current State | Target State | Notes |
|---|---|---|---|
| **In-Memory State (`state: DatabaseSchema`)** | Primary active state for all API routes (<2ms read/write). Pre-seeded with 6 hosts, 4 users, 5 packages, 6 gifts. | Retain as fast in-memory working cache and double-spending lock. | Located in `dilsnap-admin/src/lib/store.ts:289-315`. |
| **Vercel Blob (`dilsnap_db.json`)** | Single monolithic JSON file written via `put('dilsnap_db.json', ...)` when `process.env.BLOB_READ_WRITE_TOKEN` is set. | Retain as snapshot backup & cold-start hydration source. | Located in `dilsnap-admin/src/lib/store.ts:324-398`. |
| **Cloud Firestore (`dilsnap-a72fb`)** | **Completely inactive**. Helper defined in `src/lib/firebaseAdmin.ts` but never called. Zero writes performed. | **Active secondary persistent store** with typed document collections. | Target collections: `hosts`, `users`, `coinPackages`, `gifts`, `systemConfig`, `callSessions`, `walletTransactions`, `paymentOrders`. |
| **Local Filesystem** | `serviceAccountKey.json` exists in `dilsnap-admin/`. No JSON database saved to disk. | Retain for local dev; support `FIREBASE_SERVICE_ACCOUNT` env string for Vercel. | Service account is valid for project `dilsnap-a72fb`. |

---

### 1.2 Entity Models & Storage Analysis

#### Entity 1: Hosts (`Host`)
- **Model Definition**: `src/lib/types.ts:1-17`
  ```typescript
  export interface Host {
    id: string;
    name: string;
    age: number;
    gender: 'Female' | 'Male';
    avatarUrl: string;
    languages: string[];
    interests: string[];
    bio: string;
    coinRatePerMinute: number;
    isOnline: boolean;
    isInCall: boolean;
    isBanned: boolean;
    rating: number;
    totalCalls: number;
    joinedDate: string;
  }
  ```
- **Current Storage**: `state.hosts` array in `store.ts`. Pre-seeded with 6 hosts (`lst_101` to `lst_106`).
- **Store Operations**:
  - `store.getHosts({ gender, onlineOnly })` (`store.ts:428-437`)
  - `store.getHostById(id)` (`store.ts:439`)
  - `store.addHost(data)` (`store.ts:441-454`) -> generates ID `lst_${Date.now()}`, unshifts to array, calls `persistState()`
  - `store.updateHost(id, updates)` (`store.ts:456-462`) -> mutates item, calls `persistState()`
  - `store.deleteHost(id)` (`store.ts:464-470`) -> filters array, calls `persistState()`
- **API Endpoints**:
  - `GET /api/hosts` (`src/app/api/hosts/route.ts:9-17`)
  - `POST /api/hosts` (`src/app/api/hosts/route.ts:19-43`)
  - `GET /api/hosts/[id]` (`src/app/api/hosts/[id]/route.ts:9-20`)
  - `PATCH /api/hosts/[id]` (`src/app/api/hosts/[id]/route.ts:22-38`)
  - `DELETE /api/hosts/[id]` (`src/app/api/hosts/[id]/route.ts:40-51`)
- **Firestore Mapping**:
  - Collection: `hosts`
  - Document ID: `host.id` (e.g. `lst_101`)
  - Actions:
    * `addHost`: `db.collection('hosts').doc(host.id).set(host)`
    * `updateHost`: `db.collection('hosts').doc(id).set(updates, { merge: true })`
    * `deleteHost`: `db.collection('hosts').doc(id).delete()`

---

#### Entity 2: Coin Packages (`CoinPackage`)
- **Model Definition**: `src/lib/types.ts:91-98`
  ```typescript
  export interface CoinPackage {
    id: string;
    name: string;
    coins: number;
    bonusCoins: number;
    priceInr: number;
    isPopular?: boolean;
  }
  ```
- **Current Storage**: `state.coinPackages` array in `store.ts`. Pre-seeded with 5 packages (`pkg_starter`, `pkg_popular`, `pkg_value`, `pkg_vip`, `pkg_royalty`).
- **Store Operations**:
  - `store.getPackages()` (`store.ts:967`)
  - `store.addPackage(pkg)` (`store.ts:969-974`) -> ID `pkg_${Date.now()}`, calls `persistState()`
  - `store.updatePackage(id, updates)` (`store.ts:976-982`) -> calls `persistState()`
  - `store.deletePackage(id)` (`store.ts:984-988`) -> calls `persistState()`
- **API Endpoints**:
  - `GET /api/packages` (`src/app/api/packages/route.ts:9-13`)
  - `POST /api/packages` (`src/app/api/packages/route.ts:15-33`)
  - **MISSING ROUTE**: `src/app/api/packages/[id]/route.ts` is missing! Updating or deleting packages from the admin panel currently has no API handler.
- **Firestore Mapping**:
  - Collection: `coinPackages`
  - Document ID: `pkg.id` (e.g. `pkg_starter`)
  - Actions:
    * `addPackage`: `db.collection('coinPackages').doc(pkg.id).set(pkg)`
    * `updatePackage`: `db.collection('coinPackages').doc(id).set(updates, { merge: true })`
    * `deletePackage`: `db.collection('coinPackages').doc(id).delete()`

---

#### Entity 3: Virtual Gifts (`Gift`)
- **Model Definition**: `src/lib/types.ts:100-106`
  ```typescript
  export interface Gift {
    id: string;
    name: string;
    coinCost: number;
    assetPath: string;
    category: 'Popular' | 'Luxury' | 'Special';
  }
  ```
- **Current Storage**: `state.gifts` array in `store.ts`. Pre-seeded with 6 gifts (`gift_like`, `gift_heart`, `gift_box`, `gift_cake`, `gift_diamond`, `gift_crown`).
- **Store Operations**:
  - `store.getGifts()` (`store.ts:991`)
  - `store.addGift(gift)` (`store.ts:993-998`) -> ID `gift_${Date.now()}`, calls `persistState()`
  - `store.updateGift(id, updates)` (`store.ts:1000-1006`) -> calls `persistState()`
  - `store.deleteGift(id)` (`store.ts:1008-1012`) -> calls `persistState()`
- **API Endpoints**:
  - `GET /api/gifts` (`src/app/api/gifts/route.ts:9-13`)
  - `POST /api/gifts` (`src/app/api/gifts/route.ts:15-32`)
  - **MISSING ROUTE**: `src/app/api/gifts/[id]/route.ts` is missing! Updating or deleting gifts from admin panel has no API handler.
- **Firestore Mapping**:
  - Collection: `gifts`
  - Document ID: `gift.id` (e.g. `gift_like`)
  - Actions:
    * `addGift`: `db.collection('gifts').doc(gift.id).set(gift)`
    * `updateGift`: `db.collection('gifts').doc(id).set(updates, { merge: true })`
    * `deleteGift`: `db.collection('gifts').doc(id).delete()`

---

#### Entity 4: System Configurations (`AppConfig`)
- **Model Definition**: `src/lib/types.ts:108-123`
  ```typescript
  export interface AppConfig {
    appName: string;
    version: string;
    maintenanceMode: boolean;
    welcomeBonusCoins: number;
    minVideoCoinRate: number;
    minAudioCoinRate: number;
    cashfreeMode: 'TEST' | 'PROD';
    cashfreeAppId: string;
    broadcastNotice: {
      active: boolean;
      title: string;
      message: string;
      actionUrl?: string;
    };
  }
  ```
- **Current Storage**: `state.appConfig` in `store.ts:258-273`.
- **Store Operations**:
  - `store.getConfig()` (`store.ts:1015`)
  - `store.updateConfig(updates)` (`store.ts:1017-1021`) -> mutates config, calls `persistState()`
- **API Endpoints**:
  - `GET /api/config` (`src/app/api/config/route.ts:9-13`)
  - `PATCH /api/config` (`src/app/api/config/route.ts:15-24`)
  - **BUG IDENTIFIED**: Both `src/app/settings/page.tsx:42` and `src/app/broadcast/page.tsx:45` call `POST /api/config`. But `app/api/config/route.ts` only exports `GET` and `PATCH`. Calling `POST /api/config` results in `405 Method Not Allowed`. Adding `POST` to `route.ts` is required.
- **Firestore Mapping**:
  - Collection: `systemConfig`
  - Document ID: `appConfig` (or `global`)
  - Actions:
    * `updateConfig`: `db.collection('systemConfig').doc('appConfig').set(state.appConfig, { merge: true })`

---

#### Entity 5: Users (`User`)
- **Model Definition**: `src/lib/types.ts:19-34`
  ```typescript
  export interface User {
    id: string;
    name: string;
    phone: string;
    mobile: string;
    gender: string;
    avatarUrl: string;
    coins: number;
    coinBalance: number;
    totalCalls: number;
    totalSpentInr: number;
    isBanned: boolean;
    createdAt: string;
    joinedDate: string;
    token?: string;
  }
  ```
- **Current Storage**: `state.users` in `store.ts`. Pre-seeded with 4 users (`usr_001` to `usr_004`).
- **Store Operations**:
  - `store.getUsers()` (`store.ts:473`)
  - `store.getUserById(id)`, `store.getUserByPhone(phone)`, `store.findUser(idOrPhone)` (`store.ts:401-418, 475-479`)
  - `store.createUser(data)` (`store.ts:481-516`) -> ID `usr_${Date.now()}`, credits welcome bonus coins (default 120), creates initial `WalletTransaction`, calls `persistState()`
  - `store.updateUserProfile(idOrPhone, updates)` (`store.ts:518-536`) -> updates name, gender, avatar, phone, calls `persistState()`
  - `store.adjustUserCoins(id, delta)` (`store.ts:538-556`) -> clamps coins >= 0, creates admin adjustment `WalletTransaction`, calls `persistState()`
  - `store.toggleUserBan(id)` (`store.ts:558-564`) -> inverts `user.isBanned`, calls `persistState()`
  - `store.verifyOtp(phone, otp)` (`store.ts:587-614`) -> auto-provisions user via `store.createUser()` if user does not exist, assigns session token, calls `persistState()`
- **API Endpoints**:
  - `GET /api/users` (`src/app/api/users/route.ts:8-12`)
  - `POST /api/users/wallet` (`src/app/api/users/wallet/route.ts:9-38`) -> calls `store.adjustUserCoins`
  - `GET /api/user/profile` (`src/app/api/user/profile/route.ts:9-42`)
  - `POST /api/user/profile`, `PATCH /api/user/profile` (`src/app/api/user/profile/route.ts:44-82`)
  - **MISSING ROUTE**: There is currently no `PATCH /api/users/[id]` or `/api/users/ban` route. In `src/app/users/page.tsx:73-79`, `handleToggleUserBan` only toggles client state without making an API call, so ban states are lost on refresh.
- **Firestore Mapping**:
  - Collection: `users`
  - Document ID: `user.id` (e.g. `usr_...`)
  - Actions:
    * `createUser`: `db.collection('users').doc(user.id).set(user)`
    * `updateUserProfile`: `db.collection('users').doc(user.id).set(updates, { merge: true })`
    * `adjustUserCoins`: `db.collection('users').doc(user.id).update({ coins: user.coins, coinBalance: user.coinBalance })`
    * `toggleUserBan`: `db.collection('users').doc(user.id).update({ isBanned: user.isBanned })`

---

#### Entity 6: Ancillary Transactional Entities
- **Wallet Transactions (`WalletTransaction`)**:
  - Collection: `walletTransactions`
  - Document ID: `tx.id`
  - Generated on welcome bonus, manual admin adjustment, call pulse deduction, payment purchase credit.
- **Call Sessions (`CallSession`) & Active Calls (`ActiveCall`)**:
  - Collection: `callSessions`
  - Document ID: `session.id`
  - Updated on `startCallSession`, `pulseCallSession`, `endCallSession`, `terminateCall`.
- **Payment Orders (`PaymentOrder`)**:
  - Collection: `paymentOrders`
  - Document ID: `order.orderId`
  - Updated on `createPaymentOrder` and `processPaymentWebhook`.

---

## 2. Root Cause Analysis of Discovered Technical Roadblocks

### Roadblock 1: TypeScript Compilation Failure in `firebaseAdmin.ts`
- **Observed Error**:
  ```
  src/lib/firebaseAdmin.ts(5,24): error TS2724: '".../firebase-admin/lib/index"' has no exported member named 'app'. Did you mean 'App'?
  src/lib/firebaseAdmin.ts(7,43): error TS2724: '".../firebase-admin/lib/index"' has no exported member named 'app'. Did you mean 'App'?
  src/lib/firebaseAdmin.ts(8,13): error TS2339: Property 'apps' does not exist on type...
  src/lib/firebaseAdmin.ts(17,27): error TS2339: Property 'credential' does not exist on type...
  src/lib/firebaseAdmin.ts(43,41): error TS2694: Namespace '.../firebase-admin/lib/index' has no exported member 'firestore'.
  src/lib/firebaseAdmin.ts(45,16): error TS2339: Property 'firestore' does not exist on type...
  src/lib/firebaseAdmin.ts(48,42): error TS2694: Namespace '.../firebase-admin/lib/index' has no exported member 'auth'.
  src/lib/firebaseAdmin.ts(50,16): error TS2339: Property 'auth' does not exist on type...
  Failed to type check.
  ```
- **Root Cause**: `dilsnap-admin/package.json` installs `"firebase-admin": "^14.5.0"`. In `firebase-admin` v12/13/14, subpath exports (`firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth`) replaced the v8/v9 namespaced properties. The file `src/lib/firebaseAdmin.ts` was written using legacy `admin.apps` and `admin.credential.cert`.
- **Required Fix**:
  Import from modular entry points:
  ```typescript
  import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
  import { getFirestore, Firestore } from 'firebase-admin/firestore';
  import { getAuth, Auth } from 'firebase-admin/auth';
  ```

---

### Roadblock 2: Missing Runtime Dependency `@opentelemetry/api`
- **Observed Error**:
  ```
  Error: Cannot find module '@opentelemetry/api'
  Require stack:
  - ...\node_modules\@google-cloud\firestore\build\src\telemetry\enabled-trace-util.js
  - ...\node_modules\@google-cloud\firestore\build\src\index.js
  - ...\node_modules\firebase-admin\lib\firestore\index.js
  ```
- **Root Cause**: In `dilsnap-admin/node_modules/@google-cloud/firestore/package.json`, `@opentelemetry/api` is listed as a dependency (`"^1.9.0"`), but npm did not install it into `dilsnap-admin/node_modules/` or include it in `package.json`.
- **Required Fix**:
  Add `"@opentelemetry/api": "^1.9.0"` to `dilsnap-admin/package.json` dependencies and run `npm install`.

---

### Roadblock 3: Google Cloud Firestore API Disabled in Project `dilsnap-a72fb`
- **Observed Result**:
  - Live OAuth test successfully signed RSA-SHA256 JWT using `serviceAccountKey.json` and received valid token: `Google OAuth Token Status: 200`, `expires_in: 3599`.
  - Calling Google Cloud Firestore API returned:
    ```json
    {
      "error": {
        "code": 403,
        "message": "Cloud Firestore API has not been used in project dilsnap-a72fb before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=dilsnap-a72fb then retry.",
        "status": "PERMISSION_DENIED"
      }
    }
    ```
- **Impact & Required Architectural Safeguard**:
  If code blindly awaits `db.collection(...).set(...)`, all API calls will throw 403 errors and fail the entire request!
  The dual-persistence system **MUST** wrap Firestore operations with non-blocking, fault-tolerant logic:
  - When Firestore is unavailable (disabled API, network timeout, offline test runner), log a structured warning and continue with in-memory + Vercel Blob persistence.
  - The user must also be notified to click the activation URL in the Google Developers Console: `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=dilsnap-a72fb`.

---

## 3. Dual Persistence Architecture & Synchronization Design

### 3.1 Architecture Overview

```
                      +---------------------------------------+
                      |       Next.js API & Admin Panel       |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         In-Memory Store (Cache)       |
                      |   - Immediate Mutation                |
                      |   - Atomic Balance / Double-Spend Lock|
                      +---------------------------------------+
                                          |
                        +-----------------+-----------------+
                        | (Promise.allSettled - Resilient)  |
                        v                                   v
        +-------------------------------+   +-------------------------------+
        |       Target 1: Vercel Blob   |   |   Target 2: Cloud Firestore   |
        |    File: 'dilsnap_db.json'    |   |     Project: 'dilsnap-a72fb'  |
        |  - Fast monolithic snapshot   |   |  - Granular collections:      |
        |  - Used for rapid cold-start  |   |    hosts, users, packages,    |
        |    hydration in serverless    |   |    gifts, config, calls, tx   |
        +-------------------------------+   +-------------------------------+
```

### 3.2 Dual-Persistence Implementation Blueprint

To cleanly integrate Firestore without destabilizing the existing 24 unit/route tests:

1. **Fix `src/lib/firebaseAdmin.ts`**:
   - Modernize imports for `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/auth`.
   - Check credentials in multiple locations:
     * `process.env.FIREBASE_SERVICE_ACCOUNT` (JSON string)
     * `process.env.FIREBASE_SERVICE_ACCOUNT_BASE64` (Base64 decoded JSON string)
     * `path.join(process.cwd(), 'serviceAccountKey.json')`
     * `path.join(process.cwd(), 'dilsnap-admin', 'serviceAccountKey.json')`
   - Cache `firestoreDb` instance. Return `null` safely if credentials cannot be parsed or if initialization fails.

2. **Create `src/lib/firestoreSync.ts`**:
   - Encapsulates all Firestore collection interactions.
   - Methods:
     * `syncHost(host: Host)`
     * `deleteHostDoc(hostId: string)`
     * `syncUser(user: User)`
     * `syncPackage(pkg: CoinPackage)`
     * `deletePackageDoc(pkgId: string)`
     * `syncGift(gift: Gift)`
     * `deleteGiftDoc(giftId: string)`
     * `syncConfig(config: AppConfig)`
     * `syncCallSession(session: CallSession)`
     * `syncTransaction(tx: WalletTransaction)`
     * `syncPaymentOrder(order: PaymentOrder)`
     * `hydrateFromFirestore(): Promise<Partial<DatabaseSchema> | null>`
   - Each method wraps `db.collection(...).doc(...).set(...)` in `try...catch`.
   - If an error occurs (such as `SERVICE_DISABLED` or network offline), log a concise warning: `[FirestoreSync] Write to collection 'X' skipped: <error message>`. Never throw an uncaught rejection.

3. **Update `src/lib/store.ts`**:
   - In `persistState()`:
     * Write snapshot to Vercel Blob (`put('dilsnap_db.json', ...)`).
     * Call `firestoreSync` for affected entities, or bulk-sync all dirty records.
     * Execute both via `Promise.allSettled`.
   - In `hydrateState(force = false)`:
     * 1st Priority: Read Vercel Blob snapshot.
     * 2nd Priority: If Vercel Blob is empty or unavailable, call `firestoreSync.hydrateFromFirestore()`.
     * 3rd Priority: Fallback to pre-seeded `defaultHosts`, `defaultUsers`, etc.

4. **Update `next.config.ts`**:
   - Add `"firebase-admin"` to `serverExternalPackages`:
     ```typescript
     serverExternalPackages: ["@vercel/blob", "firebase-admin"],
     ```

5. **Fix API Route Discrepancies**:
   - `src/app/api/config/route.ts`: Add `POST` handler that forwards to `PATCH` / `store.updateConfig(body)` to fix `405 Method Not Allowed` from Settings and Broadcast pages.
   - `src/app/api/users/[id]/route.ts`: Create route supporting `PATCH` for user updates and ban toggle (`store.toggleUserBan`), and wire `src/app/users/page.tsx:73-79` to call it.
   - `src/app/api/packages/[id]/route.ts`: Create route supporting `PATCH` and `DELETE` for packages.
   - `src/app/api/gifts/[id]/route.ts`: Create route supporting `PATCH` and `DELETE` for gifts.

---

## 4. Verification & Testing Strategy

1. **Unit & Route Tests**:
   - Run `npm test` in `dilsnap-admin` to verify existing 24 tests remain 100% green.
   - Add specific tests in `test/backend.test.mjs` verifying dual persistence calls and offline resilience.
2. **Build Verification**:
   - Run `npm run build` in `dilsnap-admin` to confirm Next.js 16 webpack compilation and TypeScript type checking pass with 0 errors.
3. **Firestore Mock/Live Verification**:
   - Test Firestore synchronization with mock/live database checks.
