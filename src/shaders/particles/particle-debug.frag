// particle.frag: simple debug color by UV
varying vec2 vUv;
varying vec2 vQuadUv;
void main() {
  // gl_FragColor = vec4(vUv, 0.0, 1.0);
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragColor = vec4(vQuadUv, 0.0, 1.0);
}