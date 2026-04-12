import { WebGLRenderTarget, WebGLRenderer, Texture } from 'three';
import { Pass, PassOptions, RendererInfo } from '../../types';

export declare class FullscreenPass implements Pass {
    private scene;
    private camera;
    outputTarget: WebGLRenderTarget | null;
    private material;
    opts: PassOptions;
    constructor(opts: PassOptions);
    init(info: RendererInfo): void;
    update(time: number): void;
    render(renderer: WebGLRenderer): void;
    get texture(): Texture | null;
    setUniform(name: string, value: any): void;
    resize(width: number, height: number): void;
}
