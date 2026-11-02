# Scope: E2E Testing Track

## Architecture
- **Framework**: Node.js / Next.js opaque-box test runner in `dilsnap-admin/test/e2e.test.mjs`.
- **Methodology**: Category-Partition, Boundary Value Analysis, Pairwise Combinations, Real-World Scenarios (Tiers 1-4).
- **Execution**: Runs against local Next.js API route handlers / server endpoints without internal module coupling.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 20 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite verifying all user flows and backend endpoints | E2E | user_request |

## Deliverables
1. `TEST_INFRA.md` at project root `c:\Users\hp\Desktop\dilsnap\TEST_INFRA.md`.
2. Test runner and test cases in `dilsnap-admin/test/e2e.test.mjs`.
3. `TEST_READY.md` at project root `c:\Users\hp\Desktop\dilsnap\TEST_READY.md`.

## Interface Contracts
- Command to run E2E suite: `cd dilsnap-admin && node test/e2e.test.mjs` (or via `npm run test:e2e`).
- Exit code: 0 on success, non-zero on failure.
