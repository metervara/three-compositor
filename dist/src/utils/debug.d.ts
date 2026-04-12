import { LineSegments, Vector3, Box3 } from 'three';

export declare function createWireframeBox(size: number, color?: number, position?: Vector3): LineSegments;
export declare function createWireframeBox(width: number, height: number, depth: number, color?: number, position?: Vector3): LineSegments;
export declare function createWireframeBox(boundingBox: Box3, color?: number): LineSegments;
