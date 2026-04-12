import { ShaderMaterial, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';

export declare function blit(renderer: WebGLRenderer, srcTexture: Texture, dstRenderTarget: WebGLRenderTarget | null, material?: ShaderMaterial): void;
