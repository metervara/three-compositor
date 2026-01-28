import {
  OrthographicCamera,
  ShaderMaterial,
  Scene,
  PlaneGeometry,
  Mesh,
} from "three";
import type { Texture, WebGLRenderer, WebGLRenderTarget } from "three";
import passThroughVert from "../shaders/core/pass-through.vert";
import textureFrag from "../shaders/core/texture.frag";

const _blitCamera: OrthographicCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

const _defaultCopyMaterial: ShaderMaterial = new ShaderMaterial({
  uniforms: {
    srcTexture: { value: null as Texture | null },
  },
  vertexShader: passThroughVert,
  fragmentShader: textureFrag,
});

const _blitScene: Scene = new Scene();
const _quadGeom: PlaneGeometry = new PlaneGeometry(2, 2);
const _quadMesh: Mesh<PlaneGeometry, ShaderMaterial> = new Mesh(
  _quadGeom,
  _defaultCopyMaterial
);
_blitScene.add(_quadMesh);

export function blit(
  renderer: WebGLRenderer,
  srcTexture: Texture,
  dstRenderTarget: WebGLRenderTarget | null,
  material?: ShaderMaterial
): void {
  const mat: ShaderMaterial = material ?? _defaultCopyMaterial;

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
