#ifndef GLCORE_NOISE_FBM_GLSL
#define GLCORE_NOISE_FBM_GLSL

// FBM utilities that can wrap any scalar noise function returning [-1,1]
// Default to simplex noise if available; can be overridden via macro.
// Define NOISE2/NOISE3 before including to select an alternative source, e.g.:
//   #define NOISE2 pnoise
//   #define NOISE3 pnoise
// or use function-like macros mapping to your noise functions.

#if !defined(NOISE2) || !defined(NOISE3)
  // Try to fallback to simplex if not provided
  // The user should ensure `noise-simplex.glsl` is included before this.
  float snoise(vec2);
  float snoise(vec3);
  #ifndef NOISE2
  #define NOISE2 snoise
  #endif
  #ifndef NOISE3
  #define NOISE3 snoise
  #endif
#endif

// Fixed-octave FBM (fast, unrolled where possible)
float fbm(vec2 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec2  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * NOISE2(pp);
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

float fbm(vec3 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec3  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * NOISE3(pp);
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

// Convenience overloads with typical defaults
float fbm(vec2 p)
{
  return fbm(p, 6, 2.0, 0.5);
}

float fbm(vec3 p)
{
  return fbm(p, 6, 2.0, 0.5);
}

// Ridged multifractal
float fbmRidged(vec2 p, int octaves, float lacunarity, float gain, float offset)
{
  float sum = 0.0;
  float amp = 0.5;
  vec2  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    float n = NOISE2(pp);
    n = offset - abs(n);
    n *= n;
    sum += n * amp;
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum * 1.25; // normalize-ish
}

float fbmRidged(vec3 p, int octaves, float lacunarity, float gain, float offset)
{
  float sum = 0.0;
  float amp = 0.5;
  vec3  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    float n = NOISE3(pp);
    n = offset - abs(n);
    n *= n;
    sum += n * amp;
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum * 1.25;
}

// Turbulence (absolute value FBM)
float fbmTurbulence(vec2 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec2  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * abs(NOISE2(pp));
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

float fbmTurbulence(vec3 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec3  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * abs(NOISE3(pp));
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

#endif


