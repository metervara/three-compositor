uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy ) / uResolution.xy;
  gl_FragColor = vec4(uv, 0.0, 1.0);
}