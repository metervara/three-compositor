// Types
export type {
  Pass,
  PassOptions,
  MaterialOptions,
  ParticleOptions,
  RendererInfo,
  RendererOptions,
  PixelGenerator,
} from "./types";

// Core
export { Compositor } from "./core/Compositor";
export { ParticleSystem } from "./core/ParticleSystem";
export type { ParticleSystemOptions } from "./core/ParticleSystem";

// Passes
export { FullscreenPass } from "./core/passes/FullscreenPass";
export { ParticlePass } from "./core/passes/ParticlePass";
export { ScenePass } from "./core/passes/ScenePass";
export { WeightedOITParticlesPass } from "./core/passes/WeightedOITParticlesPass";

// Infrastructure
export { runExperiment } from "./core/experimentRunner";
export type { ExperimentSetup } from "./core/experimentRunner";
export { createRenderer } from "./core/renderer";
export { startLoop } from "./core/loop";
export type { UpdateFn } from "./core/loop";
export { setupInputs, isMousePressed, mouseButton } from "./core/input";
export { setupResize } from "./core/resize";
export { globalUniforms } from "./core/uniforms";

// Utils
export { PingPongBuffer } from "./utils/PingPongBuffer";
export { blit } from "./utils/blit";
export { createDataTexture } from "./utils/texture";
export { computeTextureSize, createInstancedUvBuffer } from "./utils/particle";
export {
  perlin2D,
  perlin3D,
  fbm2D,
  fbm3D,
  ridged2D,
  domainWarp2D,
  seededRandom,
} from "./utils/noise";
export {
  createNoisePositionTexture,
  createSpiralPositionTexture,
  createClusterPositionTexture,
  createWavePositionTexture,
  createScreenSpacePositionTexture,
  createPositionTextureFromArray,
  createNormalTextureFromArray,
} from "./utils/positionTextures";
export type { PositionTextureOptions } from "./utils/positionTextures";
export {
  createFlowVelocityTexture,
  createGradientFlowVelocityTexture,
  createRotationalVelocityTexture,
  createRadialVelocityTexture,
  createTurbulentVelocityTexture,
  createWaveVelocityTexture,
  createConvergentVelocityTexture,
  createMixedVelocityTexture,
} from "./utils/velocityTextures";
export type { VelocityTextureOptions } from "./utils/velocityTextures";
export { createWireframeBox } from "./utils/debug";
export { createArrowGeometry, createParticleArrowGeometry } from "./utils/arrowGeometry";
export { buildNDCToZConst } from "./utils/matrices";

// Mesh
export { createQuad } from "./mesh/quad";

// Shaders
export { shaders } from "./shaders/index";
