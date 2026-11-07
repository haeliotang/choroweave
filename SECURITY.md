# Security policy

## Scope

choroweave v0.1 is a **design-stage repository**: documents, JSON Schemas, fixtures and a self-check script. There is no runnable runtime, node or compiler yet. Reports are still valuable for design flaws that would become vulnerabilities once implemented.

In scope:

- SHP protocol design: `world.json` validation bypass, signature/JCS canonicalization issues (ed25519, RFC 8785), portal target spoofing, traversal rollback invariants, token replay, prefetch amplification/DoS.
- `CHW_portal` / `CHW_collider` / `CHW_logic` extension semantics and capability negotiation.
- Schema weaknesses that let a malicious bundle pass `weave-check` (or make a safe bundle fail).
- Example fixtures exposing secrets or unsafe defaults.
- Supply-chain or licence violations in the repository.

Out of scope: GitHub platform vulnerabilities; issues only reproducible on unsupported browsers without a clear security impact.

## Reporting

**Please do not open a public issue for a security report.**

Use GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab → **Report a vulnerability** (GitHub Security Advisories).
2. Include: affected file/section, threat model, reproduction or proof-of-concept, impact, and suggested mitigation.
3. If private reporting is unavailable, contact the maintainers through GitHub (open a minimal issue asking for a private channel — **without exploit details**).

## What to expect

| Stage | Target |
|---|---|
| Acknowledgement | within 3 business days |
| Initial triage and severity | within 7 business days |
| Fix or documented mitigation | depends on severity; coordinated disclosure default 90 days |

We will credit reporters in the advisory unless you prefer to remain anonymous.

## Safe harbour

We will not pursue legal action for good-faith research that follows this policy, avoids privacy violations and service disruption, and gives us reasonable time to fix the issue before disclosure.

## Secrets and keys

This repository contains **no production secrets or private keys**. The example `world.json` was signed with a demo ed25519 key that was discarded after signing; it must never be used as a production identity. Do not commit keys, tokens or personal data — CI/secret scanning and review will reject them.
