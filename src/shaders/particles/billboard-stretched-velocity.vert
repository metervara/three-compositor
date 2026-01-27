attribute vec2 instUv; // per-instance UV into the position texture

uniform sampler2D uPositionTex;
uniform sampler2D uVelocityTex;
uniform float quadSize; // scale of each sprite in world units
uniform float stretchFactor; // maximum stretch amount (0 = no stretch, 0.5 = stretch to 1.5x)
uniform float squashFactor; // maximum squash amount (0 = no squash, 1 = full squash)
uniform float speedMin; // minimum speed for effects to start
uniform float speedMax; // maximum speed for full effects
uniform float useSpeedVariation; // 1.0 = use speed, 0.0 = use constant stretch
uniform float uTime;

varying vec2 vUv;

void main() {
  vec3 curPos = texture2D(uPositionTex, instUv).xyz;
  vec3 velocity = texture2D(uVelocityTex, instUv).xyz;
  vec3 Vcur = (modelViewMatrix * vec4(curPos,1.)).xyz;

  // 2) motion dir from velocity (in world space)
  float speed = length(velocity);
  vec3 mDir = speed > 1e-6 ? normalize(velocity) : vec3(0,1,0);
  
  // Transform motion direction to view space for consistent orientation
  vec3 mDirView = normalize((modelViewMatrix * vec4(mDir, 0.0)).xyz);

  // 3) build camera-facing basis
  vec3 normal = normalize(-Vcur);
  vec3 upUn = mDirView - normal * dot(mDirView, normal);
  vec3 up = length(upUn) > 1e-6 ? normalize(upUn) : vec3(0,1,0);
  vec3 right = normalize(cross(normal, up));

  // 4) size & stretch with limits
  vec4 mvPos = vec4(Vcur, 1.0);
  float halfSz = quadSize * mvPos.w;
  
  // Calculate stretch and squash amounts
  float effectAmount = 0.0;
  
  if (useSpeedVariation > 0.5) {
    // Use speed-based variation
    if (speed > speedMin) {
      float speedRange = speedMax - speedMin;
      if (speedRange > 0.0) {
        effectAmount = clamp((speed - speedMin) / speedRange, 0.0, 1.0);
      }
    }
  } else {
    // Use constant stretch for all moving boids
    effectAmount = speed > 0.01 ? 1.0 : 0.0;
  }
  
  float stretchAmount = effectAmount * stretchFactor;
  float stretch = 1.0 + stretchAmount;
  
  float squashAmount = effectAmount * squashFactor;
  float invStretch = 1.0 / stretch;
  float squash = mix(1.0, invStretch, squashAmount);

  // 5) offset & project
  vec3 offset = right*(position.x * halfSz * squash) + up*(position.y * halfSz * stretch);
  mvPos.xyz += offset;
  gl_Position = projectionMatrix * mvPos;

  vUv = position.xy + 0.5; //instUv;
}
