import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";

/**
 * P0 playground: load a World Bundle, roam, and traverse a CHW_portal.
 * Two modes:
 *  - fixture (default): local /worlds paths, no network trust required.
 *  - live (?live=1): real HTTPS node origins, signed descriptors pinned by
 *    fixtures/p0 trust anchors, one-time arrive token, strict fetch.
 */

const FIXTURES = {
  "https://alice.example/worlds/pixel-rooftop/world.json": "/pixel-rooftop/world.json",
  "https://hana.example/worlds/neon-alley/world.json": "/neon-alley/world.json",
};
const LIVE = {
  "pixel-rooftop": "https://alice.example:8443/worlds/pixel-rooftop/world.json",
  "neon-alley": "https://hana.example:8444/worlds/neon-alley/world.json",
};
const SHORT_IDS = { "pixel-rooftop": "/pixel-rooftop/world.json", "neon-alley": "/neon-alley/world.json" };
const PORTAL_RADIUS = 3.4;
const PREFETCH_RADIUS = 7.0;
const params = new URLSearchParams(location.search);
const IS_LIVE = params.has("live");
const FAIL_DEMO = params.has("failPortal");
const DEFAULT_LIMIT = 8 * 1024 * 1024;

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true });
const state = { active: null, busy: false, prefetched: new Map(), failedOnce: false, trust: null, mode: IS_LIVE ? "live" : "fixture" };
const budget = { used: 0, limit: DEFAULT_LIMIT, aborted: false };
const ui = {
  loading: document.getElementById("loading"),
  loadingText: document.getElementById("loadingText"),
  toast: document.getElementById("toast"),
  title: document.getElementById("worldTitle"),
  sub: document.getElementById("worldSub"),
  prompt: document.getElementById("portalPrompt"),
  promptTitle: document.getElementById("portalTitle"),
  fps: document.getElementById("fps"),
  dialog: document.getElementById("portalDialog"),
  dialogTitle: document.getElementById("dialogTitle"),
  dialogMeta: document.getElementById("dialogMeta"),
  enter: document.getElementById("enterBtn"),
  cancel: document.getElementById("cancelBtn"),
};

function showLoading(text) { ui.loadingText.textContent = text; ui.loading.classList.add("show"); }
function hideLoading() { ui.loading.classList.remove("show"); }
let toastTimer;
function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 7000);
}

function canonical(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
}
function b64u(s) { return Uint8Array.from(atob(String(s).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)); }

async function bootstrapTrust() {
  const res = await fetch("/p0/trust.json", { cache: "no-store" });
  if (!res.ok) throw new Error("trust fixture unavailable (/p0/trust.json)");
  const doc = await res.json();
  state.trust = doc.origins || {};
  if (!Object.keys(state.trust).length) throw new Error("trust fixture has no origins");
}

function assertTrusted(origin) {
  if (!IS_LIVE) return;
  if (!state.trust?.[origin]) throw new Error(`origin ${origin} is not in the local trust fixture (SSRF guard)`);
}

