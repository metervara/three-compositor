// Core shaders
import passThroughVert from "./core/pass-through.vert";
import textureFrag from "./core/texture.frag";
import uvFrag from "./core/uv.frag";
import commonGlsl from "./core/common.glsl";
import colorGlsl from "./core/color.glsl";
import easingGlsl from "./core/easing.glsl";
import spaceGlsl from "./core/space.glsl";
import bumpCurvesGlsl from "./core/bump-curves.glsl";
import blurHFrag from "./core/blur-h.frag";
import blurVFrag from "./core/blur-v.frag";
import blurBilateralHFrag from "./core/blur-bilateral-h.frag";
import blurBilateralVFrag from "./core/blur-bilateral-v.frag";

// Particle shaders
import billboardVert from "./particles/billboard.vert";
import billboardStretchedVert from "./particles/billboard-stretched.vert";
import billboardStretchedVelocityVert from "./particles/billboard-stretched-velocity.vert";
import billboardLifescaleVert from "./particles/billboard-lifescale.vert";
import particlesCommonGlsl from "./particles/common.glsl";
import particleDebugFrag from "./particles/particle-debug.frag";
import particleFlatColorFrag from "./particles/particle-flat-color.frag";
import particleLifeDiscardFrag from "./particles/particle-life-discard.frag";
import speedDebugFrag from "./particles/speed-debug.frag";

// Noise shaders
import noiseCommonGlsl from "./noise/noise-common.glsl";
import noisePerlinGlsl from "./noise/noise-perlin.glsl";
import noiseSimplexGlsl from "./noise/noise-simplex.glsl";
import noiseWorleyGlsl from "./noise/noise-worley.glsl";
import noiseFbmGlsl from "./noise/noise-fbm.glsl";

// OIT shaders
import oitCompositeFrag from "./oit/composite.frag";

// Capsule shaders
import capsuleVert from "./capsule/capsule.vert";
import capsuleCheckerFrag from "./capsule/capsule-checker.frag";
import capsuleNoise3dFrag from "./capsule/capsule-noise3d.frag";
import capsuleNoise3dFogFrag from "./capsule/capsule-noise3d-fog.frag";

// SDF shaders
import sdfPrimitivesGlsl from "./sdf/sdf-primitives.glsl";
import sdfModifiersGlsl from "./sdf/sdf-modifiers.glsl";

export const shaders = {
  core: {
    passThroughVert,
    textureFrag,
    uvFrag,
    commonGlsl,
    colorGlsl,
    easingGlsl,
    spaceGlsl,
    bumpCurvesGlsl,
    blurHFrag,
    blurVFrag,
    blurBilateralHFrag,
    blurBilateralVFrag,
  },
  particles: {
    billboardVert,
    billboardStretchedVert,
    billboardStretchedVelocityVert,
    billboardLifescaleVert,
    commonGlsl: particlesCommonGlsl,
    particleDebugFrag,
    particleFlatColorFrag,
    particleLifeDiscardFrag,
    speedDebugFrag,
  },
  noise: {
    commonGlsl: noiseCommonGlsl,
    perlinGlsl: noisePerlinGlsl,
    simplexGlsl: noiseSimplexGlsl,
    worleyGlsl: noiseWorleyGlsl,
    fbmGlsl: noiseFbmGlsl,
  },
  oit: {
    compositeFrag: oitCompositeFrag,
  },
  capsule: {
    capsuleVert,
    capsuleCheckerFrag,
    capsuleNoise3dFrag,
    capsuleNoise3dFogFrag,
  },
  sdf: {
    primitivesGlsl: sdfPrimitivesGlsl,
    modifiersGlsl: sdfModifiersGlsl,
  },
} as const;
