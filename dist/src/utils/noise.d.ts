export declare function perlin2D(x: number, y: number): number;
export declare function perlin3D(x: number, y: number, z: number): number;
export declare function fbm2D(x: number, y: number, octaves?: number, lacunarity?: number, gain?: number): number;
export declare function fbm3D(x: number, y: number, z: number, octaves?: number, lacunarity?: number, gain?: number): number;
export declare function ridged2D(x: number, y: number, octaves?: number, lacunarity?: number, gain?: number, offset?: number): number;
export declare function domainWarp2D(x: number, y: number, strength?: number): {
    x: number;
    y: number;
};
export declare function seededRandom(seed: number): () => number;
