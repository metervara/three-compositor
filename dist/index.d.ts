import * as THREE from 'three';
import { Vector2 } from 'three';

export declare function blit(renderer: THREE.WebGLRenderer, srcTexture: THREE.Texture, dstRenderTarget: THREE.WebGLRenderTarget | null, material?: THREE.ShaderMaterial): void;

export declare function buildNDCToZConst(camera: THREE.Camera, z0?: number): THREE.Matrix3 | null;

export declare class Compositor {
    private passes;
    private pingPongBuffers;
    private renderer;
    private textureRegistry;
    private passRegistry;
    private pingPongPassMapping;
    constructor(renderer: THREE.WebGLRenderer);
    addPass(pass: Pass, name?: string): Compositor;
    getPass(name: string): Pass | undefined;
    getTexture(name: string): THREE.Texture | undefined;
    registerTexture(name: string, texture: THREE.Texture): Compositor;
    createPingPong(name: string, width: number, height: number, options?: Partial<THREE.RenderTargetOptions>): PingPongBuffer;
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
    blit(source: THREE.Texture, target: THREE.WebGLRenderTarget): Compositor;
    execute(operation: (renderer: THREE.WebGLRenderer) => void): Compositor;
    clear(): Compositor;
    removePass(name: string): Compositor;
    getPassCount(): number;
    getDescription(): string;
    private getPassNameByIndex;
    private getPassType;
    private getPassDetails;
    updatePingPongPass(passName: string, pingPongName: string, inputUniform: string, outputTarget?: THREE.WebGLRenderTarget): Compositor;
    private resolveDependencies;
    private estimateQuadFragments;
    resize(width: number, height: number): void;
    resizePass(passName: string, width: number, height: number): void;
}

export declare function computeTextureSize(count: number, usePowerOfTwo?: boolean): {
    width: number;
    height: number;
};

export declare function createArrowGeometry(raisedCenter?: number): THREE.BufferGeometry;

export declare function createClusterPositionTexture(width: number, height: number, options?: PositionTextureOptions & {
    numClusters?: number;
    clusterSize?: number;
}): THREE.DataTexture;

export declare function createConvergentVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numPoints?: number;
    convergenceStrength?: number;
}): THREE.DataTexture;

export declare function createDataTexture(width: number, height: number, generator: PixelGenerator, params?: {
    minFilter?: THREE.TextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    wrapS?: THREE.Wrapping;
    wrapT?: THREE.Wrapping;
}): THREE.DataTexture;

export declare function createFlowVelocityTexture(width: number, height: number, options?: VelocityTextureOptions): THREE.DataTexture;

export declare function createGradientFlowVelocityTexture(width: number, height: number, options?: VelocityTextureOptions): THREE.DataTexture;

export declare function createInstancedUvBuffer(count: number, width: number, height: number): Float32Array;

export declare function createMixedVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    patterns?: Array<{
        type: 'flow' | 'rotational' | 'radial' | 'turbulent' | 'wave' | 'convergent';
        weight: number;
        params?: any;
    }>;
}): THREE.DataTexture;

export declare function createNoisePositionTexture(width: number, height: number, options?: PositionTextureOptions): THREE.DataTexture;

export declare function createNormalTextureFromArray(normals: Float32Array, count: number): {
    texture: THREE.DataTexture;
    width: number;
    height: number;
};

export declare function createParticleArrowGeometry(): THREE.BufferGeometry;

export declare function createPositionTextureFromArray(positions: Float32Array, count: number, aliveState?: Uint8Array): {
    texture: THREE.DataTexture;
    width: number;
    height: number;
};

export declare function createQuad(opts: MaterialOptions, width?: number, height?: number): THREE.Mesh;

export declare function createRadialVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numCenters?: number;
    radialStrength?: number;
}): THREE.DataTexture;

export declare function createRenderer(options?: RendererOptions): RendererInfo;

export declare function createRotationalVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numCenters?: number;
    rotationStrength?: number;
}): THREE.DataTexture;

