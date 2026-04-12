import { globalUniforms } from "./uniforms";
import type { RendererInfo } from "../types";

export type UpdateFn = (time: number) => void;

let _paused = false;

export function setLoopPaused(paused: boolean) {
  _paused = paused;
}

export function startLoop(info: RendererInfo, update: UpdateFn) {
  function animate(t: number) {
    if (!_paused) {
      const seconds = t * 0.001;
      globalUniforms.uTime.value = seconds;
      update(seconds);
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
