---
id: company-os/APPROVAL_MATRIX
title: Approval Matrix
doc_type: approval_matrix
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Approval Matrix

## Schema

```yaml
gate:
  id: string
  status: fact | hypothesis | unknown
  change_type: string
  required_approver: string
  evidence_required: string
  notes: string
```

**Reality:** Repo does not name corporate officers. Approver roles below are **process roles**, not verified legal titles. Where owner is unknown, treat as **human product owner of the repository**.

---

## Gates

```yaml
gate:
  id: amend_constitution
  status: hypothesis
  change_type: "Edit CAPITAL_CONSTITUTION FACT laws"
  required_approver: "Human repository owner / designated product lead (UNKNOWN formal title)"
  evidence_required: "DECISION_LOG entry + cited docs/code"
  notes: "Agents may draft; may not merge silently."
```

```yaml
gate:
  id: promote_hypothesis_to_fact
  status: hypothesis
  change_type: "Change claim status hypothesis → fact in company-os"
  required_approver: "Human product lead"
  evidence_required: "EXPERIMENT_LEDGER result or irrevocable repo/code evidence"
  notes: "Generated recommendations alone are insufficient."
```

```yaml
gate:
  id: break_iconic_freeze
  status: fact
  change_type: "Widen main quest map / add fake MMO / foreign merge"
  required_approver: "Human product lead + explicit DECISION_LOG superseding freeze"
  evidence_required: "Cold-retell proof or explicit freeze lift decision"
  notes: "Current freeze documented in iconic-later / iconic-freeze."
```

```yaml
gate:
  id: ship_pay_to_win
  status: fact
  change_type: "Any paid power / skip-learning monetization"
  required_approver: "Forbidden under current pillars unless constitution amended"
  evidence_required: "N/A — anti-pillar"
  notes: "docs/game-pillars.md"
```

```yaml
gate:
  id: production_deploy
  status: fact
  change_type: "GitHub Pages deploy from main"
  required_approver: "Repository merge permissions + Actions workflow"
  evidence_required: "CI workflows as configured"
  notes: "path .github/workflows/deploy-pages.yml — quality gate behavior is as coded"
```

```yaml
gate:
  id: agent_code_change
  status: hypothesis
  change_type: "Automated agent proposes code or OS edits"
  required_approver: "Human review before treating as Rank 1–5 truth"
  evidence_required: "PR review"
  notes: "Vendor-neutral: any agent tooling; no provider required."
```

```yaml
gate:
  id: live_pricing
  status: unknown
  change_type: "Publish consumer or school prices"
  required_approver: "UNKNOWN"
  evidence_required: "TODO — legal/finance owner not in repo"
  notes: "No live prices in repo."
```
