import * as THREE from "three";

export function createArrowGeometry(
  raisedCenter: number = 0.2
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  vertices.push(
    0, 0.5, 0,
    -0.5, -0.5, 0,
    0, -0.5 + raisedCenter, 0,
    0.5, -0.5, 0
  );

  uvs.push(
    0.5, 1,
    0, 0,
    0.5, 0.2,
    1, 0
  );

  indices.push(
    0, 1, 2,
    0, 2, 3
  );

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  geometry.computeVertexNormals();

  return geometry;
}

export function createParticleArrowGeometry(): THREE.BufferGeometry {
  return createArrowGeometry(0.2);
}
