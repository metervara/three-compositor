#ifndef GLCORE_NOISE_WORLEY_GLSL
#define GLCORE_NOISE_WORLEY_GLSL

// Worley noise (cellular noise) - 2D and 3D implementations
// Returns distances to nearest feature points, useful for cell/organic patterns.
// Based on Stefan Gustavson's implementation.

// Hash functions for random point generation
vec3 hash3(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return fract(sin(p) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  p = vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  );
  return fract(sin(p) * 43758.5453123);
}

// 2D Worley noise
// Returns vec2: x = F1 (distance to closest point), y = F2 (distance to second closest)
vec2 worley2D(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);

  float F1 = 8.0;
  float F2 = 8.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      vec2 r = g - f + o;
      float d = dot(r, r);

      if (d < F1) {
        F2 = F1;
        F1 = d;
      } else if (d < F2) {
        F2 = d;
      }
    }
  }

  return vec2(sqrt(F1), sqrt(F2));
}

// 3D Worley noise
// Returns vec2: x = F1 (distance to closest point), y = F2 (distance to second closest)
vec2 worley3D(vec3 p) {
  vec3 n = floor(p);
  vec3 f = fract(p);

  float F1 = 8.0;
  float F2 = 8.0;

  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash3(n + g);
        vec3 r = g - f + o;
        float d = dot(r, r);

        if (d < F1) {
          F2 = F1;
          F1 = d;
        } else if (d < F2) {
          F2 = d;
        }
      }
    }
  }

  return vec2(sqrt(F1), sqrt(F2));
}

// Convenience functions that return just F1 (most common use case)
float worley(vec2 p) {
  return worley2D(p).x;
}

float worley(vec3 p) {
  return worley3D(p).x;
}

// Smooth Worley - uses smooth minimum for softer cell boundaries
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

vec2 worley3DSmooth(vec3 p, float smoothness) {
  vec3 n = floor(p);
  vec3 f = fract(p);

  float F1 = 8.0;
  float F2 = 8.0;

  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash3(n + g);
        vec3 r = g - f + o;
        float d = dot(r, r);

        float newF1 = smin(F1, d, smoothness);
        if (newF1 < F1) {
          F2 = F1;
          F1 = newF1;
        } else {
          F2 = smin(F2, d, smoothness);
        }
      }
    }
  }

  return vec2(sqrt(F1), sqrt(F2));
}

#endif
