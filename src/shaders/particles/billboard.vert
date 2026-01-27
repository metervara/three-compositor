
attribute vec2 instUv;       // per-instance UV into the position texture
uniform sampler2D uPositionTex;
uniform float quadSize;   // scale of each sprite in world units

varying vec2 vUv;
varying vec2 vQuadUv;
varying float vAlive;  // 1.0 = alive, 0.0 = dead (from position texture alpha)

void main() {
  // Sample this particle's center and alive state
  vec4 posData = texture2D(uPositionTex, instUv);
  vec3 pos = posData.xyz;
  vAlive = posData.w;  // alive state stored in alpha channel

  // Transform to view space
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  //Offset quad corner in view-space by scaled quadSize (and scale by mvPos.w for perspective)
  vec2 offset = position.xy * quadSize * mvPos.w;

  mvPos.xy += offset;

  // 4) project
  gl_Position = projectionMatrix * mvPos;

  // vUv = position.xy + 0.5; //instUv;
  vUv = instUv;
  vQuadUv = uv;
}
