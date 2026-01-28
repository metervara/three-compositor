import {
  Scene,
  WebGLRenderTarget,
  Mesh,
  ShaderMaterial,
  OrthographicCamera,
  PlaneGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Color,
  Vector2,
  LinearFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  HalfFloatType,
  CustomBlending,
  AddEquation,
  OneFactor,
  ZeroFactor,
  OneMinusSrcAlphaFactor,
} from "three";
import type { Camera, Texture, WebGLRenderer, RenderTargetOptions } from "three";
import { createInstancedUvBuffer } from "../../utils/particle";
import compositeFrag from "../../shaders/oit/composite.frag";
import passThroughVert from "../../shaders/core/pass-through.vert";
import type { Pass, PassOptions, RendererInfo } from "../../types";

export class WeightedOITParticlesPass implements Pass {
  private particleScene!: Scene;
  private camera!: Camera;
  private accumRT!: WebGLRenderTarget;
  private revealRT!: WebGLRenderTarget;
  private particleMesh!: Mesh;
  private accumMaterial!: ShaderMaterial;
  private revealMaterial!: ShaderMaterial;
  private compositeScene!: Scene;
  private compositeCamera!: OrthographicCamera;
  private compositeMesh!: Mesh;

  public opts: PassOptions;

  constructor(opts: PassOptions) {
    this.opts = opts;
  }

  init(info: RendererInfo) {
    const {
      materialOptions,
      particleOptions,
      rtSize,
    } = this.opts;

    if (!materialOptions) throw new Error("WeightedOITParticlesPass: missing materialOptions");
    if (!particleOptions) throw new Error("WeightedOITParticlesPass: missing particleOptions");

    this.camera = info.camera;
    this.particleScene = new Scene();

    const baseGeo = particleOptions.geometry || new PlaneGeometry(1, 1);
    const instGeo = new InstancedBufferGeometry();
    instGeo.index = baseGeo.index!;
    instGeo.attributes = baseGeo.attributes;
    const uvArray = createInstancedUvBuffer(particleOptions.count, particleOptions.width, particleOptions.height!);
    instGeo.setAttribute("instUv", new InstancedBufferAttribute(uvArray, 2));

    this.accumMaterial = new ShaderMaterial({
      ...materialOptions,
      transparent: true,
      depthWrite: false,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor,
      blendDst: OneFactor,
      blendEquationAlpha: AddEquation,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: OneFactor,
    });

    this.revealMaterial = new ShaderMaterial({
      ...materialOptions,
      defines: { ...(materialOptions.defines || {}), REVEAL_PASS: 1 },
      transparent: true,
      depthWrite: false,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: ZeroFactor,
      blendDst: OneMinusSrcAlphaFactor,
      blendEquationAlpha: AddEquation,
      blendSrcAlpha: ZeroFactor,
      blendDstAlpha: OneMinusSrcAlphaFactor,
    });

    this.particleMesh = new Mesh(instGeo, this.accumMaterial);
    this.particleMesh.frustumCulled = false;
    this.particleScene.add(this.particleMesh);

    const size = rtSize || ((): { width: number; height: number } => {
      const v = new Vector2();
      info.renderer.getSize(v);
      return { width: v.x, height: v.y };
    })();

    const rtParams: RenderTargetOptions = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      format: RGBAFormat,
      type: HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.accumRT = new WebGLRenderTarget(size.width, size.height, rtParams);
    this.revealRT = new WebGLRenderTarget(size.width, size.height, rtParams);

    this.compositeCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.compositeScene = new Scene();
    const quadGeo = new PlaneGeometry(2, 2);
    const compositeMat = new ShaderMaterial({
      vertexShader: passThroughVert,
      fragmentShader: compositeFrag,
      uniforms: {
        tAccum: { value: this.accumRT.texture },
        tReveal: { value: this.revealRT.texture },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    this.compositeMesh = new Mesh(quadGeo, compositeMat);
    this.compositeMesh.frustumCulled = false;
    this.compositeScene.add(this.compositeMesh);
  }

  update(time: number) {}

  setUniform(name: string, value: any) {
    if (this.accumMaterial.uniforms[name]) this.accumMaterial.uniforms[name].value = value;
    else this.accumMaterial.uniforms[name] = { value };
    if (this.revealMaterial.uniforms[name]) this.revealMaterial.uniforms[name].value = value;
    else this.revealMaterial.uniforms[name] = { value };
  }

  render(renderer: WebGLRenderer) {
    const prevClear = renderer.getClearColor(new Color()).clone();
    const prevAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(null);
    renderer.render((this.particleScene.parent as Scene) || this.particleScene, this.camera);

    renderer.setRenderTarget(this.accumRT);
    renderer.setClearColor(0x000000, 0.0);
    renderer.clear(true, true, false);
    this.particleMesh.material = this.accumMaterial;
    renderer.render(this.particleScene, this.camera);

    renderer.setRenderTarget(this.revealRT);
    renderer.setClearColor(0xffffff, 1.0);
    renderer.clear(true, true, false);
    this.particleMesh.material = this.revealMaterial;
    renderer.render(this.particleScene, this.camera);

    renderer.setClearColor(prevClear, prevAlpha);

    renderer.setRenderTarget(null);
    renderer.render(this.compositeScene, this.compositeCamera);
  }

  get texture(): Texture | null {
    return null;
  }
}
