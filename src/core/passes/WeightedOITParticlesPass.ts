import * as THREE from "three";
import { createInstancedUvBuffer } from "../../utils/particle";
import compositeFrag from "../../shaders/oit/composite.frag";
import passThroughVert from "../../shaders/core/pass-through.vert";
import type { Pass, PassOptions, RendererInfo } from "../../types";

export class WeightedOITParticlesPass implements Pass {
  private particleScene!: THREE.Scene;
  private camera!: THREE.Camera;
  private accumRT!: THREE.WebGLRenderTarget;
  private revealRT!: THREE.WebGLRenderTarget;
  private particleMesh!: THREE.Mesh;
  private accumMaterial!: THREE.ShaderMaterial;
  private revealMaterial!: THREE.ShaderMaterial;
  private compositeScene!: THREE.Scene;
  private compositeCamera!: THREE.OrthographicCamera;
  private compositeMesh!: THREE.Mesh;

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
    this.particleScene = new THREE.Scene();

    const baseGeo = particleOptions.geometry || new THREE.PlaneGeometry(1, 1);
    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.index = baseGeo.index!;
    instGeo.attributes = baseGeo.attributes;
    const uvArray = createInstancedUvBuffer(particleOptions.count, particleOptions.width, particleOptions.height!);
    instGeo.setAttribute("instUv", new THREE.InstancedBufferAttribute(uvArray, 2));

    this.accumMaterial = new THREE.ShaderMaterial({
      ...materialOptions,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquationAlpha: THREE.AddEquation,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });

    this.revealMaterial = new THREE.ShaderMaterial({
      ...materialOptions,
      defines: { ...(materialOptions.defines || {}), REVEAL_PASS: 1 },
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.ZeroFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquationAlpha: THREE.AddEquation,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });

    this.particleMesh = new THREE.Mesh(instGeo, this.accumMaterial);
    this.particleMesh.frustumCulled = false;
    this.particleScene.add(this.particleMesh);

    const size = rtSize || ((): { width: number; height: number } => {
      const v = new THREE.Vector2();
      info.renderer.getSize(v);
      return { width: v.x, height: v.y };
    })();

    const rtParams: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.accumRT = new THREE.WebGLRenderTarget(size.width, size.height, rtParams);
    this.revealRT = new THREE.WebGLRenderTarget(size.width, size.height, rtParams);

    this.compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.compositeScene = new THREE.Scene();
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const compositeMat = new THREE.ShaderMaterial({
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
    this.compositeMesh = new THREE.Mesh(quadGeo, compositeMat);
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

  render(renderer: THREE.WebGLRenderer) {
    const prevClear = renderer.getClearColor(new THREE.Color()).clone();
    const prevAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(null);
    renderer.render((this.particleScene.parent as THREE.Scene) || this.particleScene, this.camera);

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

  get texture(): THREE.Texture | null {
    return null;
  }
}
