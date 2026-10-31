# DilSnap - 1-on-1 Live Video Chat & Matchmaking App

Production-ready Flutter application built as a full-featured clone of MastiCall (`com.masticall.app`), engineered using the combined blueprint of **REA (Reverse Engineer Anything)** forensics and **Antigravity Clean-Room Engineering**.

---

## 📱 Release Deliverables

Both production release builds have been generated, signed, and placed in the [`release/`](file:///c:/Users/hp/Desktop/dilsnap/release/) folder:

| File | Type | Target | Size |
| :--- | :--- | :--- | :--- |
| **`DilSnap-v1.0.0-release.apk`** | Signed Release APK | Direct Android Device Installation & Testing | **~96.7 MB** |
| **`DilSnap-v1.0.0-playstore.aab`** | Android App Bundle | **Google Play Console Publishing** | **~68.3 MB** |

---

## 🚀 Key Features

1. **Host-Listener Live Calling Engine**:
   - 1-on-1 ultra-low-latency WebRTC video & audio calling.
   - Dual-camera preview with draggable local Picture-in-Picture (PIP).
   - Beauty filter toggle, microphone mute, and front/back camera switching.
2. **Virtual Economy & Per-Minute Coin Burn**:
   - Live coin deduction every 60 seconds of video call.
   - Low-balance warning prompts and automatic call termination when coins are exhausted.
   - Emerald (100 coins), Ruby (300 coins), Sapphire (650 coins), and Diamond VIP (1,500 coins) packages.
   - Simulated 1-tap Cashfree checkout bottom sheet.
3. **Animated In-Call Virtual Gifting**:
   - In-call gift drawer with floating gift animations (Mystery Gift, Heart Shower, Rose, Diamond, Celebration Cake).
   - Real-time coin transfers from callers to hosts.
4. **Host Mode & Earnings**:
   - Toggle between user mode and host/listener mode.
   - Host online/offline status with earning dashboard (30 coins/min).
5. **Random Matchmaker**:
   - Omegle-style 1-click random stranger video matching with animated radar waves.
6. **Authentication & Profile**:
   - Phone number login with OTP verification.
   - Profile creation with gender selection, nicknames, and languages.

---

## 🔑 Keystore & Signing Credentials

The release builds are signed with a production RSA 2048-bit key valid for 10,000 days:

* **Keystore File**: `android/app/upload-keystore.jks`
* **Properties File**: `android/key.properties`
* **Key Alias**: `upload`
* **Password**: `dilsnap2026password`

---

## 🛠️ Testing & Play Store Deployment

### Install APK directly on phone:
```bash
adb install release/DilSnap-v1.0.0-release.apk
```

### Upload to Google Play Console:
1. Go to [Google Play Console](https://play.google.com/console).
2. Create a new app or draft release under **Production** (or **Closed Testing**).
3. Upload `release/DilSnap-v1.0.0-playstore.aab`.
4. Fill in the store listing, privacy policy, and submit for review.
