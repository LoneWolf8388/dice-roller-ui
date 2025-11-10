// ========================
// CONFIG
// ========================
// Your Azure App Service URL for the Node API (no trailing slash)
const API_BASE =
  "https://dice-roller-api-cdb5hsbdh9fmc3ft.canadacentral-01.azurewebsites.net/";

// Elements
const out = (...args) => {
  const el = document.getElementById("out");
  el.textContent = args
    .map((v) => (typeof v === "string" ? v : JSON.stringify(v, null, 2)))
    .join(" ");
};

function $(id) {
  return document.getElementById(id);
}

async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, opts);
    // If CORS blocks, we never get here—error thrown before response
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// ------------------------
// Handlers
// ------------------------
async function ping() {
  out("Pinging…");
  try {
    const data = await safeFetch(`${API_BASE}/api/ping`, {
      mode: "cors",
      credentials: "omit",
    });
    out(data);
  } catch (e) {
    out("Ping failed:", String(e));
  }
}

async function roll() {
  const faces = Number($("facesInput").value || 6);
  const count = Number($("countInput").value || 1);
  const url = new URL(`${API_BASE}/api/roll`);
  url.searchParams.set("faces", faces);
  url.searchParams.set("count", count);

  out("Rolling…");
  try {
    const data = await safeFetch(url.toString(), {
      mode: "cors",
      credentials: "omit",
    });
    out(data);
  } catch (e) {
    out("Roll failed:", String(e));
  }
}

// This should be blocked by the browser when called from the static site,
// because the API route is intentionally missing CORS headers.
async function rollNoCors() {
  const faces = Number($("facesInput").value || 6);
  const count = Number($("countInput").value || 1);
  const url = new URL(`${API_BASE}/api/roll-no-cors`);
  url.searchParams.set("faces", faces);
  url.searchParams.set("count", count);

  out("Calling no-CORS endpoint…");
  try {
    const data = await safeFetch(url.toString(), {
      mode: "cors",
      credentials: "omit",
    });
    // If it somehow succeeds, show it (but from the static site it should fail).
    out(data);
  } catch (e) {
    out("Expected CORS failure occurred:", e.message || String(e));
  }
}

// ------------------------
// Wire up after DOM ready (defer ensures DOM is ready here)
// ------------------------
$("btnPing").addEventListener("click", ping);
$("btnRoll").addEventListener("click", roll);
$("btnRollNoCors").addEventListener("click", rollNoCors);

// Wake the server when the page loads (good for cold starts)
ping();
