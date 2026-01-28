import {
  Mesh,
  ShaderMaterial,
  InstancedBufferGeometry,
  PlaneGeometry,
  InstancedBufferAttribute,
} from "three";
import type { BufferGeometry } from "three";
import { createInstancedUvBuffer } from "../utils/particle";
import type { MaterialOptions } from "../types";

export interface ParticleSystemOptions {
  count: number;
  width: number;
  height: number;
  geometry?: BufferGeometry;
  materialOptions: MaterialOptions;
}

export class ParticleSystem {
  public readonly mesh: Mesh;
  public readonly material: ShaderMaterial;
  public readonly geometry: InstancedBufferGeometry;

  constructor(options: ParticleSystemOptions) {
    const { count, width, height, geometry, materialOptions } = options;

    if (!materialOptions) {
      throw new Error("ParticleSystem: missing materialOptions");
    }

    const baseGeometry = geometry || new PlaneGeometry(1, 1);
    this.geometry = new InstancedBufferGeometry();
    this.geometry.index = baseGeometry.index!;
    this.geometry.attributes = baseGeometry.attributes;

    const uvArray = createInstancedUvBuffer(count, width, height);
    this.geometry.setAttribute(
      "instUv",
      new InstancedBufferAttribute(uvArray, 2)
    );

    const autoDefines: Record<string, any> = { ...(materialOptions.defines || {}) };
    const isTransparent = !!materialOptions.transparent;
    const depthWrite = materialOptions.depthWrite === undefined ? false : materialOptions.depthWrite;
    const depthTest = materialOptions.depthTest === undefined ? true : materialOptions.depthTest;
    if (!isTransparent && depthWrite && depthTest) {
      autoDefines["ENABLE_ALPHA_TEST"] = 1;
    }

    this.material = new ShaderMaterial({
      ...materialOptions,
      defines: autoDefines,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
  }

  setUniform(name: string, value: any): void {
    if (this.material.uniforms[name]) {
      this.material.uniforms[name].value = value;
    } else {
      this.material.uniforms[name] = { value };
    }
  }

  getUniform(name: string): any {
    return this.material.uniforms[name]?.value;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
