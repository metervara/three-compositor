import {
  WebGLRenderTarget,
  LinearFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  FloatType,
} from "three";
import type { RenderTargetOptions } from "three";

export class PingPongBuffer {
  private rtA: WebGLRenderTarget;
  private rtB: WebGLRenderTarget;
  private flag = false;

  constructor(
    width: number,
    height: number,
    options?: Partial<RenderTargetOptions>
  ) {
    const params = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      format: RGBAFormat,
      type: FloatType,
      depthBuffer: false,
      stencilBuffer: false,
      ...options,
    };
    this.rtA = new WebGLRenderTarget(width, height, params);
    this.rtB = new WebGLRenderTarget(width, height, params);
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
