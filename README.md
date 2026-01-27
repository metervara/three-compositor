# @metervara/three-compositor

A Three.js compositing framework for building GPU shader experiments with multi-pass rendering, particle systems, and ping-pong buffers.

## Install

```bash
npm install github:metervara/three-compositor#v1.0.1
```

## Quick start

An experiment exports `config`, `init`, and `update`. The library handles renderer creation, input tracking, resize, and the animation loop.

```typescript
// index.ts
import * as THREE from "three";
import {
  Compositor, FullscreenPass,
  globalUniforms, shaders,
} from "@metervara/three-compositor";

export const config: RendererOptions = {};

let compositor: Compositor;

export const init = (info: RendererInfo) => {
  compositor = new Compositor(info.renderer);

  const pass = new FullscreenPass({
    materialOptions: {
      vertexShader: shaders.core.passThroughVert,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        varying vec2 vUv;
        void main() {
          vec2 st = gl_FragCoord.xy / uResolution;
          float d = length(st - uMouse / uResolution);
          gl_FragColor = vec4(vec3(smoothstep(0.2, 0.0, d)), 1.0);
        }
      `,
      uniforms: { ...globalUniforms },
    },
  });
  pass.init(info);
  compositor.addPass(pass);
};

export const update = (time: number) => {
  compositor.render();
};
```

```html
<!-- index.html -->
<script type="module">
  import { runExperiment } from "@metervara/three-compositor";
  import * as EXP from "./index.ts";
  runExperiment(EXP);
</script>
```

`runExperiment` calls `createRenderer`, `setupInputs`, `setupResize`, then your `init`, and starts the loop calling your `update` every frame.

### Using a pre-existing canvas

If you have a canvas element already in your HTML, you can pass it to the config:

```html
<!-- index.html -->
<canvas id="my-canvas"></canvas>
<script type="module">
  import { runExperiment } from "@metervara/three-compositor";
  import * as EXP from "./index.ts";
  
  const canvas = document.getElementById('my-canvas');
  runExperiment({
    ...EXP,
    config: {
      ...EXP.config,
      canvas: canvas
    }
  });
</script>
```

When a canvas is provided, the library will use it instead of creating a new one. The canvas must already be in the DOM.

## Global uniforms

`globalUniforms` is a shared uniform object updated automatically by `setupInputs` and `setupResize`. Spread it into any material's uniforms to get these values in your shaders:

| Uniform | Type | Description |
|---|---|---|
| `uTime` | `float` | Elapsed time in seconds (updated by the loop) |
| `uResolution` | `vec2` | Canvas size in drawing-buffer pixels |
| `uMouse` | `vec2` | Mouse position in drawing-buffer pixels (Y-up) |
| `uMouseUV` | `vec2` | Mouse position normalized `[0, 1]` |
| `uMouseNDC` | `vec2` | Mouse position in NDC `[-1, 1]` |
| `uMouseDelta` | `vec2` | Mouse movement delta in buffer pixels |
| `uMousePrev` | `vec2` | Previous frame mouse position |
| `uMouseUVPrev` | `vec2` | Previous frame mouse UV |
| `uMouseNDCPrev` | `vec2` | Previous frame mouse NDC |
| `uMouseDeltaPrev` | `vec2` | Previous frame mouse delta |
| `uScroll` | `float` | `window.scrollY` |

You can also import `isMousePressed` and `mouseButton` for click state.

## Compositor

The `Compositor` manages a chain of render passes and a texture registry so passes can reference each other's output.

```typescript
const compositor = new Compositor(renderer);

// Add named passes
compositor.addPass(computePass, "compute");
compositor.addPass(displayPass, "display");

// Render all passes in order
compositor.render();

// Or render specific passes
compositor.renderPassByName("compute");
compositor.renderRange(0, 1);
```

### Ping-pong buffers

For feedback effects (fluid sim, particle advection, etc.):

```typescript
const pp = compositor.createPingPong("state", width, height);

// In your compute pass, read from pp.read.texture, write to pp.write
const computePass = new FullscreenPass({
  outputTarget: pp.write,
  materialOptions: {
    vertexShader: shaders.core.passThroughVert,
    fragmentShader: mySimFrag,
    uniforms: {
      uState: { value: pp.read.texture },
      ...globalUniforms,
    },
  },
});

