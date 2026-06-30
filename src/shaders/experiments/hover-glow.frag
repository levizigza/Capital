// Experiment: hover glow — soft spotlight on interactables

precision mediump float;
uniform vec2 uCenter;
uniform float uRadius;
varying vec2 vUv;

void main() {
  float d = length(vUv - uCenter);
  float core = exp(-(d * d) / (uRadius * uRadius * 0.35));
  float ring = exp(-pow(abs(d - uRadius * 0.9) / (uRadius * 0.25), 2.0));
  float g = core * 0.4 + ring * 0.25;
  gl_FragColor = vec4(vec3(0.35, 0.55, 1.0) * g, g);
}
