// Experiment: vignette — darken screen edges
// Try in Shadertoy with Image tab = solid white

precision mediump float;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / uResolution.y;
  float d = length(p);
  float vig = smoothstep(0.85, 0.25, d);
  vec3 col = vec3(0.02, 0.05, 0.12) * (1.0 - vig) * 0.5;
  gl_FragColor = vec4(col, (1.0 - vig) * 0.4);
}