// After rendering, swap read/write
compositor.renderPassByName("compute");
compositor.swapPingPong("state");
```

## Passes

### FullscreenPass

Renders a fullscreen quad with a shader material. Used for compute passes, post-processing, and fullscreen effects.

```typescript
const pass = new FullscreenPass({
  materialOptions: {
    vertexShader: shaders.core.passThroughVert,
    fragmentShader: myFrag,
    uniforms: { ...globalUniforms },
  },
  // Optional: render to a target instead of screen
  outputTarget: myRenderTarget,
  // Or auto-create a render target:
  rtSize: { width: 512, height: 512 },
});
pass.init(info);
```

### ParticlePass

Renders GPU particles using instanced geometry. Particle positions are typically driven by a data texture updated in a compute pass.

```typescript
const pass = new ParticlePass({
  particleOptions: { count: 1024, width: TEX_W, height: TEX_H },
  materialOptions: {
    vertexShader: shaders.particles.billboardVert,
    fragmentShader: shaders.particles.particleFlatColorFrag,
    uniforms: {
      uPositions: { value: positionTexture },
      ...globalUniforms,
    },
    transparent: true,
    depthWrite: false,
  },
});
pass.init(info);
```

### ScenePass

Renders a Three.js scene with its own camera. Useful for combining 3D objects with shader passes.

### WeightedOITParticlesPass

Order-independent transparency for particle rendering.

## Renderer options

```typescript
export const config: RendererOptions = {
  canvas: undefined,       // optional: use existing HTMLCanvasElement
  dpi: 1,                  // pixel ratio (default: 1)
  scale: 1,                // resolution scale (default: 1)
  antialias: true,         // WebGL antialias (default: true)
  imageRendering: "auto",  // CSS image-rendering
  cameraType: "orthographic", // "orthographic" | "perspective"
  fov: 50,                 // perspective FOV
  near: 0.1,
  far: 100,
  cameraPosition: new THREE.Vector3(0, 0, 5),
  useOrbit: false,         // enable OrbitControls
};
```

## Shader strings

All built-in GLSL shaders are available as strings via the `shaders` namespace:

```typescript
import { shaders } from "@metervara/three-compositor";

shaders.core.passThroughVert    // standard fullscreen quad vertex shader
shaders.core.textureFrag        // passthrough texture display
shaders.core.uvFrag             // UV debug visualization
shaders.core.blurHFrag          // horizontal gaussian blur
shaders.core.blurVFrag          // vertical gaussian blur
shaders.core.blurBilateralHFrag // horizontal bilateral blur
shaders.core.blurBilateralVFrag // vertical bilateral blur
shaders.core.commonGlsl         // common utilities
shaders.core.easingGlsl         // easing functions
shaders.core.spaceGlsl          // coordinate space helpers
shaders.core.bumpCurvesGlsl     // bump/curve utilities

shaders.particles.billboardVert              // camera-facing billboard
shaders.particles.billboardStretchedVert     // velocity-stretched billboard
shaders.particles.billboardStretchedVelocityVert
shaders.particles.billboardLifescaleVert     // life-based scaling
shaders.particles.commonGlsl                // particle utilities
shaders.particles.particleFlatColorFrag     // flat colored particles
shaders.particles.particleDebugFrag         // debug visualization
shaders.particles.particleLifeDiscardFrag   // life-based discard
shaders.particles.speedDebugFrag            // speed visualization

shaders.noise.*    // perlin, simplex, worley, fbm, common
shaders.oit.*      // OIT composite
shaders.capsule.*  // capsule rendering
shaders.sdf.*      // SDF primitives and modifiers
```

### Using shaders via `#include` in consumer projects

The raw `.glsl` source files are included in the package under `src/shaders/`. If you use `vite-plugin-glsl`, configure the `root` option to resolve `#include` directives from the library:

```typescript
// vite.config.ts
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [
    glsl({ root: '/node_modules/@metervara/three-compositor/src/shaders' }),
  ],
});
```

Then in your `.frag`/`.vert` files:

```glsl
#include "/noise/noise-simplex.glsl"
#include "/core/common.glsl"
```

## Utilities

```typescript
// Texture helpers
createDataTexture(width, height, pixelGenerator)
computeTextureSize(particleCount)  // → { width, height }
PingPongBuffer(width, height)
blit(renderer, source, target)

// Position texture generators
createNoisePositionTexture(w, h, options)
createScreenSpacePositionTexture(w, h)
createPositionTextureFromArray(positions)
// ... spiral, cluster, wave variants

// Velocity texture generators
createFlowVelocityTexture(w, h, options)
// ... gradient, rotational, radial, turbulent, wave, convergent, mixed

// JS noise functions
perlin2D(x, y) / perlin3D(x, y, z)
fbm2D(x, y, opts) / fbm3D(x, y, z, opts)
ridged2D(x, y, opts)
domainWarp2D(x, y, opts)

// Debug
createWireframeBox(size)
createArrowGeometry() / createParticleArrowGeometry()
buildNDCToZConst(camera, z)
```
