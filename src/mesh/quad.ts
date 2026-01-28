import { PlaneGeometry, ShaderMaterial, Mesh } from "three";
import { globalUniforms } from "../core/uniforms";
import type { MaterialOptions } from "../types";

export function createQuad(
  opts: MaterialOptions,
  width: number = 2,
  height: number = 2,
): Mesh {
  const uniforms = {
    ...globalUniforms,
    ...(opts.uniforms || {}),
  };

  const geo = new PlaneGeometry(width, height);
  const mat = new ShaderMaterial({
    vertexShader: opts.vertexShader,
    fragmentShader: opts.fragmentShader,
    uniforms: uniforms,
  });
  const mesh = new Mesh(geo, mat);
  return mesh;
}