async function verifyNode(origin) {
  assertTrusted(origin);
  const res = await fetch(`${origin}/.well-known/weave-node.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`node descriptor HTTP ${res.status}`);
  const doc = await res.json();
  const anchor = state.trust[origin];
  const { signature, ...rest } = doc;
  if (!signature || signature.alg !== "ed25519") throw new Error("node descriptor signature missing");
  if (doc.node?.publicKey?.x !== anchor.publicJwk.x) throw new Error("node key does not match pinned trust anchor");
  if (doc.node?.origin !== origin) throw new Error("node origin mismatch");
  const key = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: anchor.publicJwk.x }, { name: "Ed25519" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("Ed25519", key, b64u(signature.value), new TextEncoder().encode(canonical(rest)));
  if (!ok) throw new Error("node descriptor signature invalid");
  return doc;
}

function assertManifest(manifest) {
  const require = (cond, msg) => { if (!cond) throw new Error(`invalid world manifest: ${msg}`); };
  require(manifest && typeof manifest === "object", "root must be an object");
  require(manifest.schemaVersion === "0.1", "unsupported schemaVersion");
  require(/^https:\/\//.test(manifest.id || ""), "id must be https URL");
  require(manifest.protocol?.name === "SHP" && manifest.protocol?.version === "0.1", "protocol must be SHP 0.1");
  require(/^scene\/[A-Za-z0-9._/-]+\.glb$/.test(manifest.entry?.scene || ""), "entry.scene must be a scene/*.glb path");
  require(Array.isArray(manifest.spawn?.position) && manifest.spawn.position.length === 3, "spawn.position must be [x,y,z]");
  require(Array.isArray(manifest.portals), "portals must be an array");
  return manifest;
}

function resolveLocal(canonicalUrl) {
  if (IS_LIVE) {
    const u = new URL(canonicalUrl);
    if (u.protocol !== "https:") throw new Error("target must be https");
    assertTrusted(u.origin);
    return canonicalUrl;
  }
  const local = FIXTURES[canonicalUrl];
  if (local) return local;
  const u = new URL(canonicalUrl);
  if (u.origin === location.origin) return u.pathname;
  throw new Error(`target domain ${u.host} is not mapped by the local P0 fixture`);
}

async function fetchManifest(url) {
  if (IS_LIVE) {
    const u = new URL(url);
    assertTrusted(u.origin);
    if (u.origin !== new URL(state.active?.canonicalId || url).origin) await verifyNode(u.origin);
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
  return assertManifest(await res.json());
}

async function loadWorld(url, canonicalHint) {
  const manifest = await fetchManifest(url);
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  scene.clearColor = new Color4(0.04, 0.05, 0.08, 1);

  const hemi = new HemisphericLight("hemi", new Vector3(0.3, 1, 0.2), scene);
  hemi.intensity = 0.85;
  const sun = new DirectionalLight("sun", new Vector3(-0.4, -1, 0.5), scene);
  sun.intensity = 1.1;

  const spawn = manifest.spawn.position;
  const camera = new UniversalCamera("camera", new Vector3(spawn[0], spawn[1] + 1.65, spawn[2]), scene);
  camera.minZ = 0.05;
  camera.maxZ = 400;
  camera.speed = 0.18;
  camera.inertia = 0.55;
  camera.angularSensibility = 1400;
  camera.keysUp = [38, 87];
  camera.keysDown = [40, 83];
  camera.keysLeft = [37, 65];
  camera.keysRight = [39, 68];
  const yaw = ((manifest.spawn.rotationY ?? 0) * Math.PI) / 180;
  camera.setTarget(new Vector3(spawn[0] + Math.sin(yaw), spawn[1] + 1.55, spawn[2] - Math.cos(yaw)));
  camera.attachControl(canvas, true);
  scene.activeCamera = camera;

  const base = url.slice(0, url.lastIndexOf("/") + 1);
  try {
    const container = await LoadAssetContainerAsync(base + manifest.entry.scene, scene);
    container.addAllToScene();
  } catch (err) {
    scene.dispose();
    throw new Error(`failed to load ${manifest.entry.scene}: ${err.message}`);
  }

  const portal = manifest.portals[0] || null;
  budget.limit = portal?.policy?.maxPrefetchBytes ?? DEFAULT_LIMIT;
  budget.used = 0;
  budget.aborted = false;

  return {
    id: (canonicalHint || manifest.id).replace(/^https:\/\/[^/]+/, "").replace(/\/world\.json$/, "").split("/").pop(),
    canonicalId: manifest.id,
    localUrl: url,
    manifest,
    scene,
    camera,
    portal,
  };
}

function updateHud(world) {
  ui.title.textContent = world.manifest.title;
  ui.sub.textContent = `${world.manifest.id} · ${world.manifest.portals.length} portal(s)${IS_LIVE ? " · LIVE" : ""}`;
}
function updateUrl(world) {
  const url = new URL(location.href);
  url.searchParams.set("world", world.id);
  history.replaceState(null, "", url);
}
function nearPortal(world) {
  if (!world.portal) return false;
  const [x, y, z] = world.portal.anchor.position;
  return Vector3.Distance(world.camera.position, new Vector3(x, y + 1.2, z)) < PORTAL_RADIUS;
}

function openPortalDialog(world) {
  const portal = world.portal;
  if (!portal || state.busy) return;
  ui.dialogTitle.textContent = `Enter ${portal.title || "another world"}?`;
  let host = "unknown";
  try { host = new URL(portal.target.url).host; } catch { /* keep */ }
  ui.dialogMeta.textContent = `${portal.target.url} · handoff: ${portal.handoff} · policy: confirm ${portal.policy.confirm}${host ? ` · ${host}` : ""}`;
  ui.enter.disabled = false;
  ui.enter.textContent = "Enter";
  ui.enter.onclick = () => { ui.dialog.close(); traverse(world.portal).catch(() => {}); };
  ui.cancel.onclick = () => ui.dialog.close();
  ui.dialog.showModal();
}

function accountPrefetch(bytes) {
  if (budget.used + bytes > budget.limit) {
    budget.aborted = true;
    return { ok: false, code: "E_PREFETCH_BUDGET", used: budget.used, limit: budget.limit };
  }
  budget.used += bytes;
  return { ok: true, used: budget.used, limit: budget.limit };
}

function tryWritePointer(pointer) {
  const wl = state.active?.manifest?.capabilities?.sync?.whitelist || [];
  const suffixFor = (p) => p.split("/").slice(3).join("/");
  const ok = wl.some((p) => {
    const m = p.match(/^\/nodes\/\{([A-Za-z_][A-Za-z0-9_]*)\}\/(.+)$/);
    if (m) return new RegExp(`^/nodes/[^/]+/${suffixFor(p)}$`).test(pointer);
    return p === pointer;
  });
  return { ok, pointer };
}

async function prefetch(world) {
  const portal = world.portal;
  if (!portal || state.prefetched.has(portal.target.url)) return;
  state.prefetched.set(portal.target.url, "inflight");
  try {
    if (!IS_LIVE) {
      const manifest = await fetchManifest(resolveLocal(portal.target.url));
      state.prefetched.set(portal.target.url, { manifest });
      return;
    }
    const target = new URL(portal.target.url);
    assertTrusted(target.origin);
    await verifyNode(target.origin);
    const res = await fetch(portal.target.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`prefetch HTTP ${res.status}`);
    const text = await res.text();
    const accounted = accountPrefetch(new TextEncoder().encode(text).length);
    state.prefetched.set(portal.target.url, accounted.ok ? { text } : { aborted: accounted.code });
  } catch {
    state.prefetched.delete(portal.target.url);
  }
}

async function arrive(origin, targetWorld) {
  assertTrusted(origin);
  const sessionId = crypto.randomUUID();
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const res = await fetch(`${origin}/arrive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetWorld, sessionId, nonce }),
  });
  const doc = await res.json();
  if (!res.ok) throw Object.assign(new Error(`arrive failed: ${doc.error || res.status}`), { code: doc.error });
  const consumed = await fetch(`${origin}/arrive/consume`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: doc.token }),
  });
  const c = await consumed.json();
  if (!consumed.ok) throw new Error(`token rejected: ${c.error || consumed.status}`);
  return { token: doc.token, sessionId };
}

