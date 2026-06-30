// Experiment: color grading — warm highlights, cool shadows

precision mediump float;
varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float vig = smoothstep(0.9, 0.2, length(p));
  vec3 warm = vec3(1.04, 0.98, 0.90);
  vec3 cool = vec3(0.10, 0.14, 0.24);
  vec3 col = mix(cool * 0.2, warm * 0.08, vig);
  gl_FragColor = vec4(col, 0.15);
}
