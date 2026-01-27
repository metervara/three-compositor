// Speed visualization fragment shader for debugging
uniform sampler2D uVelocityTex;
uniform float speedMin;
uniform float speedMax;
uniform float useSpeedVariation;

varying vec2 vUv;

void main() {
  // Sample velocity for this particle
  vec3 velocity = texture2D(uVelocityTex, vUv).xyz;
  float speed = length(velocity);
  
  vec3 color;
  
  if (useSpeedVariation > 0.5) {
    // Use speed-based color mapping
    float normalizedSpeed = clamp((speed - speedMin) / (speedMax - speedMin), 0.0, 1.0);
    color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), normalizedSpeed);
  } else {
    // Use constant color for moving boids, different color for stationary
    if (speed > 0.01) {
      color = vec3(0.0, 0.8, 1.0); // Cyan for moving boids
    } else {
      color = vec3(1.0, 0.0, 0.0); // Red for stationary boids
    }
  }
  
  // Add some alpha based on speed for visibility
  float alpha = 0.7 + 0.3 * clamp(speed, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}
