#!/usr/bin/env node
/**
 * Deterministic P0 world builder.
 *
 * Emits two hand-built, simple-geometry worlds as glTF 2.0 binary (.glb)
 * plus SHP world.json manifests with frozen canonical IDs/URLs:
 *
 *   alice.example  -> /worlds/pixel-rooftop/world.json
 *   hana.example   -> /worlds/neon-alley/world.json
 *
 * No generative models are involved. Re-running produces byte-identical output.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORLDS = join(ROOT, "worlds");

const WORLD_A = {
  id: "pixel-rooftop",
  canonicalUrl: "https://alice.example/worlds/pixel-rooftop/world.json",
  title: "Pixel Rooftop (P0)",
  author: { name: "Alice", url: "https://alice.example", did: "did:web:alice.example" },
  description: "Hand-built P0 rooftop: concrete floor, parapet, table, radio, glowing door to Neon Alley.",
};

const WORLD_B = {
  id: "neon-alley",
  canonicalUrl: "https://hana.example/worlds/neon-alley/world.json",
  title: "Neon Alley (P0)",
  author: { name: "Hana", url: "https://hana.example", did: "did:web:hana.example" },
  description: "Hand-built P0 alley: wet floor, neon signs, awnings, return door to Pixel Rooftop.",
};

/** @typedef {{name:string,size:[number,number,number],pos:[number,number,number],color:[number,number,number],emissive?:[number,number,number],metallic?:number,roughness?:number}} Box */

function box(name, size, pos, color, opts = {}) {
  return { name, size, pos, color, ...opts };
}

/** @type {Box[]} */
const ROOFTOP_BOXES = [
  box("floor", [10, 0.2, 10], [0, -0.1, 0], [0.22, 0.2, 0.2], { roughness: 0.95 }),
  box("parapet_south", [10, 1.2, 0.25], [0, 0.6, 5], [0.16, 0.15, 0.15], { roughness: 0.9 }),
  box("parapet_west", [0.25, 1.2, 10], [-4.9, 0.6, 0], [0.16, 0.15, 0.15], { roughness: 0.9 }),
  box("parapet_east", [0.25, 1.2, 10], [4.9, 0.6, 0], [0.16, 0.15, 0.15], { roughness: 0.9 }),
  box("parapet_north_left", [4.2, 1.2, 0.25], [-2.9, 0.6, -5], [0.16, 0.15, 0.15], { roughness: 0.9 }),
  box("parapet_north_right", [4.2, 1.2, 0.25], [2.9, 0.6, -5], [0.16, 0.15, 0.15], { roughness: 0.9 }),
  box("door_frame", [1.9, 2.3, 0.18], [0, 1.15, -4.95], [0.35, 0.08, 0.1], { emissive: [0.9, 0.08, 0.12], roughness: 0.4 }),
  box("door_glow", [1.5, 1.95, 0.06], [0, 1.1, -4.9], [0.05, 0.9, 1], { emissive: [0.05, 0.75, 1], roughness: 0.2 }),
  box("table_top", [1.4, 0.1, 0.8], [0, 0.72, 0], [0.55, 0.34, 0.18], { roughness: 0.7 }),
  box("table_leg_a", [0.08, 0.7, 0.08], [-0.6, 0.35, -0.3], [0.3, 0.18, 0.1]),
  box("table_leg_b", [0.08, 0.7, 0.08], [0.6, 0.35, -0.3], [0.3, 0.18, 0.1]),
  box("radio", [0.42, 0.26, 0.24], [0, 0.88, 0], [0.75, 0.2, 0.12], { emissive: [0.25, 0.05, 0.02] }),
  box("stool_left", [0.5, 0.45, 0.5], [-1.4, 0.22, 0.6], [0.6, 0.08, 0.12]),
  box("stool_right", [0.5, 0.45, 0.5], [1.4, 0.22, 0.6], [0.6, 0.08, 0.12]),
  box("water_tower", [1.4, 1.6, 1.4], [3.2, 0.8, -3.4], [0.18, 0.3, 0.36]),
];

