import * as THREE from "three";

export function createWireframeBox(
  size: number,
  color?: number,
  position?: THREE.Vector3
): THREE.LineSegments;

export function createWireframeBox(
  width: number,
  height: number,
  depth: number,
  color?: number,
  position?: THREE.Vector3
): THREE.LineSegments;

export function createWireframeBox(
  boundingBox: THREE.Box3,
  color?: number
): THREE.LineSegments;

export function createWireframeBox(
  widthOrSizeOrBoundingBox: number | THREE.Box3,
  heightOrColor?: number,
  depthOrPosition?: number | THREE.Vector3,
  color?: number,
  position?: THREE.Vector3
): THREE.LineSegments {
  if (widthOrSizeOrBoundingBox instanceof THREE.Box3) {
    const boundingBox = widthOrSizeOrBoundingBox;
    const boxColor = heightOrColor ?? 0xff0000;
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    return createWireframeBox(size.x, size.y, size.z, boxColor, center);
  }

  if (typeof heightOrColor === 'number' && typeof depthOrPosition === 'number') {
    const width = widthOrSizeOrBoundingBox;
    const height = heightOrColor;
    const depth = depthOrPosition;
    const boxColor = color ?? 0x00ff00;
    const boxPosition = position ?? new THREE.Vector3(0, 0, 0);

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: boxColor });
    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.copy(boxPosition);
    return wireframe;
  }

  const size = widthOrSizeOrBoundingBox;
  const boxColor = heightOrColor ?? 0x00ff00;
  const boxPosition = depthOrPosition instanceof THREE.Vector3 ? depthOrPosition : new THREE.Vector3(0, 0, 0);

  const geometry = new THREE.BoxGeometry(size, size, size);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: boxColor });
  const wireframe = new THREE.LineSegments(edges, material);
  wireframe.position.copy(boxPosition);
  return wireframe;
}
