import {
  DataTexture,
  PerspectiveCamera,
  OrthographicCamera,
  RGBAFormat,
  FloatType,
  NearestFilter,
  ClampToEdgeWrapping,
} from "three";
import type { Camera } from "three";
import { createDataTexture } from "./texture";
import { perlin2D, fbm2D, domainWarp2D, seededRandom } from "./noise";
import { computeTextureSize } from "./particle";
import type { PixelGenerator } from "../types";

export interface PositionTextureOptions {
  bounds?: number;
  is2D?: boolean;
  noiseScale?: number;
  seed?: number;
  noiseOffset?: { x: number; y: number; z: number };
}

export function createNoisePositionTexture(
  width: number,
  height: number,
  options: PositionTextureOptions = {}
): DataTexture {
  const {
    bounds = 2.0,
    is2D = false,
    noiseScale = 0.1,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 }
  } = options;

  const random = seededRandom(seed);

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const randomOffset = random() * 0.1;
    const noiseX = (u + randomOffset) * noiseScale + noiseOffset.x;
    const noiseY = (v + randomOffset) * noiseScale + noiseOffset.y;

    const noiseValue = fbm2D(noiseX, noiseY, 4, 2.0, 0.5);

    const worldX = noiseValue * bounds;
    const worldY = fbm2D(noiseX + 100, noiseY + 100, 4, 2.0, 0.5) * bounds;

    if (is2D) {
      return [worldX, worldY, 0.0, 1.0];
    } else {
      const worldZ = fbm2D(noiseX + 200, noiseY + 200, 4, 2.0, 0.5) * bounds;
      return [worldX, worldY, worldZ, 1.0];
    }
  });
}

export function createSpiralPositionTexture(
  width: number,
  height: number,
  options: PositionTextureOptions = {}
): DataTexture {
  const {
    bounds = 2.0,
    is2D = false,
    noiseScale = 0.1,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 }
  } = options;

  const random = seededRandom(seed);

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const angle = u * Math.PI * 4;
    const radius = v * bounds;

    const noiseX = (u + random() * 0.1) * noiseScale + noiseOffset.x;
    const noiseY = (v + random() * 0.1) * noiseScale + noiseOffset.y;
    const noiseValue = perlin2D(noiseX, noiseY) * 0.3;

    const worldX = (radius + noiseValue) * Math.cos(angle);
    const worldY = (radius + noiseValue) * Math.sin(angle);

    if (is2D) {
      return [worldX, worldY, 0.0, 1.0];
    } else {
      const worldZ = fbm2D(noiseX + 200, noiseY + 200, 3, 2.0, 0.5) * bounds * 0.5;
      return [worldX, worldY, worldZ, 1.0];
    }
  });
}

export function createClusterPositionTexture(
  width: number,
  height: number,
  options: PositionTextureOptions & {
    numClusters?: number;
    clusterSize?: number;
  } = {}
): DataTexture {
  const {
    bounds = 2.0,
    is2D = false,
    noiseScale = 0.1,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    numClusters = 5,
    clusterSize = 0.8
  } = options;

  const random = seededRandom(seed);

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    let minDist = Infinity;
    let closestCluster = { x: 0, y: 0 };

    for (let i = 0; i < numClusters; i++) {
      const clusterSeed = seed + i * 1000;
      const clusterRandom = seededRandom(clusterSeed);
      const clusterX = clusterRandom() * bounds * 2 - bounds;
      const clusterY = clusterRandom() * bounds * 2 - bounds;

      const dist = Math.sqrt((u - (clusterX + bounds) / (bounds * 2)) ** 2 +
                            (v - (clusterY + bounds) / (bounds * 2)) ** 2);

      if (dist < minDist) {
        minDist = dist;
        closestCluster = { x: clusterX, y: clusterY };
      }
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;

    const warp = domainWarp2D(noiseX, noiseY, 0.2);
    const noiseValue = perlin2D(warp.x, warp.y) * clusterSize;

    const worldX = closestCluster.x + noiseValue;
    const worldY = closestCluster.y + perlin2D(warp.x + 100, warp.y + 100) * clusterSize;

    if (is2D) {
      return [worldX, worldY, 0.0, 1.0];
    } else {
      const worldZ = fbm2D(warp.x + 200, warp.y + 200, 3, 2.0, 0.5) * bounds * 0.5;
      return [worldX, worldY, worldZ, 1.0];
    }
  });
}

