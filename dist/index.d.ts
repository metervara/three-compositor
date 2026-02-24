import { Blending } from 'three';
import { Box3 } from 'three';
import { BufferGeometry } from 'three';
import { Camera } from 'three';
import { Color } from 'three';
import { DataTexture } from 'three';
import { InstancedBufferGeometry } from 'three';
import { IUniform } from 'three';
import { LineSegments } from 'three';
import { MagnificationTextureFilter } from 'three';
import { Matrix3 } from 'three';
import { Mesh } from 'three';
import { RenderTargetOptions } from 'three';
import { Scene } from 'three';
import { ShaderMaterial } from 'three';
import { Side } from 'three';
import { Texture } from 'three';
import { TextureFilter } from 'three';
import { Vector2 } from 'three';
import { Vector3 } from 'three';
import { WebGLRenderer } from 'three';
import { WebGLRenderTarget } from 'three';
import { Wrapping } from 'three';

export declare function blit(renderer: WebGLRenderer, srcTexture: Texture, dstRenderTarget: WebGLRenderTarget | null, material?: ShaderMaterial): void;

export declare function buildNDCToZConst(camera: Camera, z0?: number): Matrix3 | null;

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

export declare function computeTextureSize(count: number, usePowerOfTwo?: boolean): {
    width: number;
    height: number;
};

export declare function createArrowGeometry(raisedCenter?: number): BufferGeometry;

export declare function createClusterPositionTexture(width: number, height: number, options?: PositionTextureOptions & {
    numClusters?: number;
    clusterSize?: number;
}): DataTexture;

export declare function createConvergentVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numPoints?: number;
    convergenceStrength?: number;
}): DataTexture;

export declare function createDataTexture(width: number, height: number, generator: PixelGenerator, params?: {
    minFilter?: TextureFilter;
    magFilter?: MagnificationTextureFilter;
    wrapS?: Wrapping;
    wrapT?: Wrapping;
}): DataTexture;

export declare function createFlowVelocityTexture(width: number, height: number, options?: VelocityTextureOptions): DataTexture;

export declare function createGradientFlowVelocityTexture(width: number, height: number, options?: VelocityTextureOptions): DataTexture;

export declare function createInstancedUvBuffer(count: number, width: number, height: number): Float32Array;

export declare function createMixedVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    patterns?: Array<{
        type: 'flow' | 'rotational' | 'radial' | 'turbulent' | 'wave' | 'convergent';
        weight: number;
        params?: any;
    }>;
}): DataTexture;

export declare function createNoisePositionTexture(width: number, height: number, options?: PositionTextureOptions): DataTexture;

export declare function createNormalTextureFromArray(normals: Float32Array, count: number): {
    texture: DataTexture;
    width: number;
    height: number;
};

export declare function createParticleArrowGeometry(): BufferGeometry;

export declare function createPositionTextureFromArray(positions: Float32Array, count: number, aliveState?: Uint8Array): {
    texture: DataTexture;
    width: number;
    height: number;
};

export declare function createQuad(opts: MaterialOptions, width?: number, height?: number): Mesh;

export declare function createRadialVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numCenters?: number;
    radialStrength?: number;
}): DataTexture;

export declare function createRenderer(options?: RendererOptions): RendererInfo;

export declare function createRotationalVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numCenters?: number;
    rotationStrength?: number;
}): DataTexture;

export declare function createScreenSpacePositionTexture(width: number, height: number, camera: Camera, options?: PositionTextureOptions & {
    distance?: number;
}): DataTexture;

export declare function createSpiralPositionTexture(width: number, height: number, options?: PositionTextureOptions): DataTexture;

export declare function createTurbulentVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    turbulenceIntensity?: number;
    turbulenceOctaves?: number;
}): DataTexture;

export declare function createWavePositionTexture(width: number, height: number, options?: PositionTextureOptions & {
    numWaves?: number;
    waveAmplitude?: number;
}): DataTexture;

export declare function createWaveVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numWaves?: number;
    waveFrequency?: number;
}): DataTexture;

export declare function createWireframeBox(size: number, color?: number, position?: Vector3): LineSegments;

export declare function createWireframeBox(width: number, height: number, depth: number, color?: number, position?: Vector3): LineSegments;

export declare function createWireframeBox(boundingBox: Box3, color?: number): LineSegments;

export declare function domainWarp2D(x: number, y: number, strength?: number): {
    x: number;
    y: number;
};

export declare interface ExperimentSetup {
    config?: RendererOptions;
    init: (info: RendererInfo) => void;
    update: (time: number) => void;
    setupInputs?: boolean;
    setupResize?: boolean;
    title?: string;
    onResize?: (info: RendererInfo) => void;
    onToggleInfo?: (visible: boolean) => void;
}

export declare function fbm2D(x: number, y: number, octaves?: number, lacunarity?: number, gain?: number): number;

export declare function fbm3D(x: number, y: number, z: number, octaves?: number, lacunarity?: number, gain?: number): number;

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

