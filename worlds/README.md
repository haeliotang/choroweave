# P0 runtime worlds

Two hand-built worlds used by the P0 playground. **Generated — do not edit by hand.**

| World | Canonical URL (frozen) | Directory |
|---|---|---|
| Pixel Rooftop | `https://alice.example/worlds/pixel-rooftop/world.json` | `worlds/pixel-rooftop/` |
| Neon Alley | `https://hana.example/worlds/neon-alley/world.json` | `worlds/neon-alley/` |

Each directory contains a SHP `world.json` and `scene/world.glb` (glTF 2.0 binary, simple box geometry).
The manifests are unsigned in P0-1; the viewer reports them as unverified, which is allowed by SHP §8.

Regenerate deterministically:

```bash
pnpm run worlds:build     # runs scripts/build-p0-worlds.mjs
```

The playground serves these at `/pixel-rooftop/...` and `/neon-alley/...`; the runtime maps the
canonical fixture URLs to those local paths (`apps/playground/src/main.js`).

Traversal contract under test: `pixel-rooftop` ↔ `neon-alley` via `CHW_portal`, 10/10 bidirectional
with a rollback path (`?failPortal=1`). See [`fixtures/p0/README.md`](../fixtures/p0/README.md).