export function createWavePositionTexture(
  width: number,
  height: number,
  options: PositionTextureOptions & {
    numWaves?: number;
    waveAmplitude?: number;
  } = {}
): DataTexture {
  const {
    bounds = 2.0,
    is2D = false,
    noiseScale = 0.1,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    numWaves = 3,
    waveAmplitude = 0.5
  } = options;

  const random = seededRandom(seed);

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    let waveX = 0;
    let waveY = 0;

    for (let i = 0; i < numWaves; i++) {
      const frequency = (i + 1) * 2;
      const phase = random() * Math.PI * 2;

      waveX += Math.sin(v * frequency + phase) * waveAmplitude;
      waveY += Math.cos(u * frequency + phase) * waveAmplitude;
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;
    const noiseValue = perlin2D(noiseX, noiseY) * 0.3;

    const worldX = (u * bounds * 2 - bounds) + waveX + noiseValue;
    const worldY = (v * bounds * 2 - bounds) + waveY + perlin2D(noiseX + 100, noiseY + 100) * 0.3;

    if (is2D) {
      return [worldX, worldY, 0.0, 1.0];
    } else {
      const worldZ = fbm2D(noiseX + 200, noiseY + 200, 3, 2.0, 0.5) * bounds * 0.5;
      return [worldX, worldY, worldZ, 1.0];
    }
  });
}

export function createScreenSpacePositionTexture(
  width: number,
  height: number,
  camera: Camera,
  options: PositionTextureOptions & {
    distance?: number;
  } = {}
): DataTexture {
  const {
    bounds = 2.0,
    is2D = false,
    noiseScale = 0.1,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    distance = 5.0
  } = options;

  const random = seededRandom(seed);

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const ndcX = u * 2 - 1;
    const ndcY = v * 2 - 1;

    let worldX: number, worldY: number, worldZ: number;

    if (camera instanceof PerspectiveCamera) {
      const aspect = camera.aspect;
      const fovRad = (camera.fov * Math.PI) / 180;
      const heightAtDistance = 2 * distance * Math.tan(fovRad / 2);
      const widthAtDistance = heightAtDistance * aspect;

      worldX = ndcX * widthAtDistance / 2;
      worldY = ndcY * heightAtDistance / 2;
      worldZ = distance;
    } else if (camera instanceof OrthographicCamera) {
      const left = camera.left;
      const right = camera.right;
      const top = camera.top;
      const bottom = camera.bottom;

      worldX = left + (right - left) * u;
      worldY = bottom + (top - bottom) * v;
      worldZ = distance;
    } else {
      worldX = ndcX * bounds;
      worldY = ndcY * bounds;
      worldZ = distance;
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;
    const noiseValue = perlin2D(noiseX, noiseY) * 0.2;

    worldX += noiseValue;
    worldY += perlin2D(noiseX + 100, noiseY + 100) * 0.2;

    if (is2D) {
      return [worldX, worldY, 0.0, 1.0];
    } else {
      worldZ += fbm2D(noiseX + 200, noiseY + 200, 3, 2.0, 0.5) * bounds * 0.3;
      return [worldX, worldY, worldZ, 1.0];
    }
  });
}

export function createPositionTextureFromArray(
  positions: Float32Array,
  count: number,
  aliveState?: Uint8Array
): { texture: DataTexture; width: number; height: number } {
  const { width, height } = computeTextureSize(count);
  const totalTexels = width * height;

  const data = new Float32Array(totalTexels * 4);

  for (let i = 0; i < count; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;

    data[dstIdx + 0] = positions[srcIdx + 0];
    data[dstIdx + 1] = positions[srcIdx + 1];
    data[dstIdx + 2] = positions[srcIdx + 2];
    data[dstIdx + 3] = aliveState ? aliveState[i] : 1.0;
  }

  for (let i = count; i < totalTexels; i++) {
    const dstIdx = i * 4;
    data[dstIdx + 0] = 0;
    data[dstIdx + 1] = 0;
    data[dstIdx + 2] = 0;
    data[dstIdx + 3] = 0;
  }

  const texture = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    FloatType
  );

  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return { texture, width, height };
}

export function createNormalTextureFromArray(
  normals: Float32Array,
  count: number
): { texture: DataTexture; width: number; height: number } {
  const { width, height } = computeTextureSize(count);
  const totalTexels = width * height;

  const data = new Float32Array(totalTexels * 4);

  for (let i = 0; i < count; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;

    data[dstIdx + 0] = normals[srcIdx + 0];
    data[dstIdx + 1] = normals[srcIdx + 1];
    data[dstIdx + 2] = normals[srcIdx + 2];
    data[dstIdx + 3] = 1.0;
  }

  for (let i = count; i < totalTexels; i++) {
    const dstIdx = i * 4;
    data[dstIdx + 0] = 0;
    data[dstIdx + 1] = 1;
    data[dstIdx + 2] = 0;
    data[dstIdx + 3] = 1;
  }

  const texture = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    FloatType
  );

  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return { texture, width, height };
}
