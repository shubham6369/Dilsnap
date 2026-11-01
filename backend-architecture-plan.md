# DilSnap Production Backend Architecture & Implementation Plan

## Goal
Design and build a scalable, production-ready backend for DilSnap using Vercel Functions, Marketplace Database (Postgres/Neon), Realtime WebRTC signaling, User Auth/Wallet API, and Payment Gateway integration.

## Tasks
- [x] Task 1: Map Vercel backend architecture & workloads (HTTP APIs on Vercel Functions, Neon/Supabase Postgres for user/wallet data, Vercel Blob for media, WebRTC signaling) → Verify: Architecture document added to `dilsnap-admin/BACKEND.md`.
- [x] Task 2: Create User & Authentication endpoints (`/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/user/profile`) with JWT token issuance → Verify: `curl -X POST /api/auth/send-otp` returns OTP delivery response.
- [x] Task 3: Build Wallet & Transaction API (`/api/wallet/balance`, `/api/wallet/deduct`, `/api/wallet/credit`) with atomic coin deduction to prevent double-spending → Verify: Unit tests confirm balance cannot drop below zero.
- [x] Task 4: Implement Call Session & Billing API (`/api/calls/start`, `/api/calls/pulse`, `/api/calls/end`) to track duration and auto-debit host coin rates per minute → Verify: POST call start returns sessionId and active billing rate.
- [x] Task 5: Add Payment Gateway Order & Webhook handler (`/api/payments/create-order`, `/api/payments/webhook`) for live coin pack purchases with HMAC signature validation → Verify: Webhook rejects invalid signatures and credits coins on verified payment.
- [x] Task 6: Implement WebRTC Signaling Service route or integration configuration for live 1-on-1 audio/video call pairing → Verify: Mobile client connects to signaling route and exchanges SDP offer/answer.
- [x] Task 7: Wire mobile app services (`ApiService`, `AuthController`, `WalletController`, `CallController`) to point to the live unified backend endpoints → Verify: App registers user, loads balance, and initiates call with live backend session.
- [x] Task 8: Build and verify end-to-end integration and create fresh production APK → Verify: `npm test` passed 24/24, `flutter test` passed 6/6, `flutter analyze` 0 issues, and `DilSnap.apk` updated on Desktop.

## Done When
- [x] DilSnap has a complete REST & signaling backend with Auth, Wallet, Host Management, Calls, and Payments.
- [x] Mobile app is seamlessly configured to talk to the live production backend without hardcoded mocks.
- [x] All endpoints and mobile clients are fully verified and compiled.