export declare function createScreenSpacePositionTexture(width: number, height: number, camera: THREE.Camera, options?: PositionTextureOptions & {
    distance?: number;
}): THREE.DataTexture;

export declare function createSpiralPositionTexture(width: number, height: number, options?: PositionTextureOptions): THREE.DataTexture;

export declare function createTurbulentVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    turbulenceIntensity?: number;
    turbulenceOctaves?: number;
}): THREE.DataTexture;

export declare function createWavePositionTexture(width: number, height: number, options?: PositionTextureOptions & {
    numWaves?: number;
    waveAmplitude?: number;
}): THREE.DataTexture;

export declare function createWaveVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numWaves?: number;
    waveFrequency?: number;
}): THREE.DataTexture;

export declare function createWireframeBox(size: number, color?: number, position?: THREE.Vector3): THREE.LineSegments;

export declare function createWireframeBox(width: number, height: number, depth: number, color?: number, position?: THREE.Vector3): THREE.LineSegments;

export declare function createWireframeBox(boundingBox: THREE.Box3, color?: number): THREE.LineSegments;

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
    outputTarget: THREE.WebGLRenderTarget | null;
    private material;
    opts: PassOptions;
    constructor(opts: PassOptions);
    init(info: RendererInfo): void;
    update(time: number): void;
    render(renderer: THREE.WebGLRenderer): void;
    get texture(): THREE.Texture | null;
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
        [key: string]: THREE.IUniform;
    };
    defines?: Record<string, boolean | number>;
    depthTest?: boolean;
    depthWrite?: boolean;
    alphaTest?: number;
    blending?: THREE.Blending;
    transparent?: boolean;
    side?: THREE.Side;
}

export declare let mouseButton: number;

export declare interface ParticleOptions {
    count: number;
    width: number;
    height: number;
    geometry?: THREE.BufferGeometry;
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
    render(renderer: THREE.WebGLRenderer): void;
    get texture(): THREE.Texture | null;
    get outputTarget(): THREE.WebGLRenderTarget | null;
    set outputTarget(target: THREE.WebGLRenderTarget | null);
    setUniform(name: string, value: any): void;
    resize(width: number, height: number): void;
}

export declare class ParticleSystem {
    readonly mesh: THREE.Mesh;
    readonly material: THREE.ShaderMaterial;
    readonly geometry: THREE.InstancedBufferGeometry;
    constructor(options: ParticleSystemOptions);
    setUniform(name: string, value: any): void;
    getUniform(name: string): any;
    dispose(): void;
}

export declare interface ParticleSystemOptions {
    count: number;
    width: number;
    height: number;
    geometry?: THREE.BufferGeometry;
    materialOptions: MaterialOptions;
}

export declare interface Pass {
    opts: PassOptions;
    texture: THREE.Texture | null;
    init(info: RendererInfo): void;
    update(time: number): void;
    render(renderer: THREE.WebGLRenderer): void;
    resize?(width: number, height: number): void;
    setUniform?(name: string, value: any): void;
}

export declare interface PassOptions {
    seedTexture?: THREE.Texture;
    outputTarget?: THREE.WebGLRenderTarget;
    rtSize?: {
        width: number;
        height: number;
    };
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

export declare function perlin2D(x: number, y: number): number;

export declare function perlin3D(x: number, y: number, z: number): number;

export declare class PingPongBuffer {
    private rtA;
    private rtB;
    private flag;
    constructor(width: number, height: number, options?: Partial<THREE.RenderTargetOptions>);
    get read(): THREE.WebGLRenderTarget<THREE.Texture>;
    get write(): THREE.WebGLRenderTarget<THREE.Texture>;
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
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    canvas: HTMLCanvasElement;
    dpi: number;
    scale: number;
}

export declare interface RendererOptions {
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
    render(renderer: THREE.WebGLRenderer): void;
    get texture(): THREE.Texture | null;
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
    render(renderer: THREE.WebGLRenderer): void;
    get texture(): THREE.Texture | null;
}

export { }
