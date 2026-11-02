# DilSnap Backend Services & API Routes Deep-Dive Analysis

Date: 2026-11-01  
Explorer: Survey Explorer 2 (Focus: API Routes & Backend Services)  
Target Directory: `c:\Users\hp\Desktop\dilsnap\dilsnap-admin`  

---

## 1. Executive Summary

The DilSnap backend is implemented as a **Next.js 16.4.3 App Router** application located in `dilsnap-admin`. It provides 22 HTTP REST/signaling endpoints under `src/app/api/` serving both the Next.js Admin Panel and the Flutter mobile client (`dilsnap`).

### Key Findings at a Glance:
1. **Endpoint Inventory**: Exactly 22 `route.ts` files exist under `src/app/api/`. All implement CORS via `@/lib/cors`.
2. **Persistence Architecture**: Persistence is currently centralized in `src/lib/store.ts` via an in-memory database snapshot (`state: DatabaseSchema`) backed asynchronously by Vercel Blob (`dilsnap_db.json`). **No Cloud Firestore persistence exists** in `store.ts` despite the existence of `serviceAccountKey.json` and `src/lib/firebaseAdmin.ts`.
3. **Build Status**: `npm run build` **FAILS** due to 11 TypeScript compilation errors in `src/lib/firebaseAdmin.ts` caused by incompatible namespace imports with `firebase-admin` v14.5.0 (`import * as admin from 'firebase-admin'`).
4. **Test Suite Status**: `npm test` runs a custom Node.js runner (`npx tsx`) executing `test/backend.test.mjs` and `test/routes.test.mjs`. All 24 assertions pass (100%), but only 11 of the 22 route endpoints are tested (50% route coverage). No Jest, Vitest, or Playwright framework is configured.
5. **Lint Status**: `npm run lint` fails with 18 errors and 44 warnings, exclusively in frontend UI pages/components (`src/app/**/page.tsx` React hook violations) and test files. The `src/app/api/**` route handlers have zero lint errors.
6. **Critical Functional Discrepancies**:
   - `src/app/settings/page.tsx` and `src/app/broadcast/page.tsx` issue `POST /api/config`, but `src/app/api/config/route.ts` only exports `GET` and `PATCH`. This causes `405 Method Not Allowed` when admins save settings or broadcast notices.
   - User suspension in `src/app/users/page.tsx` only mutates local component state and does not call any API route, meaning user bans are never persisted.
   - Coin packages and gifts have no update or delete API endpoints (`/api/packages/[id]` and `/api/gifts/[id]` are missing), even though `store.updatePackage`, `store.deletePackage`, `store.updateGift`, and `store.deleteGift` are implemented in `store.ts`.
7. **Security & Vulnerability Analysis**:
   - Zero authentication or admin authorization checks exist on any admin endpoints (`/api/users`, `/api/users/wallet`, `/api/config`, `/api/calls/terminate`, `/api/hosts`).
   - `/api/wallet/credit` and `/api/payments/webhook` lack authorization and HMAC signature verification, allowing unauthorized arbitrary coin additions.
   - `/api/auth/verify-otp` issues opaque strings (`tok_${user.id}_${Date.now()}`) without cryptographic signature or expiration verification.
   - `/api/calls/signal` uses a process-local in-memory Map (`signalQueue`), which will drop WebRTC signals across multi-instance serverless deployments.

---

## 2. Comprehensive Endpoint Catalog (All 22 Routes)

