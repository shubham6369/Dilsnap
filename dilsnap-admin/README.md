# 💎 DilSnap Admin Control Center

A modern, high-performance mission control dashboard and REST API backend for **DilSnap** (1-on-1 Audio & Video Calling Platform), built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**.

Ready for instant deployment to **Vercel** with zero external database configuration required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

---

## 🚀 Features

- **📊 Live Telemetry & Analytics Dashboard**: Real-time revenue tracking, active WebRTC call metrics, coin burn counters, and hourly traffic distribution.
- **🎙️ Verified Hosts Directory**: Add, edit, verify, or ban audio & video hosts. Set coin rates per minute (e.g. 30 💎/min) and toggle online availability.
- **👥 Users & Wallets Control**: Search registered callers, view lifetime spend, adjust wallet balances (grant promotional coins or deductions with audit notes), and manage suspensions.
- **📞 Live Call Monitor & Kill-Switch**: Inspect active 1-on-1 WebRTC streams in real-time with duration and coins burned counters. Includes a **Force Terminate** button to immediately stop abusive calls.
- **💎 Packages & Virtual Gifts**: Manage in-app coin recharge packages (Cashfree UPI pricing in INR) and in-call virtual gifts (Hearts, Diamonds, Cakes, Cars).
- **📢 Real-Time App Broadcasts**: Broadcast in-app notice banners to all connected mobile clients with an interactive **Mobile Device Live Preview**.
- **⚙️ Global App Settings**: Emergency Maintenance Mode switch, free welcome bonus coins for new users, floor call rates, and Cashfree payment credentials.
- **⚡ Mobile REST API**: Native JSON endpoints with CORS enabled for seamless integration with the DilSnap Flutter Android & iOS mobile app.

---

## 🌐 Mobile App REST API Endpoints

All endpoints have CORS enabled (`Access-Control-Allow-Origin: *`) for native mobile access:

| Endpoint | Method | Description |
|---|---|---|
| `/api/config` | `GET` / `POST` | Global app config, maintenance mode & active broadcast banner |
| `/api/hosts` | `GET` / `POST` | List verified hosts (`?gender=female&online=true`) or register host |
| `/api/hosts/[id]` | `PATCH` / `DELETE` | Update host rate, online state, bio, or delete host |
| `/api/users` | `GET` | Registered callers list & wallet balances |
| `/api/users/wallet` | `POST` | Grant or deduct coins from user wallet |
| `/api/calls` | `GET` | Active calls in progress & recent call history |
| `/api/calls/terminate` | `POST` | Forcibly terminate an active call session |
| `/api/packages` | `GET` / `POST` | Coin recharge packages for wallet screen |
| `/api/gifts` | `GET` / `POST` | Virtual gifts list for in-call gifting |
| `/api/analytics` | `GET` | Dashboard revenue, coin circulation, and call metrics |

---

## 🛠️ Deploying to Vercel

### Method 1: Using the Vercel Web Dashboard (Recommended)
1. Push this `dilsnap-admin` directory to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. Set the Framework Preset to **Next.js**.
5. Click **"Deploy"**.
6. Once deployed, copy your production URL (e.g., `https://dilsnap-admin.vercel.app`).

### Method 2: Using Vercel CLI
```bash
cd dilsnap-admin
npm install -g vercel
vercel
```
Follow the interactive prompts and select default settings.

---

## 📱 Connecting DilSnap Mobile App to this Vercel Admin

Open `lib/core/constants/app_constants.dart` in the DilSnap Flutter project:

```dart
class AppConstants {
  static const String appName = 'DilSnap';
  // Replace with your Vercel URL:
  static const String apiBaseUrl = 'https://your-dilsnap-admin.vercel.app';
}
```

The Flutter app will dynamically fetch hosts, banners, coin packages, and configuration directly from your Vercel admin!

---

## 💻 Local Development

```bash
cd dilsnap-admin
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the Admin Control Center.
