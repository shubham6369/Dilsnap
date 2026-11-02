## 2026-11-01T18:51:57Z

You are Worker Milestone 2 (Backend API Routes & Tests).
Your working directory is: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m2\
The project root is: c:\Users\hp\Desktop\dilsnap
ORIGINAL_REQUEST.md is at: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md is at: c:\Users\hp\Desktop\dilsnap\PROJECT.md
Explorer 2 handoff report is at: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\explorer_survey_2\handoff.md

MANDATORY FIRST STEP:
Read ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_2/handoff.md before touching any code.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You own and may edit:
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\config\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\users\[id]\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\packages\[id]\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\gifts\[id]\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\payments\webhook\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\wallet\credit\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\app\api\users\wallet\route.ts
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\src\lib\store.ts (if needed for API integration)
- c:\Users\hp\Desktop\dilsnap\dilsnap-admin\test\routes.test.mjs
- Files in your working directory: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m2\
Do NOT edit UI pages under src/app/* (which belong to Milestone 3).

OBJECTIVE:
1. Fix `src/app/api/config/route.ts`:
   - Add `POST` handler alongside `GET` and `PATCH` that accepts config updates (called by settings/page.tsx and broadcast/page.tsx) and calls `store.updateConfig(data)` with dual persistence.
2. Implement User Ban & Profile API (`src/app/api/users/[id]/route.ts`):
   - `GET`: Fetch user by ID.
   - `PATCH`: Update user fields, specifically supporting `{ isBanned: boolean }` and updating store via `store.updateUser` / `store.toggleUserBan` with dual persistence to Blob and Firestore.
3. Implement Coin Package CRUD API (`src/app/api/packages/[id]/route.ts`):
   - `GET`: Fetch package by ID.
   - `PATCH` / `PUT`: Update package (price, coins, bonusCoins, isPopular, isActive) via `store.updatePackage`.
   - `DELETE`: Delete package via `store.deletePackage`.
4. Implement Virtual Gift CRUD API (`src/app/api/gifts/[id]/route.ts`):
   - `GET`: Fetch gift by ID.
   - `PATCH` / `PUT`: Update gift (name, coinCost, category, icon, animationPath, isActive) via `store.updateGift`.
   - `DELETE`: Delete gift via `store.deleteGift`.
5. Security & Validation Hardening:
   - In `payments/webhook/route.ts`: Validate webhook body payload safely.
   - In `wallet/credit/route.ts` and `users/wallet/route.ts`: Validate positive integers for coin operations.
6. Complete Test Coverage:
   - Expand `dilsnap-admin/test/routes.test.mjs` to test all 22+ API endpoints, including the new `[id]` routes and `POST /api/config`.
7. Verification:
   - Run `npm run build` in `dilsnap-admin` — must exit 0 with 0 errors.
   - Run `npm test` in `dilsnap-admin` — must pass 100% of tests.
   - Run `node test/e2e.test.mjs` in `dilsnap-admin` — verify E2E suite passes 100%.
8. Document results and commands in `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m2\handoff.md`.
9. Notify orchestrator via send_message when complete.
