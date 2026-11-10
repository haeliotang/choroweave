# ADR-14 — Layered licensing: AGPL-3.0-or-later applications, permissive contracts, CC-BY docs

- **Status:** accepted (2026-11-10)
- **Supersedes:** the licensing portion of [ADR-12](../02-tech-selection.md) (conformance-governance portion unchanged)
- **Basis:** Inceptless decision 2026-11-10 #19
- **Related:** [LICENSING.md](../../LICENSING.md), [CLA.md](../../CLA.md), ADR-01 (incubation), ADR-12 (governance)

## Context

The P0 reference implementation was Apache-2.0. That let anyone host the node or embed the viewer as a closed service without contributing changes back. The protocol must remain independently implementable, including by closed-source products, so a single copyleft licence for the whole repository would be wrong.

Inceptless decided on 2026-11-10 that its open-source projects use a split model: **applications and runtimes under AGPL-3.0-or-later; the specification and contract surface stay permissive**. DCO is replaced by a CLA so that dual licensing (AGPL plus a commercial licence) remains possible.

## Decision

| Layer | SPDX | Scope |
|---|---|---|
| Reference applications / runtime / node / compiler / scripts | `AGPL-3.0-or-later` | `apps/playground`, `scripts/`, future compiler and node packages |
| Protocol contracts and verification surface | `Apache-2.0` | JSON Schemas, `packages/check` (`weave-check`), fixtures/test vectors |
| Documentation | `CC-BY-4.0` | specs, design docs, README and docs prose |
| Brand assets | `LicenseRef-Inceptless-Brand` | logo/icon/name assets; excluded from open-source licences |
| Future embeddable client SDK | `MPL-2.0` | only if a component is specifically designed to be embedded in third-party closed-source engines; none exists today |

Boundary test: *does this artifact exist so that someone else can implement or interoperate with the protocol contract?* If yes → Apache-2.0; otherwise → AGPL-3.0-or-later.

Other decisions:

1. **No retroactive relicensing.** `p0-rc3` and every earlier release/tag remain Apache-2.0. The new model applies only from the commits that introduce it; no tag has been cut under the new model at the time of this ADR.
2. **DCO → CLA.** External contributions require a signed Inceptless CLA. The CLA is a draft pending legal review; until it is in force, external contributions are not merged. The DCO and `git commit -s` requirements are removed.
3. **AGPL §13.** Every network-interactive component (viewer, node) exposes a visible Source entry pointing at the running version's repository URL + commit. This is a link/read-only endpoint only; no product behaviour changes.
4. **Dependency compatibility.** Dependencies must remain AGPL-compatible; CI rejects known-incompatible licences. The project's own AGPL packages are accepted by the policy.
5. **Brand assets** are excluded via `LicenseRef-Inceptless-Brand`; no further brand terms are added beyond that file.
6. **Dual licensing.** AGPL-3.0-or-later is the open-source offer; other terms are available from Inceptless at support@inceptless.com. The Apache-2.0 contract surface is not part of that commercial offer.

## Evidence

- Inceptless decision 2026-11-10 #19 (founder).
- Official texts: SPDX `AGPL-3.0-or-later`, Apache-2.0, CC-BY-4.0 (hashes recorded in the licensing report).
- P0 repository state at `p0-rc3` / `95f12d8` (Apache-2.0), no formal release after it.

## Consequences

- The reference node/viewer become copyleft; hosted use must offer corresponding source under AGPL §13.
- Independent implementations can still use the schemas, conformance suite and fixtures under Apache-2.0.
- The project needs a CLA signature tool and legal review before accepting external contributions.
- Licence layers must be reflected in package manifests, REUSE metadata and CI; stale "Apache-2.0" project statements are incorrect.
- No change to the SHP protocol or the frozen P0 runtime behaviour.

## Review signals

- If the CLA is not in force by the next public contribution window, keep external PRs closed rather than silently accepting unlicensed contributions.
- If a genuinely embeddable SDK appears, evaluate MPL-2.0 rather than adding it to the AGPL layer.
- If AGPL adoption blocks a strategic implementer that only needs the wire contract, confirm they can rely on the Apache-2.0 schemas/fixtures; do not relicense application code ad hoc.