| # | Route | Methods | Path Parameters | Query Parameters | Request Body Shape | Response Status & Shape | Auth Protection |
|---|---|---|---|---|---|---|---|
| 1 | `/api/analytics` | `OPTIONS`, `GET` | None | None | None | `200`: `{ success: true, data: AnalyticsMetrics }` | None (Public) |
| 2 | `/api/auth/send-otp` | `OPTIONS`, `POST` | None | None | `{ phone?: string, mobile?: string, phoneNumber?: string }` | `200`: `{ success: true, message: string, data: { phone, otp, expiresInSeconds: 300 } }`<br>`400`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None (Public) |
| 3 | `/api/auth/verify-otp` | `OPTIONS`, `POST` | None | None | `{ phone?: string, mobile?: string, phoneNumber?: string, otp?: string, code?: string }` | `200`: `{ success: true, message: string, data: { user: User, token: string } }`<br>`400`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None (Public) |
| 4 | `/api/calls` | `OPTIONS`, `GET` | None | None | None | `200`: `{ success: true, data: { activeCalls: ActiveCall[], recentHistory: ActiveCall[], activeCount: number } }` | None (Public) |
| 5 | `/api/calls/start` | `OPTIONS`, `POST` | None | None | `{ userId?: string, phone?: string, hostId: string, callType?: 'video' \| 'audio' }` | `200`: `{ success: true, message: string, data: { session: CallSession, sessionId: string, ratePerMinute: number } }`<br>`400`: `{ success: false, error: string, requiredCoins?: number, currentBalance?: number }`<br>`500`: `{ success: false, error: string }` | None (UserId passed in body) |
| 6 | `/api/calls/pulse` | `OPTIONS`, `POST` | None | None | `{ sessionId?: string, callId?: string }` | `200`: `{ success: true, message: string, data: { session: CallSession, remainingCoins: number } }`<br>`400`: `{ success: false, error: string }`<br>`402`: `{ success: false, error: string, status: 'insufficient_coins', remainingCoins: number }`<br>`500`: `{ success: false, error: string }` | None |
| 7 | `/api/calls/end` | `OPTIONS`, `POST` | None | None | `{ sessionId?: string, callId?: string, durationSeconds?: number, coinsDeducted?: number }` | `200`: `{ success: true, message: string, data: { session: CallSession } }`<br>`400`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None |
| 8 | `/api/calls/terminate` | `OPTIONS`, `POST` | None | None | `{ callId: string }` | `200`: `{ success: true, message: string, data: ActiveCall }`<br>`400`: `{ success: false, error: string }`<br>`404`: `{ success: false, error: string }` | None (Admin endpoint unprotected) |
| 9 | `/api/calls/signal` | `OPTIONS`, `GET`, `POST` | None | `GET`: `sessionId` (req), `peerId`/`targetId` (opt) | `POST`: `{ sessionId: string, senderId?: string, targetId?: string, type: 'offer' \| 'answer' \| 'candidate', payload: unknown }` | `GET 200`: `{ success: true, data: SignalMessage[] }`<br>`POST 200`: `{ success: true, message: string, data: SignalMessage }`<br>`400`: `{ success: false, error: string }` | None |
| 10 | `/api/config` | `OPTIONS`, `GET`, `PATCH` | None | None | `PATCH`: `Partial<AppConfig>` | `GET 200`: `{ success: true, data: AppConfig }`<br>`PATCH 200`: `{ success: true, message: string, data: AppConfig }`<br>`400`: `{ success: false, error: string }` | None (Unprotected config modification) |
| 11 | `/api/gifts` | `OPTIONS`, `GET`, `POST` | None | None | `POST`: `{ name: string, coinCost: number, assetPath: string, category?: 'Popular' \| 'Luxury' \| 'Special' }` | `GET 200`: `{ success: true, count: number, data: Gift[] }`<br>`POST 201`: `{ success: true, message: string, data: Gift }`<br>`400`: `{ success: false, error: string }` | None |
| 12 | `/api/hosts` | `OPTIONS`, `GET`, `POST` | None | `GET`: `gender?: string`, `online?: 'true'` | `POST`: `{ name: string, avatarUrl: string, age?: number, gender?: 'Female' \| 'Male', languages?: string[] \| string, interests?: string[] \| string, bio?: string, coinRatePerMinute?: number, isOnline?: boolean }` | `GET 200`: `{ success: true, count: number, data: Host[] }`<br>`POST 201`: `{ success: true, message: string, data: Host }`<br>`400`: `{ success: false, error: string }` | None |
| 13 | `/api/hosts/[id]` | `OPTIONS`, `GET`, `PATCH`, `DELETE` | `id: string` | None | `PATCH`: `Partial<Host>` | `GET 200`: `{ success: true, data: Host }`<br>`PATCH 200`: `{ success: true, message: string, data: Host }`<br>`DELETE 200`: `{ success: true, message: string }`<br>`404`: `{ success: false, error: string }`<br>`400`: `{ success: false, error: string }` | None |
| 14 | `/api/packages` | `OPTIONS`, `GET`, `POST` | None | None | `POST`: `{ name: string, coins: number, priceInr: number, bonusCoins?: number, isPopular?: boolean }` | `GET 200`: `{ success: true, count: number, data: CoinPackage[] }`<br>`POST 201`: `{ success: true, message: string, data: CoinPackage }`<br>`400`: `{ success: false, error: string }` | None |
| 15 | `/api/payments/create-order` | `OPTIONS`, `POST` | None | None | `{ userId?: string, phone?: string, packageId: string }` | `200`: `{ success: true, message: string, data: { order: PaymentOrder, orderId: string, amountInr: number, coins: number, paymentSessionId: string } }`<br>`400`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None |
| 16 | `/api/payments/webhook` | `OPTIONS`, `POST` | None | None | Direct `{ orderId: string, status?: string, paymentSessionId?: string }` OR Cashfree nested webhook | `200`: `{ success: true, message: string, data: { order: PaymentOrder, newBalance: number, coinBalance: number } }`<br>`400`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None (NO HMAC signature check!) |
| 17 | `/api/user/profile` | `OPTIONS`, `GET`, `POST`, `PATCH` | None | `GET`: `userId?: string`, `id?: string`, `phone?: string`, `mobile?: string` | `POST`/`PATCH`: `{ userId?: string, id?: string, phone?: string, mobile?: string, name?: string, gender?: string, avatarUrl?: string, avatar?: string }` | `GET 200`: `{ success: true, data: User }`<br>`POST/PATCH 200`: `{ success: true, message: string, data: User }`<br>`400`: `{ success: false, error: string }`<br>`404`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | Bearer token fallback if query empty; otherwise unprotected |
| 18 | `/api/users` | `OPTIONS`, `GET` | None | None | None | `200`: `{ success: true, count: number, data: User[] }` | None (Leaks all user details, tokens, balances) |
| 19 | `/api/users/wallet` | `OPTIONS`, `POST` | None | None | `{ userId: string, amount: number, action?: 'deduct' \| 'credit', reason?: string }` | `200`: `{ success: true, message: string, data: { userId: string, newBalance: number, reason: string } }`<br>`400`: `{ success: false, error: string }`<br>`404`: `{ success: false, error: string }` | None (Unprotected admin coin modification) |
| 20 | `/api/wallet/balance` | `OPTIONS`, `GET` | None | `userId?: string`, `id?: string`, `phone?: string`, `mobile?: string` | None | `200`: `{ success: true, data: { userId: string, phone: string, coinBalance: number, coins: number, transactions: WalletTransaction[] } }`<br>`400`: `{ success: false, error: string }`<br>`404`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None |
| 21 | `/api/wallet/credit` | `OPTIONS`, `POST` | None | None | `{ userId?: string, id?: string, phone?: string, mobile?: string, amount: number, reason?: string }` | `200`: `{ success: true, message: string, data: { newBalance: number, coinBalance: number, transaction: WalletTransaction } }`<br>`400`: `{ success: false, error: string }`<br>`500`: `{ success: false, error: string }` | None (CRITICAL: Anyone can credit coins) |
| 22 | `/api/wallet/deduct` | `OPTIONS`, `POST` | None | None | `{ userId?: string, id?: string, phone?: string, mobile?: string, amount: number, reason?: string }` | `200`: `{ success: true, message: string, data: { newBalance: number, coinBalance: number, transaction: WalletTransaction } }`<br>`400`: `{ success: false, error: string, currentBalance?: number }`<br>`500`: `{ success: false, error: string }` | None |

