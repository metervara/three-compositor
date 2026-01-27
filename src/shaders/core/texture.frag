precision highp float;

uniform sampler2D srcTexture;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(srcTexture, vUv);
}
