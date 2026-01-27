uniform vec3 uColorAlive;
uniform vec3 uColorDead;

varying float vAlive;

void main() {
  vec3 color = mix(uColorDead, uColorAlive, vAlive);
  gl_FragColor = vec4(color, 1.0);
}