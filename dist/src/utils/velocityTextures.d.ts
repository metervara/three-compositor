import { DataTexture } from 'three';

export interface VelocityTextureOptions {
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
export declare function createFlowVelocityTexture(width: number, height: number, options?: VelocityTextureOptions): DataTexture;
export declare function createGradientFlowVelocityTexture(width: number, height: number, options?: VelocityTextureOptions): DataTexture;
export declare function createRotationalVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numCenters?: number;
    rotationStrength?: number;
}): DataTexture;
export declare function createRadialVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numCenters?: number;
    radialStrength?: number;
}): DataTexture;
export declare function createTurbulentVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    turbulenceIntensity?: number;
    turbulenceOctaves?: number;
}): DataTexture;
export declare function createWaveVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numWaves?: number;
    waveFrequency?: number;
}): DataTexture;
export declare function createConvergentVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    numPoints?: number;
    convergenceStrength?: number;
}): DataTexture;
export declare function createMixedVelocityTexture(width: number, height: number, options?: VelocityTextureOptions & {
    patterns?: Array<{
        type: 'flow' | 'rotational' | 'radial' | 'turbulent' | 'wave' | 'convergent';
        weight: number;
        params?: any;
    }>;
}): DataTexture;
