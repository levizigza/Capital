// Experiment: soft bloom — center lift without scene buffer
// Real bloom = threshold + blur + add. This fake bloom uses radial falloff.

precision mediump float;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float d = length(uv - 0.5);
  float bloom = exp(-d * d * 3.5) * 0.12;
  gl_FragColor = vec4(vec3(1.0, 0.96, 0.9) * bloom, bloom);
}
