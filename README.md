# Project GaurdAIN — Real-Time Cyber Fraud & UPI Mule Defense

A standalone **Manifest V3 Chrome Extension** that acts as a client-side **Sensor**,
**Offline Heuristic Engine**, and **Intervention UI**. It runs fully autonomously with
**no backend / mock server dependency** — all detection happens on-device.

---

## Files

```
Project/
├── manifest.json                 # Chrome MV3 manifest (webNavigation, file:// support, 3 icons)
├── background.js                 # MV3 service worker — offline heuristic + hard block + 5s auto-close
├── content.js                    # DOM scanner + professional block overlay + 5s countdown
├── popup.html / popup.js         # Dashboard UI (protection status, offline indicator, heuristic toggle)
├── icon16.png / icon48.png / icon128.png   # Extension icons
├── scam.html                     # Dangerous test page (KYC/digital-arrest/UPI scam keywords)
└── safe.html                     # Benign test page (zero false positives)
```

---

## How It Works

- **Offline Heuristic Engine (`background.js`):** Classifies every page locally using
  keyword rules for scam vectors (KYC Blocked, Digital Arrest, Fake Investment, UPI
  Collect Requests, mule recruitment) plus WHOIS/domain-age signals. No network call.
- **Hard Blocking:** On a `high_risk` verdict:
  1. Fires a native Chrome notification showing the dangerous URL + reasons.
  2. Sends a `BLOCK_PAGE` message to `content.js`, which injects a **non-dismissable**
     full-screen overlay (`z-index: 2147483647`) covering the whole viewport.
  3. Shows an active **5-second countdown** with a progress bar.
  4. After 5s, the tab is **forcibly closed** via `chrome.alarms` plus a redundant
     `CLOSE_TAB` message from the overlay.
- **Privacy-by-Design:** `content.js` scrubs PII (phones, emails, cards, VPAs) locally.

---

## Test It (no server — just open the file)

1. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this
   folder.
2. On the extension card, click **Details** and enable **"Allow access to file URLs"**.
3. Double-click **`scam.html`** in this folder to open it in Chrome.
   → You'll see a dark **"🔍 Scanning…"** badge, a native notification, then a red
   **professional block overlay** with a **5-second countdown**, and the tab auto-closes.
4. Double-click **`safe.html`** → you'll see a green **"✓ Looks safe"** badge and normal
   rendering (no false positive).

> **Troubleshooting:** After editing any file, reload the extension in
> `chrome://extensions`. If scanning doesn't start, confirm "Allow access to file URLs"
> is enabled and the heuristic toggle in the popup is ON.
