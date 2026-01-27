// #pragma once

// Compute toroidal delta to avoid large jumps when wrapping across bounds
vec3 toroidalDelta(vec3 cur, vec3 prev, vec3 bounds) {
  vec3 d = cur - prev;
  vec3 halfB = bounds * 0.5;
  if (d.x >  halfB.x) d.x -= bounds.x; else if (d.x < -halfB.x) d.x += bounds.x;
  if (d.y >  halfB.y) d.y -= bounds.y; else if (d.y < -halfB.y) d.y += bounds.y;
  if (d.z >  halfB.z) d.z -= bounds.z; else if (d.z < -halfB.z) d.z += bounds.z;
  return d;
}

// Wrap positions with hysteresis using an outer boundary inflated by margin
vec3 wrapHysteresis(vec3 p, vec3 innerBounds, float margin) {
  vec3 innerHalf = innerBounds * 0.5;
  vec3 outerHalf = innerHalf * (1.0 + margin);
  const float eps = 0.001;
  if (p.x < -outerHalf.x)      p.x =  outerHalf.x - eps;
  else if (p.x >  outerHalf.x) p.x = -outerHalf.x + eps;
  if (p.y < -outerHalf.y)      p.y =  outerHalf.y - eps;
  else if (p.y >  outerHalf.y) p.y = -outerHalf.y + eps;
  if (p.z < -outerHalf.z)      p.z =  outerHalf.z - eps;
  else if (p.z >  outerHalf.z) p.z = -outerHalf.z + eps;
  return p;
}

// Returns 1.0 at inner region, 0.0 at the outer wrapping boundary
float edgeFactorWithinBounds(vec3 pos, vec3 bounds, float wrapMargin) {
  vec3 innerHalf = 0.5 * bounds;
  vec3 outerHalf = innerHalf * (1.0 + wrapMargin);
  vec3 ap = abs(pos);
  vec3 over = max(ap - innerHalf, 0.0);
  vec3 span = max(outerHalf - innerHalf, vec3(1e-6));
  vec3 t = clamp(over / span, 0.0, 1.0);
  return 1.0 - max(max(t.x, t.y), t.z);
}


