# Shader FX Experiments

Small GLSL snippets for learning before they are composed in `postfx.frag`.

## Learning path

1. **vignette.frag** — radial edge darkening with `smoothstep`
2. **bloom.frag** — cheap center glow without a scene buffer (Gaussian falloff)
3. **color-grade.frag** — warm/cool split toning
4. **noise.frag** — hash-based film grain
5. **dissolve.frag** — FBM noise + sweep for fog wipe transitions
6. **hover-glow.frag** — radial spotlight for interactables

Each experiment is a standalone `main()` you can paste into [Shadertoy](https://www.shadertoy.com/) or the browser WebGL sandbox. The production shader in `postfx.frag` inlines the same functions for a **single draw call** (important for FPS).

## Integration

`src/fx/FxOverlay.tsx` runs one fullscreen triangle per frame. Effects are screen-space overlays on top of the DOM — no framebuffer readback, no DOM capture.
