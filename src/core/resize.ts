import { PerspectiveCamera } from "three";
import { globalUniforms } from "./uniforms";
import type { RendererInfo } from "../types";

export function setupResize(info: RendererInfo, onResizeCallback?: (info: RendererInfo) => void) {
  const { renderer, camera, dpi, scale } = info;

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w * scale, h * scale, false);

    info.canvas.style.width = `${w}px`;
    info.canvas.style.height = `${h}px`;

    if (camera instanceof PerspectiveCamera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    globalUniforms.uResolution.value.set(w * scale * dpi, h * scale * dpi);

    if (onResizeCallback) {
      onResizeCallback(info);
    }
  }

  window.addEventListener("resize", onResize);
  onResize();
}
