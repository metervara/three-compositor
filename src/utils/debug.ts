import {
  LineSegments,
  Vector3,
  Box3,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
} from "three";

export function createWireframeBox(
  size: number,
  color?: number,
  position?: Vector3
): LineSegments;

export function createWireframeBox(
  width: number,
  height: number,
  depth: number,
  color?: number,
  position?: Vector3
): LineSegments;

export function createWireframeBox(
  boundingBox: Box3,
  color?: number
): LineSegments;

export function createWireframeBox(
  widthOrSizeOrBoundingBox: number | Box3,
  heightOrColor?: number,
  depthOrPosition?: number | Vector3,
  color?: number,
  position?: Vector3
): LineSegments {
  if (widthOrSizeOrBoundingBox instanceof Box3) {
    const boundingBox = widthOrSizeOrBoundingBox;
    const boxColor = heightOrColor ?? 0xff0000;
    const size = boundingBox.getSize(new Vector3());
    const center = boundingBox.getCenter(new Vector3());
    return createWireframeBox(size.x, size.y, size.z, boxColor, center);
  }

  if (typeof heightOrColor === 'number' && typeof depthOrPosition === 'number') {
    const width = widthOrSizeOrBoundingBox;
    const height = heightOrColor;
    const depth = depthOrPosition;
    const boxColor = color ?? 0x00ff00;
    const boxPosition = position ?? new Vector3(0, 0, 0);

    const geometry = new BoxGeometry(width, height, depth);
    const edges = new EdgesGeometry(geometry);
    const material = new LineBasicMaterial({ color: boxColor });
    const wireframe = new LineSegments(edges, material);
    wireframe.position.copy(boxPosition);
    return wireframe;
  }

  const size = widthOrSizeOrBoundingBox;
  const boxColor = heightOrColor ?? 0x00ff00;
  const boxPosition = depthOrPosition instanceof Vector3 ? depthOrPosition : new Vector3(0, 0, 0);

  const geometry = new BoxGeometry(size, size, size);
  const edges = new EdgesGeometry(geometry);
  const material = new LineBasicMaterial({ color: boxColor });
  const wireframe = new LineSegments(edges, material);
  wireframe.position.copy(boxPosition);
  return wireframe;
}
