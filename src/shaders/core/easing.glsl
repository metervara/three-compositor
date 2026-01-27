// #pragma once

// Basic easing functions for smooth animations
// All functions expect input t in range [0, 1] and return values in range [0, 1]

// Linear easing (no easing)
float easeLinear(float t) {
  return t;
}

// Quadratic easing
float easeInQuad(float t) {
  return t * t;
}

float easeOutQuad(float t) {
  return 1.0 - (1.0 - t) * (1.0 - t);
}

float easeInOutQuad(float t) {
  return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;
}

// Cubic easing
float easeInCubic(float t) {
  return t * t * t;
}

float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

// Quartic easing
float easeInQuart(float t) {
  return t * t * t * t;
}

float easeOutQuart(float t) {
  return 1.0 - pow(1.0 - t, 4.0);
}

float easeInOutQuart(float t) {
  return t < 0.5 ? 8.0 * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 4.0) / 2.0;
}

// Quintic easing
float easeInQuint(float t) {
  return t * t * t * t * t;
}

float easeOutQuint(float t) {
  return 1.0 - pow(1.0 - t, 5.0);
}

float easeInOutQuint(float t) {
  return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 5.0) / 2.0;
}

// Sine easing
float easeInSine(float t) {
  return 1.0 - cos((t * 3.14159265359) / 2.0);
}

float easeOutSine(float t) {
  return sin((t * 3.14159265359) / 2.0);
}

float easeInOutSine(float t) {
  return -(cos(3.14159265359 * t) - 1.0) / 2.0;
}

// Exponential easing
float easeInExpo(float t) {
  return t == 0.0 ? 0.0 : pow(2.0, 10.0 * (t - 1.0));
}

float easeOutExpo(float t) {
  return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

float easeInOutExpo(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return t < 0.5 ? pow(2.0, 20.0 * t - 10.0) / 2.0 : (2.0 - pow(2.0, -20.0 * t + 10.0)) / 2.0;
}

// Circular easing
float easeInCirc(float t) {
  return 1.0 - sqrt(1.0 - pow(t, 2.0));
}

float easeOutCirc(float t) {
  return sqrt(1.0 - pow(t - 1.0, 2.0));
}

float easeInOutCirc(float t) {
  return t < 0.5 ? (1.0 - sqrt(1.0 - pow(2.0 * t, 2.0))) / 2.0 : (sqrt(1.0 - pow(-2.0 * t + 2.0, 2.0)) + 1.0) / 2.0;
}

// Back easing (overshoot)
float easeInBack(float t) {
  const float c1 = 1.70158;
  const float c3 = c1 + 1.0;
  return c3 * t * t * t - c1 * t * t;
}

float easeOutBack(float t) {
  const float c1 = 1.70158;
  const float c3 = c1 + 1.0;
  return 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0);
}

float easeInOutBack(float t) {
  const float c1 = 1.70158;
  const float c2 = c1 * 1.525;
  return t < 0.5 ? (pow(2.0 * t, 2.0) * ((c2 + 1.0) * 2.0 * t - c2)) / 2.0 : (pow(2.0 * t - 2.0, 2.0) * ((c2 + 1.0) * (t * 2.0 - 2.0) + c2) + 2.0) / 2.0;
}

// Elastic easing
float easeInElastic(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return -pow(2.0, 10.0 * t - 10.0) * sin((t * 10.0 - 10.75) * (2.0 * 3.14159265359) / 3.0);
}

float easeOutElastic(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return pow(2.0, -10.0 * t) * sin((t * 10.0 - 0.75) * (2.0 * 3.14159265359) / 3.0) + 1.0;
}

float easeInOutElastic(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return t < 0.5 ? -(pow(2.0, 20.0 * t - 10.0) * sin((20.0 * t - 11.125) * (2.0 * 3.14159265359) / 4.5)) / 2.0 : (pow(2.0, -20.0 * t + 10.0) * sin((20.0 * t - 11.125) * (2.0 * 3.14159265359) / 4.5)) / 2.0 + 1.0;
}

// Bounce easing
float easeOutBounce(float t) {
  const float n1 = 7.5625;
  const float d1 = 2.75;
  
  if (t < 1.0 / d1) {
    return n1 * t * t;
  } else if (t < 2.0 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

float easeInBounce(float t) {
  return 1.0 - easeOutBounce(1.0 - t);
}

float easeInOutBounce(float t) {
  return t < 0.5 ? (1.0 - easeOutBounce(1.0 - 2.0 * t)) / 2.0 : (1.0 + easeOutBounce(2.0 * t - 1.0)) / 2.0;
}
