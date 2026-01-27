import * as THREE from "three";
import type { Pass, PassOptions, RendererInfo } from "../../types";

export class ScenePass implements Pass {
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private _outputTarget: THREE.WebGLRenderTarget | null = null;

  public opts: PassOptions;

  constructor(opts: PassOptions) {
    this.opts = opts;
  }

  init(info: RendererInfo) {
    const {
      outputTarget,
      rtSize,
      clearColor = true,
      clearDepth = true,
      clearStencil = false,
    } = this.opts;

    this.scene = (this.opts as any).scene || info.scene;
    this.camera = (this.opts as any).camera || info.camera;

    if (outputTarget) {
      this._outputTarget = outputTarget;
    } else if (rtSize) {
      const { width, height } = rtSize;
      this._outputTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== undefined ? this.opts.depthBuffer : true,
        stencilBuffer: false,
      });
    } else {
      this._outputTarget = null;
    }

    this.opts.clearColor = clearColor;
    this.opts.clearDepth = clearDepth;
    this.opts.clearStencil = clearStencil;
  }

  update(_time: number) {}

  render(renderer: THREE.WebGLRenderer) {
    const { clearColor = true, clearDepth = true, clearStencil = false, viewport } = this.opts;

    renderer.setRenderTarget(this._outputTarget);

    let originalViewport: THREE.Vector4 | null = null;
    if (viewport && !this._outputTarget) {
      originalViewport = new THREE.Vector4();
      renderer.getViewport(originalViewport);
      renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }

    if (clearColor || clearDepth || clearStencil) {
      renderer.clear(clearColor, clearDepth, clearStencil);
    }

    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);

    if (originalViewport) {
      renderer.setViewport(originalViewport.x, originalViewport.y, originalViewport.z, originalViewport.w);
    }
  }

  get texture(): THREE.Texture | null {
    return this._outputTarget ? this._outputTarget.texture : null;
  }

  resize(width: number, height: number) {
    if (this._outputTarget && this.opts.rtSize) {
      this._outputTarget.dispose();
      this._outputTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== undefined ? this.opts.depthBuffer : true,
        stencilBuffer: false,
      });
      this.opts.rtSize.width = width;
      this.opts.rtSize.height = height;
    }
  }
}
