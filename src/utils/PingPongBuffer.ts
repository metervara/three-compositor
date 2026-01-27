import * as THREE from "three";

export class PingPongBuffer {
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;
  private flag = false;

  constructor(
    width: number,
    height: number,
    options?: Partial<THREE.RenderTargetOptions>
  ) {
    const params = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
      ...options,
    };
    this.rtA = new THREE.WebGLRenderTarget(width, height, params);
    this.rtB = new THREE.WebGLRenderTarget(width, height, params);
    this.rtA.texture.generateMipmaps = false;
    this.rtB.texture.generateMipmaps = false;
    this.rtA.texture.anisotropy = 1;
    this.rtB.texture.anisotropy = 1;
  }

  get read() {
    return this.flag ? this.rtA : this.rtB;
  }

  get write() {
    return this.flag ? this.rtB : this.rtA;
  }

  swap() {
    this.flag = !this.flag;
  }

  dispose() {
    this.rtA.dispose();
    this.rtB.dispose();
  }
}
