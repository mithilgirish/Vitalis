# Vitalis Mobile — Emergency Blood Transfer Courier

A mission-critical emergency logistics mobile cockpit for blood bank couriers and hospital trauma triage teams.

---

## 🚀 Expo Go Compatibility (SDK 57 & SDK 58)

Because **Expo Go** enforces a strict 1-to-1 match with the Expo SDK version installed on your device (devices running Expo Go SDK 58 reject SDK 57 bundles, and vice-versa), Vitalis Mobile includes **dual SDK support** and instantaneous 1-step switching.

### Check Current Active SDK Profile
```bash
npm run status:sdk
```

### Switch to Expo SDK 57 (for Expo Go SDK 57 client)
```bash
npm run use:sdk57
npm install
npm run start:go
```

### Switch to Expo SDK 58 (for Expo Go SDK 58 client)
```bash
npm run use:sdk58
npm install
npm run start:go
```

---

## 📱 Running on Android and iOS (Expo Go)

### Launching Dev Server
```bash
# Start explicitly in Expo Go mode
npm run start:go

# Or target platform directly
npm run android:go   # Opens connected Android emulator / USB device
npm run ios:go       # Opens iOS Simulator / device
```

### Connecting Physical Devices
- **Android**:
  1. Open the **Expo Go** app on your Android phone.
  2. Scan the Metro QR code directly within Expo Go.
  3. Ensure your phone and development machine are connected to the same Wi-Fi network (or pass `--tunnel` via `npx expo start --go --tunnel`).

- **iOS**:
  1. Open the default iOS **Camera** app.
  2. Aim at the QR code; tap the prompt to open in **Expo Go**.
  3. Sign into the matching Expo account if prompted by your Expo Go client.

---

## 🛡️ Cross-Platform Hardware & Permission Features
1. **Barcode & QR Viewfinder (`CameraView`)**:
   - Configured with native iOS `NSCameraUsageDescription` & Android `CAMERA` permissions in `app.json`.
   - Includes graceful `CameraErrorBoundary` and **Virtual Viewfinder / Manual Input Drawer** so scanning can be tested seamlessly on simulators or when hardware permissions are disabled.
2. **Apple Maps & OpenStreetMap Navigation (`react-native-webview`)**:
   - Zero-key Leaflet + OpenStreetMap engine configured with proper Android and iOS WebView permissions (`javaScriptEnabled`, `domStorageEnabled`, `originWhitelist`).
3. **Ergonomic Safe Area Handling**:
   - Adaptive insets using `react-native-safe-area-context` for Android navigation bars and iOS Dynamic Island / Home Indicator.
4. **Universal Animations & Worklets**:
   - Pure `runOnJS` from `react-native-reanimated` (4.x) ensuring consistent execution across SDK 57 and SDK 58 without worklet binding conflicts.
