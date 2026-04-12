import { DataTexture, Camera } from 'three';

export interface PositionTextureOptions {
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
export declare function createNoisePositionTexture(width: number, height: number, options?: PositionTextureOptions): DataTexture;
export declare function createSpiralPositionTexture(width: number, height: number, options?: PositionTextureOptions): DataTexture;
export declare function createClusterPositionTexture(width: number, height: number, options?: PositionTextureOptions & {
    numClusters?: number;
    clusterSize?: number;
}): DataTexture;
export declare function createWavePositionTexture(width: number, height: number, options?: PositionTextureOptions & {
    numWaves?: number;
    waveAmplitude?: number;
}): DataTexture;
export declare function createScreenSpacePositionTexture(width: number, height: number, camera: Camera, options?: PositionTextureOptions & {
    distance?: number;
}): DataTexture;
export declare function createPositionTextureFromArray(positions: Float32Array, count: number, aliveState?: Uint8Array): {
    texture: DataTexture;
    width: number;
    height: number;
};
export declare function createNormalTextureFromArray(normals: Float32Array, count: number): {
    texture: DataTexture;
    width: number;
    height: number;
};
