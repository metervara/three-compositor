import { Vector2 } from 'three';

export const globalUniforms = {
  uTime:       { value: 0.0 },
  uResolution: { value: new Vector2() },
  uMouse:      { value: new Vector2() },
  uMouseUV:      { value: new Vector2() },
  uMouseNDC:      { value: new Vector2() },
  uMouseDelta:      { value: new Vector2() },
  uMousePrev:      { value: new Vector2() },
  uMouseUVPrev:      { value: new Vector2() },
  uMouseNDCPrev:      { value: new Vector2() },
  uMouseDeltaPrev:      { value: new Vector2() },
  uScroll:     { value: 0.0 },
};
