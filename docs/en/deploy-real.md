# Connecting a real LAN / public deployment (RC3)

> Scope: how to run the P0 two-node handshake on real hosts and feed the result into the G0 evidence bundle.
> English-first. Chinese: [`../deploy-real.md`](../deploy-real.md)
> Current candidate: `p0-rc3`; runtime `95f12d8`. **RC3 is fixture-bound** — see §4 before promising public results.

## 1. Topology

```
browser (client machine)
   │  https://alice.example:8443  (client + Node A + pixel-rooftop)
   ├──────────────► Node A  ── reverse proxy :8443 ── internal Node :9443
   │  https://hana.example:8444   (Node B + neon-alley)
   └──────────────► Node B  ── reverse proxy :8444 ── internal Node :9444
```

- Node A serves the built viewer, `/p0/trust.json`, its descriptor, and `pixel-rooftop`.
- Node B serves its descriptor and `neon-alley`.
- TLS terminates at the reverse proxy. Node A/B can stay on `127.0.0.1` (they bind loopback; do not expose them directly).
- `.example` is used because RC3 hardcodes `alice.example` / `hana.example`; for a **LAN validation** this is fine with local DNS/hosts.
- For a **public deployment** with real domains, RC3 cannot be used as-is (see §4).

## 2. LAN deployment (works with RC3, no runtime changes)

### 2.1 Prepare both hosts

```bash
# on the build machine
pnpm install
pnpm run worlds:build
pnpm build
pnpm tls:fixture          # test-only CA + certs + node keys + trust.json

# copy to Node A and Node B: repo (or at least scripts/, worlds/, apps/playground/dist, .p0-tls/, package files)
```

Keep `.p0-tls/` identical on both hosts. These are **test credentials**; do not reuse them outside the validation.

### 2.2 Start nodes on each host (loopback only)

Node A:

```bash
node scripts/serve-node.mjs \
  --name alice --port 9443 \
  --origin https://alice.example:8443 \
  --peer https://hana.example:8444 \
  --client-dist apps/playground/dist
```

Node B:

```bash
node scripts/serve-node.mjs \
  --name hana --port 9444 \
  --origin https://hana.example:8444 \
  --peer https://alice.example:8443
```

The internal ports (9443/9444) are arbitrary; the external origins must remain `:8443`/`:8444` because the RC3 viewer hardcodes them. Do not expose 9443/9444 through the firewall.

### 2.3 Reverse proxy on each host

Caddy example (Node A; Node B is the same with `hana`/`8444`/`9444`):

```caddyfile
https://alice.example:8443 {
  tls /path/to/.p0-tls/alice.crt /path/to/.p0-tls/alice.key
  reverse_proxy https://127.0.0.1:9443 {
    transport http {
      tls_insecure_skip_verify
    }
  }
}
```

nginx equivalent:

```nginx
server {
  listen 8443 ssl;
  server_name alice.example;
  ssl_certificate     /path/to/.p0-tls/alice.crt;
  ssl_certificate_key /path/to/.p0-tls/alice.key;
  location / {
    proxy_pass https://127.0.0.1:9443;
    proxy_ssl_verify off;
    proxy_set_header Host $host;
  }
}
```

For LAN validation either use the fixture certs (as above) plus the fixture CA / SPKI pin on the client, or issue LAN certs from your own CA and update `.p0-tls/trust.json` + browser trust. The origin strings must stay `https://alice.example:8443` / `https://hana.example:8444`.

### 2.4 DNS / hosts on the client machine

Point the client (the machine that runs the browser or `perf-p0`) at the two hosts:

```text
192.168.1.10 alice.example
192.168.1.11 hana.example
```

Use your LAN IPs. Node's DNS lookup and Chrome must both resolve these names; `/etc/hosts` is enough for a single client. Install `.p0-tls/ca.crt` in the browser trust store **or** pass `--ignore-certificate-errors-spki-list=<pin>` in automated runs (never as a global browser setting).

### 2.5 Verify

```bash
# from the client
curl --cacert .p0-tls/ca.crt --resolve alice.example:8443:192.168.1.10 \
  https://alice.example:8443/.well-known/weave-node.json
curl --cacert .p0-tls/ca.crt --resolve hana.example:8444:192.168.1.11 \
  https://hana.example:8444/.well-known/weave-node.json
```

Then run the remote performance driver:

