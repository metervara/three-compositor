import { WebGLRenderTarget, RenderTargetOptions } from 'three';

export declare class PingPongBuffer {
    private rtA;
    private rtB;
    private flag;
    constructor(width: number, height: number, options?: Partial<RenderTargetOptions>);
    get read(): WebGLRenderTarget<import('three').Texture<unknown>>;
    get write(): WebGLRenderTarget<import('three').Texture<unknown>>;
    swap(): void;
    dispose(): void;
}
