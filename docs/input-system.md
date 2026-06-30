# Unified Input System

## Overview

`src/input/` provides keyboard, mouse, and gamepad support with rebindable controls and on-screen prompts (Xelu CC0 assets).

- **Provider:** `InputProvider` in `main.tsx` wraps the app.
- **Settings:** Islands → Settings → **Controls** (rebind + prompt style).
- **Credits:** Footer **Credits** and Settings attributions list (`src/data/assetCredits.ts`).

## Assets

```bash
npm run assets:xelu-prompts
```

Copies PNGs into `public/input-prompts/xelu/`. Until sync runs, `public/input-prompts/fallback/*.svg` are used.

See `public/input-prompts/ATTRIBUTION.md` for CC0 license text.

## Usage

```tsx
import { useInputAction, InputPromptHint, InputPrompt } from "@/input";

useInputAction("map", () => setView("travel"));

<InputPromptHint action="interact">Talk —</InputPromptHint>
<InputPrompt action="confirm" size="md" />
```

## Device detection

Last-used device drives prompt art: keyboard/mouse → key icons; gamepad → Xbox/Switch/PS layout (configurable).
