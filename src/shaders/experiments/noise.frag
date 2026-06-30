// Experiment: film grain — hash noise animated over time

precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  float n = (hash21(vUv * uResolution + fract(uTime * 24.0)) - 0.5) * 0.06;
  gl_FragColor = vec4(vec3(n), abs(n) * 2.0);
}
