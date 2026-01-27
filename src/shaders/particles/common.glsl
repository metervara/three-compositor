// #pragma once

float circleAlpha(vec2 uv, float softEdge) {
  vec2 center = uv * 2.0 - 1.0;
  float d = length(center);
  float a = 1.0 - clamp((d - (1.0 - softEdge)) / softEdge, 0.0, 1.0);
  return a;
}

// Helper to alpha test discard with a threshold
// Using a function allows shader code to remain concise and optionally inlined by the compiler
void alphaTestDiscard(float alpha, float threshold) {
  if (alpha < threshold) discard;
}

// Macro to conditionally alpha-test based on a define injected by the engine
#ifdef ENABLE_ALPHA_TEST
  #define ALPHA_TEST(alpha, threshold) if ((alpha) < (threshold)) discard;
#else
  #define ALPHA_TEST(alpha, threshold)
#endif