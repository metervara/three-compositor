export declare const shaders: {
    readonly core: {
        readonly passThroughVert: string;
        readonly textureFrag: string;
        readonly uvFrag: string;
        readonly commonGlsl: string;
        readonly colorGlsl: string;
        readonly easingGlsl: string;
        readonly spaceGlsl: string;
        readonly bumpCurvesGlsl: string;
        readonly blurHFrag: string;
        readonly blurVFrag: string;
        readonly blurBilateralHFrag: string;
        readonly blurBilateralVFrag: string;
    };
    readonly particles: {
        readonly billboardVert: string;
        readonly billboardStretchedVert: string;
        readonly billboardStretchedVelocityVert: string;
        readonly billboardLifescaleVert: string;
        readonly commonGlsl: string;
        readonly particleDebugFrag: string;
        readonly particleFlatColorFrag: string;
        readonly particleLifeDiscardFrag: string;
        readonly speedDebugFrag: string;
    };
    readonly noise: {
        readonly commonGlsl: string;
        readonly perlinGlsl: string;
        readonly simplexGlsl: string;
        readonly worleyGlsl: string;
        readonly fbmGlsl: string;
    };
    readonly oit: {
        readonly compositeFrag: string;
    };
    readonly capsule: {
        readonly capsuleVert: string;
        readonly capsuleCheckerFrag: string;
        readonly capsuleNoise3dFrag: string;
        readonly capsuleNoise3dFogFrag: string;
    };
    readonly sdf: {
        readonly primitivesGlsl: string;
        readonly modifiersGlsl: string;
    };
};
