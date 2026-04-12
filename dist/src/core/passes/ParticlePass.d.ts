import { WebGLRenderTarget, Texture, WebGLRenderer } from 'three';
import { Pass, PassOptions, RendererInfo } from '../../types';

export declare class ParticlePass implements Pass {
    private scene;
    private camera;
    private outRT;
    private particleSystem;
    opts: PassOptions;
    constructor(opts: PassOptions);
    init(info: RendererInfo): void;
    update(time: number): void;
    render(renderer: WebGLRenderer): void;
    get texture(): Texture | null;
    get outputTarget(): WebGLRenderTarget | null;
    set outputTarget(target: WebGLRenderTarget | null);
    setUniform(name: string, value: any): void;
    resize(width: number, height: number): void;
}
