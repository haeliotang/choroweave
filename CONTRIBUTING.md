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

## 4. Licensing and provenance

- **Code**: Apache-2.0 (see [`LICENSE`](LICENSE)). By contributing, you agree your contribution is licensed under Apache-2.0.
- **Specification/docs**: CC-BY-4.0.
- **Example assets**: CC0/CC-BY as declared in each `world.json`.
- **Do not copy GPL/AGPL code** into the repository (Hyperfy is GPL-3.0 and is referenced only as prior art).
- **Model-generated assets** must record provenance: model name/version, license, generation parameters. Do not add assets whose license is unclear or whose terms exclude the project's distribution model.
- **Sign-off (DCO)**: every commit must be signed off (`git commit -s`), certifying the [Developer Certificate of Origin 1.1](https://developercertificate.org/). No CLA is required.

## 5. Development workflow

```bash
# Plan-repo self-check (Node >= 18, no install needed)
node scripts/validate.mjs --strict

# P0 (once the scaffold lands)
pnpm install --frozen-lockfile
pnpm -r build
pnpm test:p0
```

- Branch naming: `feat/…`, `fix/…`, `docs/…`, `protocol/…`.
- Keep pull requests small and scoped; one concern per PR.
- PR checklist:
  - [ ] `node scripts/validate.mjs --strict` passes
  - [ ] relative links resolve; no new dead links
  - [ ] English and Chinese docs updated together (or the gap is stated)
  - [ ] numbers/dates carry evidence grades and sources
  - [ ] no secrets, no production keys, no GPL code
  - [ ] commits signed off (`-s`)

## 6. Review and response times

Maintainers review best-effort. Target first response within **5 business days**; protocol/security issues within **3 business days**. If a PR stalls, ping the issue thread — do not open duplicates.

## 7. Security

Do **not** open a public issue for a security problem. Follow [`SECURITY.md`](SECURITY.md). The repository contains no production keys; the example ed25519 signing key was discarded after signing.

## 8. Community

- GitHub Discussions: protocol questions, external reproduction logs, design proposals.
- Issues: concrete defects and actionable tasks.
- Be respectful and precise; assume good faith, critique the artifact rather than the person.
