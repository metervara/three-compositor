precision highp float;

uniform sampler2D tAccum;
uniform sampler2D tReveal;
varying vec2 vUv;

void main() {
  vec4 accum = texture2D(tAccum, vUv);
  vec4 reveal = texture2D(tReveal, vUv);

  float oneMinusAlpha = clamp(reveal.r, 0.0, 1.0);
  float alpha = 1.0 - oneMinusAlpha;
  vec3 color = accum.rgb / max(accum.a, 1e-6);
  // Optional: background assumed black; if you want scene underlay, draw it before this composite
  gl_FragColor = vec4(color, alpha);
}


