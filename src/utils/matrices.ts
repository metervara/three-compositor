import * as THREE from "three";

export function buildNDCToZConst(camera: THREE.Camera, z0: number = 0): THREE.Matrix3 | null {
  const M = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );

  const e = M.elements;
  const m = (r: number, c: number) => e[c * 4 + r];

  const H = new THREE.Matrix3().set(
    m(0,0), m(0,1), m(0,2) * z0 + m(0,3),
    m(1,0), m(1,1), m(1,2) * z0 + m(1,3),
    m(3,0), m(3,1), m(3,2) * z0 + m(3,3)
  );

  const det = H.determinant();
  if (Math.abs(det) < 1e-8) return null;

  return new THREE.Matrix3().copy(H).invert();
}
