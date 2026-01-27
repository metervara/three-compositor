
#include "../core/bump-curves.glsl"

attribute vec2 instUv;       // per-instance UV into the position texture
uniform sampler2D uPositionTex;
uniform float quadSize;   // scale of each sprite in world units

varying vec2 vUv;
varying vec2 vQuadUv;

void main() {
  // Sample this particle's center and lifetime
  vec4 posData = texture2D(uPositionTex, instUv);
  vec3 pos = posData.xyz;
  float life = posData.w;

  // Transform to view space
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  float lifeScale = bumpSine(life);
  float scaledQuadSize = quadSize * lifeScale;

  //Offset quad corner in view-space by scaled quadSize (and scale by mvPos.w for perspective)
  vec2 offset = position.xy * scaledQuadSize * mvPos.w;

  mvPos.xy += offset;

  // 4) project
  gl_Position = projectionMatrix * mvPos;

  // vUv = position.xy + 0.5; //instUv;
  vUv = instUv;
  vQuadUv = uv;
}
