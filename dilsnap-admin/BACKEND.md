# DilSnap Production Backend Architecture

## Overview
DilSnap runs a high-throughput, real-time backend architecture powered by **Vercel Serverless Functions** (Next.js 16 App Router) and cloud-persistent state storage (Vercel Blob / Postgres / Neon), delivering low latency mobile API performance across India.

```
+--------------------------------------------------------------+
|                    DilSnap Flutter App                       |
+--------------------------------------------------------------+
       |                  |                    |             |
  (Auth / OTP)      (Wallet / Coins)     (Call Sessions)  (Signaling)
       |                  |                    |             |
       v                  v                    v             v
+--------------------------------------------------------------+
|            Vercel Serverless Edge & Functions API            |
|                   (dilsnap-admin / Next.js 16)               |
+--------------------------------------------------------------+
  /api/auth/*       /api/wallet/*        /api/calls/*     /api/payments/*
       |                  |                    |             |
       +------------------+--------------------+-------------+
                                  |
                                  v
+--------------------------------------------------------------+
|                   Persistent Data Engine                     |
|           Vercel Blob Storage + Atomic In-Memory Store       |
|            (Optional: Neon / Supabase PostgreSQL DB)         |
+--------------------------------------------------------------+
```

---

## 1. Authentication & Identity
- **`/api/auth/send-otp`** (POST): Dispatches or simulates high-speed OTP verification for user phone numbers.
- **`/api/auth/verify-otp`** (POST): Validates entered OTP code, ensures idempotency, provisions user identity, and issues secure session token.
- **`/api/user/profile`** (GET, POST, PATCH): Retrieves or updates user nickname, gender preferences, and avatar.

## 2. Wallet & Double-Spending Prevention
- **`/api/wallet/balance`** (GET): Real-time balance enquiry with transaction ledger history.
- **`/api/wallet/credit`** (POST): Atomically credits coins into user wallet (welcome bonuses, coin packages, promotional gifts).
- **`/api/wallet/deduct`** (POST): Performs atomic balance decrement with pre-flight check (`coins >= amount`) to strictly prevent double spending or negative balance states.

## 3. Real-Time Call Sessions & Billing Pulses
- **`/api/calls/start`** (POST): Initializes 1-on-1 video or audio session with a host, verifies minimum required coins, marks host busy (`isInCall = true`), and binds billing rate per minute.
- **`/api/calls/pulse`** (POST): Triggered periodically during calls (every 30-60s) to deduct host minute rates. If user balance is exhausted, transitions call to `insufficient_coins` and frees host.
- **`/api/calls/end`** (POST): Gracefully closes session, computes duration, updates user and host total call counters, and writes completed record into history.
- **`/api/calls/signal`** (GET, POST): Serverless WebRTC SDP offer, answer, and ICE candidate exchange queue.

## 4. Payment Gateway & Webhook Reconciliation
- **`/api/payments/create-order`** (POST): Generates order session bound to a selected `CoinPackage` (INR value and bonus coins).
- **`/api/payments/webhook`** (POST): Listens to payment capture webhooks (Cashfree, Razorpay, UPI) to credit purchased coins with duplicate protection.
