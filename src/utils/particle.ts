export function computeTextureSize(
  count: number,
  usePowerOfTwo: boolean = false
): { width: number; height: number } {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("computeTextureSize: count must be a positive integer");
  }

  function nextPow2(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  if (!usePowerOfTwo) {
    const width = Math.ceil(Math.sqrt(count));
    const height = Math.ceil(count / width);
    return { width, height };
  }

  const approx = Math.ceil(Math.sqrt(count));
  const powW = nextPow2(approx);

  const neededH = Math.ceil(count / powW);
  const powH = nextPow2(neededH);

  return { width: powW, height: powH };
}

export function createInstancedUvBuffer(
  count: number,
  width: number,
  height: number
): Float32Array {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("createInstancedUvBuffer: count must be a positive integer");
  }
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error("createInstancedUvBuffer: width must be a positive integer");
  }
  if (!Number.isInteger(height) || height <= 0) {
    throw new Error("createInstancedUvBuffer: height must be a positive integer");
  }
  if (width * height < count) {
    throw new Error(
      `createInstancedUvBuffer: texture too small (${width}x${height} = ${width * height} < count=${count})`
    );
  }

  const uvArray = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = (i % width) + 0.5;
    const y = Math.floor(i / width) + 0.5;
    uvArray[2 * i + 0] = x / width;
    uvArray[2 * i + 1] = y / height;
  }
  return uvArray;
}
