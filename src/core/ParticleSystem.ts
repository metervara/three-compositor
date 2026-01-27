import * as THREE from "three";
import { createInstancedUvBuffer } from "../utils/particle";
import type { MaterialOptions } from "../types";

export interface ParticleSystemOptions {
  count: number;
  width: number;
  height: number;
  geometry?: THREE.BufferGeometry;
  materialOptions: MaterialOptions;
}

export class ParticleSystem {
  public readonly mesh: THREE.Mesh;
  public readonly material: THREE.ShaderMaterial;
  public readonly geometry: THREE.InstancedBufferGeometry;

  constructor(options: ParticleSystemOptions) {
    const { count, width, height, geometry, materialOptions } = options;

    if (!materialOptions) {
      throw new Error("ParticleSystem: missing materialOptions");
    }

    const baseGeometry = geometry || new THREE.PlaneGeometry(1, 1);
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.index = baseGeometry.index!;
    this.geometry.attributes = baseGeometry.attributes;

    const uvArray = createInstancedUvBuffer(count, width, height);
    this.geometry.setAttribute(
      "instUv",
      new THREE.InstancedBufferAttribute(uvArray, 2)
    );

    const autoDefines: Record<string, any> = { ...(materialOptions.defines || {}) };
    const isTransparent = !!materialOptions.transparent;
    const depthWrite = materialOptions.depthWrite === undefined ? false : materialOptions.depthWrite;
    const depthTest = materialOptions.depthTest === undefined ? true : materialOptions.depthTest;
    if (!isTransparent && depthWrite && depthTest) {
      autoDefines["ENABLE_ALPHA_TEST"] = 1;
    }

    this.material = new THREE.ShaderMaterial({
      ...materialOptions,
      defines: autoDefines,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
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
