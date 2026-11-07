# ADR-13 — Rust Core, Web-Native Runtime

- **Status:** accepted (2026-11-07), **not implemented in P0**
- **Applies from:** after G0
- **Related:** ADR-02 (World Bundle), ADR-03 (logic layers), ADR-04 (Babylon runtime), ADR-09 (compiler), ADR-12 (governance)

## Context

P0 has a working Web-native prototype: TypeScript + Babylon.js 9 for the runtime, a Node.js HTTPS node, and `weave-check`/conformance in JavaScript. The protocol and compiler are currently implemented in TypeScript/JavaScript too.

The project's core value is not a faster viewer; it is an **open, verifiable space protocol and compilation core** that third parties can reuse without depending on the official platform. That argues for a single authoritative implementation of protocol semantics — signatures, trust, capability negotiation, version compatibility, handshake state, deterministic compilation — shared by browser, CLI, CI and server. Maintaining separate JS and Rust/native versions of these rules would drift.

Rust is a good fit for that core: memory safety, strong type/ownership guarantees for state machines, deterministic computation, a mature WASM toolchain and CLI distribution. It is **not** a good fit for replacing the browser surface: DOM, WebXR, rendering, asset loading and Agent adapters stay in TypeScript/Babylon.js.

This differs from Poieweave (Rust-first): Choroweave's primary runtime environment is the browser, so Rust-first would trade ecosystem reach for marginal performance.

## Decision

Adopt the architecture principle:

> **Web-native at the surface, Rust-native at the core.**
>
> The surface natively fits the Web; the core implements verifiable, portable protocol and computation logic in Rust.

Scope split:

| Subsystem | Stack | Rationale |
|---|---|---|
| Web 3D runtime / XR / UI | TypeScript + Babylon.js 9 | browser, WebXR, rendering and interaction ecosystem |
| SHP protocol core (signatures, trust, capability negotiation, version compatibility, handshake state) | Rust | one authoritative, testable implementation |
| `weave-check` | Rust CLI + WASM | same semantics in local, CI and browser |
| Chôra Compiler (DSL validation, layout, assembly, deterministic bundle) | Rust core + TypeScript Agent adapter | deterministic compilation; LLM provider/orchestration stays TS |
| 3D asset processing (geometry, colliders, LOD, batch validation) | Rust + glTF tooling | independent compute core, reusable |
| Node service | Node.js for P0; evaluate Rust/Tokio/Axum in P1/P2 | migrate only on measured need |
| Physics | Rapier (Rust core, official JS/WASM bindings) | reuse, do not reimplement |
| Web UI / Agent surface | TypeScript | mature Web toolchain |

WASM is the portable delivery format for core logic where it makes sense, not a mandatory execution environment for everything. TypeScript remains responsible for DOM, rendering and network-facing browser integration to avoid JS/WASM conversion overhead. Native Node modules via NAPI-RS are allowed only when the distribution cost (OS/arch binaries) is justified.

## Migration order

1. **Now (P0 freeze):** freeze the JavaScript implementation; complete external reproduction and G0. Do not modify protocol behavior that has passed CI.
2. **After G0:** create a Rust workspace; implement `choroweave-protocol` first (JCS, Ed25519, World Manifest, trust verification, handshake semantics) and validate it against existing JS test vectors across languages.
3. **P1:** move compiler core to Rust (Spatial-DSL validation, layout, assembly, deterministic World Bundle). Keep LLM providers and authoring UI in TypeScript.
4. **P2:** evaluate a Rust node service (Tokio/Axum) only if Node.js shows a concrete bottleneck in room state, concurrency or long-running stability.

## Consequences

- Protocol semantics gain one authoritative implementation and cross-language test vectors; browser and CLI share behavior via WASM/CLI.
- The project carries a dual-language build/test matrix (Rust + TS) after G0; this cost is accepted only for the core, not for the whole product.
- P0 RC is unaffected: this ADR introduces no runtime changes before G0.
- If Rust/WASM boundary overhead hurts the browser path, keep the hot path in TypeScript and call Rust only for validation/signing/compilation.

## Review signals

- If cross-language conformance vectors diverge, protocol Rust becomes the single authority and the JS path becomes a thin adapter.
- If a Rust node does not materially improve measured operations by P2, keep Node.js and revisit at P3.
- If WASM size/startup harms cold start, split the core into smaller WASM modules or keep the browser on the TS validator.
