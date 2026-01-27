#ifndef GLCORE_NOISE_PERLIN_GLSL
#define GLCORE_NOISE_PERLIN_GLSL

// Improved Perlin noise (2D, 3D) adapted for GLSL
// Fast hash + gradient selection; returns [-1, 1]

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

// 2D Perlin
float pnoise(vec2 P)
{
  vec2 Pi = floor(P);
  vec2 Pf = P - Pi;
  vec2 f = fade(Pf);

  // Hash corners
  vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x,     Pi.x + 1.0);
  vec4 iy = vec4(Pi.y, Pi.y,       Pi.y + 1.0, Pi.y + 1.0);

  vec4 i  = permute(permute(ix) + iy);

  // Gradients: 8 directions (N,E,S,W and diagonals)
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);

  float n00 = dot(g00, Pf);
  float n10 = dot(g10, Pf - vec2(1.0, 0.0));
  float n01 = dot(g01, Pf - vec2(0.0, 1.0));
  float n11 = dot(g11, Pf - vec2(1.0, 1.0));

  float nx0 = mix(n00, n10, f.x);
  float nx1 = mix(n01, n11, f.x);
  float nxy = mix(nx0, nx1, f.y);
  return 2.3 * nxy; // scale to ~[-1,1]
}

// 3D Perlin
float pnoise(vec3 P)
{
  vec3 Pi = floor(P);
  vec3 Pf = P - Pi;
  vec3 f = fade(Pf);

  // Hash 8 corners of cube
  vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x,     Pi.x + 1.0);
  vec4 iy = vec4(Pi.y, Pi.y,       Pi.y + 1.0, Pi.y + 1.0);
  vec4 iz0 = vec4(Pi.z);
  vec4 iz1 = vec4(Pi.z + 1.0);

  vec4 i0 = permute(permute(permute(ix) + iy) + iz0);
  vec4 i1 = permute(permute(permute(ix) + iy) + iz1);

  // Gradients: map to a unit cube, similar to simplex approach
  vec4 gx0 = fract(i0 * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy0 = abs(gx0) - 0.5;
  vec4 gz0 = 1.5 - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);

  vec4 gx1 = fract(i1 * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy1 = abs(gx1) - 0.5;
  vec4 gz1 = 1.5 - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  float n000 = dot(g000, Pf);
  float n100 = dot(g100, Pf - vec3(1.0, 0.0, 0.0));
  float n010 = dot(g010, Pf - vec3(0.0, 1.0, 0.0));
  float n110 = dot(g110, Pf - vec3(1.0, 1.0, 0.0));
  float n001 = dot(g001, Pf - vec3(0.0, 0.0, 1.0));
  float n101 = dot(g101, Pf - vec3(1.0, 0.0, 1.0));
  float n011 = dot(g011, Pf - vec3(0.0, 1.0, 1.0));
  float n111 = dot(g111, Pf - vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);

  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);

  float nxyz = mix(nxy0, nxy1, f.z);
  return 2.2 * nxyz; // scale to ~[-1,1]
}

#endif


