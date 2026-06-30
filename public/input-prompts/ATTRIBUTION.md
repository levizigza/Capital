# Input prompt assets — attribution

> **Canonical registry:** `content/assets/xelu-controller-prompts.json`  
> Run `npm run assets:export-credits` to refresh `public/CREDITS.txt`.

## Xelu's FREE Controller & Keyboard Prompts (CC0)

- **Author:** Nicolae "Xelu" Berbece / [Those Awesome Guys](https://thoseawesomeguys.com/)
- **License:** [Creative Commons Zero 1.0 Universal (CC0)](https://creativecommons.org/publicdomain/zero/1.0/)
- **Source:** https://thoseawesomeguys.com/prompts/  
  Mirror: https://opengameart.org/content/free-keyboard-and-controllers-prompts-pack

You may use these assets in any project (commercial or non-commercial) without attribution, though we credit the author in the in-app **Credits** screen.

### Install official assets

```bash
npm run assets:xelu-prompts
```

This extracts keyboard and Xbox Series X prompts into `public/input-prompts/xelu/`. Until sync runs, the app uses SVG fallbacks in `public/input-prompts/fallback/`.

### Notes

- Some distributions omit Sony △○×□ icons; use Xbox/Switch/generic layouts or external pack for PS symbols.
- Steam Deck prompts in the full pack may reference COCO Goose font—swap fonts for commercial projects per the pack README.

## Fallback icons

Fallback SVGs in `fallback/` are original placeholders for FinanceQuest Pro (also CC0 / project-owned).
