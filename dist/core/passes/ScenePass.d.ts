import { Texture, WebGLRenderer } from 'three';
import { Pass, PassOptions, RendererInfo } from '../../types';

export declare class ScenePass implements Pass {
    private scene;
    private camera;
    private _outputTarget;
    opts: PassOptions;
    constructor(opts: PassOptions);
    init(info: RendererInfo): void;
    update(_time: number): void;
    render(renderer: WebGLRenderer): void;
    get texture(): Texture | null;
    resize(width: number, height: number): void;
}
