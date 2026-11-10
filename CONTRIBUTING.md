# Contributing to choroweave

> Stage: **design / protocol v0.1**. The most valuable contributions right now are protocol critique, conformance cases, translation, and independent reproduction of the P0 plan — implementation of P0-1 has not started yet.

Thanks for helping build an open, verifiable spatial web. This document explains what to contribute, how decisions are made, and the licensing/evidence rules.

## 1. What we need most (in order)

| Priority | Contribution | Where |
|---|---|---|
| 1 | **Protocol review** — attack `world.json`, `CHW_portal`, the traversal handshake, trust/signature, rollback invariants | [Protocol feedback issue](.github/ISSUE_TEMPLATE/protocol-feedback.yml) |
| 2 | **Conformance cases** — turn requirements in [`docs/en/04-spatial-hyperlink-protocol.md`](docs/en/04-spatial-hyperlink-protocol.md) §12 into executable checks | Issues → `weave-check` |
| 3 | **External reproduction** — read the docs and report where a third party could not deploy two nodes | [Reproduction report](.github/ISSUE_TEMPLATE/external-reproduction.yml) |
| 4 | **Documentation & translation** — fix errors, improve English/Chinese parity | Pull requests |
| 5 | **Implementation** — P0 code (runtime, node, conformance suite) after the P0-1 scaffold lands | Issues → "P0 implementation" |

If you are unsure where something belongs, open a Discussion or a blank issue; we will route it.

## 2. Ground rules

- **Evidence over assertion.** Every factual claim in docs must carry an evidence grade: **A** = primary source (spec/official docs/repo metadata), **B** = third-party test/report, **C** = engineering judgement. Unverifiable claims must be marked *not verified*. See [`docs/en/02-tech-selection.md`](docs/en/02-tech-selection.md) §2.
- **No invented numbers.** Star counts, dates, benchmark results, market figures must include a source and a date ("verified as of 2026-11").
- **Separate fact from decision.** New technical decisions need an ADR under [`docs/decisions/`](docs/decisions/README.md); do not silently rewrite an existing ADR — supersede it.
- **Interoperability first.** Prefer standards (`glTF 2.0`, `KHR_interactivity`, MSF "Web of Worlds"/X3D Anchor) over private extensions; new extensions use the `CHW_` prefix and must degrade gracefully.
- **Be precise about stage.** This is a plan, not a shipped platform. Do not describe future work as done.

## 3. Decision process (RFC / ADR)

1. Open an issue using the relevant template.
2. For protocol changes, write a short RFC: problem, options, compatibility impact, migration.
3. ADRs live in [`docs/decisions/`](docs/decisions/README.md); accepted ADRs update the summary table in `docs/en/02-tech-selection.md` (and the Chinese counterpart).
4. Breaking changes to SHP require a minor/major version bump in [`docs/en/04-spatial-hyperlink-protocol.md`](docs/en/04-spatial-hyperlink-protocol.md) and a fixture update.
5. Consensus is sought; the maintainers make the final call and record it.

## 4. Licensing, CLA and provenance

- **Applications, runtime, node and scripts**: **AGPL-3.0-or-later**. By contributing code to these paths, you agree it is licensed under AGPL-3.0-or-later.
- **Protocol contracts and verification surface** (`schemas/`, `packages/check/`, `fixtures/`): **Apache-2.0**, so independent implementations can reuse them.
- **Documentation**: **CC-BY-4.0**.
- **Example assets**: the licence declared in each `world.json` (P0 examples: CC-BY-4.0).
- **Brand assets**: excluded from the open-source licences (see [`LICENSES/LicenseRef-Inceptless-Brand.txt`](LICENSES/LicenseRef-Inceptless-Brand.txt)).
- Do not copy GPL/AGPL code into the Apache-2.0 contract surface; dependencies must remain compatible with the layered policy (`pnpm license:check`).
- **CLA.** External contributions require a signed Inceptless CLA. Sign at <https://cla-assistant.io/haeliotang/choroweave>. **PRs are merged only after the CLA check (`license/cla`) passes.**
- **Model-generated assets** must record provenance: model name/version, licence, generation parameters. Do not add assets whose licence is unclear or whose terms exclude the project's distribution model.
- Full layer table and licence history: [`LICENSING.md`](LICENSING.md). `CLA.md` is the unmodified 1.0 text.

## 5. Development workflow

```bash
# Plan-repo self-check (Node >= 18, no install needed)
node scripts/validate.mjs --strict
node scripts/check-licenses.mjs
reuse lint   # install reuse (https://reuse.software) first

# P0 scaffold
pnpm install --frozen-lockfile
pnpm run worlds:build
pnpm build
pnpm test:p0        # manifests + 22/22 conformance (mock session)
pnpm dev            # http://localhost:5173
pnpm test:e2e       # headless 10 bidirectional jumps + rollback through the portal UI (Chrome)
pnpm test:live      # live two-node HTTPS protocol suite (strict CA)
pnpm test:hardening # rate limit, room-full, private world, key rotation
P0_LIVE=1 pnpm build && P0_LIVE=1 pnpm test:e2e   # live browser E2E against two HTTPS nodes
pnpm report:p0      # unified mock/live report
pnpm repro:check    # external reproduction preflight
pnpm test:source    # AGPL §13 Source endpoint + viewer link
```

- Branch naming: `feat/…`, `fix/…`, `docs/…`, `protocol/…`.
- Keep pull requests small and scoped; one concern per PR.
- PR checklist:
  - [ ] `node scripts/validate.mjs --strict` passes
  - [ ] relative links resolve; no new dead links
  - [ ] English and Chinese docs updated together (or the gap is stated)
  - [ ] numbers/dates carry evidence grades and sources
  - [ ] no secrets, no production keys, no incompatible third-party code
  - [ ] if external: CLA check (`license/cla`) passed

## 6. Review and response times

Maintainers review best-effort. Target first response within **5 business days**; protocol/security issues within **3 business days**. If a PR stalls, ping the issue thread — do not open duplicates.

## 7. Security

Do **not** open a public issue for a security problem. Follow [`SECURITY.md`](SECURITY.md). The repository contains no production keys; the example ed25519 signing key was discarded after signing.

## 8. Community

- GitHub Discussions: protocol questions, external reproduction logs, design proposals.
- Issues: concrete defects and actionable tasks.
- Be respectful and precise; assume good faith, critique the artifact rather than the person.