---

## 3. Deep Route-by-Route Technical Details

### 3.1 Authentication (`/api/auth/*`)
- **`POST /api/auth/send-otp`**:
  - Accepts phone in fields `phone`, `mobile`, or `phoneNumber`.
  - Normalizes format using `normalizePhone` (+91 standard).
  - Validation: rejects input if shorter than 8 digits (`!rawPhone || rawPhone.length < 8`). Note that `store.sendOtp` has a stricter requirement (`normalized.length < 10`).
  - Stores `{ otp: '1234', expiresAt: Date.now() + 600000 }` in `pendingOtps` Map.
  - Returns `otp: '1234'` in the response payload for testing / sandbox automation.
- **`POST /api/auth/verify-otp`**:
  - Accepts phone and `otp` / `code`.
  - Verifies against pending record or allows static fallback `'1234'`.
  - Auto-provisions unregistered users into `state.users` with default name `"DilSnap User"`, 120 welcome bonus coins, and creates an initial credit transaction.
  - Generates token string: `tok_${user.id}_${Date.now()}`.
  - Returns 200 with `{ user, token }`.

### 3.2 User Profile & Management (`/api/user/profile`, `/api/users`, `/api/users/wallet`)
- **`GET /api/user/profile`**:
  - Searches user by `userId`/`id` or `phone`/`mobile`.
  - If neither query param is provided, checks `Authorization: Bearer <token>`.
  - Returns 200 with `data: User` or 404.
