/**
 * Complexity → model tier routing.
 */

import type {
  ModelCatalogEntry,
  ModelRouteTable,
  ModelTier,
  TaskComplexity,
} from "./types";
import { DEFAULT_ROUTE_TABLE } from "./types";

export function routeTier(
  complexity: TaskComplexity,
  table: ModelRouteTable = DEFAULT_ROUTE_TABLE,
): ModelTier {
  return table[complexity];
}

export function pickModelForTier(
  tier: ModelTier,
  catalog: ModelCatalogEntry[],
  preferredModel?: string | null,
): string {
  if (preferredModel) {
    const pref = catalog.find((m) => m.model_id === preferredModel);
    if (pref && pref.tier === tier) return pref.model_id;
  }
  const match = catalog.find((m) => m.tier === tier);
  if (!match) {
    throw new Error(`No model in catalog for tier ${tier}`);
  }
  return match.model_id;
}

export function resolveModel(input: {
  complexity: TaskComplexity;
  catalog: ModelCatalogEntry[];
  route_table?: ModelRouteTable;
  budget_default_model?: string;
}): { tier: ModelTier; model_id: string } {
  const tier = routeTier(input.complexity, input.route_table ?? DEFAULT_ROUTE_TABLE);
  const model_id = pickModelForTier(tier, input.catalog, input.budget_default_model);
  return { tier, model_id };
}