export declare const globalUniforms: {
    uTime: {
        value: number;
    };
    uResolution: {
        value: Vector2;
    };
    uMouse: {
        value: Vector2;
    };
    uMouseUV: {
        value: Vector2;
    };
    uMouseNDC: {
        value: Vector2;
    };
    uMouseDelta: {
        value: Vector2;
    };
    uMousePrev: {
        value: Vector2;
    };
    uMouseUVPrev: {
        value: Vector2;
    };
    uMouseNDCPrev: {
        value: Vector2;
    };
    uMouseDeltaPrev: {
        value: Vector2;
    };
    uScroll: {
        value: number;
    };
};

export declare let isMousePressed: boolean;

export declare interface MaterialOptions {
    vertexShader: string;
    fragmentShader: string;
    uniforms?: {
        [key: string]: IUniform;
    };
    defines?: Record<string, boolean | number>;
    depthTest?: boolean;
    depthWrite?: boolean;
    alphaTest?: number;
    blending?: Blending;
    transparent?: boolean;
    side?: Side;
}

export declare let mouseButton: number;

export declare interface ParticleOptions {
    count: number;
    width: number;
    height: number;
    geometry?: BufferGeometry;
}

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

export declare class ParticleSystem {
    readonly mesh: Mesh;
    readonly material: ShaderMaterial;
    readonly geometry: InstancedBufferGeometry;
    constructor(options: ParticleSystemOptions);
    setUniform(name: string, value: any): void;
    getUniform(name: string): any;
    dispose(): void;
}

export declare interface ParticleSystemOptions {
    count: number;
    width: number;
    height: number;
    geometry?: BufferGeometry;
    materialOptions: MaterialOptions;
}

export declare interface Pass {
    opts: PassOptions;
    texture: Texture | null;
    init(info: RendererInfo): void;
    update(time: number): void;
    render(renderer: WebGLRenderer): void;
    resize?(width: number, height: number): void;
    setUniform?(name: string, value: any): void;
}

export declare interface PassOptions {
    seedTexture?: Texture;
    outputTarget?: WebGLRenderTarget;
    rtSize?: {
        width: number;
        height: number;
    };
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

export declare function perlin2D(x: number, y: number): number;

export declare function perlin3D(x: number, y: number, z: number): number;

export declare class PingPongBuffer {
    private rtA;
    private rtB;
    private flag;
    constructor(width: number, height: number, options?: Partial<RenderTargetOptions>);
    get read(): WebGLRenderTarget<Texture>;
    get write(): WebGLRenderTarget<Texture>;
    swap(): void;
    dispose(): void;
}

export declare type PixelGenerator = (x: number, y: number, width: number, height: number) => [number, number, number, number];

export declare interface PositionTextureOptions {
    bounds?: number;
    is2D?: boolean;
    noiseScale?: number;
    seed?: number;
    noiseOffset?: {
        x: number;
        y: number;
        z: number;
    };
}

export declare interface RendererInfo {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    canvas: HTMLCanvasElement;
    dpi: number;
    scale: number;
}

export declare interface RendererOptions {
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

export declare function ridged2D(x: number, y: number, octaves?: number, lacunarity?: number, gain?: number, offset?: number): number;

export declare function runExperiment(experiment: ExperimentSetup): void;

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

export declare function seededRandom(seed: number): () => number;

export declare function setupInputs(info: RendererInfo): void;

export declare function setupResize(info: RendererInfo, onResizeCallback?: (info: RendererInfo) => void): void;

export declare const shaders: {
    readonly core: {
        readonly passThroughVert: string;
        readonly textureFrag: string;
        readonly uvFrag: string;
        readonly commonGlsl: string;
        readonly colorGlsl: string;
        readonly easingGlsl: string;
        readonly spaceGlsl: string;
        readonly bumpCurvesGlsl: string;
        readonly blurHFrag: string;
        readonly blurVFrag: string;
        readonly blurBilateralHFrag: string;
        readonly blurBilateralVFrag: string;
    };
    readonly particles: {
        readonly billboardVert: string;
        readonly billboardStretchedVert: string;
        readonly billboardStretchedVelocityVert: string;
        readonly billboardLifescaleVert: string;
        readonly commonGlsl: string;
        readonly particleDebugFrag: string;
        readonly particleFlatColorFrag: string;
        readonly particleLifeDiscardFrag: string;
        readonly speedDebugFrag: string;
    };
    readonly noise: {
        readonly commonGlsl: string;
        readonly perlinGlsl: string;
        readonly simplexGlsl: string;
        readonly worleyGlsl: string;
        readonly fbmGlsl: string;
    };
    readonly oit: {
        readonly compositeFrag: string;
    };
    readonly capsule: {
        readonly capsuleVert: string;
        readonly capsuleCheckerFrag: string;
        readonly capsuleNoise3dFrag: string;
        readonly capsuleNoise3dFogFrag: string;
    };
    readonly sdf: {
        readonly primitivesGlsl: string;
        readonly modifiersGlsl: string;
    };
};

export declare function startLoop(info: RendererInfo, update: UpdateFn): void;

export declare type UpdateFn = (time: number) => void;

export declare interface VelocityTextureOptions {
    maxSpeed?: number;
    is2D?: boolean;
    noiseScale?: number;
    seed?: number;
    noiseOffset?: {
        x: number;
        y: number;
        z: number;
    };
}

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

export { }
