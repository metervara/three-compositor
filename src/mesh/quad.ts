import * as THREE from "three";
import { globalUniforms } from "../core/uniforms";
import type { MaterialOptions } from "../types";

export function createQuad(
  opts: MaterialOptions,
  width: number = 2,
  height: number = 2,
): THREE.Mesh {
  const uniforms = {
    ...globalUniforms,
    ...(opts.uniforms || {}),
  };

  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.ShaderMaterial({
    vertexShader: opts.vertexShader,
    fragmentShader: opts.fragmentShader,
    uniforms: uniforms,
  });
  const mesh = new THREE.Mesh(geo, mat);
  return mesh;
}
