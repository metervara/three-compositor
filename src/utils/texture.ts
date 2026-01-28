import {
  DataTexture,
  RGBAFormat,
  FloatType,
  NearestFilter,
  RepeatWrapping,
} from "three";
import type { TextureFilter, MagnificationTextureFilter, Wrapping } from "three";
import type { PixelGenerator } from "../types";

export function createDataTexture(
  width: number,
  height: number,
  generator: PixelGenerator,
  params?: {
    minFilter?: TextureFilter;
    magFilter?: MagnificationTextureFilter;
    wrapS?: Wrapping;
    wrapT?: Wrapping;
  }
): DataTexture {
  const size = width * height * 4;
  const data = new Float32Array(size);

  let ptr = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = generator(x, y, width, height);
      data[ptr++] = r;
      data[ptr++] = g;
      data[ptr++] = b;
      data[ptr++] = a;
    }
  }

  const tex = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    FloatType
  );

  tex.minFilter = params?.minFilter ?? NearestFilter;
  tex.magFilter = params?.magFilter ?? NearestFilter;
  tex.wrapS = params?.wrapS ?? RepeatWrapping;
  tex.wrapT = params?.wrapT ?? RepeatWrapping;

  tex.needsUpdate = true;
  return tex;
}
