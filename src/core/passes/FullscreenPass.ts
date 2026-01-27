import * as THREE from "three";
import { createQuad } from "../../mesh/quad";
import { blit } from "../../utils/blit";
import type { Pass, PassOptions, RendererInfo } from "../../types";

export class FullscreenPass implements Pass {
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;

  public outputTarget: THREE.WebGLRenderTarget | null = null;

  private material!: THREE.ShaderMaterial;

  public opts: PassOptions;

  constructor(opts: PassOptions) {
    this.opts = opts;
  }

  init(info: RendererInfo) {
    const { renderer } = info;
    const {
      outputTarget,
      rtSize,
      clearColor = true,
      clearDepth = false,
      clearStencil = false,
      materialOptions,
      seedTexture,
    } = this.opts;

    if (!materialOptions) {
      throw new Error("FullscreenPass: missing materialOptions");
    }

    if (outputTarget) {
      this.outputTarget = outputTarget;
    } else if (rtSize) {
      const { width, height } = rtSize;
      this.outputTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
      });
    } else {
      this.outputTarget = null;
    }

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.scene = new THREE.Scene();
    const mesh = createQuad(materialOptions);
    this.material = mesh.material as THREE.ShaderMaterial;
    if (this.material && this.material.blending !== THREE.NoBlending) {
      this.material.blending = THREE.NoBlending;
      this.material.transparent = false;
      this.material.depthWrite = false;
      this.material.depthTest = false;
    }
    mesh.frustumCulled = false;
    this.scene.add(mesh);

    this.opts.clearColor = clearColor;
    this.opts.clearDepth = clearDepth;
    this.opts.clearStencil = clearStencil;

    if(seedTexture && this.outputTarget) {
      blit(
        renderer,
        seedTexture,
        this.outputTarget
      );
    }
  }

  update(time: number) {}

  render(renderer: THREE.WebGLRenderer) {
    const {
      clearColor = true,
      clearDepth = false,
      clearStencil = false,
      clearColorValue,
      clearAlpha,
      viewport,
    } = this.opts;

    renderer.setRenderTarget(this.outputTarget);

    let originalViewport: THREE.Vector4 | null = null;
    if (viewport && !this.outputTarget) {
      originalViewport = new THREE.Vector4();
      renderer.getViewport(originalViewport);
      renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }

    let prevColor: THREE.Color | null = null;
    let prevAlpha: number | null = null;
    if (clearColor && (clearColorValue !== undefined || clearAlpha !== undefined)) {
      prevColor = new THREE.Color();
      renderer.getClearColor(prevColor);
      prevAlpha = (renderer as any).getClearAlpha ? (renderer as any).getClearAlpha() : 1.0;
      if (clearColorValue !== undefined) {
        const color = clearColorValue instanceof THREE.Color ? clearColorValue : new THREE.Color(clearColorValue as any);
        renderer.setClearColor(color, clearAlpha !== undefined ? clearAlpha : (prevAlpha ?? 1.0));
      } else if (clearAlpha !== undefined && prevColor) {
        renderer.setClearColor(prevColor, clearAlpha);
      }
    }
    if (clearColor || clearDepth || clearStencil) {
      renderer.clear(clearColor, clearDepth, clearStencil);
    }
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);

    if (originalViewport) {
      renderer.setViewport(originalViewport.x, originalViewport.y, originalViewport.z, originalViewport.w);
    }
    if (prevColor) {
      renderer.setClearColor(prevColor, prevAlpha ?? 1.0);
    }
  }

  get texture(): THREE.Texture | null {
    return this.outputTarget ? this.outputTarget.texture : null;
  }

  public setUniform(name: string, value: any) {
    if (!this.material) {
      throw new Error("FullscreenPass: must call init() first");
    }
    if (this.material.uniforms[name]) {
      this.material.uniforms[name].value = value;
    } else {
      this.material.uniforms[name] = { value };
    }
  }

  resize(width: number, height: number) {
    if (this.outputTarget && this.opts.rtSize) {
      this.outputTarget.dispose();

      this.outputTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
      });

      this.opts.rtSize.width = width;
      this.opts.rtSize.height = height;
    }
  }
}
