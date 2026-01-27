// #pragma once

#define PI 3.14159265358979323846
#define TAU 6.28318530717958647692

float bumpSine(float x) {
    x = clamp(x, 0.0, 1.0);
    return sin(PI * x);
}

// Top half of a unit circle mapped to x ∈ [0,1]
// 0 -> 0, 0.5 -> 1, 1 -> 0
float bumpCirc(float x) {
    x = clamp(x, 0.0, 1.0);
    float u = 2.0 * x - 1.0;          // [-1,1]
    return sqrt(max(0.0, 1.0 - u*u)); // y = √(1 - u²)
}

float bumpTriangle(float x) {
    x = clamp(x, 0.0, 1.0);
    return 1.0 - abs(2.0 * x - 1.0);
}

