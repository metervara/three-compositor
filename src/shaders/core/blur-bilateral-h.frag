/**
 * Horizontal bilateral blur shader.
 * 
 * Performs Gaussian blur weighted by depth similarity to prevent
 * bleeding across depth discontinuities (edges, background).
 * 
 * Expects input texture with depth stored in alpha channel.
 * 
 * Uniforms:
 * - uInput: source texture (RGB = color/normals, A = depth)
 * - uTexelSize: 1/width, 1/height of source
 * - uBlurScale: multiplier for sample offset (1.0 = normal, 2.0 = wider)
 * - uDepthThreshold: depth difference tolerance (smaller = stricter edge preservation)
 */

precision highp float;

varying vec2 vUv;

uniform sampler2D uInput;
uniform vec2 uTexelSize;
uniform float uBlurScale;
uniform float uDepthThreshold;

void main() {
    vec4 centerSample = texture2D(uInput, vUv);
    float centerDepth = centerSample.a;
    
    vec4 colorSum = vec4(0.0);
    float weightSum = 0.0;
    
    vec2 dir = vec2(uTexelSize.x * uBlurScale, 0.0);
    
    // Unrolled 9-tap Gaussian blur with bilateral weighting
    // Weights: 0.05, 0.09, 0.12, 0.15, 0.16, 0.15, 0.12, 0.09, 0.05
    
    vec4 s; float d; float dw; float w;
    float depthThreshSq = uDepthThreshold * uDepthThreshold + 0.0001;
    
    // Tap -4
    s = texture2D(uInput, vUv + dir * -4.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.05 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap -3
    s = texture2D(uInput, vUv + dir * -3.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.09 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap -2
    s = texture2D(uInput, vUv + dir * -2.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.12 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap -1
    s = texture2D(uInput, vUv + dir * -1.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.15 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap 0 (center)
    d = 0.0;  // no depth difference with self
    dw = 1.0;
    w = 0.16 * dw;
    colorSum += centerSample * w; weightSum += w;
    
    // Tap +1
    s = texture2D(uInput, vUv + dir * 1.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.15 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap +2
    s = texture2D(uInput, vUv + dir * 2.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.12 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap +3
    s = texture2D(uInput, vUv + dir * 3.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.09 * dw;
    colorSum += s * w; weightSum += w;
    
    // Tap +4
    s = texture2D(uInput, vUv + dir * 4.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.05 * dw;
    colorSum += s * w; weightSum += w;
    
    // Normalize and output
    gl_FragColor = colorSum / max(weightSum, 0.0001);
}
