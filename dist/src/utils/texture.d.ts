import { DataTexture, TextureFilter, MagnificationTextureFilter, Wrapping } from 'three';
import { PixelGenerator } from '../types';

export declare function createDataTexture(width: number, height: number, generator: PixelGenerator, params?: {
    minFilter?: TextureFilter;
    magFilter?: MagnificationTextureFilter;
    wrapS?: Wrapping;
    wrapT?: Wrapping;
}): DataTexture;
