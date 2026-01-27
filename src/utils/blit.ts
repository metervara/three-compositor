import * as THREE from "three";
import passThroughVert from "../shaders/core/pass-through.vert";
import textureFrag from "../shaders/core/texture.frag";

const _blitCamera: THREE.OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const _defaultCopyMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    srcTexture: { value: null as THREE.Texture | null },
  },
  vertexShader: passThroughVert,
  fragmentShader: textureFrag,
});

const _blitScene: THREE.Scene = new THREE.Scene();
const _quadGeom: THREE.PlaneGeometry = new THREE.PlaneGeometry(2, 2);
const _quadMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> = new THREE.Mesh(
  _quadGeom,
  _defaultCopyMaterial
);
_blitScene.add(_quadMesh);

export function blit(
  renderer: THREE.WebGLRenderer,
  srcTexture: THREE.Texture,
  dstRenderTarget: THREE.WebGLRenderTarget | null,
  material?: THREE.ShaderMaterial
): void {
  const mat: THREE.ShaderMaterial = material ?? _defaultCopyMaterial;

  if (material && !( 'srcTexture' in material.uniforms )) {
    console.warn(
      'Blit: provided material does not have a `srcTexture` uniform. ' +
      'If it uses another sampler uniform name, you\'ll need to set it yourself before calling.'
    );
  }

  _quadMesh.material = mat;

  mat.uniforms.srcTexture.value = srcTexture;

  renderer.setRenderTarget(dstRenderTarget);
  renderer.clear();
  renderer.render(_blitScene, _blitCamera);
  renderer.setRenderTarget(null);
}
