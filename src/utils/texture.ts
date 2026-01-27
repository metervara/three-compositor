import * as THREE from "three";
import type { PixelGenerator } from "../types";

export function createDataTexture(
  width: number,
  height: number,
  generator: PixelGenerator,
  params?: {
    minFilter?: THREE.TextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    wrapS?: THREE.Wrapping;
    wrapT?: THREE.Wrapping;
  }
): THREE.DataTexture {
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

  const tex = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType
  );

  tex.minFilter = params?.minFilter ?? THREE.NearestFilter;
  tex.magFilter = params?.magFilter ?? THREE.NearestFilter;
  tex.wrapS = params?.wrapS ?? THREE.RepeatWrapping;
  tex.wrapT = params?.wrapT ?? THREE.RepeatWrapping;

  tex.needsUpdate = true;
  return tex;
}