- **`POST / PATCH /api/user/profile`**:
  - Updates `name`, `gender`, `avatarUrl`, or `phone`.
  - Normalizes phone if updated.
  - Persists state and returns updated user.
- **`GET /api/users`**:
  - Dumps entire `state.users` list without pagination.
- **`POST /api/users/wallet`**:
  - Admin wallet manual adjustment: parses `{ userId, amount, action: 'credit' | 'deduct', reason }`.
  - Executes `store.adjustUserCoins(userId, delta)` which clamps minimum balance to 0 and logs transaction.

### 3.3 Wallet System (`/api/wallet/*`)
- **`GET /api/wallet/balance`**:
  - Query params: `userId` or `phone`.
  - Returns `{ userId, phone, coinBalance, coins, transactions }` (last 20 transactions).
- **`POST /api/wallet/credit`**:
  - Body: `{ userId, amount, reason }`.
  - Validates `amount` is a positive integer (`isNaN(amount) || amount <= 0 || amount !== rawAmount`).
  - Adds coins, creates transaction, persists state.
- **`POST /api/wallet/deduct`**:
  - Body: `{ userId, amount, reason }`.
  - Atomic double-spend check: verifies `user.coins >= amount`.
  - Rejects overdraft with 400 and returns `currentBalance`.
  - If sufficient, deducts coins, creates debit transaction, persists state.

### 3.4 Calls & Billing Pulse (`/api/calls/*`)
- **`GET /api/calls`**:
  - Returns `{ activeCalls, recentHistory, activeCount }`.
- **`POST /api/calls/start`**:
  - Accepts `{ userId, hostId, callType }`.
  - Pre-flight check: verifies host exists, user exists and is not banned.
  - Rate calculation: Video rate = `host.coinRatePerMinute`; Audio rate = `Math.max(10, Math.round(rate * 0.7))`.
  - Balance verification: rejects if `user.coins < rate` with 400 (`requiredCoins`, `currentBalance`).
  - Marks `host.isInCall = true`, creates active call session.
- **`POST /api/calls/pulse`**:
  - Heartbeat pulse every 30-60s.
  - Calls `store.deductWallet(session.userId, session.ratePerMinute)`.
  - If user balance is exhausted: auto-terminates session (`status = 'insufficient_coins'`), frees host (`isInCall = false`), moves call to `callHistory`, returns **HTTP 402 Payment Required**.
  - If successful: increments `session.durationSeconds += 60`, `session.coinsDeducted += rate`, returns 200.
- **`POST /api/calls/end`**:
  - Closes session: sets `status = 'completed'`, records duration and coins, frees host, increments `host.totalCalls` and `user.totalCalls`.
- **`POST /api/calls/terminate`**:
  - Admin kill-switch for live calls. Sets `status = 'terminated_by_admin'`, frees host, returns 200.
- **`GET / POST /api/calls/signal`**:
  - Serverless WebRTC signaling queue (SDP offers, answers, ICE candidates).
  - In-memory `signalQueue: Map<string, SignalMessage[]>`.

### 3.5 Hosts Catalog (`/api/hosts`, `/api/hosts/[id]`)
- **`GET /api/hosts`**:
  - Filters: `gender` ('Female', 'Male', 'All'), `online=true` (filters `isOnline && !isBanned`).
  - Returns array of `Host` objects.
- **`POST /api/hosts`**:
  - Validates `name` and `avatarUrl`. Parses comma-separated or array `languages` and `interests`.
  - Creates host with ID `lst_${Date.now()}`, initial rating `5.0`, 0 calls. Returns 201 Created.
- **`GET /api/hosts/[id]`**:
  - Returns host or 404.
- **`PATCH /api/hosts/[id]`**:
  - Partial updates host object (status, rates, bio, online, ban status).
- **`DELETE /api/hosts/[id]`**:
  - Deletes host from store, persists state, returns 200.

### 3.6 Packages & Gifts (`/api/packages`, `/api/gifts`)
- **`GET /api/packages`**: Returns list of `CoinPackage` objects.
- **`POST /api/packages`**: Validates `name`, `coins`, `priceInr`. Adds new package (`pkg_${Date.now()}`), returns 201.
- **`GET /api/gifts`**: Returns list of `Gift` objects.
- **`POST /api/gifts`**: Validates `name`, `coinCost`, `assetPath`. Adds new gift (`gift_${Date.now()}`), returns 201.

