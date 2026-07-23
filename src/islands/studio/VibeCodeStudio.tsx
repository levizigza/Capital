import { useMemo, useState } from "react";
import { GameButton, GamePanel, GameTabs } from "@/game-ui";
import { useInputAction } from "@/input";
import {
  PROMPT_TIPS_FOR_KIDS,
  VIBE_TEMPLATES,
  createStarterLevel,
  type VibeLevel,
} from "./levelSchema";
import {
  exportLevelJson,
  importLevelJson,
  loadCommunityLevels,
  saveCommunityLevel,
} from "./communityStorage";
import { VibeLevelPreview } from "./VibeLevelPreview";

export type VibeCodeStudioProps = {
  authorName: string;
  onClose: () => void;
  onPublish?: (level: VibeLevel) => void;
};

type StudioTab = "guide" | "edit" | "preview" | "community";

/** Simple prompt → level JSON (local heuristic, no API required) */
function applyPromptToLevel(level: VibeLevel, prompt: string): VibeLevel {
  const lower = prompt.toLowerCase();
  const next = { ...level };

  if (lower.includes("neon") || lower.includes("city")) {
    next.title = next.title || "Neon Signal Quiz";
    next.icon = "🌃";
  }
  if (lower.includes("beach") || lower.includes("harbor") || lower.includes("seaside")) {
    next.title = next.title || "Harbor Explorer";
    next.icon = "🏖️";
  }
  if (lower.includes("easy") || lower.includes("ages 7") || lower.includes("kid")) {
    next.tags = [...new Set([...next.tags, "easy", "kids"])];
  }
  if (lower.includes("hard") || lower.includes("teen")) {
    next.tags = [...new Set([...next.tags, "hard", "teens"])];
  }

  if (next.template === "quiz-signals" && lower.includes("credit")) {
    next.questions = [
      ...(next.questions ?? []),
      {
        prompt: "Using less than 30% of your credit limit is…",
        answer: "Good for your score",
        wrong: ["Bad for your score", "Illegal"],
      },
    ];
  }

  if (next.template === "budget-split" && (lower.includes("expense") || lower.includes("rent"))) {
    next.expenses = [
      { label: "Rent", amount: 900, bucket: "needs" },
      { label: "Phone bill", amount: 45, bucket: "needs" },
      { label: "Games", amount: 60, bucket: "wants" },
      { label: "Emergency savings", amount: 100, bucket: "savings" },
    ];
  }

  if (next.description.length < 20) {
    next.description = prompt.slice(0, 120);
  }

  return next;
}