async function traverse(portal, opts = {}) {
  if (opts.gesture === false) throw Object.assign(new Error("E_GESTURE_REQUIRED"), { code: "E_GESTURE_REQUIRED" });
  if (state.busy) return;
  state.busy = true;
  showLoading(`traversing to ${portal.title || "target world"}…`);
  const previous = state.active;
  let next = null;
  try {
    if (FAIL_DEMO && !state.failedOnce) { state.failedOnce = true; throw new Error("simulated target node offline (demo)"); }
    let singlePlayer = false;
    if (IS_LIVE) {
      const target = new URL(portal.target.url);
      assertTrusted(target.origin);
      await verifyNode(target.origin);
      try {
        await arrive(target.origin, portal.target.url);
      } catch (err) {
        if (err.code === "E_ROOM_FULL") {
          singlePlayer = true;
          showToast("target room is full — entering single-player preview");
        } else {
          throw err;
        }
      }
    }
    const local = resolveLocal(portal.target.url);
    next = await loadWorld(local, portal.target.url);
    next.singlePlayer = singlePlayer;
    state.active = next;
    if (previous && previous !== next) previous.scene.dispose();
    updateHud(next);
    updateUrl(next);
    ui.prompt.classList.remove("show");
  } catch (err) {
    if (next) next.scene.dispose();
    showToast(`traversal failed: ${err.message} — stayed in ${previous ? previous.manifest.title : "current world"}`);
    throw err;
  } finally {
    state.busy = false;
    hideLoading();
  }
}

