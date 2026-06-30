// Experiment: fog dissolve — noise-modulated wipe for area transitions

precision mediump float;
uniform float uProgress;
uniform vec2 uDir;
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
    mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x),
    f.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 dir = normalize(uDir + vec2(0.001));
  float sweep = dot(uv - 0.5, dir) * 0.6 + 0.5;
  float noise = valueNoise(uv * 8.0);
  float fog = smoothstep(uProgress - 0.1, uProgress + 0.05, sweep + noise * 0.3);
  vec3 fogColor = vec3(0.75, 0.88, 0.96);
  gl_FragColor = vec4(fogColor, fog * uProgress);
}