export function VibeCodeStudio({ authorName, onClose, onPublish }: VibeCodeStudioProps) {
  useInputAction("cancel", onClose);
  const [tab, setTab] = useState<StudioTab>("guide");
  const [templateId, setTemplateId] = useState<VibeLevel["template"]>("explorable-puzzle");
  const [level, setLevel] = useState<VibeLevel>(() =>
    createStarterLevel("explorable-puzzle", authorName),
  );
  const [jsonText, setJsonText] = useState(() => exportLevelJson(level));
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const community = useMemo(() => loadCommunityLevels(), [status]);

  const syncJson = (next: VibeLevel) => {
    setLevel(next);
    setJsonText(exportLevelJson(next));
  };

  const applyPrompt = () => {
    if (!prompt.trim()) return;
    const next = applyPromptToLevel(level, prompt.trim());
    syncJson(next);
    setStatus("Applied your prompt to the level JSON — check Preview!");
    setTab("preview");
  };

  const applyJson = () => {
    try {
      const parsed = importLevelJson(jsonText);
      setLevel(parsed);
      setStatus("JSON looks good!");
    } catch (e) {
      setStatus(`Fix JSON: ${e instanceof Error ? e.message : "invalid"}`);
    }
  };

  const publish = () => {
    saveCommunityLevel(level);
    onPublish?.(level);
    setStatus(`Published "${level.title}" to the community gallery!`);
  };

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              ✨ VibeCode Studio
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-violet-600">mini-IDE</span>
            </h1>
            <p className="text-sm text-slate-400">
              Prompt → edit JSON → preview — inspired by creative coding tools like{" "}
              <a href="https://github.com/voideditor/void" className="text-cyan-400 underline" target="_blank" rel="noreferrer">
                Void
              </a>
              , built for kids.
            </p>
          </div>
          <GameButton variant="outline" size="sm" onClick={onClose}>
            Back to Hub
          </GameButton>
        </div>

        {status ? (
          <div className="rounded-lg bg-violet-900/40 border border-violet-500/40 px-3 py-2 text-sm">
            {status}
          </div>
        ) : null}

        <GameTabs
          tabs={[
            { id: "guide", label: "Prompt Guide", icon: "📖" },
            { id: "edit", label: "Level JSON", icon: "{ }" },
            { id: "preview", label: "Playtest", icon: "▶️" },
            { id: "community", label: "Community", icon: "👥" },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as StudioTab)}
        />

        {tab === "guide" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GamePanel title="Pick a template">
              <div className="space-y-2">
                {VIBE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplateId(t.id);
                      syncJson(createStarterLevel(t.id, authorName));
                    }}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      templateId === t.id
                        ? "border-cyan-400 bg-cyan-950/40"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-bold">
                      {t.icon} {t.name}
                    </div>
                    <div className="text-xs text-slate-400">{t.description}</div>
                  </button>
                ))}
              </div>
            </GamePanel>

            <GamePanel title="Describe your level">
              <p className="text-xs text-slate-400 mb-2">
                Try the starter prompt, then tweak it. Good prompts = fun games!
              </p>
              <textarea
                className="w-full h-32 rounded-lg bg-slate-900 border border-slate-700 p-3 text-sm font-mono"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={VIBE_TEMPLATES.find((t) => t.id === templateId)?.starterPrompt}
              />
              <GameButton variant="primary" className="w-full mt-2" onClick={applyPrompt}>
                ✨ Vibe-code my level
              </GameButton>

              <div className="mt-4 space-y-2">
                {PROMPT_TIPS_FOR_KIDS.map((tip) => (
                  <div key={tip.title} className="text-sm">
                    <span className="font-bold text-cyan-300">{tip.title}:</span> {tip.tip}
                  </div>
                ))}
              </div>
            </GamePanel>
          </div>
        ) : null}

        {tab === "edit" ? (
          <GamePanel title="Level JSON (advanced)">
            <p className="text-xs text-slate-400 mb-2">
              Edit the data directly — like a real game editor. Validate before playtesting.
            </p>
            <textarea
              className="w-full h-[min(50vh,420px)] rounded-lg bg-slate-900 border border-slate-700 p-3 text-xs font-mono"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              <GameButton variant="primary" onClick={applyJson}>
                Validate JSON
              </GameButton>
              <GameButton variant="secondary" onClick={() => setJsonText(exportLevelJson(level))}>
                Reset from level
              </GameButton>
              <GameButton variant="outline" onClick={publish}>
                Publish to community
              </GameButton>
            </div>
          </GamePanel>
        ) : null}

        {tab === "preview" ? (
          <VibeLevelPreview level={level} onClose={() => setTab("edit")} />
        ) : null}

        {tab === "community" ? (
          <GamePanel title="Community levels">
            {community.length === 0 ? (
              <p className="text-sm text-slate-400">No community levels yet — be the first to publish!</p>
            ) : (
              <div className="space-y-2">
                {community.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className="w-full text-left rounded-lg border border-slate-700 p-3 hover:border-cyan-500/50"
                    onClick={() => {
                      syncJson(l);
                      setTab("preview");
                    }}
                  >
                    <div className="font-bold">
                      {l.icon} {l.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      by {l.author} · {l.plays} plays · {l.template}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </GamePanel>
        ) : null}
      </div>
    </div>
  );
}
