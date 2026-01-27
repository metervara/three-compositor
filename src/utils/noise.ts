function mod289(x: number): number {
  return x - Math.floor(x * (1.0 / 289.0)) * 289.0;
}

function permute(x: number): number {
  return mod289(((x * 34.0) + 1.0) * x);
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

function grad(hash: number, x: number, y: number, z?: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : (z ?? 0);
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function perlin2D(x: number, y: number): number {
  const X = Math.floor(x);
  const Y = Math.floor(y);

  x = x - X;
  y = y - Y;

  const u = fade(x);
  const v = fade(y);

  const n00 = grad(permute(permute(X) + Y), x, y);
  const n01 = grad(permute(permute(X) + Y + 1), x, y - 1);
  const n10 = grad(permute(permute(X + 1) + Y), x - 1, y);
  const n11 = grad(permute(permute(X + 1) + Y + 1), x - 1, y - 1);

  const nx0 = n00 + u * (n10 - n00);
  const nx1 = n01 + u * (n11 - n01);

  return 2.3 * (nx0 + v * (nx1 - nx0));
}

export function perlin3D(x: number, y: number, z: number): number {
  const X = Math.floor(x);
  const Y = Math.floor(y);
  const Z = Math.floor(z);

  x = x - X;
  y = y - Y;
  z = z - Z;

  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  const A = permute(X) + Y;
  const AA = permute(A) + Z;
  const AB = permute(A + 1) + Z;
  const B = permute(X + 1) + Y;
  const BA = permute(B) + Z;
  const BB = permute(B + 1) + Z;

  const n000 = grad(permute(AA), x, y, z);
  const n001 = grad(permute(AB), x, y, z - 1);
  const n010 = grad(permute(AA + 1), x, y - 1, z);
  const n011 = grad(permute(AB + 1), x, y - 1, z - 1);
  const n100 = grad(permute(BA), x - 1, y, z);
  const n101 = grad(permute(BB), x - 1, y, z - 1);
  const n110 = grad(permute(BA + 1), x - 1, y - 1, z);
  const n111 = grad(permute(BB + 1), x - 1, y - 1, z - 1);

  const nx00 = n000 + u * (n100 - n000);
  const nx01 = n001 + u * (n101 - n001);
  const nx10 = n010 + u * (n110 - n010);
  const nx11 = n011 + u * (n111 - n011);

  const nxy0 = nx00 + v * (nx10 - nx00);
  const nxy1 = nx01 + v * (nx11 - nx01);

  return 2.3 * (nxy0 + w * (nxy1 - nxy0));
}

export function fbm2D(
  x: number,
  y: number,
  octaves: number = 6,
  lacunarity: number = 2.0,
  gain: number = 0.5
): number {
  let sum = 0.0;
  let amplitude = 0.5;
  let frequency = 1.0;

  for (let i = 0; i < octaves; i++) {
    sum += amplitude * perlin2D(x * frequency, y * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return sum;
}

export function fbm3D(
  x: number,
  y: number,
  z: number,
  octaves: number = 6,
  lacunarity: number = 2.0,
  gain: number = 0.5
): number {
  let sum = 0.0;
  let amplitude = 0.5;
  let frequency = 1.0;

  for (let i = 0; i < octaves; i++) {
    sum += amplitude * perlin3D(x * frequency, y * frequency, z * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return sum;
}

export function ridged2D(
  x: number,
  y: number,
  octaves: number = 6,
  lacunarity: number = 2.0,
  gain: number = 0.5,
  offset: number = 1.0
): number {
  let sum = 0.0;
  let amplitude = 0.5;
  let frequency = 1.0;

  for (let i = 0; i < octaves; i++) {
    let n = perlin2D(x * frequency, y * frequency);
    n = offset - Math.abs(n);
    n *= n;
    sum += n * amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return sum * 1.25;
}

export function domainWarp2D(x: number, y: number, strength: number = 0.1): { x: number; y: number } {
  const warpX = perlin2D(x, y) * strength;
  const warpY = perlin2D(x + 100, y + 100) * strength;

  return {
    x: x + warpX,
    y: y + warpY
  };
}

export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
