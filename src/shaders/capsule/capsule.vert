/**
 * Vertex shader for instanced tapered capsules.
 *
 * Transforms a unit capsule (y=0 to y=1, radius=1) to world space,
 * orienting it between start and end positions with different radii at each end.
 *
 * UV.y is accumulated along branches for seamless bark texture tiling.
 */

// Per-vertex attributes (from unit capsule geometry)
attribute float aLocalY; // 0 at start cap, 1 at end cap

// Per-instance attributes
attribute vec3 aStartPos;
attribute vec3 aEndPos;
attribute float aStartRadius;
attribute float aEndRadius;
attribute float aUvOffset;
attribute float aSegmentLength;

// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vViewZ;

// Centerline data for analytical smooth normals (used by some fragment shaders)
varying vec3 vCapsuleStart;
varying vec3 vCapsuleEnd;

void main() {
  // 1. Build orthonormal basis from segment direction
  vec3 axis = aEndPos - aStartPos;
  float len = length(axis);
  vec3 up = len > 0.0001 ? axis / len : vec3(0.0, 1.0, 0.0);

  // Find a vector not parallel to up for cross product
  vec3 notUp = abs(up.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, notUp));
  vec3 bitangent = cross(up, tangent);

  // 2. Interpolate radius based on aLocalY
  float r = mix(aStartRadius, aEndRadius, aLocalY);

  // 3. Transform unit capsule vertex to world space
  // Unit capsule has: x,z in [-1,1] (radius), y in [-1, 2] (with caps)
  // Cylinder body: y in [0, 1]
  // Bottom cap: y in [-1, 0] (hemisphere centered at y=0)
  // Top cap: y in [1, 2] (hemisphere centered at y=1)

  vec3 localPos = position;

  // Scale radial component by interpolated radius
  vec3 radialOffset = tangent * localPos.x * r + bitangent * localPos.z * r;

  // Map y position:
  // - For cylinder (y in [0,1]): lerp from aStartPos to aEndPos
  // - For bottom cap (y < 0): offset from aStartPos
  // - For top cap (y > 1): offset from aEndPos
  vec3 axialPos;
  if (localPos.y < 0.0) {
    // Bottom cap: centered at start, offset by y * startRadius
    axialPos = aStartPos + up * (localPos.y * aStartRadius);
  } else if (localPos.y > 1.0) {
    // Top cap: centered at end, offset by (y-1) * endRadius
    axialPos = aEndPos + up * ((localPos.y - 1.0) * aEndRadius);
  } else {
    // Cylinder body: lerp along segment
    axialPos = mix(aStartPos, aEndPos, localPos.y);
  }

  vec3 worldPos = axialPos + radialOffset;

  // 4. Transform normal
  // The normal needs to be rotated to match the capsule orientation
  vec3 localNormal = normal;
  vec3 worldNormal = normalize(
    tangent * localNormal.x + up * localNormal.y + bitangent * localNormal.z
  );

  // 5. Compute UV with accumulated offset
  // uv.x: around circumference (from geometry)
  // uv.y: accumulated along branch for seamless tiling
  vUv.x = uv.x;
  vUv.y = aUvOffset + uv.y * aSegmentLength;

  // Output
  vNormal = worldNormal;
  vWorldPos = worldPos;
  
  // Pass centerline data for analytical smooth normals
  vCapsuleStart = aStartPos;
  vCapsuleEnd = aEndPos;
  
  // Compute view-space position for fog
  vec4 viewPos = modelViewMatrix * vec4(worldPos, 1.0);
  vViewZ = -viewPos.z; // Negate because view space looks down -Z

  gl_Position = projectionMatrix * viewPos;
}
