attribute vec2 instUv; // per-instance UV into the position texture

uniform sampler2D uPositionTex;
uniform sampler2D uPrevPositionTex;
uniform float quadSize; // scale of each sprite in world units
uniform float stretchFactor; // any value
uniform float squashFactor; // Keep between 0 and 1
uniform float uTime;

varying vec2 vUv;

void main() {
  vec3 curPos = texture2D(uPositionTex, instUv).xyz;
  vec3 prevPos = texture2D(uPrevPositionTex, instUv).xyz;
  vec3 Vcur = (modelViewMatrix * vec4(curPos,1.)).xyz;
  vec3 Vprev = (modelViewMatrix * vec4(prevPos,1.)).xyz;

  // 2) motion dir
  vec3 motion = Vcur - Vprev;
  float speed = length(motion);
  vec3 mDir = speed > 1e-6 ? motion/speed : vec3(0,1,0);

  // 3) build camera-facing basis
  vec3 normal = normalize(-Vcur);
  vec3 upUn = mDir - normal * dot(mDir, normal);
  vec3 up = length(upUn) > 1e-6 ? normalize(upUn) : vec3(0,1,0);
  vec3 right = normalize(cross(normal, up));

  // 4) size & stretch
  vec4 mvPos = vec4(Vcur, 1.0);
  float halfSz = quadSize * mvPos.w;
  float stretch = 1.0 + speed * stretchFactor;
  float invStretch = 1.0 / stretch;
  float squash = mix(1.0, invStretch, squashFactor);

  // 5) offset & project
  vec3 offset = right*(position.x * halfSz * squash) + up*(position.y * halfSz * stretch);
  mvPos.xyz += offset;
  gl_Position = projectionMatrix * mvPos;

  vUv = position.xy + 0.5; //instUv;
}
