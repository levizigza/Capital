/**
 * Default in-process ports — no multi-agent backend.
 */

import type {
  Classification,
  ContextPort,
  ContextSnippet,
  DelegateResult,
  MemoryPort,
  MetricsPort,
  OperatorObservation,
  ProposedAction,
  TaskHandler,
  TaskHandlerInput,
} from "./types";

export function createInMemoryContextPort(
  seed: ContextSnippet[] = [],
): ContextPort & { snippets: ContextSnippet[] } {
  const snippets = [...seed];
  return {
    snippets,
    retrieve(observation: OperatorObservation): ContextSnippet[] {
      const refs = new Set(observation.context_refs ?? []);
      if (refs.size === 0) return snippets.slice(0, 5);
      return snippets.filter((s) => refs.has(s.ref));
    },
  };
}

export function createInMemoryMetricsPort(): MetricsPort & {
  entries: { name: string; value: number; tags?: Record<string, string> }[];
} {
  const entries: { name: string; value: number; tags?: Record<string, string> }[] = [];
  return {
    entries,
    record(input) {
      entries.push({ ...input, tags: input.tags ? { ...input.tags } : undefined });
    },
  };
}

export function createInMemoryMemoryPort(): MemoryPort & {
  records: { id: string; title: string; body: string; from_agent: boolean }[];
} {
  const records: { id: string; title: string; body: string; from_agent: boolean }[] = [];
  return {
    records,
    preserve(input) {
      const id = `mem_${input.run_id}`;
      // Never canonical — callers get agent_run_history-shaped refs only
      records.push({
        id,
        title: input.title,
        body: input.body,
        from_agent: input.from_agent,
      });
      return id;
    },
  };
}

/** Built-in deterministic handlers — no external LLM required. */
export function defaultDeterministicHandler(): TaskHandler {
  return {
    name: "deterministic_builtin",
    supports(c: Classification) {
      return (
        c.mode === "deterministic" ||
        c.task_class === "propose_protected_change" ||
        c.task_class === "observe_only" ||
        c.task_class === "operational_metrics" ||
        c.task_class === "retrieve_and_summarize" ||
        c.task_class === "run_deterministic_workflow"
      );
    },
    run(input: TaskHandlerInput): DelegateResult {
      const { classification, request, context } = input;
      const proposed: ProposedAction[] = [];

      if (classification.task_class === "propose_protected_change") {
        for (const domain of classification.touched_domains) {
          proposed.push({
            id: `act_${domain}_${request.id}`,
            kind: "protected_mutation",
            summary: `Proposed change touching ${domain}: ${request.observation.signal.slice(0, 120)}`,
            protected_domain: domain,
            payload: { signal: request.observation.signal, domain },
          });
        }
        return {
          handler: "deterministic_builtin",
          summary: `Prepared ${proposed.length} protected proposal(s); awaiting approval`,
          proposed_actions: proposed,
          artifacts: { context_refs: context.map((c) => c.ref) },
        };
      }

      if (classification.task_class === "operational_metrics") {
        proposed.push({
          id: `act_metric_${request.id}`,
          kind: "record_metric_snapshot",
          summary: "Record operational metric snapshot from observation",
          protected_domain: null,
          payload: { signal: request.observation.signal },
        });
      }

      if (classification.task_class === "run_deterministic_workflow") {
        proposed.push({
          id: `act_workflow_${request.id}`,
          kind: "run_playbook_step",
          summary: "Execute permitted playbook step (non-protected)",
          protected_domain: null,
          payload: { signal: request.observation.signal },
        });
      }

      return {
        handler: "deterministic_builtin",
        summary:
          classification.task_class === "observe_only" ||
          classification.task_class === "retrieve_and_summarize"
            ? `Observed/summarized with ${context.length} context snippet(s)`
            : `Deterministic handling for ${classification.task_class}`,
        proposed_actions: proposed,
        artifacts: {
          context_titles: context.map((c) => c.title),
        },
      };
    },
  };
}

/** Optional AI handler stub — records intent only; never executes protected domains. */
export function createAiReasoningStubHandler(
  impl?: (input: TaskHandlerInput) => DelegateResult,
): TaskHandler {
  return {
    name: "ai_reasoning_stub",
    supports(c: Classification) {
      return c.mode === "ai_reasoning" || c.task_class === "request_ai_reasoning";
    },
    run(input: TaskHandlerInput): DelegateResult {
      if (impl) return impl(input);
      return {
        handler: "ai_reasoning_stub",
        summary:
          "AI reasoning stub: draft only. Output must stay in agent_run_history until human promotion.",
        proposed_actions: [
          {
            id: `act_ai_draft_${input.request.id}`,
            kind: "ai_draft_note",
            summary: `Draft analysis for: ${input.request.observation.signal.slice(0, 100)}`,
            protected_domain: null,
            payload: { draft: true, signal: input.request.observation.signal },
          },
        ],
        artifacts: { non_canonical: true },
      };
    },
  };
}
