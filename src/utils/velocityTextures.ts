import * as THREE from "three";
import { createDataTexture } from "./texture";
import { perlin2D, fbm2D, seededRandom } from "./noise";

export interface VelocityTextureOptions {
  maxSpeed?: number;
  is2D?: boolean;
  noiseScale?: number;
  seed?: number;
  noiseOffset?: { x: number; y: number; z: number };
}

export function createFlowVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 }
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;

    const velX = perlin2D(noiseX, noiseY) * maxSpeed;
    const velY = perlin2D(noiseX + 100, noiseY + 100) * maxSpeed;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = perlin2D(noiseX + 200, noiseY + 200) * maxSpeed;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createGradientFlowVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 }
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;

    const eps = 0.01;

    const noiseCenter = perlin2D(noiseX, noiseY);
    const noiseRight = perlin2D(noiseX + eps, noiseY);
    const noiseUp = perlin2D(noiseX, noiseY + eps);

    const velX = -(noiseRight - noiseCenter) / eps * maxSpeed;
    const velY = -(noiseUp - noiseCenter) / eps * maxSpeed;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = perlin2D(noiseX + 200, noiseY + 200) * maxSpeed * 0.5;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createRotationalVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions & {
    numCenters?: number;
    rotationStrength?: number;
  } = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    numCenters = 3,
    rotationStrength = 1.0
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const worldX = u * 4 - 2;
    const worldY = v * 4 - 2;

    let velX = 0, velY = 0;

    for (let i = 0; i < numCenters; i++) {
      const centerSeed = seed + i * 1000;
      const centerRandom = seededRandom(centerSeed);
      const centerX = centerRandom() * 4 - 2;
      const centerY = centerRandom() * 4 - 2;

      const dx = worldX - centerX;
      const dy = worldY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.01) {
        const strength = rotationStrength * Math.exp(-dist * 2);
        velX += (-dy / dist) * strength;
        velY += (dx / dist) * strength;
      }
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;
    const noiseVelX = perlin2D(noiseX, noiseY) * maxSpeed * 0.3;
    const noiseVelY = perlin2D(noiseX + 100, noiseY + 100) * maxSpeed * 0.3;

    velX = (velX + noiseVelX) * maxSpeed;
    velY = (velY + noiseVelY) * maxSpeed;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = perlin2D(noiseX + 200, noiseY + 200) * maxSpeed * 0.5;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createRadialVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions & {
    numCenters?: number;
    radialStrength?: number;
  } = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    numCenters = 2,
    radialStrength = 1.0
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const worldX = u * 4 - 2;
    const worldY = v * 4 - 2;

    let velX = 0, velY = 0;

    for (let i = 0; i < numCenters; i++) {
      const centerSeed = seed + i * 1000;
      const centerRandom = seededRandom(centerSeed);
      const centerX = centerRandom() * 4 - 2;
      const centerY = centerRandom() * 4 - 2;

      const dx = worldX - centerX;
      const dy = worldY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.01) {
        const strength = radialStrength * Math.exp(-dist * 1.5);
        velX += (dx / dist) * strength;
        velY += (dy / dist) * strength;
      }
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;
    const noiseVelX = perlin2D(noiseX, noiseY) * maxSpeed * 0.2;
    const noiseVelY = perlin2D(noiseX + 100, noiseY + 100) * maxSpeed * 0.2;

    velX = (velX + noiseVelX) * maxSpeed;
    velY = (velY + noiseVelY) * maxSpeed;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = perlin2D(noiseX + 200, noiseY + 200) * maxSpeed * 0.3;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createTurbulentVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions & {
    turbulenceIntensity?: number;
    turbulenceOctaves?: number;
  } = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    turbulenceIntensity = 1.0,
    turbulenceOctaves = 4
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;

    const velX = fbm2D(noiseX, noiseY, turbulenceOctaves, 2.0, 0.5) * maxSpeed * turbulenceIntensity;
    const velY = fbm2D(noiseX + 100, noiseY + 100, turbulenceOctaves, 2.0, 0.5) * maxSpeed * turbulenceIntensity;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = fbm2D(noiseX + 200, noiseY + 200, turbulenceOctaves, 2.0, 0.5) * maxSpeed * turbulenceIntensity;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createWaveVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions & {
    numWaves?: number;
    waveFrequency?: number;
  } = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    numWaves = 3,
    waveFrequency = 2.0
  } = options;

  const random = seededRandom(seed);

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    let velX = 0, velY = 0;

    for (let i = 0; i < numWaves; i++) {
      const phase = random() * Math.PI * 2;
      const freq = waveFrequency * (i + 1);

      velY += Math.sin(u * freq + phase) * maxSpeed * 0.5;
      velX += Math.cos(v * freq + phase) * maxSpeed * 0.5;
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;
    const noiseVelX = perlin2D(noiseX, noiseY) * maxSpeed * 0.3;
    const noiseVelY = perlin2D(noiseX + 100, noiseY + 100) * maxSpeed * 0.3;

    velX = (velX + noiseVelX) * maxSpeed;
    velY = (velY + noiseVelY) * maxSpeed;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = perlin2D(noiseX + 200, noiseY + 200) * maxSpeed * 0.4;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createConvergentVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions & {
    numPoints?: number;
    convergenceStrength?: number;
  } = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    numPoints = 2,
    convergenceStrength = 1.0
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    const worldX = u * 4 - 2;
    const worldY = v * 4 - 2;

    let velX = 0, velY = 0;

    for (let i = 0; i < numPoints; i++) {
      const pointSeed = seed + i * 1000;
      const pointRandom = seededRandom(pointSeed);
      const pointX = pointRandom() * 4 - 2;
      const pointY = pointRandom() * 4 - 2;

      const dx = pointX - worldX;
      const dy = pointY - worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.01) {
        const strength = convergenceStrength * Math.exp(-dist * 1.0);
        velX += (dx / dist) * strength;
        velY += (dy / dist) * strength;
      }
    }

    const noiseX = u * noiseScale + noiseOffset.x;
    const noiseY = v * noiseScale + noiseOffset.y;
    const noiseVelX = perlin2D(noiseX, noiseY) * maxSpeed * 0.2;
    const noiseVelY = perlin2D(noiseX + 100, noiseY + 100) * maxSpeed * 0.2;

    velX = (velX + noiseVelX) * maxSpeed;
    velY = (velY + noiseVelY) * maxSpeed;

    if (is2D) {
      return [velX, velY, 0.0, 1.0];
    } else {
      const velZ = perlin2D(noiseX + 200, noiseY + 200) * maxSpeed * 0.3;
      return [velX, velY, velZ, 1.0];
    }
  });
}

