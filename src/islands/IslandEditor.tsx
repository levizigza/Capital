import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getIslandById,
  ISLANDS_CONTENT_RELOAD_EVENT,
  loadIslandsContent,
  replaceIslandInCache,
} from "./content/loader";
import { validateIslandsContent, islandStats, type ValidationIssue } from "./validate";
import type { IslandDefinition, IslandsContent } from "./types";

const JsonEditorPanel = lazy(() => import("./editor/JsonEditorPanel"));
const DialogueEditorPanel = lazy(() => import("./editor/DialogueEditorPanel"));
const QuestEditorPanel = lazy(() => import("./editor/QuestEditorPanel"));
const DialogueSandbox = lazy(() => import("./editor/DialogueSandbox"));
const QuestSandbox = lazy(() => import("./editor/QuestSandbox"));
const EventDrawSimulator = lazy(() => import("./editor/EventDrawSimulator"));

type Tab =
  | "overview"
  | "dialogue-edit"
  | "quest-edit"
  | "playtest"
  | "json-editor"
  | "validation";

type PlaytestSub = "dialogue" | "quest" | "events";

export default function IslandEditor({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState<IslandsContent | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [playtestSub, setPlaytestSub] = useState<PlaytestSub>("dialogue");
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [hotReloadFlash, setHotReloadFlash] = useState(false);

  const reload = useCallback(() => {
    const raw = loadIslandsContent();
    const result = validateIslandsContent(raw);
    setContent(result.parsed || (raw as IslandsContent));
    setIssues(result.issues);
  }, []);

  useEffect(() => {
    reload();
  }, [reloadKey, reload]);

  useEffect(() => {
    const onReload = () => setReloadKey((k) => k + 1);
    window.addEventListener(ISLANDS_CONTENT_RELOAD_EVENT, onReload);
    return () => window.removeEventListener(ISLANDS_CONTENT_RELOAD_EVENT, onReload);
  }, []);

  useEffect(() => {
    if (!selectedIslandId && content?.islands[0]) {
      setSelectedIslandId(content.islands[0].id);
    }
  }, [content, selectedIslandId]);

  const handleHotReload = useCallback(
    (island: IslandDefinition) => {
      replaceIslandInCache(island);
      reload();
      setHotReloadFlash(true);
      setTimeout(() => setHotReloadFlash(false), 800);
    },
    [reload]
  );

  const selectedIsland = useMemo(
    () => (selectedIslandId && content ? getIslandById(content, selectedIslandId) : undefined),
    [content, selectedIslandId]
  );

  const errorCount = issues.filter((i) => i.level === "error").length;
  const warnCount = issues.filter((i) => i.level === "warning").length;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "📋 Islands" },
    { id: "dialogue-edit", label: "💬 Dialogue" },
    { id: "quest-edit", label: "📜 Quests" },
    { id: "playtest", label: "🧪 Simulate" },
    { id: "json-editor", label: "{ } JSON" },
    { id: "validation", label: `⚠️ Validate (${issues.length})` },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 p-6 transition-colors ${hotReloadFlash ? "bg-green-50" : ""}`}>
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-2xl font-black">
              🛠️ Island Editor
              <Badge variant="outline" className="text-xs">
                DEV ONLY
              </Badge>
              {hotReloadFlash ? (
                <Badge className="animate-pulse bg-green-500 text-xs text-white">HOT RELOADED</Badge>
              ) : null}
            </div>
            <div className="text-sm text-muted-foreground">
              Edit dialogue & quests · validate IDs · simulate · hot-reload to live game
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setReloadKey((k) => k + 1)} variant="outline" size="sm">
              🔄 Reload
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              ← Back to game
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={errorCount > 0 ? "destructive" : "secondary"}>
            {errorCount} error{errorCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant={warnCount > 0 ? "outline" : "secondary"}>
            {warnCount} warning{warnCount !== 1 ? "s" : ""}
          </Badge>
          {selectedIsland ? (
            <Badge variant="outline" className="font-mono">
              {selectedIsland.icon} {selectedIsland.id}
            </Badge>
          ) : null}
        </div>

        <div className="flex gap-1 overflow-x-auto border-b pb-1">
          {tabs.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={tab === t.id ? "default" : "ghost"}
              onClick={() => setTab(t.id)}
              className="flex-shrink-0 text-xs"
            >
              {t.label}
            </Button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(content?.islands || []).map((island) => {
              const stats = islandStats(island);
              const islandIssues = issues.filter((i) => i.islandId === island.id);
              const hasErrors = islandIssues.some((i) => i.level === "error");
              return (
                <Card
                  key={island.id}
                  className={`cursor-pointer transition-colors hover:border-blue-300 ${hasErrors ? "border-red-300" : ""}`}
                  onClick={() => {
                    setSelectedIslandId(island.id);
                    setTab("dialogue-edit");
                  }}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{island.icon}</span>
                      <div>
                        <div className="text-sm font-bold">{island.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{island.id}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <Badge variant="secondary">{stats.areas} areas</Badge>
                      <Badge variant="secondary">{stats.npcs} NPCs</Badge>
                      <Badge variant="secondary">{stats.quests} quests</Badge>
                      <Badge variant="secondary">{stats.dialogueNodes} nodes</Badge>
                    </div>
                    {hasErrors ? (
                      <div className="text-[10px] text-red-600 font-bold">❌ validation errors</div>
                    ) : (
                      <div className="text-[10px] text-green-600">✅ Valid</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}

        {tab === "dialogue-edit" ? (
          selectedIsland ? (
            <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}>
              <DialogueEditorPanel key={selectedIsland.id} island={selectedIsland} onApply={handleHotReload} />
            </Suspense>
          ) : (
            <EmptySelect />
          )
        ) : null}

        {tab === "quest-edit" ? (
          selectedIsland ? (
            <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}>
              <QuestEditorPanel key={selectedIsland.id} island={selectedIsland} onApply={handleHotReload} />
            </Suspense>
          ) : (
            <EmptySelect />
          )
        ) : null}

        {tab === "playtest" && selectedIsland ? (
          <div className="space-y-3">
            <div className="flex gap-1">
              {(
                [
                  { id: "dialogue", label: "💬 Dialogue flow" },
                  { id: "quest", label: "📜 Quest completion" },
                  { id: "events", label: "🎴 Event draws" },
                ] as { id: PlaytestSub; label: string }[]
              ).map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={playtestSub === s.id ? "default" : "outline"}
                  className="text-xs"
                  onClick={() => setPlaytestSub(s.id)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
            <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}>
              {playtestSub === "dialogue" ? <DialogueSandbox island={selectedIsland} /> : null}
              {playtestSub === "quest" ? <QuestSandbox island={selectedIsland} /> : null}
              {playtestSub === "events" ? <EventDrawSimulator /> : null}
            </Suspense>
          </div>
        ) : null}

        {tab === "playtest" && !selectedIsland ? <EmptySelect /> : null}

        {tab === "json-editor" ? (
          selectedIsland ? (
            <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}>
              <JsonEditorPanel island={selectedIsland} onApply={handleHotReload} />
            </Suspense>
          ) : (
            <EmptySelect />
          )
        ) : null}

        {tab === "validation" ? (
          <ValidationList issues={issues} />
        ) : null}
      </div>
    </div>
  );
}

function EmptySelect() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      Select an island from the <strong>Islands</strong> tab first.
    </div>
  );
}

function ValidationList({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) {
    return <div className="py-8 text-center font-bold text-green-600">✅ All islands pass validation!</div>;
  }
  return (
    <div className="space-y-2">
      {issues.map((issue, idx) => (
        <div
          key={idx}
          className={`rounded-lg border px-3 py-2 text-xs ${
            issue.level === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <span className="font-bold">{issue.level === "error" ? "❌" : "⚠️"}</span>{" "}
          {issue.islandId ? <span className="font-mono">[{issue.islandId}]</span> : null}{" "}
          <span className="font-mono text-[10px] opacity-70">{issue.path}</span> — {issue.message}
        </div>
      ))}
    </div>
  );
}
