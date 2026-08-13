// GuardAIN content.js

let warningShown = false;
let scanTimer = null;

// -------------------- PAGE SIGNAL --------------------

function getPageSignal() {
  return {
    url_host: location.hostname,
    url_path: location.pathname,
    title: document.title || "",
    text_sample: (document.body?.innerText || "")
      .slice(0, 4000),
    upi_links: [...document.querySelectorAll('a[href^="upi://"]')]
      .slice(0, 20)
      .map(a => a.getAttribute("href")?.slice(0, 200))
      .filter(Boolean),
    ts: Date.now()
  };
}

// -------------------- SCAN --------------------

function scanPage() {
  clearTimeout(scanTimer);

  scanTimer = setTimeout(() => {
    chrome.runtime.sendMessage({
      type: "PAGE_SIGNAL",
      payload: getPageSignal()
    }).catch(() => {});
  }, 500);
}

scanPage();

// Detect dynamic/SPA changes
if (document.body) {
  const observer = new MutationObserver(scanPage);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// -------------------- MESSAGES --------------------

chrome.runtime.onMessage.addListener(message => {

  if (message?.type === "REQUEST_SCAN") {
    scanPage();
    return;
  }

  if (message?.type === "BLOCK_PAGE") {
    showWarning(message.payload || {});
    return;
  }

  if (message?.type === "SCAN_RESULT") {
    const v = message.payload || {};

    if (v.risk_level === "suspicious") {
      showBadge("⚠ Suspicious signals");
    }

    if (v.risk_level === "safe") {
      showBadge("✓ Looks safe");
      setTimeout(() => {
        document.getElementById("gaurdain-badge")?.remove();
      }, 2500);
    }
  }
});

// -------------------- BADGE --------------------

function showBadge(text) {
  let badge = document.getElementById("gaurdain-badge");

  if (!badge) {
    badge = document.createElement("div");
    badge.id = "gaurdain-badge";

    Object.assign(badge.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      zIndex: "2147483646",
      padding: "7px 12px",
      borderRadius: "20px",
      background: "#111827",
      color: "#fff",
      font: "600 12px Arial",
      boxShadow: "0 2px 10px #0005"
    });

    document.documentElement.appendChild(badge);
  }

  badge.textContent = text;
}

// -------------------- WARNING --------------------

function showWarning(data) {

  if (warningShown) return;

  warningShown = true;

  document.getElementById("gaurdain-warning")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "gaurdain-warning";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    background: "rgba(0,0,0,.82)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial,sans-serif"
  });

  const box = document.createElement("div");

  Object.assign(box.style, {
    width: "min(500px,90%)",
    padding: "28px",
    background: "#17171c",
    color: "#fff",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 20px 60px #000"
  });

  const score = Math.round(
    Number(data.threat_score || 0) * 100
  );

  const reasons = Array.isArray(data.reasons)
    ? data.reasons.slice(0, 6)
    : ["Potential fraud detected"];

  box.innerHTML = `
    <div style="font-size:42px">⚠️</div>

    <h2 style="margin:10px 0">
      GuardAIN Security Warning
    </h2>

    <p style="color:#ff8b8b;font-weight:bold">
      Dangerous site detected
    </p>

    <p style="font-size:13px;word-break:break-all">
      ${escapeHtml(location.hostname)}
    </p>

    <p>
      Threat Score:
      <b style="color:#ff6b6b">${score}%</b>
    </p>

    <div style="margin:15px 0">
      ${reasons.map(r =>
        `<span style="
          display:inline-block;
          padding:5px 9px;
          margin:3px;
          border-radius:15px;
          background:#35191d;
          color:#ffcaca;
          font-size:11px
        ">${escapeHtml(String(r).replace(/_/g, " "))}</span>`
      ).join("")}
    </div>

    <p style="font-size:12px;color:#aaa">
      Do not enter passwords, OTPs, banking details
      or UPI information on this website.
    </p>

    <p id="gaurdain-countdown"
       style="color:#ffd166;font-weight:bold;font-size:16px">
      Closing in 8 seconds...
    </p>

    <button id="gaurdain-back"
      style="
        padding:10px 18px;
        margin:5px;
        border:0;
        border-radius:8px;
        font-weight:bold;
        cursor:pointer
      ">
      Go Back
    </button>

    <button id="gaurdain-proceed"
      style="
        padding:10px 18px;
        margin:5px;
        border:1px solid #7f2931;
        border-radius:8px;
        background:#3a2426;
        color:#ffb7b7;
        font-weight:bold;
        cursor:pointer
      ">
      Proceed Anyway
    </button>
  `;

  overlay.appendChild(box);
  document.documentElement.appendChild(overlay);

  // --------------------
  // BUTTONS
  // --------------------

  let cancelled = false;

  document
    .getElementById("gaurdain-back")
    .onclick = () => {
      cancelled = true;
      history.back();
    };

  document
    .getElementById("gaurdain-proceed")
    .onclick = () => {
      cancelled = true;
      overlay.remove();
      warningShown = false;
    };

  // --------------------
  // 8 SECOND COUNTDOWN
  // --------------------

  let seconds = 8;

  const timer = setInterval(() => {

    if (cancelled) {
      clearInterval(timer);
      return;
    }

    seconds--;

    const counter =
      document.getElementById("gaurdain-countdown");

    if (counter) {
      counter.textContent =
        `Closing in ${seconds} seconds...`;
    }

    if (seconds <= 0) {

      clearInterval(timer);

      // Tell background service worker
      // to close THIS tab.
      chrome.runtime.sendMessage({
        type: "AUTO_CLOSE_WARNING_TAB"
      }).catch(() => {});

    }

  }, 1000);
}

// -------------------- ESCAPE HTML --------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}