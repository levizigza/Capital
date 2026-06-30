import { useState } from "react";

import { cn } from "@/lib/utils";

import { useInputPrompt } from "../hooks";
import type { InputActionId } from "../types";

export type InputPromptProps = {
  action: InputActionId;
  size?: "sm" | "md" | "lg";
  className?: string;
  showFallbackLabel?: boolean;
};

const sizePx = { sm: 28, md: 36, lg: 44 };

export function InputPrompt({
  action,
  size = "md",
  className,
  showFallbackLabel = true,
}: InputPromptProps) {
  const { src, label } = useInputPrompt(action);
  const [imgFailed, setImgFailed] = useState(false);
  const px = sizePx[size];

  if (!src || imgFailed) {
    if (!showFallbackLabel) return null;
    return (
      <kbd
        className={cn(
          "inline-flex min-w-[2rem] items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-0.5 font-mono text-xs font-bold text-gray-800 shadow-sm",
          className
        )}
        aria-label={label}
      >
        {label}
      </kbd>
    );
  }

  return (
    <img
      src={src}
      alt=""
      role="presentation"
      width={px}
      height={px}
      className={cn("inline-block object-contain drop-shadow-sm", className)}
      style={{ width: px, height: px }}
      onError={() => setImgFailed(true)}
    />
  );
}

export type InputPromptHintProps = {
  action: InputActionId;
  children?: React.ReactNode;
  className?: string;
};

/** e.g. "Press [E] to interact" */
export function InputPromptHint({ action, children, className }: InputPromptHintProps) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5 text-sm text-gray-700", className)}>
      {children ?? "Press"}
      <InputPrompt action={action} size="sm" />
    </span>
  );
}
