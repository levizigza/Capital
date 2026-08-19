---
id: docs/KORTIX_RUNTIME_EVAL
title: Kortix as optional execution runtime — architecture proposal
status: proposal
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
decision: pending
---

# Kortix Runtime Evaluation & Architecture Proposal

**Product reminder:** Capital’s product is Harbor (`src/islands/`). Company OS, economics, memory, HITL, sales, retention, eval, and weekly packet logic are **business/admin** systems. This proposal concerns only how *selected* admin workflows might *execute* — not gameplay, and not a rewrite of Capital around any vendor.

## Verdict (proposal)

**Yes — selectively, behind adapters. No — do not rewrite Capital around Kortix.**

Kortix (open-source “AI command center” / Suna lineage) is a reasonable **optional execution runtime** for a *subset* of Capital admin workflows that benefit from:

- isolated sandboxes (per-session Linux / microVM)
- Git-backed agent/skill/config as files
- branch-based work + human-approved change requests
- brokered connectors (credentials outside the sandbox)
- triggers / scheduled execution

Capital’s **source of truth** for company policy, schemas, memory classes, economics formulas, approval rules, and business logic must remain **vendor-neutral TypeScript/docs in this repo** (`company-os/`, `src/business/*` when merged). Kortix must never become the owner of those rules.

**Do not implement the Kortix adapter until this proposal is accepted.** Interfaces below are the contract; a thin adapter package would follow in a later PR.

---

## What Kortix appears to provide (capability map)

