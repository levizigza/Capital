/**
 * Formal Agent Registry — empty by default; no role-fill workforce.
 */

import type { AgentRecord, AgentRegistrySnapshot, AgentStatus } from "./types";
import { AgentRegistryError, validateAgentRecord } from "./validate";

function nowIso(): string {
  return new Date().toISOString();
}

export function emptyRegistrySnapshot(): AgentRegistrySnapshot {
  return {
    schema_version: "1",
    policy: "registry_before_workforce_no_role_fill",
    agents: [],
    updated_at: nowIso(),
  };
}

/**
 * In-memory registry. Starts with zero agents.
 * Use register() only with InstantiationJustification.
 */
export class AgentRegistry {
  private agents = new Map<string, AgentRecord>();

  constructor(snapshot?: AgentRegistrySnapshot) {
    if (snapshot) this.hydrate(snapshot);
  }

  count(): number {
    return this.agents.size;
  }

  list(status?: AgentStatus): AgentRecord[] {
    const all = [...this.agents.values()].map((a) => structuredClone(a));
    return status ? all.filter((a) => a.status === status) : all;
  }

  get(id: string): AgentRecord | null {
    const a = this.agents.get(id);
    return a ? structuredClone(a) : null;
  }

  /**
   * Register a potential agent. Rejects invalid schema or missing justification.
   * Does not auto-activate.
   */
  register(agent: AgentRecord): AgentRecord {
    const result = validateAgentRecord(agent);
    if (!result.ok) {
      throw new AgentRegistryError(
        result.issues.map((i) => i.message).join("; "),
        result.issues,
      );
    }
    if (this.agents.has(agent.id)) {
      throw new AgentRegistryError(`Agent id already registered: ${agent.id}`);
    }
    if (agent.status === "active") {
      // Force proposed on first register — activate() is explicit
      throw new AgentRegistryError(
        "Cannot register directly as active — register as draft/proposed then activate()",
      );
    }

    const at = nowIso();
    const record: AgentRecord = {
      ...structuredClone(agent),
      created_at: agent.created_at || at,
      updated_at: at,
    };
    this.agents.set(record.id, record);
    return structuredClone(record);
  }

  /**
   * Promote to active only if validation + justification still pass.
   */
  activate(id: string, reviewer: string): AgentRecord {
    const agent = this.agents.get(id);
    if (!agent) throw new AgentRegistryError(`Unknown agent ${id}`);
    if (!reviewer.trim() || /^(agent|ai|bot|gpt|claude)/i.test(reviewer.trim())) {
      throw new AgentRegistryError("activate() requires a human reviewer identity");
    }

    const next: AgentRecord = {
      ...agent,
      status: "active",
      last_reviewed: nowIso(),
      updated_at: nowIso(),
    };
    const result = validateAgentRecord(next);
    if (!result.ok) {
      throw new AgentRegistryError(
        result.issues.map((i) => i.message).join("; "),
        result.issues,
      );
    }
    if (!next.tools.length) {
      throw new AgentRegistryError("Cannot activate without tools (or explicit none:none entry)");
    }

    this.agents.set(id, next);
    return structuredClone(next);
  }

  pause(id: string, reviewer: string, note?: string): AgentRecord {
    return this.setStatus(id, "paused", reviewer, note);
  }

  retire(id: string, reviewer: string, note?: string): AgentRecord {
    return this.setStatus(id, "retired", reviewer, note);
  }

  /**
   * Forbidden helper — documents that role templates must not mass-create agents.
   */
  static assertNotRoleFill(capabilityCount: number, agentCount: number): void {
    if (capabilityCount > 0 && agentCount === capabilityCount) {
      throw new AgentRegistryError(
        "Refusing one-agent-per-capability pattern — instantiate only for measurable workflow need",
      );
    }
  }

  serialize(): AgentRegistrySnapshot {
    return {
      schema_version: "1",
      policy: "registry_before_workforce_no_role_fill",
      agents: this.list(),
      updated_at: nowIso(),
    };
  }

  hydrate(snap: AgentRegistrySnapshot): void {
    this.agents.clear();
    for (const a of snap.agents) {
      const result = validateAgentRecord(a);
      if (!result.ok) {
        throw new AgentRegistryError(
          `Hydrate failed for ${a.id}: ${result.issues.map((i) => i.message).join("; ")}`,
          result.issues,
        );
      }
      this.agents.set(a.id, structuredClone(a));
    }
  }

  clear(): void {
    this.agents.clear();
  }

  private setStatus(
    id: string,
    status: AgentStatus,
    reviewer: string,
    _note?: string,
  ): AgentRecord {
    const agent = this.agents.get(id);
    if (!agent) throw new AgentRegistryError(`Unknown agent ${id}`);
    if (!reviewer.trim()) throw new AgentRegistryError("reviewer required");
    const next: AgentRecord = {
      ...agent,
      status,
      last_reviewed: nowIso(),
      updated_at: nowIso(),
    };
    this.agents.set(id, next);
    return structuredClone(next);
  }
}