### 3.7 Payments & Gateway Webhook (`/api/payments/*`)
- **`POST /api/payments/create-order`**:
  - Binds user and package to create `PaymentOrder`. Computes total coins (`coins + bonusCoins`).
  - Generates dummy `paymentSessionId` (`cf_sess_...`).
- **`POST /api/payments/webhook`**:
  - Supports direct format (`orderId`, `status`) and Cashfree payload format (`data.order.order_id`, `data.payment.payment_status`).
  - Verifies status is `SUCCESS`, `PAID`, or `COMPLETED`.
  - Idempotent: if order status is already `'paid'`, returns 200 without double-crediting.
  - Credits coins to user wallet and increments `user.totalSpentInr`.

### 3.8 Config & Analytics (`/api/config`, `/api/analytics`)
- **`GET /api/config`**: Returns global app configuration (`AppConfig`).
- **`PATCH /api/config`**: Updates partial configuration and broadcast announcement.
- **`GET /api/analytics`**: Calculates platform KPIs (revenue, circulation, calls count, active calls, online hosts, user count).

---

## 4. Authentication, Authorization & Security Audit

### 4.1 Admin Panel Authentication
- **Finding**: **Non-existent**.
- There are no admin session cookies, no NextAuth/Auth.js setup, no Firebase Auth token verification, and no middleware (`middleware.ts`) enforcing admin login.
- Anyone with the URL `https://dilsnap-admin.vercel.app/` or access to the API endpoints can access, modify, and delete hosts, adjust user wallets, terminate calls, and alter broadcast notices.

### 4.2 Mobile Client Authentication
- `/api/auth/send-otp` and `/api/auth/verify-otp` use a static OTP `'1234'` or in-memory map.
- The issued session token is a raw string `tok_${user.id}_${Date.now()}` stored in the `User` object.
- It is not a cryptographically signed JWT; token expiration is not verified on subsequent requests.
- Sensitive user endpoints (such as `/api/wallet/credit`, `/api/wallet/deduct`, `/api/user/profile`) allow passing arbitrary `userId` or `phone` without requiring proof of ownership.

### 4.3 Webhook HMAC Verification
- `POST /api/payments/webhook` does NOT check HMAC signatures (e.g., `x-webhook-signature` or Cashfree signature).
- Any HTTP client can trigger coin credits by posting `{ "orderId": "order_xxx", "status": "PAID" }`.

---

## 5. Persistence & Cloud Firestore Analysis

### 5.1 Current Persistence Engine
- Currently, `src/lib/store.ts` uses an in-memory state variable `state: DatabaseSchema`.
- Hydration and persistence are connected to `@vercel/blob` (`dilsnap_db.json`).
- If `process.env.BLOB_READ_WRITE_TOKEN` is unset, the store runs entirely in ephemeral RAM.

### 5.2 Firestore Integration Gap
- Requirement 1 of `ORIGINAL_REQUEST.md` mandates dual persistence to Cloud Firestore project `dilsnap-a72fb` via `firebase-admin`.
- `dilsnap-admin/serviceAccountKey.json` is present and valid for `dilsnap-a72fb`.
- `src/lib/firebaseAdmin.ts` exists, but:
  1. It fails TypeScript compilation due to outdated v13-style imports on `firebase-admin` v14.5.0.
  2. `store.ts` does NOT import or call `firebaseAdmin.ts` or Firestore anywhere. Neither reads nor writes interact with Firestore.

---

## 6. Build, Testing & Scripts Review

### 6.1 `package.json` Scripts
```json
"scripts": {
  "dev": "next dev",
  "build": "next build --webpack",
  "start": "next start",
  "lint": "eslint",
  "test": "npx tsx --tsconfig ./tsconfig.json ./test/backend.test.mjs && npx tsx --tsconfig ./tsconfig.json ./test/routes.test.mjs"
}
```

### 6.2 Test Suite Execution (`npm test`)
- Command: `npm test`
- Framework: Lightweight custom test runner using Node.js built-in `node:assert/strict` and `npx tsx`.
- Result: **PASSES (Exit code 0)**.
  - `test/backend.test.mjs`: 10 integration tests pass (normalization, send OTP, verify OTP, profile update, wallet balance, atomic deduction, overdraft rejection, atomic credit, call lifecycle, payment order/webhook).
  - `test/routes.test.mjs`: 14 route handler unit tests pass (Direct handler execution with mock NextRequest objects).
- Coverage: 11 endpoints tested; 11 endpoints not covered in `routes.test.mjs`.

