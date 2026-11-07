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
 * No generative models; two hand-built worlds; portal is a transaction with rollback.
 */

const FIXTURES = {
  "https://alice.example/worlds/pixel-rooftop/world.json": "/pixel-rooftop/world.json",
  "https://hana.example/worlds/neon-alley/world.json": "/neon-alley/world.json",
};
const SHORT_IDS = { "pixel-rooftop": "/pixel-rooftop/world.json", "neon-alley": "/neon-alley/world.json" };
const PORTAL_RADIUS = 3.4;
const PREFETCH_RADIUS = 7.0;
const FAIL_DEMO = new URLSearchParams(location.search).has("failPortal");

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true });
const state = { active: null, busy: false, prefetched: new Map(), failedOnce: false };
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

function showLoading(text) {
  ui.loadingText.textContent = text;
  ui.loading.classList.add("show");
}
function hideLoading() {
  ui.loading.classList.remove("show");
}
let toastTimer;
function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 6000);
}

/** Minimal manifest sanity checks for the runtime (the full suite lives in @choroweave/check). */
function assertManifest(manifest) {
  const require = (cond, msg) => {
    if (!cond) throw new Error(`invalid world manifest: ${msg}`);
  };
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
  const local = FIXTURES[canonicalUrl];
  if (local) return local;
  const u = new URL(canonicalUrl);
  if (u.origin === location.origin) return u.pathname;
  throw new Error(`target domain ${u.host} is not mapped by the local P0 fixture`);
}

async function fetchManifest(localUrl) {
  const res = await fetch(localUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
  return assertManifest(await res.json());
}

async function loadWorld(localUrl, canonicalHint) {
  const manifest = await fetchManifest(localUrl);
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

  const base = localUrl.slice(0, localUrl.lastIndexOf("/") + 1);
  const entry = manifest.entry.scene;
  try {
    const container = await LoadAssetContainerAsync(base + entry, scene);
    container.addAllToScene();
  } catch (err) {
    scene.dispose();
    throw new Error(`failed to load ${entry}: ${err.message}`);
  }

  const ret = {
    id: (canonicalHint || manifest.id).replace(/^https:\/\/[^/]+/, "").replace(/\/world\.json$/, "").split("/").pop(),
    canonicalId: manifest.id,
    localUrl,
    manifest,
    scene,
    camera,
    portal: manifest.portals[0] || null,
  };
  return ret;
}

function updateHud(world) {
  ui.title.textContent = world.manifest.title;
  ui.sub.textContent = `${world.manifest.id} · ${world.manifest.portals.length} portal(s)`;
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
  try {
    host = new URL(portal.target.url).host;
  } catch {
    /* keep unknown */
  }
  ui.dialogMeta.textContent = `${portal.target.url} · handoff: ${portal.handoff} · policy: confirm ${portal.policy.confirm}`;
  ui.enter.disabled = false;
  ui.enter.textContent = "Enter";
  ui.enter.onclick = () => {
    ui.dialog.close();
    traverse(world.portal).catch((err) => showToast(err.message));
  };
  ui.cancel.onclick = () => ui.dialog.close();
  ui.dialog.showModal();
}

async function prefetch(world) {
  const portal = world.portal;
  if (!portal || state.prefetched.has(portal.target.url)) return;
  state.prefetched.set(portal.target.url, "inflight");
  try {
    const local = resolveLocal(portal.target.url);
    const manifest = await fetchManifest(local);
    state.prefetched.set(portal.target.url, { manifest, local });
  } catch {
    state.prefetched.delete(portal.target.url);
  }
}

async function traverse(portal) {
  if (state.busy) return;
  state.busy = true;
  showLoading(`traversing to ${portal.title || "target world"}…`);
  const previous = state.active;
  let next = null;
  try {
    if (FAIL_DEMO && !state.failedOnce) {
      state.failedOnce = true;
      throw new Error("simulated target node offline (demo)");
    }
    const local = resolveLocal(portal.target.url);
    next = await loadWorld(local, portal.target.url);
    // Success: swap only after the target is fully loaded.
    state.active = next;
    if (previous && previous !== next) previous.scene.dispose();
    updateHud(next);
    updateUrl(next);
    ui.prompt.classList.remove("show");
  } catch (err) {
    if (next) next.scene.dispose();
    // Rollback invariant: the previous scene/camera/state are untouched.
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

  if (!world.portal || state.busy) {
    ui.prompt.classList.remove("show");
    return;
  }
  const [x, y, z] = world.portal.anchor.position;
  const dist = Vector3.Distance(pos, new Vector3(x, y + 1.2, z));
  if (dist < PREFETCH_RADIUS) prefetch(world);
  if (dist < PORTAL_RADIUS) {
    ui.promptTitle.textContent = world.portal.title || "portal";
    ui.prompt.classList.add("show");
  } else {
    ui.prompt.classList.remove("show");
  }
}

function interact() {
  const world = state.active;
  if (!world || state.busy) return;
  if (ui.dialog.open) return;
  if (nearPortal(world)) openPortalDialog(world);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyE") {
    e.preventDefault();
    interact();
  }
  if (e.code === "Escape" && ui.dialog.open) ui.dialog.close();
});
canvas.addEventListener("click", () => {
  if (!ui.dialog.open) interact();
});
canvas.addEventListener("mousedown", () => canvas.focus());

engine.runRenderLoop(() => {
  if (state.active) state.active.scene.render();
  frame();
});
window.addEventListener("resize", () => engine.resize());
window.addEventListener("error", (e) => showToast(e.message || "runtime error"));

async function boot() {
  const params = new URLSearchParams(location.search);
  const short = params.get("world") || "pixel-rooftop";
  const local = SHORT_IDS[short] || SHORT_IDS["pixel-rooftop"];
  showLoading("loading world…");
  try {
    state.active = await loadWorld(local);
    updateHud(state.active);
    ui.prompt.classList.remove("show");
  } catch (err) {
    showToast(`failed to load P0 world: ${err.message}`);
  } finally {
    hideLoading();
  }
  // Test/debug surface for P0 e2e checks (no effect on normal use).
  window.__P0__ = {
    status: () => ({
      world: state.active?.manifest.id ?? null,
      busy: state.busy,
      nearPortal: state.active ? nearPortal(state.active) : false,
      prefetched: [...state.prefetched.keys()],
    }),
    traverse: () => (state.active?.portal ? traverse(state.active.portal) : Promise.reject(new Error("no portal"))),
    enterDialog: () => (state.active ? openPortalDialog(state.active) : null),
  };
}

boot();
