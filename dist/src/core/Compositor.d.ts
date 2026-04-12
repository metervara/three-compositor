import { WebGLRenderer, Texture, WebGLRenderTarget, RenderTargetOptions } from 'three';
import { PingPongBuffer } from '../utils/PingPongBuffer';
import { Pass } from '../types';

export declare class Compositor {
    private passes;
    private pingPongBuffers;
    private renderer;
    private textureRegistry;
    private passRegistry;
    private pingPongPassMapping;
    constructor(renderer: WebGLRenderer);
    addPass(pass: Pass, name?: string): Compositor;
    getPass(name: string): Pass | undefined;
    getTexture(name: string): Texture | undefined;
    registerTexture(name: string, texture: Texture): Compositor;
    createPingPong(name: string, width: number, height: number, options?: Partial<RenderTargetOptions>): PingPongBuffer;
    getPingPong(name: string): PingPongBuffer | undefined;
    swapPingPong(name: string): Compositor;
    swapAllPingPong(): Compositor;
    renderPass(index: number): Compositor;
    renderPassByName(name: string): Compositor;
    renderRange(start: number, end: number): Compositor;
    render(): Compositor;
    renderToScreen(viewport?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): Compositor;
    blit(source: Texture, target: WebGLRenderTarget): Compositor;
    execute(operation: (renderer: WebGLRenderer) => void): Compositor;
    clear(): Compositor;
    removePass(name: string): Compositor;
    getPassCount(): number;
    getDescription(): string;
    private getPassNameByIndex;
    private getPassType;
    private getPassDetails;
    updatePingPongPass(passName: string, pingPongName: string, inputUniform: string, outputTarget?: WebGLRenderTarget): Compositor;
    private resolveDependencies;
    private estimateQuadFragments;
    resize(width: number, height: number): void;
    resizePass(passName: string, width: number, height: number): void;
}
