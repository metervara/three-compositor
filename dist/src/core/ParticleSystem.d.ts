import { Mesh, ShaderMaterial, InstancedBufferGeometry, BufferGeometry } from 'three';
import { MaterialOptions } from '../types';

export interface ParticleSystemOptions {
    count: number;
    width: number;
    height: number;
    geometry?: BufferGeometry;
    materialOptions: MaterialOptions;
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
