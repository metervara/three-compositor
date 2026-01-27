import * as THREE from "three";
import type { ParticleSystem } from "./core/ParticleSystem";

export interface Pass {
  opts: PassOptions;
  texture: THREE.Texture | null;
  init(info: RendererInfo): void;
  update(time: number): void;
  render(renderer: THREE.WebGLRenderer): void;
  resize?(width: number, height: number): void;
  setUniform?(name: string, value: any): void;
}

export interface PassOptions {
  seedTexture?: THREE.Texture;
  outputTarget?: THREE.WebGLRenderTarget;
  rtSize?: { width: number; height: number };
  depthBuffer?: boolean;

  clearColor?: boolean;
  clearDepth?: boolean;
  clearStencil?: boolean;
  clearColorValue?: THREE.Color | string | number;
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
  uniforms?: { [key: string]: THREE.IUniform };
  defines?: Record<string, boolean | number>;
  depthTest?: boolean;
  depthWrite?: boolean;
  alphaTest?: number;
  blending?: THREE.Blending;
  transparent?: boolean;
  side?: THREE.Side;
}

export interface ParticleOptions {
  count: number;
  width: number;
  height: number;
  geometry?: THREE.BufferGeometry;
}

export interface RendererInfo {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
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
  cameraPosition?: THREE.Vector3;
  useOrbit?: boolean;
}

export type PixelGenerator = (
  x: number,
  y: number,
  width: number,
  height: number
) => [number, number, number, number];
