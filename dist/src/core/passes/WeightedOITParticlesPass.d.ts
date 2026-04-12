import { Texture, WebGLRenderer } from 'three';
import { Pass, PassOptions, RendererInfo } from '../../types';

export declare class WeightedOITParticlesPass implements Pass {
    private particleScene;
    private camera;
    private accumRT;
    private revealRT;
    private particleMesh;
    private accumMaterial;
    private revealMaterial;
    private compositeScene;
    private compositeCamera;
    private compositeMesh;
    opts: PassOptions;
    constructor(opts: PassOptions);
    init(info: RendererInfo): void;
    update(time: number): void;
    setUniform(name: string, value: any): void;
    render(renderer: WebGLRenderer): void;
    get texture(): Texture | null;
}