```bash
export P0_PERF_REMOTE=1 P0_PERF_PROFILE=lan
export P0_URL=https://alice.example:8443/
export P0_NODE_A_ORIGIN=https://alice.example:8443
export P0_NODE_B_ORIGIN=https://hana.example:8444
export P0_HOST_RESOLVER="MAP alice.example 192.168.1.10,MAP hana.example 192.168.1.11"
export P0_SPKI_PINS="<alice-pin>,<hana-pin>"   # from pnpm tls:fixture output
export P0_PERF_CA=.p0-tls/ca.crt                # Node-side TLS probe

node scripts/perf-p0.mjs --validate-only        # DNS + TLS for client/A/B; no sampling
node scripts/perf-p0.mjs --strict               # real sampling, exits non-zero on budget failure
```

`--validate-only` PASS only proves DNS/TLS reachability and address classification. It does **not** prove the browser used the expected path, that the endpoints serve the correct worlds, or that performance targets are met.

## 3. What to record for G0

Use [`g0-evidence.md`](g0-evidence.md). Attach:

1. Deployment info: both origins, host/IP, proxy, cert issuer, how DNS resolves.
2. `perf-p0` report with `remoteTopology` (client/A/B addresses + TLS protocol/cipher/authorized).
3. Browser performance report (`perf-p0-lan-headed.json` / headless), N, cold/warm p50/p95, restart recovery.
4. Functional run (external developer): suite counts + unified report.
5. RC commit/tag and CI run.

## 4. Public deployment: RC3 blocker and required change

RC3 cannot serve a real public domain because of hardcoded references:

| Blocker | Location |
|---|---|
| Viewer hardcodes `alice.example:8443` / `hana.example:8444` | `apps/playground/src/main.js` (`LIVE`) |
| Node IDs/world mapping fixed to `alice`/`hana` | `scripts/serve-node.mjs` (`worldId`, descriptor `did:web`) |
| `.example` is reserved; fixture CA is not publicly trusted | test fixture |
| Node binds `127.0.0.1` only | `scripts/serve-node.mjs` (`server.listen`) |
| Manifests are rewritten to fixed `.example` origins | `scripts/serve-node.mjs` (`ORIGINS`) |

**Public validation requires a deployment profile** (planned as a new RC, e.g. RC4 — it changes runtime files and therefore needs a new tag + full re-run):

1. Serve `/p0/deployment.json` (or extend `/p0/trust.json`) from the client origin:
   ```json
   {
     "worlds": {
       "pixel-rooftop": "https://alice.example.org/worlds/pixel-rooftop/world.json",
       "neon-alley": "https://hana.example.org/worlds/neon-alley/world.json"
     },
     "origins": {
       "https://alice.example.org": { "publicJwk": { "...": "..." }, "spkiSha256": "..." },
       "https://hana.example.org":  { "publicJwk": { "...": "..." }, "spkiSha256": "..." }
     }
   }
   ```
2. Viewer bootstrap reads `worlds` and uses it instead of the hardcoded map (protocol behavior unchanged).
3. `serve-node` accepts `--origin`, `--world`, `--peer-origin`, `--cert`, `--key`, `--node-key`, `--trust-file`, `--bind`/`--http` (behind proxy), and rewrites manifests from the deployment map.
4. A production identity generator creates ed25519 node keys + trust anchors (not the fixture CA), and real TLS certs (Let's Encrypt or your CA) terminate at a proxy on 443 or 8443.
5. Then run the same `perf-p0` remote driver with real origins; no host resolver or SPKI pin is needed for publicly trusted certs.

Until that profile lands, **do not claim public performance evidence from RC3**. A public run is a new RC decision, not a configuration tweak.

## 5. Operational checklist

- [ ] Firewall exposes only the proxy ports (8443/8444 or 443); internal node ports remain loopback.
- [ ] Clock sync (tokens have short TTL; `expiresAt` is milliseconds).
- [ ] Rate/quota env: `P0_RATE_LIMIT` (default 60/10s), `P0_SESSION_QUOTA` (default 3/10min), `P0_TOKEN_TTL_MS` (default 5000).
- [ ] TLS 1.2+; no global `--ignore-certificate-errors`.
- [ ] Trust anchors distributed out-of-band and pinned; never reuse fixture keys.
- [ ] Backup the node keys; rotation via `scripts/rotate-node-key.mjs` for fixtures only (production rotation needs a deployment-profile procedure).
- [ ] Access logs + error monitoring; tokens are opaque, do not log them.