### 6.3 Build Execution (`npm run build`)
- Command: `npm run build` (`next build --webpack`)
- Result: **FAILS (Exit code 1)**.
- Cause: `src/lib/firebaseAdmin.ts` TypeScript compilation errors:
  ```
  src/lib/firebaseAdmin.ts(5,24): error TS2724: '"firebase-admin"' has no exported member named 'app'. Did you mean 'App'?
  src/lib/firebaseAdmin.ts(8,13): error TS2339: Property 'apps' does not exist on type...
  src/lib/firebaseAdmin.ts(17,27): error TS2339: Property 'credential' does not exist on type...
  src/lib/firebaseAdmin.ts(43,41): error TS2694: Namespace has no exported member 'firestore'...
  src/lib/firebaseAdmin.ts(48,42): error TS2694: Namespace has no exported member 'auth'...
  ```

### 6.4 Linter Execution (`npm run lint`)
- Command: `npm run lint` (`eslint`)
- Result: **FAILS (Exit code 1)**: 18 errors, 44 warnings.
- Cause:
  - `react-hooks/set-state-in-effect` in `src/app/page.tsx`, `src/app/users/page.tsx`, `src/app/hosts/page.tsx`, `src/app/calls/page.tsx`, `src/app/monetization/page.tsx`.
  - Unused variables across UI components and `test/routes.test.mjs`.
  - No lint errors in `src/app/api/**` route handlers.

---

## 7. Discrepancies, Missing Routes & Mock Data

### 7.1 Missing / Mismatched Endpoints
1. **`POST /api/config` Missing**:
   - `src/app/settings/page.tsx` line 42 and `src/app/broadcast/page.tsx` line 45 execute `fetch('/api/config', { method: 'POST', ... })`.
   - `src/app/api/config/route.ts` only exports `GET` and `PATCH`.
   - **Impact**: Admin configuration updates and broadcast announcements fail with `405 Method Not Allowed`.
2. **Missing Package Mutation Routes**:
   - No `PATCH /api/packages/[id]` or `DELETE /api/packages/[id]`.
   - `store.ts` implements `updatePackage` and `deletePackage`, but there is no API route exposing them.
3. **Missing Gift Mutation Routes**:
   - No `PATCH /api/gifts/[id]` or `DELETE /api/gifts/[id]`.
   - `store.ts` implements `updateGift` and `deleteGift`, but there is no API route exposing them.
4. **Missing User Ban API Route**:
   - `src/app/users/page.tsx` lines 77-78 toggles `isBanned` only in local React state. There is no route like `PATCH /api/users/[id]` or `POST /api/users/ban` to persist user suspension.
5. **WebRTC Signaling Route Persistence**:
   - `src/app/api/calls/signal/route.ts` stores signals in an in-memory `Map`. In serverless environments, calls between separate serverless instances will drop signals.

### 7.2 Mock Data & Hardcoded Metrics
- `store.getAnalytics()` hardcodes base values:
  - `+ 48250` added to revenue.
  - `todayBurnedCoins: 2840`.
  - `conversionRate: '4.8%'`.
  - `avgCallDurationMinutes: '6.4 min'`.
  - `+ 1420` added to total users count.
- `store.sendOtp()` hardcodes `'1234'` as demo OTP.

---

## 8. Concrete Recommendations for Implementation Team

1. **Fix `src/lib/firebaseAdmin.ts`**:
   - Replace namespace imports with modular subpath imports from `firebase-admin/app`, `firebase-admin/firestore`, and `firebase-admin/auth`.
   - Ensure `npm run build` passes TypeScript verification cleanly.
2. **Implement Dual Persistence in `src/lib/store.ts`**:
   - Wire `persistState()` to write collections (`hosts`, `packages`, `gifts`, `users`, `config`) to Firestore (`dilsnap-a72fb`) in addition to Vercel Blob.
   - Wire `hydrateState()` to failover or initialize from Firestore.
3. **Fix Method Mismatch in `/api/config`**:
   - Export `POST` in `src/app/api/config/route.ts` pointing to the update handler (or support both `POST` and `PATCH`).
4. **Add Missing Endpoints**:
   - Create `src/app/api/packages/[id]/route.ts` (PATCH, DELETE).
   - Create `src/app/api/gifts/[id]/route.ts` (PATCH, DELETE).
   - Create `src/app/api/users/[id]/route.ts` (GET, PATCH) to allow updating/banning users.
5. **Harden Security & Add Route Tests**:
   - Add HMAC signature verification to `POST /api/payments/webhook`.
   - Expand `test/routes.test.mjs` to test all 22+ route handlers to achieve 100% test coverage.
