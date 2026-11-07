# P0 fixtures — frozen two-world traversal harness

> Spec: [`docs/en/06-mvp-spec.md`](../../docs/en/06-mvp-spec.md) §2.1 · 中文：[`docs/06-mvp-spec.md`](../../docs/06-mvp-spec.md) §2.1
> Status: **specification only** (created with the plan; files are populated during P0-1).

## Canonical worlds

| World ID | Node | Canonical URL (must match distribution) | Directory |
|---|---|---|---|
| `pixel-rooftop` | Node A — `alice.example` | `https://alice.example/worlds/pixel-rooftop/world.json` | `examples/pixel-rooftop/` |
| `neon-alley` | Node B — `hana.example` | `https://hana.example/worlds/neon-alley/world.json` | `examples/neon-alley/` (P0-1) |

Frozen identifiers: world IDs, canonical URLs, portal `door_to_neon_alley`, spawn `spawn_default`.
Any change requires an SHP minor version bump and a fixture update.

## Local mapping

`alice.example` and `hana.example` are reserved test names, not public DNS.

```
# fixtures/p0/hosts  (example; add to /etc/hosts)
127.0.0.1 alice.example
127.0.0.1 hana.example
```

Use a local CA (mkcert) for both domains, reverse-proxy 443, and keep the canonical URLs unchanged.
`weave-check --fixture p0` may inject DNS resolution (`--resolve`) instead of editing `/etc/hosts`.

## Planned files (P0-1/P0-3)

| File | Purpose |
|---|---|
| `hosts.example` | `/etc/hosts` mapping for the two test domains |
| `nodes.yaml` | Node A/B roots, ports, cert paths (created in P0-1) |
| `traversal-10.example.json` | 10 bidirectional jump script with expected results (created in P0-2) |
| `golden/` | Golden copies of both signed `world.json` files (created in P0-1) |

## Gate commands

```bash
pnpm test:p0                       # 10/10 traversal + weave-check 22/22
node scripts/validate.mjs --strict # plan repo self-check
```

Exit criteria (G0, **2027-01-25**): bidirectional 10/10, `weave-check` 22/22, ≥1 external developer reproduction, zero generative-model calls.