/** @type {Box[]} */
const ALLEY_BOXES = [
  box("floor", [6, 0.2, 14], [0, -0.1, 0], [0.12, 0.14, 0.16], { roughness: 0.4, metallic: 0.1 }),
  box("wall_west", [0.3, 3.6, 14], [-3, 1.8, 0], [0.15, 0.15, 0.18], { roughness: 0.85 }),
  box("wall_east", [0.3, 3.6, 14], [3, 1.8, 0], [0.15, 0.15, 0.18], { roughness: 0.85 }),
  box("wall_warm_brick", [6, 3.6, 0.3], [0, 1.8, -7], [0.24, 0.16, 0.13], { roughness: 0.9 }),
  box("return_frame", [1.9, 2.3, 0.18], [0, 1.15, 6.85], [0.35, 0.08, 0.1], { emissive: [0.9, 0.08, 0.12] }),
  box("return_glow", [1.5, 1.95, 0.06], [0, 1.1, 6.8], [0.05, 0.9, 1], { emissive: [0.05, 0.75, 1] }),
  box("neon_pink", [3.2, 0.28, 0.08], [-1.3, 2.6, -6.8], [1, 0.15, 0.7], { emissive: [1, 0.1, 0.6] }),
  box("neon_cyan", [0.08, 2.6, 0.28], [2.7, 1.8, -3.5], [0.1, 0.9, 1], { emissive: [0.05, 0.8, 1] }),
  box("awning_left", [1.8, 0.12, 3.2], [-2.1, 2.4, -2.2], [0.35, 0.05, 0.1], { roughness: 0.6 }),
  box("awning_right", [1.8, 0.12, 3.2], [2.1, 2.4, 1.8], [0.05, 0.2, 0.4], { roughness: 0.6 }),
  box("crate_a", [0.7, 0.7, 0.7], [-1.6, 0.35, 2.6], [0.35, 0.24, 0.12]),
  box("crate_b", [0.5, 0.5, 0.5], [1.8, 0.25, 4.4], [0.3, 0.22, 0.14]),
  box("street_lamp", [0.18, 2.4, 0.18], [1.4, 1.2, -4.6], [0.2, 0.2, 0.22], { emissive: [0.2, 0.16, 0.08] }),
];

// ---------------------------------------------------------------- glTF writer

function writeGlb(file, boxes) {
  const bin = [];
  let offset = 0;
  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const materials = [];
  const nodes = [];

  for (const b of boxes) {
    const positions = [];
    const normals = [];
    const indices = [];
    const [sx, sy, sz] = b.size.map((v) => v / 2);
    const [cx, cy, cz] = b.pos;
    const faces = [
      { n: [1, 0, 0], v: [[sx, -sy, -sz], [sx, sy, -sz], [sx, sy, sz], [sx, -sy, sz]] },
      { n: [-1, 0, 0], v: [[-sx, -sy, sz], [-sx, sy, sz], [-sx, sy, -sz], [-sx, -sy, -sz]] },
      { n: [0, 1, 0], v: [[-sx, sy, -sz], [-sx, sy, sz], [sx, sy, sz], [sx, sy, -sz]] },
      { n: [0, -1, 0], v: [[-sx, -sy, sz], [-sx, -sy, -sz], [sx, -sy, -sz], [sx, -sy, sz]] },
      { n: [0, 0, 1], v: [[-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz]] },
      { n: [0, 0, -1], v: [[sx, -sy, -sz], [-sx, -sy, -sz], [-sx, sy, -sz], [sx, sy, -sz]] },
    ];
    for (const f of faces) {
      const base = positions.length / 3;
      for (const v of f.v) positions.push(v[0] + cx, v[1] + cy, v[2] + cz);
      for (let i = 0; i < 4; i++) normals.push(...f.n);
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    const posBytes = Buffer.from(new Float32Array(positions).buffer);
    const normBytes = Buffer.from(new Float32Array(normals).buffer);
    const idxBytes = Buffer.from(new Uint16Array(indices).buffer);
    // 4-byte alignment
    const align4 = (n) => (n + 3) & ~3;
    const posOff = offset;
    bin.push(posBytes);
    offset += posBytes.length;
    const normOff = offset;
    bin.push(normBytes);
    offset += normBytes.length;
    const pad = align4(offset) - offset;
    if (pad) {
      bin.push(Buffer.alloc(pad));
      offset += pad;
    }
    const idxOff = offset;
    bin.push(idxBytes);
    offset += idxBytes.length;
    const pad2 = align4(offset) - offset;
    if (pad2) {
      bin.push(Buffer.alloc(pad2));
      offset += pad2;
    }
    const posView = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: posOff, byteLength: posBytes.length, target: 34962 });
    const normView = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: normOff, byteLength: normBytes.length, target: 34962 });
    const idxView = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: idxOff, byteLength: idxBytes.length, target: 34963 });
    const min = [Math.min(...positions.filter((_, i) => i % 3 === 0)), Math.min(...positions.filter((_, i) => i % 3 === 1)), Math.min(...positions.filter((_, i) => i % 3 === 2))];
    const max = [Math.max(...positions.filter((_, i) => i % 3 === 0)), Math.max(...positions.filter((_, i) => i % 3 === 1)), Math.max(...positions.filter((_, i) => i % 3 === 2))];
    accessors.push({ bufferView: posView, componentType: 5126, count: positions.length / 3, type: "VEC3", min, max });
    const posAccessor = accessors.length - 1;
    accessors.push({ bufferView: normView, componentType: 5126, count: normals.length / 3, type: "VEC3" });
    const normAccessor = accessors.length - 1;
    accessors.push({ bufferView: idxView, componentType: 5123, count: indices.length, type: "SCALAR" });
    const idxAccessor = accessors.length - 1;

    const mat = {
      name: `${b.name}_mat`,
      pbrMetallicRoughness: {
        baseColorFactor: [...b.color, 1],
        metallicFactor: b.metallic ?? 0,
        roughnessFactor: b.roughness ?? 0.8,
      },
    };
    if (b.emissive) mat.emissiveFactor = b.emissive;
    materials.push(mat);
    const matIndex = materials.length - 1;

    meshes.push({ name: b.name, primitives: [{ attributes: { POSITION: posAccessor, NORMAL: normAccessor }, indices: idxAccessor, material: matIndex }] });
    nodes.push({ name: b.name, mesh: meshes.length - 1 });
  }

  const binBuffer = Buffer.concat(bin);
  const gltf = {
    asset: { version: "2.0", generator: "choroweave-p0-world-builder" },
    scene: 0,
    scenes: [{ name: "world", nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binBuffer.length }],
  };

  const json = Buffer.from(JSON.stringify(gltf), "utf8");
  const jsonPad = (4 - (json.length % 4)) % 4;
  const jsonChunk = Buffer.concat([json, Buffer.alloc(jsonPad, 0x20)]);
  const binPad = (4 - (binBuffer.length % 4)) % 4;
  const binChunk = Buffer.concat([binBuffer, Buffer.alloc(binPad)]);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // glTF
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4); // JSON
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binChunk.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4); // BIN

  writeFileSync(file, Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]));
}

