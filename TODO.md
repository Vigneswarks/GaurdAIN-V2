# GaurdAIN — Purely Web-Based Working Model

## Final Scope (no demo server, no mobile-pwa/android)
- [x] Delete `serve_demo.py`, `mock_server.py`, `demo/` folder
- [x] `manifest.json` — MV3, `file://*/*` content-script support, three icons
- [x] `background.js` — offline heuristic engine, high_risk verdict, native notification, 5s auto-close
- [x] `content.js` — MutationObserver scanner, PII scrub, professional block overlay + 5s countdown
- [x] `scam.html` — high-risk test page (KYC blocked, digital arrest, fake investment, UPI deep-links)
- [x] `safe.html` — benign test page (zero false positives)
- [x] `popup.html` / `popup.js` — dashboard (offline indicator, heuristic toggle)
- [x] JS syntax validated (`node --check`)
- [x] Countdown fixed to 5 seconds across background + content

## How to verify
1. `chrome://extensions` → Developer mode → Load unpacked → select this folder
2. Extension card → Details → enable "Allow access to file URLs"
3. Open `scam.html` → red block overlay + notification → tab auto-closes in 5s
4. Open `safe.html` → green "✓ Looks safe" → no blocking
</content>
