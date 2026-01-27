import { globalUniforms } from "./uniforms";
import type { RendererInfo } from "../types";

// Mouse state tracking
export let isMousePressed = false;
export let mouseButton = -1; // -1 = no button, 0 = left, 1 = middle, 2 = right

export function setupInputs(info: RendererInfo): void {

  const { dpi, scale } = info;
  const ratio = dpi * scale;

  // previous mouse position for delta
  let prevX: number | undefined = undefined;
  let prevY: number | undefined = undefined;

  let xCss: number | undefined = undefined;
  let yCss: number | undefined = undefined;

  const updateInputs = () => {
    if(prevX === undefined || prevY === undefined || xCss === undefined || yCss === undefined) {
      requestAnimationFrame(updateInputs);
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 1) drawing-buffer pixel coords (flipped Y for gl_FragCoord)
    const xBuf = xCss * ratio;
    const yBuf = h * ratio - yCss * ratio;

    // 2) normalized UV [0 -> 1]
    const uX = xCss / w;
    const uY = yCss / h;

    // 3) NDC [-1 -> +1]
    const nX = uX * 2 - 1;
    const nY = -(uY * 2 - 1);

    // 4) delta in buffer-pixel space
    const dX = xBuf - prevX;
    const dY = yBuf - prevY;

    prevX = xBuf;
    prevY = yBuf;

    globalUniforms.uMousePrev.value.set(prevX, prevY);
    globalUniforms.uMouseUVPrev.value.set(globalUniforms.uMouseUV.value.x, globalUniforms.uMouseUV.value.y);
    globalUniforms.uMouseNDCPrev.value.set(globalUniforms.uMouseNDC.value.x, globalUniforms.uMouseNDC.value.y);
    globalUniforms.uMouseDeltaPrev.value.set(globalUniforms.uMouseDelta.value.x, globalUniforms.uMouseDelta.value.y);

    globalUniforms.uMouse.value.set(xBuf, yBuf);
    globalUniforms.uMouseUV.value.set(uX, uY);
    globalUniforms.uMouseNDC.value.set(nX, nY);
    globalUniforms.uMouseDelta.value.set(dX, dY);

    requestAnimationFrame(updateInputs);
  }

  window.addEventListener("mousemove", (e) => {
    xCss = e.clientX;
    yCss = e.clientY;

    if(prevX === undefined || prevY === undefined) {
      const h = window.innerHeight;
      prevX = e.clientX * ratio;
      prevY = h * ratio - e.clientY * ratio;

      requestAnimationFrame(updateInputs);
    }
  });

  window.addEventListener("scroll", () => {
    globalUniforms.uScroll.value = window.scrollY;
  });

  // Mouse button state tracking
  window.addEventListener("mousedown", (e) => {
    isMousePressed = true;
    mouseButton = e.button;
  });

  window.addEventListener("mouseup", () => {
    isMousePressed = false;
    mouseButton = -1;
  });

  // Handle mouse leaving the window
  window.addEventListener("mouseleave", () => {
    isMousePressed = false;
    mouseButton = -1;
  });

}
