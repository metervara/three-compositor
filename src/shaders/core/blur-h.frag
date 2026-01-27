precision highp float;

varying vec2 vUv;

uniform sampler2D uInput;
uniform vec2 uTexelSize; // 1/width, 1/height of source

void main() {
  vec2 d = vec2(uTexelSize.x, 0.0);
  vec4 sum = vec4(0.0);
  sum += texture2D(uInput, vUv + d * -4.0) * 0.05;
  sum += texture2D(uInput, vUv + d * -3.0) * 0.09;
  sum += texture2D(uInput, vUv + d * -2.0) * 0.12;
  sum += texture2D(uInput, vUv + d * -1.0) * 0.15;
  sum += texture2D(uInput, vUv)             * 0.16;
  sum += texture2D(uInput, vUv + d *  1.0) * 0.15;
  sum += texture2D(uInput, vUv + d *  2.0) * 0.12;
  sum += texture2D(uInput, vUv + d *  3.0) * 0.09;
  sum += texture2D(uInput, vUv + d *  4.0) * 0.05;
  gl_FragColor = sum;
}


