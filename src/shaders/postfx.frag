// Composited post-FX pass — vignette, bloom, grade, noise, dissolve, hover.
// Built from experiments in src/shaders/experiments/ (see README there).

// @common

precision mediump float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;

// Area transition (0 = off, 1 = fully fogged)
uniform float uDissolve;
uniform vec2 uDissolveDir;

// Hover highlight (center in 0–1 UV, radius in UV units)
uniform float uHoverActive;
uniform vec2 uHoverCenter;
uniform float uHoverRadius;

// --- Experiment: vignette ---
float vignetteMask(vec2 uv) {
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / max(uResolution.y, 1.0);
  float d = length(p);
  return smoothstep(0.85, 0.25, d);
}

// --- Experiment: soft bloom (center lift, no scene buffer) ---
float softBloom(vec2 uv) {
  float d = length(uv - 0.5);
  return exp(-d * d * 3.5) * 0.08;
}

// --- Experiment: color grading tint ---
vec3 colorGradeTint(vec3 base) {
  vec3 warm = vec3(1.03, 0.98, 0.92);
  vec3 coolShadow = vec3(0.08, 0.12, 0.22);
  float vig = vignetteMask(vUv);
  return base * warm + coolShadow * (1.0 - vig) * 0.15;
}

// --- Experiment: film grain ---
float filmGrain(vec2 uv, float t) {
  return (hash21(uv * uResolution + fract(t * 24.0)) - 0.5) * 0.035;
}

// --- Experiment: fog dissolve wipe ---
float fogDissolve(vec2 uv, float progress, vec2 dir) {
  if (progress <= 0.001) return 0.0;
  vec2 nDir = normalize(dir + vec2(0.0001));
  float sweep = dot(uv - 0.5, nDir) * 0.6 + 0.5;
  float noise = fbm(uv * 6.0 + progress * 2.0);
  float edge = progress * 1.15;
  return smoothstep(edge - 0.12, edge + 0.04, sweep + noise * 0.35);
}

// --- Experiment: interactable hover glow ---
float hoverGlow(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  float core = exp(-(d * d) / (radius * radius * 0.35));
  float ring = exp(-pow(abs(d - radius * 0.9) / (radius * 0.25), 2.0));
  return core * 0.35 + ring * 0.2;
}

void main() {
  vec2 uv = vUv;
  float I = uIntensity;

  // Vignette — darken edges
  float vig = vignetteMask(uv);
  vec3 col = vec3(0.02, 0.05, 0.12) * (1.0 - vig) * 0.42 * I;

  // Soft bloom — gentle center lift
  col += vec3(0.95, 0.92, 0.85) * softBloom(uv) * I;

  // Color grade
  col = colorGradeTint(col);

  // Film grain
  col += filmGrain(uv, uTime) * I;

  // Fog dissolve transition
  float fog = fogDissolve(uv, uDissolve, uDissolveDir) * I;
  vec3 fogColor = vec3(0.75, 0.88, 0.96);
  col = mix(col, fogColor, fog * 0.92);

  // Hover highlight
  if (uHoverActive > 0.5) {
    float g = hoverGlow(uv, uHoverCenter, uHoverRadius);
    col += vec3(0.35, 0.55, 1.0) * g * I;
  }

  // Alpha — keep overlay lightweight (never fully opaque except dissolve peak)
  float alpha = clamp(length(col) * 1.2 + fog * 0.65, 0.0, 0.55);
  gl_FragColor = vec4(col, alpha);
}
