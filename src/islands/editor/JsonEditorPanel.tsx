import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IslandDefinitionSchema } from "../schemas";
import { validateIslandsContent } from "../validate";
import type { IslandDefinition } from "../types";

// ---------------------------------------------------------------------------
// JsonEditorPanel — full JSON editor with live Zod + cross-ref validation
// ---------------------------------------------------------------------------

type Props = {
  island: IslandDefinition;
  onApply: (island: IslandDefinition) => void;
};

export default function JsonEditorPanel({ island, onApply }: Props) {
  const [json, setJson] = useState(() => JSON.stringify(island, null, 2));
  const [errors, setErrors] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setJson(JSON.stringify(island, null, 2));
    setErrors([]);
    setApplied(false);
  }, [island.id]);

  const validate = useCallback(
    (text: string): { ok: boolean; island?: IslandDefinition; errors: string[] } => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e: any) {
        return { ok: false, errors: [`JSON syntax error: ${e.message}`] };
      }

      const result = IslandDefinitionSchema.safeParse(parsed);
      if (!result.success) {
        return {
          ok: false,
          errors: result.error.issues.map((iss) => `${iss.path.join(".")} — ${iss.message}`),
        };
      }

      const wrapped = { version: "1", islands: [result.data] };
      const full = validateIslandsContent(wrapped);
      const crossErrors = full.issues
        .filter((i) => i.level === "error")
        .map((i) => `${i.path} — ${i.message}`);
      const crossWarnings = full.issues
        .filter((i) => i.level === "warning")
        .map((i) => `⚠ ${i.path} — ${i.message}`);

      return {
        ok: crossErrors.length === 0,
        island: result.data as IslandDefinition,
        errors: [...crossErrors, ...crossWarnings],
      };
    },
    [],
  );

  const handleChange = (text: string) => {
    setJson(text);
    setApplied(false);
    const r = validate(text);
    setErrors(r.errors);
  };

  const handleApply = () => {
    const r = validate(json);
    if (r.ok && r.island) {
      onApply(r.island);
      setApplied(true);
    } else {
      setErrors(r.errors.length > 0 ? r.errors : ["Cannot apply: validation failed"]);
    }
  };

  const hasBlockingErrors = errors.some((e) => !e.startsWith("⚠"));
  const lineCount = json.split("\n").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">
          Editing: <span className="font-mono text-blue-600">{island.id}</span> ({island.name})
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setJson(JSON.stringify(island, null, 2));
              setErrors([]);
            }}
          >
            ↩️ Reset
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={hasBlockingErrors}
            className={applied ? "bg-green-600" : ""}
          >
            {applied ? "✅ Applied" : "⚡ Apply & Hot-Reload"}
          </Button>
        </div>
      </div>

      {/* Error display */}
      {errors.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {errors.map((err, i) => (
            <div
              key={i}
              className={`text-xs rounded px-2 py-1 ${
                err.startsWith("⚠")
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {err.startsWith("⚠") ? "" : "❌ "}
              {err}
            </div>
          ))}
        </div>
      )}

      {errors.length === 0 && json !== JSON.stringify(island, null, 2) && (
        <div className="text-xs text-green-600 font-bold">✅ Valid JSON — ready to apply</div>
      )}

      {/* Editor */}
      <div className="relative border rounded-lg overflow-hidden bg-gray-900">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-800 text-gray-500 text-[10px] font-mono text-right pr-1 pt-2 select-none overflow-hidden">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="leading-[18px]">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={json}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full min-h-[500px] bg-transparent text-green-300 font-mono text-xs p-2 pl-12 resize-y focus:outline-none leading-[18px]"
          spellCheck={false}
          title="Island JSON editor"
        />
      </div>
    </div>
  );
}
