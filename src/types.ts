import type {
  Texture,
  WebGLRenderer,
  WebGLRenderTarget,
  Color,
  IUniform,
  Blending,
  Side,
  BufferGeometry,
  Scene,
  Camera,
  Vector3,
} from "three";
import type { ParticleSystem } from "./core/ParticleSystem";

export interface Pass {
  opts: PassOptions;
  texture: Texture | null;
  init(info: RendererInfo): void;
  update(time: number): void;
  render(renderer: WebGLRenderer): void;
  resize?(width: number, height: number): void;
  setUniform?(name: string, value: any): void;
}

export interface PassOptions {
  seedTexture?: Texture;
  outputTarget?: WebGLRenderTarget;
  rtSize?: { width: number; height: number };
  depthBuffer?: boolean;

  clearColor?: boolean;
  clearDepth?: boolean;
  clearStencil?: boolean;
  clearColorValue?: Color | string | number;
  clearAlpha?: number;

  particleOptions?: ParticleOptions;
  particleSystem?: ParticleSystem;
  materialOptions?: MaterialOptions;

  viewport?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  inputTextures?: {
    [uniformName: string]: string;
  };
  outputTextureName?: string;

  [key: string]: any;
}

export interface MaterialOptions {
  vertexShader: string;
  fragmentShader: string;
  uniforms?: { [key: string]: IUniform };
  defines?: Record<string, boolean | number>;
  depthTest?: boolean;
  depthWrite?: boolean;
  alphaTest?: number;
  blending?: Blending;
  transparent?: boolean;
  side?: Side;
}

export interface ParticleOptions {
  count: number;
  width: number;
  height: number;
  geometry?: BufferGeometry;
}

export interface RendererInfo {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: Camera;
  canvas: HTMLCanvasElement;
  dpi: number;
  scale: number;
}

export interface RendererOptions {
  canvas?: HTMLCanvasElement;
  dpi?: number;
  scale?: number;
  antialias?: boolean;
  imageRendering?: string;
  cameraType?: "perspective" | "orthographic";
  fov?: number;
  near?: number;
  far?: number;
  cameraPosition?: Vector3;
  useOrbit?: boolean;
}

export type PixelGenerator = (
  x: number,
  y: number,
  width: number,
  height: number
) => [number, number, number, number];
