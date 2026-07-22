import { useMemo } from "react";

import { GamePanel } from "@/game-ui";
import { loadAssetRegistry } from "@/content/assets/loader";
import type { AssetRegistryEntry } from "@/content/assets/schema";

const SOURCE_LABELS: Record<AssetRegistryEntry["source"], string> = {
  opengameart: "OpenGameArt",
  gamedevmarket: "GameDevMarket",
  direct: "Direct",
  other: "Other",
};

function licenseLabel(entry: AssetRegistryEntry): string {
  if (entry.gameDevMarket?.licenseTier) {
    return `${entry.license} (${entry.gameDevMarket.licenseTier})`;
  }
  return entry.license;
}

function AssetCreditCard({ entry }: { entry: AssetRegistryEntry }) {
  return (
    <li className="rounded-lg border border-gray-200 bg-white/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900">{entry.name}</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-600">
          {entry.type}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-800">{entry.attributionText}</p>
      <p className="mt-1 text-sm text-gray-600">
        {entry.author} · {licenseLabel(entry)}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Source: {SOURCE_LABELS[entry.source]}
        {entry.gameDevMarket?.productId ? ` · Product ${entry.gameDevMarket.productId}` : null}
      </p>
      {entry.modifications !== "None" ? (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          <span className="font-medium">Modifications:</span> {entry.modifications}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
        >
          Source
        </a>
        <a
          href={entry.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
        >
          License
        </a>
      </div>
    </li>
  );
}

export function CreditsScreen() {
  const assets = useMemo(() => loadAssetRegistry(), []);

  return (
    <div className="space-y-4">
      <GamePanel title="Credits & Attributions">
        <p className="mb-4 text-sm text-gray-600">
          Automatically generated from <code className="text-xs">content/assets/</code>. We thank
          creators who share work under open and commercial-friendly licenses.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <a
            href={`${import.meta.env.BASE_URL}CREDITS.txt`}
            download="CREDITS.txt"
            className="inline-flex min-h-9 items-center rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            Download CREDITS.txt
          </a>
          <a
            href={`${import.meta.env.BASE_URL}THIRD_PARTY_LICENSES.txt`}
            download="THIRD_PARTY_LICENSES.txt"
            className="inline-flex min-h-9 items-center rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            Download THIRD_PARTY_LICENSES.txt
          </a>
        </div>

        {assets.length === 0 ? (
          <p className="text-sm text-gray-500">No registered third-party assets.</p>
        ) : (
          <ul className="space-y-4">
            {assets.map((entry) => (
              <AssetCreditCard key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </GamePanel>
    </div>
  );
}

/** @deprecated Use CreditsScreen — kept for existing imports */
export function CreditsAttributions() {
  return <CreditsScreen />;
}