function manifest(world, { portalId, portalTitle, targetUrl, anchorPos, spawnPos, syncWhitelist, triangles }) {
  return {
    schemaVersion: "0.1",
    id: world.canonicalUrl,
    title: world.title,
    description: world.description,
    author: world.author,
    license: "CC-BY-4.0",
    createdAt: "2026-11-07T00:00:00Z",
    updatedAt: "2026-11-07T00:00:00Z",
    protocol: { name: "SHP", version: "0.1" },
    entry: { scene: "scene/world.glb", format: "gltf-2.0", interactivity: "KHR_interactivity" },
    spawn: { node: "spawn_default", position: spawnPos, rotationY: 180 },
    assets: [],
    capabilities: {
      interactivity: { extension: "KHR_interactivity" },
      extensions: ["CHW_portal"],
      maxPlayers: 20,
      audio: { spatial: false, music: false },
      avatar: { format: "gltf", required: false },
      sync: { rateHz: 15, whitelist: syncWhitelist },
    },
    portals: [
      {
        id: portalId,
        entity: "neon_door",
        title: portalTitle,
        target: { url: targetUrl },
        anchor: { spawnNode: "spawn_default", position: anchorPos, rotationY: 180 },
        handoff: "cross-instance",
        policy: { confirm: "once", carry: ["avatar"], allowGuests: true, prefetch: "proximity", maxPrefetchBytes: 8388608 },
        version: "0.1",
      },
    ],
    perf: {
      budget: { triangles, drawCalls: 64, textureMB: 8, firstByteKB: 3072 },
    },
    moderation: { rating: "general", allowGuests: true },
  };
}

function main() {
  for (const [w, boxes] of [
    [WORLD_A, ROOFTOP_BOXES],
    [WORLD_B, ALLEY_BOXES],
  ]) {
    const dir = join(WORLDS, w.id);
    mkdirSync(join(dir, "scene"), { recursive: true });
    writeGlb(join(dir, "scene", "world.glb"), boxes);
    console.log(`built ${w.id}: ${boxes.length} boxes -> scene/world.glb`);
  }

  const rooftop = manifest(WORLD_A, {
    portalId: "door_to_neon_alley",
    portalTitle: "Neon Alley",
    targetUrl: WORLD_B.canonicalUrl,
    anchorPos: [0, 1.1, -4.7],
    spawnPos: [0, 0, 3.8],
    syncWhitelist: ["/nodes/{radio}/translation", "/nodes/{radio}/rotation", "/extensions/CHW_logic/props/lightsOn"],
    triangles: 12000,
  });
  const alley = manifest(WORLD_B, {
    portalId: "door_to_rooftop",
    portalTitle: "Pixel Rooftop",
    targetUrl: WORLD_A.canonicalUrl,
    anchorPos: [0, 1.1, 6.6],
    spawnPos: [0, 0, -5.2],
    syncWhitelist: ["/nodes/{crate_a}/translation", "/extensions/CHW_logic/props/neonOn"],
    triangles: 14000,
  });

  writeFileSync(join(WORLDS, WORLD_A.id, "world.json"), JSON.stringify(rooftop, null, 2) + "\n");
  writeFileSync(join(WORLDS, WORLD_B.id, "world.json"), JSON.stringify(alley, null, 2) + "\n");
  console.log("wrote world.json for both worlds");
}

main();