export function createMixedVelocityTexture(
  width: number,
  height: number,
  options: VelocityTextureOptions & {
    patterns?: Array<{
      type: 'flow' | 'rotational' | 'radial' | 'turbulent' | 'wave' | 'convergent';
      weight: number;
      params?: any;
    }>;
  } = {}
): THREE.DataTexture {
  const {
    maxSpeed = 0.5,
    is2D = false,
    noiseScale = 0.05,
    seed = Math.random() * 1000,
    noiseOffset = { x: 0, y: 0, z: 0 },
    patterns = [
      { type: 'flow', weight: 0.4 },
      { type: 'rotational', weight: 0.3 },
      { type: 'turbulent', weight: 0.3 }
    ]
  } = options;

  return createDataTexture(width, height, (x, y, w, h) => {
    const u = x / w;
    const v = y / h;

    let totalVelX = 0, totalVelY = 0, totalVelZ = 0;
    let totalWeight = 0;

    patterns.forEach((pattern, index) => {
      const patternSeed = seed + index * 1000;
      const patternRandom = seededRandom(patternSeed);

      let velX = 0, velY = 0, velZ = 0;

      switch (pattern.type) {
        case 'flow': {
          const flowX = u * noiseScale + noiseOffset.x;
          const flowY = v * noiseScale + noiseOffset.y;
          velX = perlin2D(flowX, flowY) * maxSpeed;
          velY = perlin2D(flowX + 100, flowY + 100) * maxSpeed;
          if (!is2D) velZ = perlin2D(flowX + 200, flowY + 200) * maxSpeed;
          break;
        }
        case 'rotational': {
          const wX = u * 4 - 2;
          const wY = v * 4 - 2;
          const centerX = patternRandom() * 4 - 2;
          const centerY = patternRandom() * 4 - 2;
          const dx = wX - centerX;
          const dy = wY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.01) {
            const strength = Math.exp(-dist * 2);
            velX = (-dy / dist) * strength * maxSpeed;
            velY = (dx / dist) * strength * maxSpeed;
          }
          break;
        }
        case 'turbulent': {
          const turbX = u * noiseScale + noiseOffset.x;
          const turbY = v * noiseScale + noiseOffset.y;
          velX = fbm2D(turbX, turbY, 4, 2.0, 0.5) * maxSpeed;
          velY = fbm2D(turbX + 100, turbY + 100, 4, 2.0, 0.5) * maxSpeed;
          if (!is2D) velZ = fbm2D(turbX + 200, turbY + 200, 4, 2.0, 0.5) * maxSpeed;
          break;
        }
        case 'wave': {
          const waveFreq = 2.0;
          const wavePhase = patternRandom() * Math.PI * 2;
          velX = Math.cos(v * waveFreq + wavePhase) * maxSpeed * 0.5;
          velY = Math.sin(u * waveFreq + wavePhase) * maxSpeed * 0.5;
          break;
        }
        case 'radial': {
          const radWX = u * 4 - 2;
          const radWY = v * 4 - 2;
          const radCX = patternRandom() * 4 - 2;
          const radCY = patternRandom() * 4 - 2;
          const radDx = radWX - radCX;
          const radDy = radWY - radCY;
          const radDist = Math.sqrt(radDx * radDx + radDy * radDy);
          if (radDist > 0.01) {
            const radStrength = Math.exp(-radDist * 1.5);
            velX = (radDx / radDist) * radStrength * maxSpeed;
            velY = (radDy / radDist) * radStrength * maxSpeed;
          }
          break;
        }
        case 'convergent': {
          const convWX = u * 4 - 2;
          const convWY = v * 4 - 2;
          const convPX = patternRandom() * 4 - 2;
          const convPY = patternRandom() * 4 - 2;
          const convDx = convPX - convWX;
          const convDy = convPY - convWY;
          const convDist = Math.sqrt(convDx * convDx + convDy * convDy);
          if (convDist > 0.01) {
            const convStrength = Math.exp(-convDist * 1.0);
            velX = (convDx / convDist) * convStrength * maxSpeed;
            velY = (convDy / convDist) * convStrength * maxSpeed;
          }
          break;
        }
      }

      totalVelX += velX * pattern.weight;
      totalVelY += velY * pattern.weight;
      totalVelZ += velZ * pattern.weight;
      totalWeight += pattern.weight;
    });

    if (totalWeight > 0) {
      totalVelX /= totalWeight;
      totalVelY /= totalWeight;
      totalVelZ /= totalWeight;
    }

    if (is2D) {
      return [totalVelX, totalVelY, 0.0, 1.0];
    } else {
      return [totalVelX, totalVelY, totalVelZ, 1.0];
    }
  });
}