function frame() {
  const world = state.active;
  if (!world) return;
  const pos = world.camera.position;
  ui.fps.textContent = `${engine.getFps().toFixed(0)} fps · ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
  if (!world.portal || state.busy) { ui.prompt.classList.remove("show"); return; }
  const [x, y, z] = world.portal.anchor.position;
  const dist = Vector3.Distance(pos, new Vector3(x, y + 1.2, z));
  if (dist < PREFETCH_RADIUS) prefetch(world);
  if (dist < PORTAL_RADIUS) { ui.promptTitle.textContent = world.portal.title || "portal"; ui.prompt.classList.add("show"); }
  else ui.prompt.classList.remove("show");
}

function interact() {
  const world = state.active;
  if (!world || state.busy || ui.dialog.open) return;
  if (nearPortal(world)) openPortalDialog(world);
}
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyE") { e.preventDefault(); interact(); }
  if (e.code === "Escape" && ui.dialog.open) ui.dialog.close();
});
canvas.addEventListener("click", () => { if (!ui.dialog.open) interact(); });

engine.runRenderLoop(() => { if (state.active) state.active.scene.render(); frame(); });
window.addEventListener("resize", () => engine.resize());
window.addEventListener("error", (e) => showToast(e.message || "runtime error"));

async function boot() {
  const short = params.get("world") || "pixel-rooftop";
  showLoading("loading world…");
  try {
    if (IS_LIVE) {
      await bootstrapTrust();
      const bootUrl = LIVE[short] || LIVE["pixel-rooftop"];
      await verifyNode(new URL(bootUrl).origin);
      state.active = await loadWorld(bootUrl);
    } else {
      state.active = await loadWorld(SHORT_IDS[short] || SHORT_IDS["pixel-rooftop"]);
    }
    updateHud(state.active);
    ui.prompt.classList.remove("show");
  } catch (err) {
    showToast(`failed to load P0 world: ${err.message}`);
  } finally { hideLoading(); }

  window.__P0__ = {
    status: () => ({
      mode: state.mode,
      world: state.active?.manifest.id ?? null,
      busy: state.busy,
      nearPortal: state.active ? nearPortal(state.active) : false,
      singlePlayer: Boolean(state.active?.singlePlayer),
      prefetched: [...state.prefetched.keys()],
      budget: { used: budget.used, limit: budget.limit, aborted: budget.aborted },
      trust: state.trust ? Object.keys(state.trust) : [],
    }),
    traverse: () => (state.active?.portal ? traverse(state.active.portal) : Promise.reject(new Error("no portal"))),
    autoTraverse: () => (state.active?.portal ? traverse(state.active.portal, { gesture: false }) : Promise.reject(new Error("no portal"))),
    enterDialog: () => (state.active ? openPortalDialog(state.active) : null),
    teleportToPortal: () => {
      const w = state.active;
      if (!w?.portal) return false;
      const [x, y, z] = w.portal.anchor.position;
      w.camera.position = new Vector3(x, y + 1.2, z + 1.6);
      w.camera.setTarget(new Vector3(x, y + 1.2, z));
      return true;
    },
    prefetchTest: (bytes) => accountPrefetch(bytes),
    tryWritePointer,
  };
  window.dispatchEvent(new CustomEvent("p0-ready"));
}
boot();
