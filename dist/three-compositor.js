var ne = Object.defineProperty;
var re = (n, e, t) => e in n ? ne(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var S = (n, e, t) => (re(n, typeof e != "symbol" ? e + "" : e, t), t);
import * as i from "three";
import { Vector2 as G, PerspectiveCamera as oe } from "three";
import { OrbitControls as ie } from "three/examples/jsm/controls/OrbitControls.js";
class ae {
  constructor(e, t, s) {
    S(this, "rtA");
    S(this, "rtB");
    S(this, "flag", !1);
    const r = {
      minFilter: i.LinearFilter,
      magFilter: i.LinearFilter,
      wrapS: i.ClampToEdgeWrapping,
      wrapT: i.ClampToEdgeWrapping,
      format: i.RGBAFormat,
      type: i.FloatType,
      depthBuffer: !1,
      stencilBuffer: !1,
      ...s
    };
    this.rtA = new i.WebGLRenderTarget(e, t, r), this.rtB = new i.WebGLRenderTarget(e, t, r), this.rtA.texture.generateMipmaps = !1, this.rtB.texture.generateMipmaps = !1, this.rtA.texture.anisotropy = 1, this.rtB.texture.anisotropy = 1;
  }
  get read() {
    return this.flag ? this.rtA : this.rtB;
  }
  get write() {
    return this.flag ? this.rtB : this.rtA;
  }
  swap() {
    this.flag = !this.flag;
  }
  dispose() {
    this.rtA.dispose(), this.rtB.dispose();
  }
}
var k = `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`, ce = `precision highp float;

uniform sampler2D srcTexture;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(srcTexture, vUv);
}`;
const le = new i.OrthographicCamera(-1, 1, 1, -1, 0, 1), j = new i.ShaderMaterial({
  uniforms: {
    srcTexture: { value: null }
  },
  vertexShader: k,
  fragmentShader: ce
}), Q = new i.Scene(), ue = new i.PlaneGeometry(2, 2), K = new i.Mesh(
  ue,
  j
);
Q.add(K);
function J(n, e, t, s) {
  const r = s ?? j;
  s && !("srcTexture" in s.uniforms) && console.warn(
    "Blit: provided material does not have a `srcTexture` uniform. If it uses another sampler uniform name, you'll need to set it yourself before calling."
  ), K.material = r, r.uniforms.srcTexture.value = e, n.setRenderTarget(t), n.clear(), n.render(Q, le), n.setRenderTarget(null);
}
class We {
  constructor(e) {
    S(this, "passes", []);
    S(this, "pingPongBuffers", /* @__PURE__ */ new Map());
    S(this, "renderer");
    S(this, "textureRegistry", /* @__PURE__ */ new Map());
    S(this, "passRegistry", /* @__PURE__ */ new Map());
    S(this, "pingPongPassMapping", /* @__PURE__ */ new Map());
    this.renderer = e, window.__compositor = this;
  }
  addPass(e, t) {
    return this.passes.push(e), t && this.passRegistry.set(t, e), e.opts.outputTextureName && e.texture && this.textureRegistry.set(e.opts.outputTextureName, e.texture), this;
  }
  getPass(e) {
    return this.passRegistry.get(e);
  }
  getTexture(e) {
    return this.textureRegistry.get(e);
  }
  registerTexture(e, t) {
    return this.textureRegistry.set(e, t), this;
  }
  createPingPong(e, t, s, r) {
    const o = new ae(t, s, r);
    return this.pingPongBuffers.set(e, o), this.textureRegistry.set(`${e}_read`, o.read.texture), this.textureRegistry.set(`${e}_write`, o.write.texture), o;
  }
  getPingPong(e) {
    return this.pingPongBuffers.get(e);
  }
  swapPingPong(e) {
    const t = this.pingPongBuffers.get(e);
    return t && (t.swap(), this.textureRegistry.set(`${e}_read`, t.read.texture), this.textureRegistry.set(`${e}_write`, t.write.texture)), this;
  }
  swapAllPingPong() {
    for (const [e, t] of this.pingPongBuffers)
      t.swap(), this.textureRegistry.set(`${e}_read`, t.read.texture), this.textureRegistry.set(`${e}_write`, t.write.texture);
    return this;
  }
  renderPass(e) {
    if (e >= 0 && e < this.passes.length) {
      const t = this.passes[e];
      this.resolveDependencies(t), t.render(this.renderer);
    }
    return this;
  }
  renderPassByName(e) {
    const t = this.getPass(e);
    return t && (this.resolveDependencies(t), t.render(this.renderer)), this;
  }
  renderRange(e, t) {
    const s = this.passes.slice(e, t);
    for (const r of s)
      this.resolveDependencies(r), r.render(this.renderer);
    return this;
  }
  render() {
    for (const e of this.passes)
      this.resolveDependencies(e), e.render(this.renderer);
    return this;
  }
  renderToScreen(e) {
    const t = new i.Vector2();
    this.renderer.getSize(t), e && this.renderer.setViewport(e.x, e.y, e.width, e.height);
    const s = this.passes[this.passes.length - 1];
    return s && (this.resolveDependencies(s), s.render(this.renderer)), this.renderer.setViewport(0, 0, t.x, t.y), this;
  }
  blit(e, t) {
    return J(this.renderer, e, t), this;
  }
  execute(e) {
    return e(this.renderer), this;
  }
  clear() {
    return this.passes = [], this.textureRegistry.clear(), this.passRegistry.clear(), this;
  }
  removePass(e) {
    const t = this.passes.findIndex((s) => this.passRegistry.get(e) === s);
    return t !== -1 && (this.passes.splice(t, 1), this.passRegistry.delete(e)), this;
  }
  getPassCount() {
    return this.passes.length;
  }
  getDescription() {
    var s, r, o, c;
    const e = [];
    let t = 0;
    if (e.push(`Compositor with ${this.passes.length} pass${this.passes.length !== 1 ? "es" : ""}:`), this.passes.forEach((a, l) => {
      const u = this.getPassNameByIndex(l), p = this.getPassType(a), m = this.getPassDetails(a), w = this.estimateQuadFragments(a);
      w > 0 && (t += w), e.push(`  ${l + 1}. ${u} (${p})${m ? ` - ${m}` : ""}`);
    }), t > 0) {
      e.push("");
      const a = Math.max(1, Math.round(Math.sqrt(t)));
      e.push(`Estimated fragments (quad passes): ${t} (~${a}x${a})`);
    }
    if (this.pingPongBuffers.size > 0) {
      e.push(""), e.push("Ping-pong buffers:");
      for (const [a, l] of this.pingPongBuffers)
        e.push(`  - ${a} (${l.read.width}x${l.read.height})`);
    }
    if (this.textureRegistry.size > 0) {
      e.push(""), e.push("Registered textures:");
      for (const [a, l] of this.textureRegistry) {
        const u = `${((s = l.image) == null ? void 0 : s.width) || ((r = l.image) == null ? void 0 : r.videoWidth) || "?"}x${((o = l.image) == null ? void 0 : o.height) || ((c = l.image) == null ? void 0 : c.videoHeight) || "?"}`;
        e.push(`  - ${a} (${u})`);
      }
    }
    return e.join(`
`);
  }
  getPassNameByIndex(e) {
    for (const [t, s] of this.passRegistry)
      if (this.passes[e] === s)
        return t;
    return `Pass ${e + 1}`;
  }
  getPassType(e) {
    return e.constructor.name === "FullscreenPass" ? "Quad" : e.constructor.name === "ParticlePass" ? "Particle" : e.constructor.name === "WeightedOITParticlesPass" ? "WeightedOIT" : e.constructor.name;
  }
  getPassDetails(e) {
    const t = [];
    let s = null;
    const r = this.getPassNameByIndex(this.passes.indexOf(e));
    if (this.pingPongPassMapping.has(r))
      s = this.pingPongPassMapping.get(r);
    else
      for (const [o, c] of this.pingPongBuffers)
        if (e.outputTarget === c.write || e.outputTarget === c.read) {
          s = o;
          break;
        }
    if (s) {
      const o = this.pingPongBuffers.get(s);
      o && t.push(`ping-pong (${o.read.width}x${o.read.height}, ${s})`);
    } else if (e.opts.rtSize)
      t.push(`render-target (${e.opts.rtSize.width}x${e.opts.rtSize.height})`);
    else if (e.opts.outputTarget)
      t.push("custom render-target");
    else {
      const o = new i.Vector2();
      this.renderer.getSize(o), t.push(`screen (${o.x}x${o.y})`);
    }
    if (e.opts.viewport && t.push(`viewport (${e.opts.viewport.width}x${e.opts.viewport.height})`), e.opts.inputTextures && Object.keys(e.opts.inputTextures).length > 0) {
      const o = Object.values(e.opts.inputTextures).join(", ");
      t.push(`inputs: ${o}`);
    }
    return e.opts.outputTextureName && t.push(`output: ${e.opts.outputTextureName}`), e.opts.particleOptions && t.push(`${e.opts.particleOptions.count} particles`), t.join(", ");
  }
  updatePingPongPass(e, t, s, r) {
    const o = this.getPass(e), c = this.getPingPong(t);
    return o && c && (o.setUniform(s, c.read.texture), r && (o.outputTarget = r), this.pingPongPassMapping.set(e, t)), this;
  }
  resolveDependencies(e) {
    if (e.opts.inputTextures)
      for (const [t, s] of Object.entries(e.opts.inputTextures)) {
        const r = this.textureRegistry.get(s);
        r && e.setUniform(t, r);
      }
  }
  estimateQuadFragments(e) {
    let t = 0, s = 0;
    const r = e;
    if (e.constructor.name === "FullscreenPass")
      if (r.outputTarget)
        e.opts.rtSize ? (t = e.opts.rtSize.width, s = e.opts.rtSize.height) : r.outputTarget.width && r.outputTarget.height && (t = r.outputTarget.width, s = r.outputTarget.height);
      else if (e.opts.viewport)
        t = e.opts.viewport.width, s = e.opts.viewport.height;
      else {
        const a = new i.Vector2();
        this.renderer.getSize(a), t = a.x, s = a.y;
      }
    else if (e.constructor.name === "ParticlePass" && r.outRT === null)
      if (e.opts.viewport)
        t = e.opts.viewport.width, s = e.opts.viewport.height;
      else {
        const a = new i.Vector2();
        this.renderer.getSize(a), t = a.x, s = a.y;
      }
    const o = Math.max(0, Math.floor(t)), c = Math.max(0, Math.floor(s));
    return o * c;
  }
  resize(e, t) {
    for (const s of this.passes)
      s.resize && s.resize(e, t);
  }
  resizePass(e, t, s) {
    const r = this.getPass(e);
    r && r.resize && r.resize(t, s);
  }
}
function ee(n, e = !1) {
  if (!Number.isInteger(n) || n <= 0)
    throw new Error("computeTextureSize: count must be a positive integer");
  function t(a) {
    return Math.pow(2, Math.ceil(Math.log2(a)));
  }
  if (!e) {
    const a = Math.ceil(Math.sqrt(n)), l = Math.ceil(n / a);
    return { width: a, height: l };
  }
  const s = Math.ceil(Math.sqrt(n)), r = t(s), o = Math.ceil(n / r), c = t(o);
  return { width: r, height: c };
}
function te(n, e, t) {
  if (!Number.isInteger(n) || n <= 0)
    throw new Error("createInstancedUvBuffer: count must be a positive integer");
  if (!Number.isInteger(e) || e <= 0)
    throw new Error("createInstancedUvBuffer: width must be a positive integer");
  if (!Number.isInteger(t) || t <= 0)
    throw new Error("createInstancedUvBuffer: height must be a positive integer");
  if (e * t < n)
    throw new Error(
      `createInstancedUvBuffer: texture too small (${e}x${t} = ${e * t} < count=${n})`
    );
  const s = new Float32Array(n * 2);
  for (let r = 0; r < n; r++) {
    const o = r % e + 0.5, c = Math.floor(r / e) + 0.5;
    s[2 * r + 0] = o / e, s[2 * r + 1] = c / t;
  }
  return s;
}
class pe {
  constructor(e) {
    S(this, "mesh");
    S(this, "material");
    S(this, "geometry");
    const { count: t, width: s, height: r, geometry: o, materialOptions: c } = e;
    if (!c)
      throw new Error("ParticleSystem: missing materialOptions");
    const a = o || new i.PlaneGeometry(1, 1);
    this.geometry = new i.InstancedBufferGeometry(), this.geometry.index = a.index, this.geometry.attributes = a.attributes;
    const l = te(t, s, r);
    this.geometry.setAttribute(
      "instUv",
      new i.InstancedBufferAttribute(l, 2)
    );
    const u = { ...c.defines || {} }, p = !!c.transparent, m = c.depthWrite === void 0 ? !1 : c.depthWrite, w = c.depthTest === void 0 ? !0 : c.depthTest;
    !p && m && w && (u.ENABLE_ALPHA_TEST = 1), this.material = new i.ShaderMaterial({
      ...c,
      defines: u
    }), this.mesh = new i.Mesh(this.geometry, this.material), this.mesh.frustumCulled = !1;
  }
  setUniform(e, t) {
    this.material.uniforms[e] ? this.material.uniforms[e].value = t : this.material.uniforms[e] = { value: t };
  }
  getUniform(e) {
    var t;
    return (t = this.material.uniforms[e]) == null ? void 0 : t.value;
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
const X = {
  uTime: { value: 0 },
  uResolution: { value: new G() },
  uMouse: { value: new G() },
  uMouseUV: { value: new G() },
  uMouseNDC: { value: new G() },
  uMouseDelta: { value: new G() },
  uMousePrev: { value: new G() },
  uMouseUVPrev: { value: new G() },
  uMouseNDCPrev: { value: new G() },
  uMouseDeltaPrev: { value: new G() },
  uScroll: { value: 0 }
};
function he(n, e = 2, t = 2) {
  const s = {
    ...X,
    ...n.uniforms || {}
  }, r = new i.PlaneGeometry(e, t), o = new i.ShaderMaterial({
    vertexShader: n.vertexShader,
    fragmentShader: n.fragmentShader,
    uniforms: s
  });
  return new i.Mesh(r, o);
}
class Ve {
  constructor(e) {
    S(this, "scene");
    S(this, "camera");
    S(this, "outputTarget", null);
    S(this, "material");
    S(this, "opts");
    this.opts = e;
  }
  init(e) {
    const { renderer: t } = e, {
      outputTarget: s,
      rtSize: r,
      clearColor: o = !0,
      clearDepth: c = !1,
      clearStencil: a = !1,
      materialOptions: l,
      seedTexture: u
    } = this.opts;
    if (!l)
      throw new Error("FullscreenPass: missing materialOptions");
    if (s)
      this.outputTarget = s;
    else if (r) {
      const { width: m, height: w } = r;
      this.outputTarget = new i.WebGLRenderTarget(m, w, {
        minFilter: i.LinearFilter,
        magFilter: i.LinearFilter,
        wrapS: i.ClampToEdgeWrapping,
        wrapT: i.ClampToEdgeWrapping,
        format: i.RGBAFormat,
        type: i.FloatType,
        depthBuffer: !1,
        stencilBuffer: !1
      });
    } else
      this.outputTarget = null;
    this.camera = new i.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new i.Scene();
    const p = he(l);
    this.material = p.material, this.material && this.material.blending !== i.NoBlending && (this.material.blending = i.NoBlending, this.material.transparent = !1, this.material.depthWrite = !1, this.material.depthTest = !1), p.frustumCulled = !1, this.scene.add(p), this.opts.clearColor = o, this.opts.clearDepth = c, this.opts.clearStencil = a, u && this.outputTarget && J(
      t,
      u,
      this.outputTarget
    );
  }
  update(e) {
  }
  render(e) {
    const {
      clearColor: t = !0,
      clearDepth: s = !1,
      clearStencil: r = !1,
      clearColorValue: o,
      clearAlpha: c,
      viewport: a
    } = this.opts;
    e.setRenderTarget(this.outputTarget);
    let l = null;
    a && !this.outputTarget && (l = new i.Vector4(), e.getViewport(l), e.setViewport(a.x, a.y, a.width, a.height));
    let u = null, p = null;
    if (t && (o !== void 0 || c !== void 0))
      if (u = new i.Color(), e.getClearColor(u), p = e.getClearAlpha ? e.getClearAlpha() : 1, o !== void 0) {
        const m = o instanceof i.Color ? o : new i.Color(o);
        e.setClearColor(m, c !== void 0 ? c : p ?? 1);
      } else
        c !== void 0 && u && e.setClearColor(u, c);
    (t || s || r) && e.clear(t, s, r), e.render(this.scene, this.camera), e.setRenderTarget(null), l && e.setViewport(l.x, l.y, l.z, l.w), u && e.setClearColor(u, p ?? 1);
  }
  get texture() {
    return this.outputTarget ? this.outputTarget.texture : null;
  }
  setUniform(e, t) {
    if (!this.material)
      throw new Error("FullscreenPass: must call init() first");
    this.material.uniforms[e] ? this.material.uniforms[e].value = t : this.material.uniforms[e] = { value: t };
  }
  resize(e, t) {
    this.outputTarget && this.opts.rtSize && (this.outputTarget.dispose(), this.outputTarget = new i.WebGLRenderTarget(e, t, {
      minFilter: i.LinearFilter,
      magFilter: i.LinearFilter,
      wrapS: i.ClampToEdgeWrapping,
      wrapT: i.ClampToEdgeWrapping,
      format: i.RGBAFormat,
      type: i.FloatType,
      depthBuffer: !1,
      stencilBuffer: !1
    }), this.opts.rtSize.width = e, this.opts.rtSize.height = t);
  }
}
class Ye {
  constructor(e) {
    S(this, "scene");
    S(this, "camera");
    S(this, "outRT");
    S(this, "particleSystem");
    S(this, "opts");
    this.opts = e;
  }
  init(e) {
    const {
      outputTarget: t,
      rtSize: s,
      clearColor: r = !0,
      clearDepth: o = !1,
      clearStencil: c = !1,
      materialOptions: a,
      particleOptions: l,
      particleSystem: u
    } = this.opts;
    if (this.scene = new i.Scene(), this.camera = e.camera, u)
      this.particleSystem = u;
    else {
      if (!l)
        throw new Error("ParticlePass: missing particleOptions (or provide a particleSystem)");
      if (!a)
        throw new Error("ParticlePass: missing materialOptions (or provide a particleSystem)");
      this.particleSystem = new pe({
        count: l.count,
        width: l.width,
        height: l.height,
        geometry: l.geometry,
        materialOptions: a
      });
    }
    if (this.scene.add(this.particleSystem.mesh), t)
      this.outRT = t;
    else if (s) {
      const { width: p, height: m } = s;
      this.outRT = new i.WebGLRenderTarget(p, m, {
        minFilter: i.LinearFilter,
        magFilter: i.LinearFilter,
        wrapS: i.ClampToEdgeWrapping,
        wrapT: i.ClampToEdgeWrapping,
        format: i.RGBAFormat,
        type: i.UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !1,
        stencilBuffer: !1
      });
    } else
      this.outRT = null;
    this.opts.clearColor = r, this.opts.clearDepth = o, this.opts.clearStencil = c;
  }
  update(e) {
  }
  render(e) {
    const {
      clearColor: t = !0,
      clearDepth: s = !1,
      clearStencil: r = !1,
      clearColorValue: o,
      clearAlpha: c
    } = this.opts;
    e.setRenderTarget(this.outRT);
    let a = null, l = null;
    if (t && (o !== void 0 || c !== void 0))
      if (a = new i.Color(), e.getClearColor(a), l = e.getClearAlpha ? e.getClearAlpha() : 1, o !== void 0) {
        const u = o instanceof i.Color ? o : new i.Color(o);
        e.setClearColor(u, c !== void 0 ? c : l ?? 1);
      } else
        c !== void 0 && a && e.setClearColor(a, c);
    (t || s || r) && e.clear(t, s, r), e.render(this.scene, this.camera), a && e.setClearColor(a, l ?? 1), e.setRenderTarget(null);
  }
  get texture() {
    return this.outRT ? this.outRT.texture : null;
  }
  get outputTarget() {
    return this.outRT;
  }
  set outputTarget(e) {
    this.outRT = e;
  }
  setUniform(e, t) {
    this.particleSystem.setUniform(e, t);
  }
  resize(e, t) {
    this.outRT && this.opts.rtSize && (this.outRT.dispose(), this.outRT = new i.WebGLRenderTarget(e, t, {
      minFilter: i.LinearFilter,
      magFilter: i.LinearFilter,
      wrapS: i.ClampToEdgeWrapping,
      wrapT: i.ClampToEdgeWrapping,
      format: i.RGBAFormat,
      type: i.UnsignedByteType,
      depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !1,
      stencilBuffer: !1
    }), this.opts.rtSize.width = e, this.opts.rtSize.height = t);
  }
}
class Xe {
  constructor(e) {
    S(this, "scene");
    S(this, "camera");
    S(this, "_outputTarget", null);
    S(this, "opts");
    this.opts = e;
  }
  init(e) {
    const {
      outputTarget: t,
      rtSize: s,
      clearColor: r = !0,
      clearDepth: o = !0,
      clearStencil: c = !1
    } = this.opts;
    if (this.scene = this.opts.scene || e.scene, this.camera = this.opts.camera || e.camera, t)
      this._outputTarget = t;
    else if (s) {
      const { width: a, height: l } = s;
      this._outputTarget = new i.WebGLRenderTarget(a, l, {
        minFilter: i.LinearFilter,
        magFilter: i.LinearFilter,
        wrapS: i.ClampToEdgeWrapping,
        wrapT: i.ClampToEdgeWrapping,
        format: i.RGBAFormat,
        type: i.UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !0,
        stencilBuffer: !1
      });
    } else
      this._outputTarget = null;
    this.opts.clearColor = r, this.opts.clearDepth = o, this.opts.clearStencil = c;
  }
  update(e) {
  }
  render(e) {
    const { clearColor: t = !0, clearDepth: s = !0, clearStencil: r = !1, viewport: o } = this.opts;
    e.setRenderTarget(this._outputTarget);
    let c = null;
    o && !this._outputTarget && (c = new i.Vector4(), e.getViewport(c), e.setViewport(o.x, o.y, o.width, o.height)), (t || s || r) && e.clear(t, s, r), e.render(this.scene, this.camera), e.setRenderTarget(null), c && e.setViewport(c.x, c.y, c.z, c.w);
  }
  get texture() {
    return this._outputTarget ? this._outputTarget.texture : null;
  }
  resize(e, t) {
    this._outputTarget && this.opts.rtSize && (this._outputTarget.dispose(), this._outputTarget = new i.WebGLRenderTarget(e, t, {
      minFilter: i.LinearFilter,
      magFilter: i.LinearFilter,
      wrapS: i.ClampToEdgeWrapping,
      wrapT: i.ClampToEdgeWrapping,
      format: i.RGBAFormat,
      type: i.UnsignedByteType,
      depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !0,
      stencilBuffer: !1
    }), this.opts.rtSize.width = e, this.opts.rtSize.height = t);
  }
}
var fe = `precision highp float;

uniform sampler2D tAccum;
uniform sampler2D tReveal;
varying vec2 vUv;

void main() {
  vec4 accum = texture2D(tAccum, vUv);
  vec4 reveal = texture2D(tReveal, vUv);

  float oneMinusAlpha = clamp(reveal.r, 0.0, 1.0);
  float alpha = 1.0 - oneMinusAlpha;
  vec3 color = accum.rgb / max(accum.a, 1e-6);
  
  gl_FragColor = vec4(color, alpha);
}`;
class ze {
  constructor(e) {
    S(this, "particleScene");
    S(this, "camera");
    S(this, "accumRT");
    S(this, "revealRT");
    S(this, "particleMesh");
    S(this, "accumMaterial");
    S(this, "revealMaterial");
    S(this, "compositeScene");
    S(this, "compositeCamera");
    S(this, "compositeMesh");
    S(this, "opts");
    this.opts = e;
  }
  init(e) {
    const {
      materialOptions: t,
      particleOptions: s,
      rtSize: r
    } = this.opts;
    if (!t)
      throw new Error("WeightedOITParticlesPass: missing materialOptions");
    if (!s)
      throw new Error("WeightedOITParticlesPass: missing particleOptions");
    this.camera = e.camera, this.particleScene = new i.Scene();
    const o = s.geometry || new i.PlaneGeometry(1, 1), c = new i.InstancedBufferGeometry();
    c.index = o.index, c.attributes = o.attributes;
    const a = te(s.count, s.width, s.height);
    c.setAttribute("instUv", new i.InstancedBufferAttribute(a, 2)), this.accumMaterial = new i.ShaderMaterial({
      ...t,
      transparent: !0,
      depthWrite: !1,
      blending: i.CustomBlending,
      blendEquation: i.AddEquation,
      blendSrc: i.OneFactor,
      blendDst: i.OneFactor,
      blendEquationAlpha: i.AddEquation,
      blendSrcAlpha: i.OneFactor,
      blendDstAlpha: i.OneFactor
    }), this.revealMaterial = new i.ShaderMaterial({
      ...t,
      defines: { ...t.defines || {}, REVEAL_PASS: 1 },
      transparent: !0,
      depthWrite: !1,
      blending: i.CustomBlending,
      blendEquation: i.AddEquation,
      blendSrc: i.ZeroFactor,
      blendDst: i.OneMinusSrcAlphaFactor,
      blendEquationAlpha: i.AddEquation,
      blendSrcAlpha: i.ZeroFactor,
      blendDstAlpha: i.OneMinusSrcAlphaFactor
    }), this.particleMesh = new i.Mesh(c, this.accumMaterial), this.particleMesh.frustumCulled = !1, this.particleScene.add(this.particleMesh);
    const l = r || (() => {
      const w = new i.Vector2();
      return e.renderer.getSize(w), { width: w.x, height: w.y };
    })(), u = {
      minFilter: i.LinearFilter,
      magFilter: i.LinearFilter,
      wrapS: i.ClampToEdgeWrapping,
      wrapT: i.ClampToEdgeWrapping,
      format: i.RGBAFormat,
      type: i.HalfFloatType,
      depthBuffer: !1,
      stencilBuffer: !1
    };
    this.accumRT = new i.WebGLRenderTarget(l.width, l.height, u), this.revealRT = new i.WebGLRenderTarget(l.width, l.height, u), this.compositeCamera = new i.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.compositeScene = new i.Scene();
    const p = new i.PlaneGeometry(2, 2), m = new i.ShaderMaterial({
      vertexShader: k,
      fragmentShader: fe,
      uniforms: {
        tAccum: { value: this.accumRT.texture },
        tReveal: { value: this.revealRT.texture }
      },
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    });
    this.compositeMesh = new i.Mesh(p, m), this.compositeMesh.frustumCulled = !1, this.compositeScene.add(this.compositeMesh);
  }
  update(e) {
  }
  setUniform(e, t) {
    this.accumMaterial.uniforms[e] ? this.accumMaterial.uniforms[e].value = t : this.accumMaterial.uniforms[e] = { value: t }, this.revealMaterial.uniforms[e] ? this.revealMaterial.uniforms[e].value = t : this.revealMaterial.uniforms[e] = { value: t };
  }
  render(e) {
    const t = e.getClearColor(new i.Color()).clone(), s = e.getClearAlpha();
    e.setRenderTarget(null), e.render(this.particleScene.parent || this.particleScene, this.camera), e.setRenderTarget(this.accumRT), e.setClearColor(0, 0), e.clear(!0, !0, !1), this.particleMesh.material = this.accumMaterial, e.render(this.particleScene, this.camera), e.setRenderTarget(this.revealRT), e.setClearColor(16777215, 1), e.clear(!0, !0, !1), this.particleMesh.material = this.revealMaterial, e.render(this.particleScene, this.camera), e.setClearColor(t, s), e.setRenderTarget(null), e.render(this.compositeScene, this.compositeCamera);
  }
  get texture() {
    return null;
  }
}
const de = {
  dpi: 1,
  scale: 1,
  antialias: !0,
  imageRendering: "auto",
  cameraType: "orthographic",
  fov: 50,
  near: 0.1,
  far: 100,
  cameraPosition: new i.Vector3(0, 0, 5),
  useOrbit: !1
};
function ge(n = {}) {
  const e = { ...de, ...n }, t = document.createElement("canvas");
  t.style.imageRendering = e.imageRendering, document.body.appendChild(t);
  const s = new i.WebGLRenderer({
    canvas: t,
    antialias: e.antialias
  });
  s.setPixelRatio(e.dpi), s.autoClear = !1;
  let r;
  const o = window.innerWidth / window.innerHeight;
  if (e.cameraType === "perspective") {
    const a = new i.PerspectiveCamera(e.fov, o, e.near, e.far);
    a.position.set(e.cameraPosition.x, e.cameraPosition.y, e.cameraPosition.z), a.lookAt(0, 0, 0), r = a;
  } else {
    const a = -o, l = o, u = 1, p = -1;
    r = new i.OrthographicCamera(a, l, u, p, e.near, e.far);
  }
  e.useOrbit && new ie(r, s.domElement).update();
  const c = new i.Scene();
  return { renderer: s, scene: c, camera: r, canvas: t, dpi: e.dpi, scale: e.scale };
}
let q = !1, N = -1;
function me(n) {
  const { dpi: e, scale: t } = n, s = e * t;
  let r, o, c, a;
  const l = () => {
    if (r === void 0 || o === void 0 || c === void 0 || a === void 0) {
      requestAnimationFrame(l);
      return;
    }
    const u = window.innerWidth, p = window.innerHeight, m = c * s, w = p * s - a * s, M = c / u, d = a / p, g = M * 2 - 1, y = -(d * 2 - 1), x = m - r, h = w - o;
    r = m, o = w, X.uMousePrev.value.set(r, o), X.uMouseUVPrev.value.set(X.uMouseUV.value.x, X.uMouseUV.value.y), X.uMouseNDCPrev.value.set(X.uMouseNDC.value.x, X.uMouseNDC.value.y), X.uMouseDeltaPrev.value.set(X.uMouseDelta.value.x, X.uMouseDelta.value.y), X.uMouse.value.set(m, w), X.uMouseUV.value.set(M, d), X.uMouseNDC.value.set(g, y), X.uMouseDelta.value.set(x, h), requestAnimationFrame(l);
  };
  window.addEventListener("mousemove", (u) => {
    if (c = u.clientX, a = u.clientY, r === void 0 || o === void 0) {
      const p = window.innerHeight;
      r = u.clientX * s, o = p * s - u.clientY * s, requestAnimationFrame(l);
    }
  }), window.addEventListener("scroll", () => {
    X.uScroll.value = window.scrollY;
  }), window.addEventListener("mousedown", (u) => {
    q = !0, N = u.button;
  }), window.addEventListener("mouseup", () => {
    q = !1, N = -1;
  }), window.addEventListener("mouseleave", () => {
    q = !1, N = -1;
  });
}
function we(n, e) {
  const { renderer: t, camera: s, dpi: r, scale: o } = n;
  function c() {
    const a = window.innerWidth, l = window.innerHeight;
    t.setSize(a * o, l * o, !1), n.canvas.style.width = `${a}px`, n.canvas.style.height = `${l}px`, s instanceof oe && (s.aspect = a / l, s.updateProjectionMatrix()), X.uResolution.value.set(a * o * r, l * o * r), e && e(n);
  }
  window.addEventListener("resize", c), c();
}
function ve(n, e) {
  function t(s) {
    const r = s * 1e-3;
    X.uTime.value = r, e(r), requestAnimationFrame(t);
  }
  requestAnimationFrame(t);
}
function Ie(n) {
  const e = ge(n.config), t = n.setupInputs ?? !0, s = n.setupResize ?? !0;
  t && me(e), s && we(e, n.onResize), n.init(e), ye(), Te(), Se(n.onToggleInfo), ve(e, n.update);
}
function ye() {
  setTimeout(() => {
    const n = window.__compositor;
    if (n && typeof n.getDescription == "function") {
      const e = n.getDescription();
      Ce(e);
    }
  }, 0);
}
function xe() {
  let n = document.getElementById("info-overlay");
  return n || (n = document.createElement("div"), n.id = "info-overlay", n.className = "info-overlay", document.body.appendChild(n)), n.style.display = "none", n;
}
function Te() {
  document.removeEventListener("keydown", Z), document.addEventListener("keydown", Z);
}
function Z(n) {
  (n.key === "i" || n.key === "I") && Me();
}
function Me() {
  const n = document.getElementById("info-overlay");
  if (n) {
    const s = getComputedStyle(n).display === "none";
    n.style.display = s ? "block" : "none", typeof H() == "function" && H()(s);
  }
}
let se;
function Se(n) {
  se = n;
}
function H() {
  return se;
}
function Ce(n) {
  let e = document.getElementById("compositor-description");
  e ? e.innerHTML = "" : (e = document.createElement("div"), e.id = "compositor-description", e.className = "compositor-description", xe().appendChild(e));
  const t = n.split(`
`);
  t.forEach((s, r) => {
    if (s.trim()) {
      const o = document.createElement("span");
      o.textContent = s, s.includes(":") && !s.startsWith("  ") && !s.startsWith("	") && o.classList.add("title"), e.appendChild(o);
    }
    r < t.length - 1 && e.appendChild(document.createElement("br"));
  });
}
function L(n, e, t, s) {
  const r = n * e * 4, o = new Float32Array(r);
  let c = 0;
  for (let l = 0; l < e; l++)
    for (let u = 0; u < n; u++) {
      const [p, m, w, M] = t(u, l, n, e);
      o[c++] = p, o[c++] = m, o[c++] = w, o[c++] = M;
    }
  const a = new i.DataTexture(
    o,
    n,
    e,
    i.RGBAFormat,
    i.FloatType
  );
  return a.minFilter = (s == null ? void 0 : s.minFilter) ?? i.NearestFilter, a.magFilter = (s == null ? void 0 : s.magFilter) ?? i.NearestFilter, a.wrapS = (s == null ? void 0 : s.wrapS) ?? i.RepeatWrapping, a.wrapT = (s == null ? void 0 : s.wrapT) ?? i.RepeatWrapping, a.needsUpdate = !0, a;
}
function Pe(n) {
  return n - Math.floor(n * (1 / 289)) * 289;
}
function V(n) {
  return Pe((n * 34 + 1) * n);
}
function U(n) {
  return n * n * n * (n * (n * 6 - 15) + 10);
}
function O(n, e, t, s) {
  const r = n & 15, o = r < 8 ? e : t, c = r < 4 ? t : r === 12 || r === 14 ? e : s ?? 0;
  return (r & 1 ? -o : o) + (r & 2 ? -c : c);
}
function b(n, e) {
  const t = Math.floor(n), s = Math.floor(e);
  n = n - t, e = e - s;
  const r = U(n), o = U(e), c = O(V(V(t) + s), n, e), a = O(V(V(t) + s + 1), n, e - 1), l = O(V(V(t + 1) + s), n - 1, e), u = O(V(V(t + 1) + s + 1), n - 1, e - 1), p = c + r * (l - c), m = a + r * (u - a);
  return 2.3 * (p + o * (m - p));
}
function Re(n, e, t) {
  const s = Math.floor(n), r = Math.floor(e), o = Math.floor(t);
  n = n - s, e = e - r, t = t - o;
  const c = U(n), a = U(e), l = U(t), u = V(s) + r, p = V(u) + o, m = V(u + 1) + o, w = V(s + 1) + r, M = V(w) + o, d = V(w + 1) + o, g = O(V(p), n, e, t), y = O(V(m), n, e, t - 1), x = O(V(p + 1), n, e - 1, t), h = O(V(m + 1), n, e - 1, t - 1), f = O(V(M), n - 1, e, t), v = O(V(d), n - 1, e, t - 1), P = O(V(M + 1), n - 1, e - 1, t), F = O(V(d + 1), n - 1, e - 1, t - 1), B = g + c * (f - g), T = y + c * (v - y), D = x + c * (P - x), C = h + c * (F - h), R = B + a * (D - B), z = T + a * (C - T);
  return 2.3 * (R + l * (z - R));
}
function I(n, e, t = 6, s = 2, r = 0.5) {
  let o = 0, c = 0.5, a = 1;
  for (let l = 0; l < t; l++)
    o += c * b(n * a, e * a), a *= s, c *= r;
  return o;
}
function Le(n, e, t, s = 6, r = 2, o = 0.5) {
  let c = 0, a = 0.5, l = 1;
  for (let u = 0; u < s; u++)
    c += a * Re(n * l, e * l, t * l), l *= r, a *= o;
  return c;
}
function Oe(n, e, t = 6, s = 2, r = 0.5, o = 1) {
  let c = 0, a = 0.5, l = 1;
  for (let u = 0; u < t; u++) {
    let p = b(n * l, e * l);
    p = o - Math.abs(p), p *= p, c += p * a, l *= s, a *= r;
  }
  return c * 1.25;
}
function be(n, e, t = 0.1) {
  const s = b(n, e) * t, r = b(n + 100, e + 100) * t;
  return {
    x: n + s,
    y: e + r
  };
}
function $(n) {
  let e = n;
  return () => (e = (e * 1664525 + 1013904223) % 4294967296, e / 4294967296);
}
function Ge(n, e, t = {}) {
  const {
    bounds: s = 2,
    is2D: r = !1,
    noiseScale: o = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 }
  } = t, l = $(c);
  return L(n, e, (u, p, m, w) => {
    const M = u / m, d = p / w, g = l() * 0.1, y = (M + g) * o + a.x, x = (d + g) * o + a.y, f = I(y, x, 4, 2, 0.5) * s, v = I(y + 100, x + 100, 4, 2, 0.5) * s;
    if (r)
      return [f, v, 0, 1];
    {
      const P = I(y + 200, x + 200, 4, 2, 0.5) * s;
      return [f, v, P, 1];
    }
  });
}
function $e(n, e, t = {}) {
  const {
    bounds: s = 2,
    is2D: r = !1,
    noiseScale: o = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 }
  } = t, l = $(c);
  return L(n, e, (u, p, m, w) => {
    const M = u / m, d = p / w, g = M * Math.PI * 4, y = d * s, x = (M + l() * 0.1) * o + a.x, h = (d + l() * 0.1) * o + a.y, f = b(x, h) * 0.3, v = (y + f) * Math.cos(g), P = (y + f) * Math.sin(g);
    if (r)
      return [v, P, 0, 1];
    {
      const F = I(x + 200, h + 200, 3, 2, 0.5) * s * 0.5;
      return [v, P, F, 1];
    }
  });
}
function _e(n, e, t = {}) {
  const {
    bounds: s = 2,
    is2D: r = !1,
    noiseScale: o = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    numClusters: l = 5,
    clusterSize: u = 0.8
  } = t;
  return L(n, e, (p, m, w, M) => {
    const d = p / w, g = m / M;
    let y = 1 / 0, x = { x: 0, y: 0 };
    for (let T = 0; T < l; T++) {
      const D = c + T * 1e3, C = $(D), R = C() * s * 2 - s, z = C() * s * 2 - s, Y = Math.sqrt((d - (R + s) / (s * 2)) ** 2 + (g - (z + s) / (s * 2)) ** 2);
      Y < y && (y = Y, x = { x: R, y: z });
    }
    const h = d * o + a.x, f = g * o + a.y, v = be(h, f, 0.2), P = b(v.x, v.y) * u, F = x.x + P, B = x.y + b(v.x + 100, v.y + 100) * u;
    if (r)
      return [F, B, 0, 1];
    {
      const T = I(v.x + 200, v.y + 200, 3, 2, 0.5) * s * 0.5;
      return [F, B, T, 1];
    }
  });
}
function Ue(n, e, t = {}) {
  const {
    bounds: s = 2,
    is2D: r = !1,
    noiseScale: o = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    numWaves: l = 3,
    waveAmplitude: u = 0.5
  } = t, p = $(c);
  return L(n, e, (m, w, M, d) => {
    const g = m / M, y = w / d;
    let x = 0, h = 0;
    for (let T = 0; T < l; T++) {
      const D = (T + 1) * 2, C = p() * Math.PI * 2;
      x += Math.sin(y * D + C) * u, h += Math.cos(g * D + C) * u;
    }
    const f = g * o + a.x, v = y * o + a.y, P = b(f, v) * 0.3, F = g * s * 2 - s + x + P, B = y * s * 2 - s + h + b(f + 100, v + 100) * 0.3;
    if (r)
      return [F, B, 0, 1];
    {
      const T = I(f + 200, v + 200, 3, 2, 0.5) * s * 0.5;
      return [F, B, T, 1];
    }
  });
}
function qe(n, e, t, s = {}) {
  const {
    bounds: r = 2,
    is2D: o = !1,
    noiseScale: c = 0.1,
    seed: a = Math.random() * 1e3,
    noiseOffset: l = { x: 0, y: 0, z: 0 },
    distance: u = 5
  } = s;
  return L(n, e, (p, m, w, M) => {
    const d = p / w, g = m / M, y = d * 2 - 1, x = g * 2 - 1;
    let h, f, v;
    if (t instanceof i.PerspectiveCamera) {
      const T = t.aspect, D = t.fov * Math.PI / 180, C = 2 * u * Math.tan(D / 2), R = C * T;
      h = y * R / 2, f = x * C / 2, v = u;
    } else if (t instanceof i.OrthographicCamera) {
      const T = t.left, D = t.right, C = t.top, R = t.bottom;
      h = T + (D - T) * d, f = R + (C - R) * g, v = u;
    } else
      h = y * r, f = x * r, v = u;
    const P = d * c + l.x, F = g * c + l.y, B = b(P, F) * 0.2;
    return h += B, f += b(P + 100, F + 100) * 0.2, o ? [h, f, 0, 1] : (v += I(P + 200, F + 200, 3, 2, 0.5) * r * 0.3, [h, f, v, 1]);
  });
}
function Ne(n, e, t) {
  const { width: s, height: r } = ee(e), o = s * r, c = new Float32Array(o * 4);
  for (let l = 0; l < e; l++) {
    const u = l * 3, p = l * 4;
    c[p + 0] = n[u + 0], c[p + 1] = n[u + 1], c[p + 2] = n[u + 2], c[p + 3] = t ? t[l] : 1;
  }
  for (let l = e; l < o; l++) {
    const u = l * 4;
    c[u + 0] = 0, c[u + 1] = 0, c[u + 2] = 0, c[u + 3] = 0;
  }
  const a = new i.DataTexture(
    c,
    s,
    r,
    i.RGBAFormat,
    i.FloatType
  );
  return a.minFilter = i.NearestFilter, a.magFilter = i.NearestFilter, a.wrapS = i.ClampToEdgeWrapping, a.wrapT = i.ClampToEdgeWrapping, a.needsUpdate = !0, { texture: a, width: s, height: r };
}
function Ze(n, e) {
  const { width: t, height: s } = ee(e), r = t * s, o = new Float32Array(r * 4);
  for (let a = 0; a < e; a++) {
    const l = a * 3, u = a * 4;
    o[u + 0] = n[l + 0], o[u + 1] = n[l + 1], o[u + 2] = n[l + 2], o[u + 3] = 1;
  }
  for (let a = e; a < r; a++) {
    const l = a * 4;
    o[l + 0] = 0, o[l + 1] = 1, o[l + 2] = 0, o[l + 3] = 1;
  }
  const c = new i.DataTexture(
    o,
    t,
    s,
    i.RGBAFormat,
    i.FloatType
  );
  return c.minFilter = i.NearestFilter, c.magFilter = i.NearestFilter, c.wrapS = i.ClampToEdgeWrapping, c.wrapT = i.ClampToEdgeWrapping, c.needsUpdate = !0, { texture: c, width: t, height: s };
}
function He(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 }
  } = t;
  return L(n, e, (l, u, p, m) => {
    const w = l / p, M = u / m, d = w * o + a.x, g = M * o + a.y, y = b(d, g) * s, x = b(d + 100, g + 100) * s;
    if (r)
      return [y, x, 0, 1];
    {
      const h = b(d + 200, g + 200) * s;
      return [y, x, h, 1];
    }
  });
}
function ke(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 }
  } = t;
  return L(n, e, (l, u, p, m) => {
    const w = l / p, M = u / m, d = w * o + a.x, g = M * o + a.y, y = 0.01, x = b(d, g), h = b(d + y, g), f = b(d, g + y), v = -(h - x) / y * s, P = -(f - x) / y * s;
    if (r)
      return [v, P, 0, 1];
    {
      const F = b(d + 200, g + 200) * s * 0.5;
      return [v, P, F, 1];
    }
  });
}
function je(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    numCenters: l = 3,
    rotationStrength: u = 1
  } = t;
  return L(n, e, (p, m, w, M) => {
    const d = p / w, g = m / M, y = d * 4 - 2, x = g * 4 - 2;
    let h = 0, f = 0;
    for (let T = 0; T < l; T++) {
      const D = c + T * 1e3, C = $(D), R = C() * 4 - 2, z = C() * 4 - 2, Y = y - R, E = x - z, A = Math.sqrt(Y * Y + E * E);
      if (A > 0.01) {
        const W = u * Math.exp(-A * 2);
        h += -E / A * W, f += Y / A * W;
      }
    }
    const v = d * o + a.x, P = g * o + a.y, F = b(v, P) * s * 0.3, B = b(v + 100, P + 100) * s * 0.3;
    if (h = (h + F) * s, f = (f + B) * s, r)
      return [h, f, 0, 1];
    {
      const T = b(v + 200, P + 200) * s * 0.5;
      return [h, f, T, 1];
    }
  });
}
function Qe(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    numCenters: l = 2,
    radialStrength: u = 1
  } = t;
  return L(n, e, (p, m, w, M) => {
    const d = p / w, g = m / M, y = d * 4 - 2, x = g * 4 - 2;
    let h = 0, f = 0;
    for (let T = 0; T < l; T++) {
      const D = c + T * 1e3, C = $(D), R = C() * 4 - 2, z = C() * 4 - 2, Y = y - R, E = x - z, A = Math.sqrt(Y * Y + E * E);
      if (A > 0.01) {
        const W = u * Math.exp(-A * 1.5);
        h += Y / A * W, f += E / A * W;
      }
    }
    const v = d * o + a.x, P = g * o + a.y, F = b(v, P) * s * 0.2, B = b(v + 100, P + 100) * s * 0.2;
    if (h = (h + F) * s, f = (f + B) * s, r)
      return [h, f, 0, 1];
    {
      const T = b(v + 200, P + 200) * s * 0.3;
      return [h, f, T, 1];
    }
  });
}
function Ke(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    turbulenceIntensity: l = 1,
    turbulenceOctaves: u = 4
  } = t;
  return L(n, e, (p, m, w, M) => {
    const d = p / w, g = m / M, y = d * o + a.x, x = g * o + a.y, h = I(y, x, u, 2, 0.5) * s * l, f = I(y + 100, x + 100, u, 2, 0.5) * s * l;
    if (r)
      return [h, f, 0, 1];
    {
      const v = I(y + 200, x + 200, u, 2, 0.5) * s * l;
      return [h, f, v, 1];
    }
  });
}
function Je(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    numWaves: l = 3,
    waveFrequency: u = 2
  } = t, p = $(c);
  return L(n, e, (m, w, M, d) => {
    const g = m / M, y = w / d;
    let x = 0, h = 0;
    for (let B = 0; B < l; B++) {
      const T = p() * Math.PI * 2, D = u * (B + 1);
      h += Math.sin(g * D + T) * s * 0.5, x += Math.cos(y * D + T) * s * 0.5;
    }
    const f = g * o + a.x, v = y * o + a.y, P = b(f, v) * s * 0.3, F = b(f + 100, v + 100) * s * 0.3;
    if (x = (x + P) * s, h = (h + F) * s, r)
      return [x, h, 0, 1];
    {
      const B = b(f + 200, v + 200) * s * 0.4;
      return [x, h, B, 1];
    }
  });
}
function et(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    numPoints: l = 2,
    convergenceStrength: u = 1
  } = t;
  return L(n, e, (p, m, w, M) => {
    const d = p / w, g = m / M, y = d * 4 - 2, x = g * 4 - 2;
    let h = 0, f = 0;
    for (let T = 0; T < l; T++) {
      const D = c + T * 1e3, C = $(D), R = C() * 4 - 2, z = C() * 4 - 2, Y = R - y, E = z - x, A = Math.sqrt(Y * Y + E * E);
      if (A > 0.01) {
        const W = u * Math.exp(-A * 1);
        h += Y / A * W, f += E / A * W;
      }
    }
    const v = d * o + a.x, P = g * o + a.y, F = b(v, P) * s * 0.2, B = b(v + 100, P + 100) * s * 0.2;
    if (h = (h + F) * s, f = (f + B) * s, r)
      return [h, f, 0, 1];
    {
      const T = b(v + 200, P + 200) * s * 0.3;
      return [h, f, T, 1];
    }
  });
}
function tt(n, e, t = {}) {
  const {
    maxSpeed: s = 0.5,
    is2D: r = !1,
    noiseScale: o = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: a = { x: 0, y: 0, z: 0 },
    patterns: l = [
      { type: "flow", weight: 0.4 },
      { type: "rotational", weight: 0.3 },
      { type: "turbulent", weight: 0.3 }
    ]
  } = t;
  return L(n, e, (u, p, m, w) => {
    const M = u / m, d = p / w;
    let g = 0, y = 0, x = 0, h = 0;
    return l.forEach((f, v) => {
      const P = c + v * 1e3, F = $(P);
      let B = 0, T = 0, D = 0;
      switch (f.type) {
        case "flow": {
          const C = M * o + a.x, R = d * o + a.y;
          B = b(C, R) * s, T = b(C + 100, R + 100) * s, r || (D = b(C + 200, R + 200) * s);
          break;
        }
        case "rotational": {
          const C = M * 4 - 2, R = d * 4 - 2, z = F() * 4 - 2, Y = F() * 4 - 2, E = C - z, A = R - Y, W = Math.sqrt(E * E + A * A);
          if (W > 0.01) {
            const _ = Math.exp(-W * 2);
            B = -A / W * _ * s, T = E / W * _ * s;
          }
          break;
        }
        case "turbulent": {
          const C = M * o + a.x, R = d * o + a.y;
          B = I(C, R, 4, 2, 0.5) * s, T = I(C + 100, R + 100, 4, 2, 0.5) * s, r || (D = I(C + 200, R + 200, 4, 2, 0.5) * s);
          break;
        }
        case "wave": {
          const R = F() * Math.PI * 2;
          B = Math.cos(d * 2 + R) * s * 0.5, T = Math.sin(M * 2 + R) * s * 0.5;
          break;
        }
        case "radial": {
          const C = M * 4 - 2, R = d * 4 - 2, z = F() * 4 - 2, Y = F() * 4 - 2, E = C - z, A = R - Y, W = Math.sqrt(E * E + A * A);
          if (W > 0.01) {
            const _ = Math.exp(-W * 1.5);
            B = E / W * _ * s, T = A / W * _ * s;
          }
          break;
        }
        case "convergent": {
          const C = M * 4 - 2, R = d * 4 - 2, z = F() * 4 - 2, Y = F() * 4 - 2, E = z - C, A = Y - R, W = Math.sqrt(E * E + A * A);
          if (W > 0.01) {
            const _ = Math.exp(-W * 1);
            B = E / W * _ * s, T = A / W * _ * s;
          }
          break;
        }
      }
      g += B * f.weight, y += T * f.weight, x += D * f.weight, h += f.weight;
    }), h > 0 && (g /= h, y /= h, x /= h), r ? [g, y, 0, 1] : [g, y, x, 1];
  });
}
function Fe(n, e, t, s, r) {
  if (n instanceof i.Box3) {
    const w = n, M = e ?? 16711680, d = w.getSize(new i.Vector3()), g = w.getCenter(new i.Vector3());
    return Fe(d.x, d.y, d.z, M, g);
  }
  if (typeof e == "number" && typeof t == "number") {
    const w = n, M = e, d = t, g = s ?? 65280, y = r ?? new i.Vector3(0, 0, 0), x = new i.BoxGeometry(w, M, d), h = new i.EdgesGeometry(x), f = new i.LineBasicMaterial({ color: g }), v = new i.LineSegments(h, f);
    return v.position.copy(y), v;
  }
  const o = n, c = e ?? 65280, a = t instanceof i.Vector3 ? t : new i.Vector3(0, 0, 0), l = new i.BoxGeometry(o, o, o), u = new i.EdgesGeometry(l), p = new i.LineBasicMaterial({ color: c }), m = new i.LineSegments(u, p);
  return m.position.copy(a), m;
}
function Be(n = 0.2) {
  const e = new i.BufferGeometry(), t = [], s = [], r = [];
  return t.push(
    0,
    0.5,
    0,
    -0.5,
    -0.5,
    0,
    0,
    -0.5 + n,
    0,
    0.5,
    -0.5,
    0
  ), s.push(
    0.5,
    1,
    0,
    0,
    0.5,
    0.2,
    1,
    0
  ), r.push(
    0,
    1,
    2,
    0,
    2,
    3
  ), e.setAttribute("position", new i.Float32BufferAttribute(t, 3)), e.setAttribute("uv", new i.Float32BufferAttribute(s, 2)), e.setIndex(r), e.computeVertexNormals(), e;
}
function st() {
  return Be(0.2);
}
function nt(n, e = 0) {
  const s = new i.Matrix4().multiplyMatrices(
    n.projectionMatrix,
    n.matrixWorldInverse
  ).elements, r = (a, l) => s[l * 4 + a], o = new i.Matrix3().set(
    r(0, 0),
    r(0, 1),
    r(0, 2) * e + r(0, 3),
    r(1, 0),
    r(1, 1),
    r(1, 2) * e + r(1, 3),
    r(3, 0),
    r(3, 1),
    r(3, 2) * e + r(3, 3)
  ), c = o.determinant();
  return Math.abs(c) < 1e-8 ? null : new i.Matrix3().copy(o).invert();
}
export {
  We as Compositor,
  Ve as FullscreenPass,
  Ye as ParticlePass,
  pe as ParticleSystem,
  ae as PingPongBuffer,
  Xe as ScenePass,
  ze as WeightedOITParticlesPass,
  J as blit,
  nt as buildNDCToZConst,
  ee as computeTextureSize,
  Be as createArrowGeometry,
  _e as createClusterPositionTexture,
  et as createConvergentVelocityTexture,
  L as createDataTexture,
  He as createFlowVelocityTexture,
  ke as createGradientFlowVelocityTexture,
  te as createInstancedUvBuffer,
  tt as createMixedVelocityTexture,
  Ge as createNoisePositionTexture,
  Ze as createNormalTextureFromArray,
  st as createParticleArrowGeometry,
  Ne as createPositionTextureFromArray,
  he as createQuad,
  Qe as createRadialVelocityTexture,
  ge as createRenderer,
  je as createRotationalVelocityTexture,
  qe as createScreenSpacePositionTexture,
  $e as createSpiralPositionTexture,
  Ke as createTurbulentVelocityTexture,
  Ue as createWavePositionTexture,
  Je as createWaveVelocityTexture,
  Fe as createWireframeBox,
  be as domainWarp2D,
  I as fbm2D,
  Le as fbm3D,
  X as globalUniforms,
  q as isMousePressed,
  N as mouseButton,
  b as perlin2D,
  Re as perlin3D,
  Oe as ridged2D,
  Ie as runExperiment,
  $ as seededRandom,
  me as setupInputs,
  we as setupResize,
  ve as startLoop
};
