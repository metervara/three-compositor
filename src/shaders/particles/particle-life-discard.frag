precision highp float;

uniform sampler2D uPositionTex; // RGBA, w = life
varying vec2 vUv;               // instanced uv into position texture
varying vec2 vQuadUv;           // quad-local uv for sprite shape

// Controls the softness of the edge: smaller gap => sharper edge
uniform float uSmoothFrom;      // inner threshold for smoothstep
uniform float uSmoothTo;        // outer threshold for smoothstep

void main() {
  float life = texture2D(uPositionTex, vUv).w;
  if (life <= 0.0) discard;     // dead particles contribute nothing
  
  // Create soft round particle using distance from center in quad-local UVs
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vQuadUv, center);
  float radius = 0.5;
  
  // Soft falloff using configurable smoothstep window
  // alpha goes from 1 at center to 0 at radius; control edge softness via uSmoothFrom/uSmoothTo
  float edge = smoothstep(uSmoothFrom * radius, uSmoothTo * radius, dist);
  float alpha = 1.0 - edge;
  
  // Apply life-based alpha fade
  alpha *= life;
  
  // Soft white color with slight blue tint
  vec3 color = vec3(1.0, 1.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}


