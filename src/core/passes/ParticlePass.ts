import {
  Scene,
  WebGLRenderTarget,
  Color,
  LinearFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  UnsignedByteType,
} from "three";
import type { Camera, Texture, WebGLRenderer } from "three";
import { ParticleSystem } from "../ParticleSystem";
import type { Pass, PassOptions, RendererInfo } from "../../types";

export class ParticlePass implements Pass {
  private scene!: Scene;
  private camera!: Camera;
  private outRT!: WebGLRenderTarget | null;
  private particleSystem!: ParticleSystem;

  public opts: PassOptions;

  constructor(opts: PassOptions) {
    this.opts = opts;
  }

  init(info: RendererInfo) {
    const {
      outputTarget,
      rtSize,
      clearColor = true,
      clearDepth = false,
      clearStencil = false,
      materialOptions,
      particleOptions,
      particleSystem,
    } = this.opts;

    this.scene = new Scene();
    this.camera = info.camera;

    if (particleSystem) {
      this.particleSystem = particleSystem;
    } else {
      if (!particleOptions) {
        throw new Error("ParticlePass: missing particleOptions (or provide a particleSystem)");
      }
      if (!materialOptions) {
        throw new Error("ParticlePass: missing materialOptions (or provide a particleSystem)");
      }

      this.particleSystem = new ParticleSystem({
        count: particleOptions.count,
        width: particleOptions.width,
        height: particleOptions.height,
        geometry: particleOptions.geometry,
        materialOptions,
      });
    }

    this.scene.add(this.particleSystem.mesh);

    if (outputTarget) {
      this.outRT = outputTarget;
    } else if (rtSize) {
      const { width, height } = rtSize;
      this.outRT = new WebGLRenderTarget(width, height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        format: RGBAFormat,
        type: UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== undefined ? this.opts.depthBuffer : false,
        stencilBuffer: false,
      });
    } else {
      this.outRT = null;
    }

    this.opts.clearColor = clearColor;
    this.opts.clearDepth = clearDepth;
    this.opts.clearStencil = clearStencil;
  }

  update(time: number) {}

  render(renderer: WebGLRenderer) {
    const {
      clearColor = true,
      clearDepth = false,
      clearStencil = false,
      clearColorValue,
      clearAlpha,
    } = this.opts;

    renderer.setRenderTarget(this.outRT);
    let prevColor: Color | null = null;
    let prevAlpha: number | null = null;
    if (clearColor && (clearColorValue !== undefined || clearAlpha !== undefined)) {
      prevColor = new Color();
      renderer.getClearColor(prevColor);
      prevAlpha = (renderer as any).getClearAlpha ? (renderer as any).getClearAlpha() : 1.0;
      if (clearColorValue !== undefined) {
        const color = clearColorValue instanceof Color ? clearColorValue : new Color(clearColorValue as any);
        renderer.setClearColor(color, clearAlpha !== undefined ? clearAlpha : (prevAlpha ?? 1.0));
      } else if (clearAlpha !== undefined && prevColor) {
        renderer.setClearColor(prevColor, clearAlpha);
      }
    }
    if (clearColor || clearDepth || clearStencil) {
      renderer.clear(clearColor, clearDepth, clearStencil);
    }
    renderer.render(this.scene, this.camera);
    if (prevColor) {
      renderer.setClearColor(prevColor, prevAlpha ?? 1.0);
    }
    renderer.setRenderTarget(null);
  }

  get texture(): Texture | null {
    return this.outRT ? this.outRT.texture : null;
  }

  get outputTarget(): WebGLRenderTarget | null {
    return this.outRT;
  }

  set outputTarget(target: WebGLRenderTarget | null) {
    this.outRT = target;
  }

  public setUniform(name: string, value: any) {
    this.particleSystem.setUniform(name, value);
  }

  resize(width: number, height: number) {
    if (this.outRT && this.opts.rtSize) {
      this.outRT.dispose();

      this.outRT = new WebGLRenderTarget(width, height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        format: RGBAFormat,
        type: UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== undefined ? this.opts.depthBuffer : false,
        stencilBuffer: false,
      });

      this.opts.rtSize.width = width;
      this.opts.rtSize.height = height;
    }
  }
}
