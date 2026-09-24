// Sign-in gate for private JS Systems projects.
// Framework-agnostic: Web Request/Response + Web Crypto only, no dependencies.
// Env: GATE_EMAIL, GATE_PASSWORD_SHA256 (hex sha256 of "js-gate:" + password), GATE_SECRET (random, 32+ chars).
// gate(request) returns a Response to send (login page, redirect, 401) or null to let the request through.

const COOKIE = "js_gate";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const LOGIN_PATH = "/__login";
export const LOGOUT_PATH = "/__logout";

const enc = new TextEncoder();

function env() {
  const e = (typeof process !== "undefined" && process.env) || {};
  return { email: (e.GATE_EMAIL || "").trim().toLowerCase(), hash: (e.GATE_PASSWORD_SHA256 || "").trim().toLowerCase(), secret: e.GATE_SECRET || "" };
}

function hex(buf) { return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""); }

function sameString(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256(text) { return hex(await crypto.subtle.digest("SHA-256", enc.encode(text))); }

async function sign(secret, text) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

function readCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return "";
}

function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") && !value.startsWith(LOGIN_PATH) ? value : "/";
}

function configured(c) { return c.email && /^[0-9a-f]{64}$/.test(c.hash) && c.secret.length >= 32; }

export async function isSignedIn(request) {
  const c = env();
  if (!configured(c)) return false;
  const [exp, mac] = readCookie(request, COOKIE).split(".");
  if (!exp || !mac || !(Number(exp) > Date.now() / 1000)) return false;
  return sameString(mac, await sign(c.secret, `${c.email}|${exp}`));
}

function cookieHeader(request, value, maxAge) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function esc(s) { return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]); }

function loginPage({ title, next, error, status = 200 }) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Entrar · ${esc(title)}</title>
<style>
:root{--bg:#f4f6f9;--card:#fff;--ink:#0f1b2d;--muted:#5b6778;--line:#d9dee6;--accent:#0f2a4a;--err:#b42318;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0b111b;--card:#121a27;--ink:#e8edf4;--muted:#94a0b2;--line:#253247;--accent:#5cc8e8;--err:#ff8a80;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);font:16px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif}
form{width:100%;max-width:380px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px 24px;box-shadow:0 10px 30px rgba(15,27,45,.08)}
.eyebrow{margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
h1{margin:0 0 20px;font-size:22px;line-height:1.25}
label{display:block;font-size:14px;font-weight:600;margin:14px 0 6px}
input{width:100%;font:inherit;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit}
input:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
button{margin-top:22px;width:100%;font:inherit;font-weight:600;padding:13px;border:0;border-radius:10px;background:var(--accent);color:var(--card);cursor:pointer}
.err{margin:14px 0 0;color:var(--err);font-size:14px}
</style></head><body>
<form method="post" action="${LOGIN_PATH}">
<p class="eyebrow">Acceso privado</p><h1>${esc(title)}</h1>
<input type="hidden" name="next" value="${esc(next)}">
<label for="email">Correo</label><input id="email" name="email" type="email" autocomplete="username" required autofocus>
<label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required>
${error ? `<p class="err" role="alert">${esc(error)}</p>` : ""}
<button type="submit">Entrar</button>
</form></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}

function redirect(request, path, cookie) {
  const headers = new Headers({ location: new URL(path, request.url).toString(), "cache-control": "no-store" });
  if (cookie) headers.append("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export async function gate(request, { title = "Proyecto privado" } = {}) {
  const url = new URL(request.url);
  const c = env();

  if (url.pathname === LOGOUT_PATH) return redirect(request, LOGIN_PATH, cookieHeader(request, "", 0));

  if (url.pathname === LOGIN_PATH) {
    if (!configured(c)) return loginPage({ title, next: "/", error: "El acceso no está configurado en este servidor.", status: 503 });
    if (request.method !== "POST") return loginPage({ title, next: safeNext(url.searchParams.get("next")) });
    const form = await request.formData();
    const next = safeNext(form.get("next"));
    const email = String(form.get("email") || "").trim().toLowerCase();
    const hash = await sha256("js-gate:" + String(form.get("password") || ""));
    if (sameString(email, c.email) && sameString(hash, c.hash)) {
      const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
      return redirect(request, next, cookieHeader(request, `${exp}.${await sign(c.secret, `${c.email}|${exp}`)}`, MAX_AGE));
    }
    await new Promise((r) => setTimeout(r, 700));
    return loginPage({ title, next, error: "Correo o contraseña incorrectos.", status: 401 });
  }

  if (await isSignedIn(request)) return null;

  const wantsPage = request.method === "GET" && (request.headers.get("accept") || "").includes("text/html");
  if (wantsPage) return redirect(request, `${LOGIN_PATH}?next=${encodeURIComponent(url.pathname + url.search)}`);
  return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
