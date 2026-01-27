/**
 * Debug fragment shader for capsule rendering.
 * Displays a checkerboard pattern to visualize UV tiling.
 */

uniform float uTileScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  // Scale UVs for tiling
  vec2 scaledUv = vUv * uTileScale;

  // Checkerboard pattern
  float checker = mod(floor(scaledUv.x * 4.0) + floor(scaledUv.y), 2.0);

  // Base colors: dark brown and light brown for bark-like appearance
  vec3 colorA = vec3(1.0, 1.0, 1.0);
  vec3 colorB = vec3(0.0, 0.0, 0.0);
  vec3 baseColor = mix(colorA, colorB, checker);

  // Simple directional lighting for depth
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float ndotl = max(dot(normalize(vNormal), lightDir), 0.0);
  float ambient = 0.3;
  float lighting = ambient + (1.0 - ambient) * ndotl;

  vec3 finalColor = baseColor * lighting;

  gl_FragColor = vec4(finalColor, 1.0);
}
