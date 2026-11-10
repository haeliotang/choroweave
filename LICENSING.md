# Licensing

choroweave uses a layered licence model: the protocol and its verification surface stay permissive, while the reference applications and node service are copyleft.

## Layer table

| Path / component | SPDX identifier | Why |
|---|---|---|
| `apps/playground/` — reference viewer/runtime | `AGPL-3.0-or-later` | application/runtime; network use must offer corresponding source (§13) |
| `scripts/` — node service, fixtures, build, E2E and operations tooling | `AGPL-3.0-or-later` | application/operations code; not a contract for third-party implementers |
| `packages/check/` — `weave-check` conformance checker | `Apache-2.0` | an independent verifier that third parties must be able to reuse and embed |
| `schemas/` — `world.json`, Spatial-DSL and implicit-spec schemas | `Apache-2.0` | protocol contract types; independent implementations need them without copyleft |
| `fixtures/` — conformance cases, traversal vectors, P0 test data | `Apache-2.0` | test vectors must be reusable by any implementation (frozen bytes) |
| `docs/` — specification, design, research and guides | `CC-BY-4.0` | documentation |
| `README.md`, `README.zh-CN.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CLA.md`, `NOTICE`, `LICENSING.md` | `CC-BY-4.0` | project prose; `CLA.md` is copied verbatim |
| `worlds/`, `examples/` — example worlds and assets | `CC-BY-4.0` (as declared in each `world.json`) | creative assets; P0 manifests declare CC-BY-4.0 |
| `assets/brand/` — logo and brand identifiers | `LicenseRef-Inceptless-Brand` | brand assets are excluded from the open-source licences |
| `.github/` — CI, issue and PR templates | `AGPL-3.0-or-later` (PR template prose: CC-BY-4.0) | operations code / contribution prose |
| Root manifests (`.json`, `.yaml`, `.npmrc`, `.gitignore`) | `AGPL-3.0-or-later` | build/operations configuration |
| Third-party dependencies / vendored assets | their own licences | retained as-is |

The rule for the Apache/AGPL boundary: **is this artifact meant to let someone else implement or interoperate with the protocol contract?** If yes, Apache-2.0; otherwise AGPL-3.0-or-later.

`MPL-2.0` is not used today. If a client SDK specifically designed to be embedded in a third-party closed-source engine appears, it should use `MPL-2.0`; do not apply MPL to the current packages.

## Licence history

| Version / tag | Licence | Notes |
|---|---|---|
| `p0-rc3` and earlier | `Apache-2.0` | released candidate and all earlier commits remain under Apache-2.0 |
| unreleased `license/agpl-split` (2026-11-10) | layered: AGPL-3.0-or-later + Apache-2.0 + CC-BY-4.0 | no release tag has been cut under this model yet |

Already-published versions are **not** relicensed. The new model applies from the commits on the `license/agpl-split` branch after maintainer merge; the exact merge commit should be recorded here when merged.

## Dual licensing

The reference applications are available under AGPL-3.0-or-later. If you need terms other than the AGPL (for example a commercial licence for a hosted or embedded product), contact **support@inceptless.com**. The protocol schemas, conformance suite and fixtures remain Apache-2.0 and are not part of the dual-licence offer.

## Brand assets

The Inceptless and choroweave names, logos and icons are **not** licensed under the open-source licences. They may be used to refer to the project, but not in a way that suggests official status or endorsement. See `LICENSES/LicenseRef-Inceptless-Brand.txt`; questions: support@inceptless.com.


## Contributions

External contributions require a signed Inceptless CLA. See `CONTRIBUTING.md` and `CLA.md`. Until the CLA is formally in force, external contributions are not merged.

## Reuse

Every file is licensed via SPDX headers and/or `REUSE.toml`; run `reuse lint`. Frozen P0 conformance/fixture bytes and signed example worlds are declared in `REUSE.toml` and must not be modified for licensing metadata.
