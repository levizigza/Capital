import { useEffect, useRef, useState } from "react";

import { GameButton, GamePanel } from "@/game-ui";

import { ALL_ACTION_IDS, INPUT_ACTION_META } from "../defaultBindings";
import { useInput } from "../InputContext";
import type { InputActionId } from "../types";
import { formatBindingLabel } from "../prompts/manifest";
import { InputPrompt } from "../prompts/InputPrompt";
import type { GamepadPromptLayout, PromptTheme } from "../types";

export function ControlsSettingsPanel() {
  const {
    bindings,
    activeDevice,
    gamepadLayout,
    promptTheme,
    updateSettings,
    setBinding,
    resetAllBindings,
    captureNextInput,
  } = useInput();

  const [listening, setListening] = useState<InputActionId | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const startRebind = (action: InputActionId) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setListening(action);
    captureNextInput(ac.signal)
      .then((captured) => {
        setBinding(action, captured);
        setListening(null);
      })
      .catch(() => setListening(null));
  };

  const cancelRebind = () => {
    abortRef.current?.abort();
    setListening(null);
  };

  const categories = ["ui", "navigation", "movement"] as const;

  return (
    <div className="space-y-4">
      <GamePanel title="Controls">
        <p className="mb-3 text-xs text-gray-600">
          Active device: <strong className="capitalize">{activeDevice}</strong>
          {activeDevice === "gamepad" ? ` (${gamepadLayout})` : null}
        </p>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-gray-700">
            Button prompt style
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
              value={gamepadLayout}
              onChange={(e) =>
                updateSettings({ gamepadPromptLayout: e.target.value as GamepadPromptLayout })
              }
            >
              <option value="xbox-series">Xbox Series X</option>
              <option value="playstation">PlayStation</option>
              <option value="switch">Nintendo Switch</option>
              <option value="generic">Generic</option>
            </select>
          </label>
          <label className="text-xs font-medium text-gray-700">
            Prompt theme
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
              value={promptTheme}
              onChange={(e) => updateSettings({ promptTheme: e.target.value as PromptTheme })}
            >
              <option value="dark">Dark (on light UI)</option>
              <option value="light">Light (on dark UI)</option>
            </select>
          </label>
        </div>

        {listening ? (
          <div className="mb-4 rounded-lg border-2 border-blue-400 bg-blue-50 px-3 py-3 text-sm text-blue-900">
            Press a key, mouse button, or controller input for{" "}
            <strong>{INPUT_ACTION_META[listening].label}</strong>…
            <GameButton size="sm" variant="outline" className="ml-2" onClick={cancelRebind}>
              Cancel
            </GameButton>
          </div>
        ) : null}

        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{cat}</div>
            <ul className="space-y-2">
              {ALL_ACTION_IDS.filter((id) => INPUT_ACTION_META[id].category === cat).map((actionId) => {
                const set = bindings[actionId];
                const primary =
                  activeDevice === "gamepad"
                    ? set?.gamepad?.[0]
                    : activeDevice === "mouse"
                      ? set?.mouse?.[0] ?? set?.keyboard?.[0]
                      : set?.keyboard?.[0] ?? set?.mouse?.[0];

                return (
                  <li
                    key={actionId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{INPUT_ACTION_META[actionId].label}</span>
                    <div className="flex items-center gap-2">
                      <InputPrompt action={actionId} size="sm" />
                      <span className="text-xs text-gray-500">
                        {primary ? formatBindingLabel(primary) : "—"}
                      </span>
                      <GameButton
                        size="sm"
                        variant={listening === actionId ? "primary" : "outline"}
                        motionEnabled={false}
                        onClick={() => startRebind(actionId)}
                        disabled={listening !== null && listening !== actionId}
                      >
                        Rebind
                      </GameButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <GameButton variant="secondary" size="sm" onClick={resetAllBindings}>
          Reset to defaults
        </GameButton>
      </GamePanel>
    </div>
  );
}