Sources: [kortix.com](https://kortix.com/), [Agent Computer](https://kortix.com/agent-computer), [kortix-ai/suna](https://github.com/kortix-ai/suna).

| Capability | Kortix shape | Capital interest |
|------------|--------------|------------------|
| Isolated sandboxes | Disposable Linux sandbox / microVM per session; own FS/process/net | Safe tool runs, install/break without poisoning shared state |
| Git-backed config | Agents, skills, connectors, triggers as repo files (`kortix.yaml`, `.kortix/`) | Diffable worker config; aligns with “registry before workforce” |
| Branch-based work | Session clones repo onto a session branch | Fits Capital’s PR/agent branch culture |
| Change requests | Work reaches default branch only via human-approved CR | Aligns with HITL / no auto-canonical promotion |
| Connectors | 3k+ apps + MCP/OpenAPI/HTTP; **credentials brokered server-side** | Useful if scoped per agent — not org-wide dump |
| Secrets | Encrypted; **granted per agent**; injected at runtime | Required for least privilege |
| Triggers / schedule | Cron + signed webhooks spawn sessions | Weekly packet, retention scan, stress test cadence |
| Parallel sessions | Many sandboxes on same config | Batch evals / content drafts |

---

## Non-negotiables (Capital)

1. **Vendor-neutral core** — Company OS docs, institutional memory schemas, economics math, task routing, HITL tiers, sales AI allow/deny, retention diagnosis-first, AI eval stop/escalate, cost governor, stress-test priorities, weekly packet sections stay in Capital-owned code/docs. No Kortix types in those modules.
2. **No rewrite** — Do not move Harbor, Vite app, or game loop into Kortix. Do not require Kortix to develop or ship the game.
3. **Adapter-only coupling** — All Kortix APIs live under a replaceable port (e.g. `ExecutionRuntimePort`). Swap to “local process”, “GitHub Actions”, or another vendor without rewriting business logic.
4. **Least privilege** — Each workflow/agent gets **only** the connectors and secrets it needs. **Never** “all agents see all company secrets/systems.”
5. **Capital approval rules still gate side effects** — Kortix change-request merge ≠ Capital `canonical` promotion, pricing change, deploy, or financial transaction. Those still require Capital HITL / Sales OS denies / Operator protected domains.
6. **AI output is not truth** — Sandbox drafts land in `agent_run_history` / temp context (or CR on a *workflow config* repo), never auto-canonical.

---

## Architecture (proposed)

```
┌─────────────────────────────────────────────────────────────┐
│  Capital vendor-neutral core                                 │
│  company-os/ · src/business/* (memory, HITL, sales, eval…) │
│  Weekly Packet · Cost Governor · Stress Test · Agent Registry│
└──────────────────────────┬──────────────────────────────────┘
                           │ calls ports only
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  ExecutionRuntimePort (interface)                            │
│  schedule · startSession · grantSecrets · attachConnectors   │
│  openChangeRequest · awaitApproval · collectArtifacts        │
│  StreamAudit → AiEvalFramework                               │
└──────────────────────────┬──────────────────────────────────┘
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   LocalRuntimeAdapter  KortixAdapter   (future: GHA/other)
   (dev/test)           (optional prod)
```

### Port sketch (not implemented in this PR)

```ts
// Conceptual — vendor-neutral
interface ExecutionRuntimePort {
  startSession(req: RuntimeSessionRequest): Promise<RuntimeSessionHandle>
  /** Least-privilege: explicit secret ids + connector ids only */
  configureGrants(session: RuntimeSessionHandle, grants: RuntimeGrants): Promise<void>
  waitForCompletion(session: RuntimeSessionHandle): Promise<RuntimeSessionResult>
  openChangeRequest(input: RuntimeChangeRequestInput): Promise<RuntimeChangeRequest>
  /** Cron/webhook registration for allowlisted workflow ids only */
  upsertTrigger(trigger: RuntimeTriggerSpec): Promise<void>
}

type RuntimeGrants = {
  secret_ids: string[]      // deny-by-default empty
  connector_ids: string[]   // deny-by-default empty
  repo_paths_writable: string[]  // e.g. only drafts/, never company-os/canonical
}
```

Kortix-specific types (`kortix.yaml`, Suna session IDs, Pipedream tokens) exist **only** inside `src/business/runtimeAdapters/kortix/` (future package).

---

## Where Kortix helps Capital (selected workflows)

Use Kortix **only** when a measurable workflow needs isolation, branch/CR, or scheduled sandboxed tools — consistent with Agent Registry instantiation gate.

| Workflow candidate | Why Kortix | Must still obey |
|--------------------|------------|-----------------|
| Weekly Executive Packet assembly (draft markdown from inputs) | Scheduled trigger + sandbox + CR for draft packet | UNKNOWN rules; founder decisions stay in Capital packet schema |
| VoC / content draft generation | Sandbox + connectors to read tickets; CR for drafts | Product-to-Content insight lineage; no generic filler |
| AI worker eval harness runs | Parallel sandboxes; tool failure isolation | AiEvalFramework stop/preserve/escalate; finite retries |
| Stress-test / cost-governor batch jobs | Scheduled compute | Neutral formulas in Capital; Kortix only runs the job |
| Agent skill/config edits | Git-backed agents + CR | Registry + HITL; no role-fill mass agents |

### Where Kortix should **not** run

| System | Why |
|--------|-----|
| Harbor gameplay / R3F client | Product surface; wrong runtime |
| Canonical memory promotion | Human ladder in institutional memory |
| Pricing, contracts, prod deploy, refunds | Protected domains / Sales AI denies / HITL CRITICAL |
| Holding production Stripe/GitHub admin as shared agent pool | Violates least privilege |
| Becoming “Company OS database of record” | Vendor lock-in; Capital docs/code remain SoT |

---

## Secrets & connectors (least privilege)

```
Deny by default
  → Agent Registry permissions + RuntimeGrants
  → Kortix adapter requests only listed secret_ids / connector_ids
  → Broker injects into that session only
  → Audit trail: which grant, which session, which workflow
```

**Forbidden patterns**

- Org-wide “super-agent” with all Pipedream connectors  
- Putting production DB URLs / Pages deploy keys into every sandbox  
- Letting sandbox agents write `company-os/` constitution or canonical memory files without Capital promotion + founder approval  

**Allowed pattern**

- `worker_voc_triage` → secrets: `[VOC_READ_TOKEN]` · connectors: `[linear_read]` · writable: `artifacts/drafts/voc/`  
- Weekly packet job → secrets: none or `[PACKET_INPUT_BUCKET_READ]` · writable: `artifacts/packets/`

---

## Dual Git story (avoid confusion)

Capital already uses GitHub branches/PRs for **product** engineering.

Proposal:

1. **Capital monorepo** — Harbor + `src/business` + docs (this repo). Business logic SoT.  
2. **Optional “ops runtime” repo** (or `/ops-runtime` subtree later) — Kortix manifest, agent markdown, triggers — *execution packaging only*, importing Capital packages as libraries or calling Capital APIs.  

Kortix change requests merge **runtime config / drafts**, not silent changes to Capital canon. Product code changes still go through normal Capital PRs + human review.

---

## Relationship to existing Capital controls

| Capital control | Kortix interaction |
|-----------------|--------------------|
| Institutional memory | Session outputs → `agent_run_history` via MemoryPort; never auto-canonical |
| HITL / risk tiers | Side effects still need ApprovalEvent before execute |
| Task routing | Classify first; only `AI_AGENT` / assisted jobs may be dispatched to runtime |
| Agent Registry | No Kortix agent without justified registry record |
| AI Eval Framework | Every session streams audit; retry limits enforced in Capital even if Kortix restarts |
| Cost Governor | Budget checked before `startSession`; model tier from Capital routing |
| Weekly Packet | Kortix may *assemble draft*; packet schema remains Capital’s |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Accidental vendor lock-in | Ports + no Kortix imports in core business modules |
| Secret sprawl | Per-agent grants; empty default; periodic grant audit |
| Agents “improving” company via unreviewed CR spam | Deny-by-default merge; Capital HITL for protected domains |
| Kortix product churn / Suna rename | Adapter isolation; LocalRuntimeAdapter for CI |
| Over-automating strategy | Task router `HUMAN_DECISION` never auto-dispatched |

---

## Implementation plan (after approval — not this PR)

1. Land `ExecutionRuntimePort` + `LocalRuntimeAdapter` (in-process/fake) with tests.  
2. Add `KortixAdapter` behind feature flag; map session/CR/trigger/grants.  
3. Wire **one** low-risk scheduled job (e.g. weekly packet *draft* only).  
4. Eval + cost governor gates on that job.  
5. Expand only with Agent Registry justifications.

**This PR:** proposal doc only. **No Kortix SDK, no `kortix.yaml`, no adapter implementation.**

---

## Decision asked of founder

Approve / amend / reject:

1. Kortix allowed as **optional** execution runtime for selected admin workflows?  
2. Accept **ports-first** isolation and dual-repo/subtree packaging?  
3. Accept **deny-by-default secrets/connectors**?  
4. Defer adapter code until after this proposal is accepted?

Evidence: public Kortix/Suna docs on sandboxes, Git-backed config, CR, brokered connectors, per-agent secrets, triggers.  
Expected upside: safer parallel admin automation without rewriting Capital.  
Cost: integration + ops complexity; ongoing vendor/self-host maintenance.  
Confidence: medium (docs-based eval; no production pilot yet).  
Reversibility: high if ports are enforced — swap Local/GHA.  
Worst case: team rebuilds processes around Kortix UX and drifts from vendor-neutral core.  
Alternative: LocalRuntimeAdapter + GitHub Actions cron only; skip Kortix entirely.
