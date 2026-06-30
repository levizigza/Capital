/**
 * @deprecated Import from @/content/assets or use CreditsScreen component.
 * Registry is the single source of truth in content/assets/*.json
 */
export { loadAssetRegistry as getAssetCredits } from "@/content/assets/loader";
export type { AssetRegistryEntry as AssetCreditEntry } from "@/content/assets/schema";

import { loadAssetRegistry } from "@/content/assets/loader";

/** Legacy shape for callers still using ASSET_CREDITS array */
export const ASSET_CREDITS = loadAssetRegistry().map((a) => ({
  id: a.id,
  name: a.name,
  author: a.author,
  license: a.license,
  licenseUrl: a.licenseUrl,
  sourceUrl: a.sourceUrl,
  notes: a.modifications !== "None" ? a.modifications : undefined,
}));
