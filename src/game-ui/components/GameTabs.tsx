import { cn } from "@/lib/utils";

import { GameButton } from "./GameButton";

export type GameTab = {
  id: string;
  label: string;
  icon?: string;
};

export type GameTabsProps = {
  tabs: GameTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  /** full = stacked buttons; pills = horizontal scroll */
  layout?: "pills" | "full";
};

export function GameTabs({ tabs, activeId, onChange, className, layout = "pills" }: GameTabsProps) {
  if (layout === "full") {
    return (
      <div className={cn("flex flex-col gap-2", className)} role="tablist">
        {tabs.map((tab) => (
          <GameButton
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            variant={activeId === tab.id ? "primary" : "secondary"}
            size="md"
            motionEnabled={false}
            className="w-full justify-start"
            onClick={() => onChange(tab.id)}
          >
            {tab.icon ? <span aria-hidden>{tab.icon}</span> : null}
            {tab.label}
          </GameButton>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-xl bg-white/80 p-1 shadow-inner border border-black/5",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors min-h-10",
              active ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {tab.icon ? <span className="mr-1" aria-hidden>{tab.icon}</span> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
