# Task Assignment: Milestone 3 (Admin Panel Pages & UI Polish)

## Instructions
You are `worker_m3`. Implement Milestone 3 (Admin Panel Pages & UI Polish) in `dilsnap-admin`:

1. **Context & Requirements**:
   - Read `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\ORIGINAL_REQUEST.md`.
   - Read `c:\Users\hp\Desktop\dilsnap\PROJECT.md` (Features 12 through 19).
   - Read `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\reviewer_m2_1\handoff.md` and `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\reviewer_m2_2\handoff.md`.

2. **Feature Implementation Tasks**:
   - **Feature 12 - Dedicated Analytics Page (`/analytics`)**:
     Create `dilsnap-admin/src/app/analytics/page.tsx`. Fetch from `/api/analytics`. Display revenue metrics, call duration & minutes, total users & active hosts, call volume trends, revenue breakdown, and host performance leaderboards with modern UI cards, charts/bars, and loading skeletons.
   - **Feature 13 - Dedicated Gifts Page (`/gifts`)**:
     Create `dilsnap-admin/src/app/gifts/page.tsx`. Fetch from `/api/gifts`. Display virtual gifts grid/table with icons/images, coin costs, category badges, active/inactive toggles. Provide Add Gift modal (`POST /api/gifts`), Edit Gift modal (`PATCH /api/gifts/[id]`), and Delete Gift action (`DELETE /api/gifts/[id]`).
   - **Feature 14 - Navigation & Sidebar Update (`Sidebar.tsx`)**:
     Update `dilsnap-admin/src/components/Sidebar.tsx` to include navigation links for `/analytics` and `/gifts` with appropriate Lucide icons, active state highlighting, and badges.
   - **Feature 15 - Users Page Ban Persistence (`users/page.tsx`)**:
     Connect the Ban / Unban button in `dilsnap-admin/src/app/users/page.tsx` to `PATCH /api/users/[id]` with `{ action: 'toggleBan' }` or `{ isBanned: !user.isBanned }`. Update UI state immediately upon successful API response and trigger a toast notification.
   - **Feature 16 - Packages & Gifts Edit/Delete UI (`monetization/page.tsx` & `gifts/page.tsx`)**:
     In `monetization/page.tsx`, add Edit and Delete modals/buttons for Coin Packages calling `PATCH /api/packages/[id]` and `DELETE /api/packages/[id]`.
   - **Feature 17 - UI Polish: Modern Toast & Modals (`Toast.tsx`, `ConfirmModal.tsx`)**:
     Create reusable toast notification context/component `src/components/Toast.tsx` and custom confirmation modal `src/components/ConfirmModal.tsx`. Replace native browser `alert()` and `confirm()` dialogs across admin pages (`users`, `monetization`, `hosts`, `broadcast`, `settings`, `gifts`) with sleek Tailwind UI toasts and modals.
   - **Feature 18 - Dashboard Polish & Skeletons (`src/app/page.tsx`)**:
     Ensure `src/app/page.tsx` displays real metrics fetched from `/api/analytics`, `/api/hosts`, `/api/users`, `/api/calls`. Include animated loading skeletons while fetching, and clear empty states.
   - **Feature 19 - Header Maintenance Sync (`Header.tsx`)**:
     In `src/components/Header.tsx`, fetch `/api/config` to check `maintenanceMode`. Display the amber maintenance banner when active, and provide quick link/toggle to settings.
   - **Security Hardening (from M2 review)**:
     In `src/app/api/payments/webhook/route.ts`, use `crypto.timingSafeEqual` for HMAC signature comparison, and ensure production mode does not accept sandbox dummy signatures.
   - **Update `PROJECT.md`**:
     Update milestone table in `c:\Users\hp\Desktop\dilsnap\PROJECT.md` to show Milestone 2 as DONE and Milestone 3 as IN_PROGRESS.

3. **Verification**:
   In `c:\Users\hp\Desktop\dilsnap\dilsnap-admin`:
   - Run `npm test`
   - Run `npm run build`
   - Run `node test/routes.test.mjs`
   - Run `node test/e2e.test.mjs`
   Ensure 0 TypeScript errors, clean build, and 100% test pass rate.

4. **Reporting**:
   - Write `handoff.md` in `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m3\handoff.md`.
   - Send completion message to orchestrator (`0511d4a2-e39d-4d18-971a-246d8a5b03c9`).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-11-02T13:43:34Z
You are worker_m3.
Your working directory is: c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m3
Parent Conversation ID: 0511d4a2-e39d-4d18-971a-246d8a5b03c9

Read the following files before starting:
- c:\Users\hp\Desktop\dilsnap\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\hp\Desktop\dilsnap\PROJECT.md
- c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m3\DISPATCH.md
- c:\Users\hp\Desktop\dilsnap\.agents\teamwork\reviewer_m2_1\handoff.md
- c:\Users\hp\Desktop\dilsnap\.agents\teamwork\reviewer_m2_2\handoff.md

Your task:
Implement Milestone 3 (Admin Panel Pages & UI Polish) in `dilsnap-admin`:
1. Create dedicated `/analytics` page (`src/app/analytics/page.tsx`).
2. Create dedicated `/gifts` page (`src/app/gifts/page.tsx`) with full CRUD modals (Add, Edit, Delete).
3. Update `src/components/Sidebar.tsx` to register `/analytics` and `/gifts`.
4. Connect User ban button in `src/app/users/page.tsx` to `PATCH /api/users/[id]` with immediate UI state update.
5. In `src/app/monetization/page.tsx`, add Edit and Delete modals/buttons for Coin Packages calling `PATCH` and `DELETE /api/packages/[id]`.
6. Create `src/components/Toast.tsx` and `src/components/ConfirmModal.tsx`, replacing native `alert()` and `confirm()` throughout the admin pages.
7. Add loading skeletons and real data display in `src/app/page.tsx` and other pages.
8. Update `src/components/Header.tsx` to fetch `/api/config` and show maintenance mode banner when active.
9. Harden `src/app/api/payments/webhook/route.ts` with `crypto.timingSafeEqual` and production HMAC enforcement.
10. Update `PROJECT.md` to mark M2 as DONE and M3 as IN_PROGRESS.
11. Run verification in `c:\Users\hp\Desktop\dilsnap\dilsnap-admin`:
   - `npm test`
   - `npm run build`
   - `node test/routes.test.mjs`
   - `node test/e2e.test.mjs`
12. Write `c:\Users\hp\Desktop\dilsnap\.agents\teamwork\worker_m3\handoff.md` and notify parent (0511d4a2-e39d-4d18-971a-246d8a5b03c9).
