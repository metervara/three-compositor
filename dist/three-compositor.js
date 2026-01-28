var ae = Object.defineProperty;
var se = (o, e, n) => e in o ? ae(o, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : o[e] = n;
var z = (o, e, n) => (se(o, typeof e != "symbol" ? e + "" : e, n), n);
import * as s from "three";
import { Vector2 as k, PerspectiveCamera as ie } from "three";
import { OrbitControls as ce } from "three/examples/jsm/controls/OrbitControls.js";
class le {
  constructor(e, n, t) {
    z(this, "rtA");
    z(this, "rtB");
    z(this, "flag", !1);
    const r = {
      minFilter: s.LinearFilter,
      magFilter: s.LinearFilter,
      wrapS: s.ClampToEdgeWrapping,
      wrapT: s.ClampToEdgeWrapping,
      format: s.RGBAFormat,
      type: s.FloatType,
      depthBuffer: !1,
      stencilBuffer: !1,
      ...t
    };
    this.rtA = new s.WebGLRenderTarget(e, n, r), this.rtB = new s.WebGLRenderTarget(e, n, r), this.rtA.texture.generateMipmaps = !1, this.rtB.texture.generateMipmaps = !1, this.rtA.texture.anisotropy = 1, this.rtB.texture.anisotropy = 1;
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
var H = `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`, Q = `precision highp float;

uniform sampler2D srcTexture;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(srcTexture, vUv);
}`;
const ue = new s.OrthographicCamera(-1, 1, 1, -1, 0, 1), Z = new s.ShaderMaterial({
  uniforms: {
    srcTexture: { value: null }
  },
  vertexShader: H,
  fragmentShader: Q
}), K = new s.Scene(), pe = new s.PlaneGeometry(2, 2), J = new s.Mesh(
  pe,
  Z
);
K.add(J);
function ee(o, e, n, t) {
  const r = t ?? Z;
  t && !("srcTexture" in t.uniforms) && console.warn(
    "Blit: provided material does not have a `srcTexture` uniform. If it uses another sampler uniform name, you'll need to set it yourself before calling."
  ), J.material = r, r.uniforms.srcTexture.value = e, o.setRenderTarget(n), o.clear(), o.render(K, ue), o.setRenderTarget(null);
}
class ln {
  constructor(e) {
    z(this, "passes", []);
    z(this, "pingPongBuffers", /* @__PURE__ */ new Map());
    z(this, "renderer");
    z(this, "textureRegistry", /* @__PURE__ */ new Map());
    z(this, "passRegistry", /* @__PURE__ */ new Map());
    z(this, "pingPongPassMapping", /* @__PURE__ */ new Map());
    this.renderer = e, window.__compositor = this;
  }
  addPass(e, n) {
    return this.passes.push(e), n && this.passRegistry.set(n, e), e.opts.outputTextureName && e.texture && this.textureRegistry.set(e.opts.outputTextureName, e.texture), this;
  }
  getPass(e) {
    return this.passRegistry.get(e);
  }
  getTexture(e) {
    return this.textureRegistry.get(e);
  }
  registerTexture(e, n) {
    return this.textureRegistry.set(e, n), this;
  }
  createPingPong(e, n, t, r) {
    const a = new le(n, t, r);
    return this.pingPongBuffers.set(e, a), this.textureRegistry.set(`${e}_read`, a.read.texture), this.textureRegistry.set(`${e}_write`, a.write.texture), a;
  }
  getPingPong(e) {
    return this.pingPongBuffers.get(e);
  }
  swapPingPong(e) {
    const n = this.pingPongBuffers.get(e);
    return n && (n.swap(), this.textureRegistry.set(`${e}_read`, n.read.texture), this.textureRegistry.set(`${e}_write`, n.write.texture)), this;
  }
  swapAllPingPong() {
    for (const [e, n] of this.pingPongBuffers)
      n.swap(), this.textureRegistry.set(`${e}_read`, n.read.texture), this.textureRegistry.set(`${e}_write`, n.write.texture);
    return this;
  }
  renderPass(e) {
    if (e >= 0 && e < this.passes.length) {
      const n = this.passes[e];
      this.resolveDependencies(n), n.render(this.renderer);
    }
    return this;
  }
  renderPassByName(e) {
    const n = this.getPass(e);
    return n && (this.resolveDependencies(n), n.render(this.renderer)), this;
  }
  renderRange(e, n) {
    const t = this.passes.slice(e, n);
    for (const r of t)
      this.resolveDependencies(r), r.render(this.renderer);
    return this;
  }
  render() {
    for (const e of this.passes)
      this.resolveDependencies(e), e.render(this.renderer);
    return this;
  }
  renderToScreen(e) {
    const n = new s.Vector2();
    this.renderer.getSize(n), e && this.renderer.setViewport(e.x, e.y, e.width, e.height);
    const t = this.passes[this.passes.length - 1];
    return t && (this.resolveDependencies(t), t.render(this.renderer)), this.renderer.setViewport(0, 0, n.x, n.y), this;
  }
  blit(e, n) {
    return ee(this.renderer, e, n), this;
  }
  execute(e) {
    return e(this.renderer), this;
  }
  clear() {
    return this.passes = [], this.textureRegistry.clear(), this.passRegistry.clear(), this;
  }
  removePass(e) {
    const n = this.passes.findIndex((t) => this.passRegistry.get(e) === t);
    return n !== -1 && (this.passes.splice(n, 1), this.passRegistry.delete(e)), this;
  }
  getPassCount() {
    return this.passes.length;
  }
  getDescription() {
    var t, r, a, c;
    const e = [];
    let n = 0;
    if (e.push(`Compositor with ${this.passes.length} pass${this.passes.length !== 1 ? "es" : ""}:`), this.passes.forEach((i, l) => {
      const u = this.getPassNameByIndex(l), p = this.getPassType(i), h = this.getPassDetails(i), g = this.estimateQuadFragments(i);
      g > 0 && (n += g), e.push(`  ${l + 1}. ${u} (${p})${h ? ` - ${h}` : ""}`);
    }), n > 0) {
      e.push("");
      const i = Math.max(1, Math.round(Math.sqrt(n)));
      e.push(`Estimated fragments (quad passes): ${n} (~${i}x${i})`);
    }
    if (this.pingPongBuffers.size > 0) {
      e.push(""), e.push("Ping-pong buffers:");
      for (const [i, l] of this.pingPongBuffers)
        e.push(`  - ${i} (${l.read.width}x${l.read.height})`);
    }
    if (this.textureRegistry.size > 0) {
      e.push(""), e.push("Registered textures:");
      for (const [i, l] of this.textureRegistry) {
        const u = `${((t = l.image) == null ? void 0 : t.width) || ((r = l.image) == null ? void 0 : r.videoWidth) || "?"}x${((a = l.image) == null ? void 0 : a.height) || ((c = l.image) == null ? void 0 : c.videoHeight) || "?"}`;
        e.push(`  - ${i} (${u})`);
      }
    }
    return e.join(`
`);
  }
  getPassNameByIndex(e) {
    for (const [n, t] of this.passRegistry)
      if (this.passes[e] === t)
        return n;
    return `Pass ${e + 1}`;
  }
  getPassType(e) {
    return e.constructor.name === "FullscreenPass" ? "Quad" : e.constructor.name === "ParticlePass" ? "Particle" : e.constructor.name === "WeightedOITParticlesPass" ? "WeightedOIT" : e.constructor.name;
  }
  getPassDetails(e) {
    const n = [];
    let t = null;
    const r = this.getPassNameByIndex(this.passes.indexOf(e));
    if (this.pingPongPassMapping.has(r))
      t = this.pingPongPassMapping.get(r);
    else
      for (const [a, c] of this.pingPongBuffers)
        if (e.outputTarget === c.write || e.outputTarget === c.read) {
          t = a;
          break;
        }
    if (t) {
      const a = this.pingPongBuffers.get(t);
      a && n.push(`ping-pong (${a.read.width}x${a.read.height}, ${t})`);
    } else if (e.opts.rtSize)
      n.push(`render-target (${e.opts.rtSize.width}x${e.opts.rtSize.height})`);
    else if (e.opts.outputTarget)
      n.push("custom render-target");
    else {
      const a = new s.Vector2();
      this.renderer.getSize(a), n.push(`screen (${a.x}x${a.y})`);
    }
    if (e.opts.viewport && n.push(`viewport (${e.opts.viewport.width}x${e.opts.viewport.height})`), e.opts.inputTextures && Object.keys(e.opts.inputTextures).length > 0) {
      const a = Object.values(e.opts.inputTextures).join(", ");
      n.push(`inputs: ${a}`);
    }
    return e.opts.outputTextureName && n.push(`output: ${e.opts.outputTextureName}`), e.opts.particleOptions && n.push(`${e.opts.particleOptions.count} particles`), n.join(", ");
  }
  updatePingPongPass(e, n, t, r) {
    const a = this.getPass(e), c = this.getPingPong(n);
    return a && c && (a.setUniform(t, c.read.texture), r && (a.outputTarget = r), this.pingPongPassMapping.set(e, n)), this;
  }
  resolveDependencies(e) {
    if (e.opts.inputTextures)
      for (const [n, t] of Object.entries(e.opts.inputTextures)) {
        const r = this.textureRegistry.get(t);
        r && e.setUniform(n, r);
      }
  }
  estimateQuadFragments(e) {
    let n = 0, t = 0;
    const r = e;
    if (e.constructor.name === "FullscreenPass")
      if (r.outputTarget)
        e.opts.rtSize ? (n = e.opts.rtSize.width, t = e.opts.rtSize.height) : r.outputTarget.width && r.outputTarget.height && (n = r.outputTarget.width, t = r.outputTarget.height);
      else if (e.opts.viewport)
        n = e.opts.viewport.width, t = e.opts.viewport.height;
      else {
        const i = new s.Vector2();
        this.renderer.getSize(i), n = i.x, t = i.y;
      }
    else if (e.constructor.name === "ParticlePass" && r.outRT === null)
      if (e.opts.viewport)
        n = e.opts.viewport.width, t = e.opts.viewport.height;
      else {
        const i = new s.Vector2();
        this.renderer.getSize(i), n = i.x, t = i.y;
      }
    const a = Math.max(0, Math.floor(n)), c = Math.max(0, Math.floor(t));
    return a * c;
  }
  resize(e, n) {
    for (const t of this.passes)
      t.resize && t.resize(e, n);
  }
  resizePass(e, n, t) {
    const r = this.getPass(e);
    r && r.resize && r.resize(n, t);
  }
}
function ne(o, e = !1) {
  if (!Number.isInteger(o) || o <= 0)
    throw new Error("computeTextureSize: count must be a positive integer");
  function n(i) {
    return Math.pow(2, Math.ceil(Math.log2(i)));
  }
  if (!e) {
    const i = Math.ceil(Math.sqrt(o)), l = Math.ceil(o / i);
    return { width: i, height: l };
  }
  const t = Math.ceil(Math.sqrt(o)), r = n(t), a = Math.ceil(o / r), c = n(a);
  return { width: r, height: c };
}
function te(o, e, n) {
  if (!Number.isInteger(o) || o <= 0)
    throw new Error("createInstancedUvBuffer: count must be a positive integer");
  if (!Number.isInteger(e) || e <= 0)
    throw new Error("createInstancedUvBuffer: width must be a positive integer");
  if (!Number.isInteger(n) || n <= 0)
    throw new Error("createInstancedUvBuffer: height must be a positive integer");
  if (e * n < o)
    throw new Error(
      `createInstancedUvBuffer: texture too small (${e}x${n} = ${e * n} < count=${o})`
    );
  const t = new Float32Array(o * 2);
  for (let r = 0; r < o; r++) {
    const a = r % e + 0.5, c = Math.floor(r / e) + 0.5;
    t[2 * r + 0] = a / e, t[2 * r + 1] = c / n;
  }
  return t;
}
class fe {
  constructor(e) {
    z(this, "mesh");
    z(this, "material");
    z(this, "geometry");
    const { count: n, width: t, height: r, geometry: a, materialOptions: c } = e;
    if (!c)
      throw new Error("ParticleSystem: missing materialOptions");
    const i = a || new s.PlaneGeometry(1, 1);
    this.geometry = new s.InstancedBufferGeometry(), this.geometry.index = i.index, this.geometry.attributes = i.attributes;
    const l = te(n, t, r);
    this.geometry.setAttribute(
      "instUv",
      new s.InstancedBufferAttribute(l, 2)
    );
    const u = { ...c.defines || {} }, p = !!c.transparent, h = c.depthWrite === void 0 ? !1 : c.depthWrite, g = c.depthTest === void 0 ? !0 : c.depthTest;
    !p && h && g && (u.ENABLE_ALPHA_TEST = 1), this.material = new s.ShaderMaterial({
      ...c,
      defines: u
    }), this.mesh = new s.Mesh(this.geometry, this.material), this.mesh.frustumCulled = !1;
  }
  setUniform(e, n) {
    this.material.uniforms[e] ? this.material.uniforms[e].value = n : this.material.uniforms[e] = { value: n };
  }
  getUniform(e) {
    var n;
    return (n = this.material.uniforms[e]) == null ? void 0 : n.value;
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
const B = {
  uTime: { value: 0 },
  uResolution: { value: new k() },
  uMouse: { value: new k() },
  uMouseUV: { value: new k() },
  uMouseNDC: { value: new k() },
  uMouseDelta: { value: new k() },
  uMousePrev: { value: new k() },
  uMouseUVPrev: { value: new k() },
  uMouseNDCPrev: { value: new k() },
  uMouseDeltaPrev: { value: new k() },
  uScroll: { value: 0 }
};
function ve(o, e = 2, n = 2) {
  const t = {
    ...B,
    ...o.uniforms || {}
  }, r = new s.PlaneGeometry(e, n), a = new s.ShaderMaterial({
    vertexShader: o.vertexShader,
    fragmentShader: o.fragmentShader,
    uniforms: t
  });
  return new s.Mesh(r, a);
}
class un {
  constructor(e) {
    z(this, "scene");
    z(this, "camera");
    z(this, "outputTarget", null);
    z(this, "material");
    z(this, "opts");
    this.opts = e;
  }
  init(e) {
    const { renderer: n } = e, {
      outputTarget: t,
      rtSize: r,
      clearColor: a = !0,
      clearDepth: c = !1,
      clearStencil: i = !1,
      materialOptions: l,
      seedTexture: u
    } = this.opts;
    if (!l)
      throw new Error("FullscreenPass: missing materialOptions");
    if (t)
      this.outputTarget = t;
    else if (r) {
      const { width: h, height: g } = r;
      this.outputTarget = new s.WebGLRenderTarget(h, g, {
        minFilter: s.LinearFilter,
        magFilter: s.LinearFilter,
        wrapS: s.ClampToEdgeWrapping,
        wrapT: s.ClampToEdgeWrapping,
        format: s.RGBAFormat,
        type: s.FloatType,
        depthBuffer: !1,
        stencilBuffer: !1
      });
    } else
      this.outputTarget = null;
    this.camera = new s.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new s.Scene();
    const p = ve(l);
    this.material = p.material, this.material && this.material.blending !== s.NoBlending && (this.material.blending = s.NoBlending, this.material.transparent = !1, this.material.depthWrite = !1, this.material.depthTest = !1), p.frustumCulled = !1, this.scene.add(p), this.opts.clearColor = a, this.opts.clearDepth = c, this.opts.clearStencil = i, u && this.outputTarget && ee(
      n,
      u,
      this.outputTarget
    );
  }
  update(e) {
  }
  render(e) {
    const {
      clearColor: n = !0,
      clearDepth: t = !1,
      clearStencil: r = !1,
      clearColorValue: a,
      clearAlpha: c,
      viewport: i
    } = this.opts;
    e.setRenderTarget(this.outputTarget);
    let l = null;
    i && !this.outputTarget && (l = new s.Vector4(), e.getViewport(l), e.setViewport(i.x, i.y, i.width, i.height));
    let u = null, p = null;
    if (n && (a !== void 0 || c !== void 0))
      if (u = new s.Color(), e.getClearColor(u), p = e.getClearAlpha ? e.getClearAlpha() : 1, a !== void 0) {
        const h = a instanceof s.Color ? a : new s.Color(a);
        e.setClearColor(h, c !== void 0 ? c : p ?? 1);
      } else
        c !== void 0 && u && e.setClearColor(u, c);
    (n || t || r) && e.clear(n, t, r), e.render(this.scene, this.camera), e.setRenderTarget(null), l && e.setViewport(l.x, l.y, l.z, l.w), u && e.setClearColor(u, p ?? 1);
  }
  get texture() {
    return this.outputTarget ? this.outputTarget.texture : null;
  }
  setUniform(e, n) {
    if (!this.material)
      throw new Error("FullscreenPass: must call init() first");
    this.material.uniforms[e] ? this.material.uniforms[e].value = n : this.material.uniforms[e] = { value: n };
  }
  resize(e, n) {
    this.outputTarget && this.opts.rtSize && (this.outputTarget.dispose(), this.outputTarget = new s.WebGLRenderTarget(e, n, {
      minFilter: s.LinearFilter,
      magFilter: s.LinearFilter,
      wrapS: s.ClampToEdgeWrapping,
      wrapT: s.ClampToEdgeWrapping,
      format: s.RGBAFormat,
      type: s.FloatType,
      depthBuffer: !1,
      stencilBuffer: !1
    }), this.opts.rtSize.width = e, this.opts.rtSize.height = n);
  }
}
class pn {
  constructor(e) {
    z(this, "scene");
    z(this, "camera");
    z(this, "outRT");
    z(this, "particleSystem");
    z(this, "opts");
    this.opts = e;
  }
  init(e) {
    const {
      outputTarget: n,
      rtSize: t,
      clearColor: r = !0,
      clearDepth: a = !1,
      clearStencil: c = !1,
      materialOptions: i,
      particleOptions: l,
      particleSystem: u
    } = this.opts;
    if (this.scene = new s.Scene(), this.camera = e.camera, u)
      this.particleSystem = u;
    else {
      if (!l)
        throw new Error("ParticlePass: missing particleOptions (or provide a particleSystem)");
      if (!i)
        throw new Error("ParticlePass: missing materialOptions (or provide a particleSystem)");
      this.particleSystem = new fe({
        count: l.count,
        width: l.width,
        height: l.height,
        geometry: l.geometry,
        materialOptions: i
      });
    }
    if (this.scene.add(this.particleSystem.mesh), n)
      this.outRT = n;
    else if (t) {
      const { width: p, height: h } = t;
      this.outRT = new s.WebGLRenderTarget(p, h, {
        minFilter: s.LinearFilter,
        magFilter: s.LinearFilter,
        wrapS: s.ClampToEdgeWrapping,
        wrapT: s.ClampToEdgeWrapping,
        format: s.RGBAFormat,
        type: s.UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !1,
        stencilBuffer: !1
      });
    } else
      this.outRT = null;
    this.opts.clearColor = r, this.opts.clearDepth = a, this.opts.clearStencil = c;
  }
  update(e) {
  }
  render(e) {
    const {
      clearColor: n = !0,
      clearDepth: t = !1,
      clearStencil: r = !1,
      clearColorValue: a,
      clearAlpha: c
    } = this.opts;
    e.setRenderTarget(this.outRT);
    let i = null, l = null;
    if (n && (a !== void 0 || c !== void 0))
      if (i = new s.Color(), e.getClearColor(i), l = e.getClearAlpha ? e.getClearAlpha() : 1, a !== void 0) {
        const u = a instanceof s.Color ? a : new s.Color(a);
        e.setClearColor(u, c !== void 0 ? c : l ?? 1);
      } else
        c !== void 0 && i && e.setClearColor(i, c);
    (n || t || r) && e.clear(n, t, r), e.render(this.scene, this.camera), i && e.setClearColor(i, l ?? 1), e.setRenderTarget(null);
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
  setUniform(e, n) {
    this.particleSystem.setUniform(e, n);
  }
  resize(e, n) {
    this.outRT && this.opts.rtSize && (this.outRT.dispose(), this.outRT = new s.WebGLRenderTarget(e, n, {
      minFilter: s.LinearFilter,
      magFilter: s.LinearFilter,
      wrapS: s.ClampToEdgeWrapping,
      wrapT: s.ClampToEdgeWrapping,
      format: s.RGBAFormat,
      type: s.UnsignedByteType,
      depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !1,
      stencilBuffer: !1
    }), this.opts.rtSize.width = e, this.opts.rtSize.height = n);
  }
}
class fn {
  constructor(e) {
    z(this, "scene");
    z(this, "camera");
    z(this, "_outputTarget", null);
    z(this, "opts");
    this.opts = e;
  }
  init(e) {
    const {
      outputTarget: n,
      rtSize: t,
      clearColor: r = !0,
      clearDepth: a = !0,
      clearStencil: c = !1
    } = this.opts;
    if (this.scene = this.opts.scene || e.scene, this.camera = this.opts.camera || e.camera, n)
      this._outputTarget = n;
    else if (t) {
      const { width: i, height: l } = t;
      this._outputTarget = new s.WebGLRenderTarget(i, l, {
        minFilter: s.LinearFilter,
        magFilter: s.LinearFilter,
        wrapS: s.ClampToEdgeWrapping,
        wrapT: s.ClampToEdgeWrapping,
        format: s.RGBAFormat,
        type: s.UnsignedByteType,
        depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !0,
        stencilBuffer: !1
      });
    } else
      this._outputTarget = null;
    this.opts.clearColor = r, this.opts.clearDepth = a, this.opts.clearStencil = c;
  }
  update(e) {
  }
  render(e) {
    const { clearColor: n = !0, clearDepth: t = !0, clearStencil: r = !1, viewport: a } = this.opts;
    e.setRenderTarget(this._outputTarget);
    let c = null;
    a && !this._outputTarget && (c = new s.Vector4(), e.getViewport(c), e.setViewport(a.x, a.y, a.width, a.height)), (n || t || r) && e.clear(n, t, r), e.render(this.scene, this.camera), e.setRenderTarget(null), c && e.setViewport(c.x, c.y, c.z, c.w);
  }
  get texture() {
    return this._outputTarget ? this._outputTarget.texture : null;
  }
  resize(e, n) {
    this._outputTarget && this.opts.rtSize && (this._outputTarget.dispose(), this._outputTarget = new s.WebGLRenderTarget(e, n, {
      minFilter: s.LinearFilter,
      magFilter: s.LinearFilter,
      wrapS: s.ClampToEdgeWrapping,
      wrapT: s.ClampToEdgeWrapping,
      format: s.RGBAFormat,
      type: s.UnsignedByteType,
      depthBuffer: this.opts.depthBuffer !== void 0 ? this.opts.depthBuffer : !0,
      stencilBuffer: !1
    }), this.opts.rtSize.width = e, this.opts.rtSize.height = n);
  }
}
var oe = `precision highp float;

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
class vn {
  constructor(e) {
    z(this, "particleScene");
    z(this, "camera");
    z(this, "accumRT");
    z(this, "revealRT");
    z(this, "particleMesh");
    z(this, "accumMaterial");
    z(this, "revealMaterial");
    z(this, "compositeScene");
    z(this, "compositeCamera");
    z(this, "compositeMesh");
    z(this, "opts");
    this.opts = e;
  }
  init(e) {
    const {
      materialOptions: n,
      particleOptions: t,
      rtSize: r
    } = this.opts;
    if (!n)
      throw new Error("WeightedOITParticlesPass: missing materialOptions");
    if (!t)
      throw new Error("WeightedOITParticlesPass: missing particleOptions");
    this.camera = e.camera, this.particleScene = new s.Scene();
    const a = t.geometry || new s.PlaneGeometry(1, 1), c = new s.InstancedBufferGeometry();
    c.index = a.index, c.attributes = a.attributes;
    const i = te(t.count, t.width, t.height);
    c.setAttribute("instUv", new s.InstancedBufferAttribute(i, 2)), this.accumMaterial = new s.ShaderMaterial({
      ...n,
      transparent: !0,
      depthWrite: !1,
      blending: s.CustomBlending,
      blendEquation: s.AddEquation,
      blendSrc: s.OneFactor,
      blendDst: s.OneFactor,
      blendEquationAlpha: s.AddEquation,
      blendSrcAlpha: s.OneFactor,
      blendDstAlpha: s.OneFactor
    }), this.revealMaterial = new s.ShaderMaterial({
      ...n,
      defines: { ...n.defines || {}, REVEAL_PASS: 1 },
      transparent: !0,
      depthWrite: !1,
      blending: s.CustomBlending,
      blendEquation: s.AddEquation,
      blendSrc: s.ZeroFactor,
      blendDst: s.OneMinusSrcAlphaFactor,
      blendEquationAlpha: s.AddEquation,
      blendSrcAlpha: s.ZeroFactor,
      blendDstAlpha: s.OneMinusSrcAlphaFactor
    }), this.particleMesh = new s.Mesh(c, this.accumMaterial), this.particleMesh.frustumCulled = !1, this.particleScene.add(this.particleMesh);
    const l = r || (() => {
      const g = new s.Vector2();
      return e.renderer.getSize(g), { width: g.x, height: g.y };
    })(), u = {
      minFilter: s.LinearFilter,
      magFilter: s.LinearFilter,
      wrapS: s.ClampToEdgeWrapping,
      wrapT: s.ClampToEdgeWrapping,
      format: s.RGBAFormat,
      type: s.HalfFloatType,
      depthBuffer: !1,
      stencilBuffer: !1
    };
    this.accumRT = new s.WebGLRenderTarget(l.width, l.height, u), this.revealRT = new s.WebGLRenderTarget(l.width, l.height, u), this.compositeCamera = new s.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.compositeScene = new s.Scene();
    const p = new s.PlaneGeometry(2, 2), h = new s.ShaderMaterial({
      vertexShader: H,
      fragmentShader: oe,
      uniforms: {
        tAccum: { value: this.accumRT.texture },
        tReveal: { value: this.revealRT.texture }
      },
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    });
    this.compositeMesh = new s.Mesh(p, h), this.compositeMesh.frustumCulled = !1, this.compositeScene.add(this.compositeMesh);
  }
  update(e) {
  }
  setUniform(e, n) {
    this.accumMaterial.uniforms[e] ? this.accumMaterial.uniforms[e].value = n : this.accumMaterial.uniforms[e] = { value: n }, this.revealMaterial.uniforms[e] ? this.revealMaterial.uniforms[e].value = n : this.revealMaterial.uniforms[e] = { value: n };
  }
  render(e) {
    const n = e.getClearColor(new s.Color()).clone(), t = e.getClearAlpha();
    e.setRenderTarget(null), e.render(this.particleScene.parent || this.particleScene, this.camera), e.setRenderTarget(this.accumRT), e.setClearColor(0, 0), e.clear(!0, !0, !1), this.particleMesh.material = this.accumMaterial, e.render(this.particleScene, this.camera), e.setRenderTarget(this.revealRT), e.setClearColor(16777215, 1), e.clear(!0, !0, !1), this.particleMesh.material = this.revealMaterial, e.render(this.particleScene, this.camera), e.setClearColor(n, t), e.setRenderTarget(null), e.render(this.compositeScene, this.compositeCamera);
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
  cameraPosition: new s.Vector3(0, 0, 5),
  useOrbit: !1
};
function me(o = {}) {
  const e = { ...de, ...o }, n = e.canvas || document.createElement("canvas");
  n.style.imageRendering = e.imageRendering, e.canvas || document.body.appendChild(n);
  const t = new s.WebGLRenderer({
    canvas: n,
    antialias: e.antialias
  });
  t.setPixelRatio(e.dpi), t.autoClear = !1;
  let r;
  const a = window.innerWidth / window.innerHeight;
  if (e.cameraType === "perspective") {
    const i = new s.PerspectiveCamera(e.fov, a, e.near, e.far);
    i.position.set(e.cameraPosition.x, e.cameraPosition.y, e.cameraPosition.z), i.lookAt(0, 0, 0), r = i;
  } else {
    const i = -a, l = a, u = 1, p = -1;
    r = new s.OrthographicCamera(i, l, u, p, e.near, e.far);
  }
  e.useOrbit && new ce(r, t.domElement).update();
  const c = new s.Scene();
  return { renderer: t, scene: c, camera: r, canvas: n, dpi: e.dpi, scale: e.scale };
}
let Y = !1, X = -1;
function he(o) {
  const { dpi: e, scale: n } = o, t = e * n;
  let r, a, c, i;
  const l = () => {
    if (r === void 0 || a === void 0 || c === void 0 || i === void 0) {
      requestAnimationFrame(l);
      return;
    }
    const u = o.canvas.getBoundingClientRect(), p = u.width, h = u.height, g = c - u.left, S = i - u.top, d = g * t, m = h * t - S * t, y = g / p, w = S / h, f = y * 2 - 1, v = -(w * 2 - 1), x = d - r, P = m - a;
    r = d, a = m, B.uMousePrev.value.set(r, a), B.uMouseUVPrev.value.set(B.uMouseUV.value.x, B.uMouseUV.value.y), B.uMouseNDCPrev.value.set(B.uMouseNDC.value.x, B.uMouseNDC.value.y), B.uMouseDeltaPrev.value.set(B.uMouseDelta.value.x, B.uMouseDelta.value.y), B.uMouse.value.set(d, m), B.uMouseUV.value.set(y, w), B.uMouseNDC.value.set(f, v), B.uMouseDelta.value.set(x, P), requestAnimationFrame(l);
  };
  window.addEventListener("mousemove", (u) => {
    if (c = u.clientX, i = u.clientY, r === void 0 || a === void 0) {
      const p = o.canvas.getBoundingClientRect(), h = u.clientX - p.left, g = u.clientY - p.top;
      r = h * t, a = p.height * t - g * t, requestAnimationFrame(l);
    }
  }), window.addEventListener("scroll", () => {
    B.uScroll.value = window.scrollY;
  }), window.addEventListener("mousedown", (u) => {
    Y = !0, X = u.button;
  }), window.addEventListener("mouseup", () => {
    Y = !1, X = -1;
  }), window.addEventListener("mouseleave", () => {
    Y = !1, X = -1;
  });
}
function xe(o, e) {
  const { renderer: n, camera: t, dpi: r, scale: a } = o;
  function c() {
    const i = o.canvas.clientWidth, l = o.canvas.clientHeight;
    n.setSize(i * a, l * a, !1), t instanceof ie && (t.aspect = i / l, t.updateProjectionMatrix()), B.uResolution.value.set(i * a * r, l * a * r), e && e(o);
  }
  window.addEventListener("resize", c), c();
}
function ge(o, e) {
  function n(t) {
    const r = t * 1e-3;
    B.uTime.value = r, e(r), requestAnimationFrame(n);
  }
  requestAnimationFrame(n);
}
function dn(o) {
  const e = me(o.config), n = o.setupInputs ?? !0, t = o.setupResize ?? !0;
  n && he(e), t && xe(e, o.onResize), o.init(e), ye(), be(), ze(o.onToggleInfo), ge(e, o.update);
}
function ye() {
  setTimeout(() => {
    const o = window.__compositor;
    if (o && typeof o.getDescription == "function") {
      const e = o.getDescription();
      Te(e);
    }
  }, 0);
}
function we() {
  let o = document.getElementById("info-overlay");
  return o || (o = document.createElement("div"), o.id = "info-overlay", o.className = "info-overlay", document.body.appendChild(o)), o.style.display = "none", o;
}
function be() {
  document.removeEventListener("keydown", $), document.addEventListener("keydown", $);
}
function $(o) {
  (o.key === "i" || o.key === "I") && Se();
}
function Se() {
  const o = document.getElementById("info-overlay");
  if (o) {
    const t = getComputedStyle(o).display === "none";
    o.style.display = t ? "block" : "none", typeof j() == "function" && j()(t);
  }
}
let re;
function ze(o) {
  re = o;
}
function j() {
  return re;
}
function Te(o) {
  let e = document.getElementById("compositor-description");
  e ? e.innerHTML = "" : (e = document.createElement("div"), e.id = "compositor-description", e.className = "compositor-description", we().appendChild(e));
  const n = o.split(`
`);
  n.forEach((t, r) => {
    if (t.trim()) {
      const a = document.createElement("span");
      a.textContent = t, t.includes(":") && !t.startsWith("  ") && !t.startsWith("	") && a.classList.add("title"), e.appendChild(a);
    }
    r < n.length - 1 && e.appendChild(document.createElement("br"));
  });
}
function V(o, e, n, t) {
  const r = o * e * 4, a = new Float32Array(r);
  let c = 0;
  for (let l = 0; l < e; l++)
    for (let u = 0; u < o; u++) {
      const [p, h, g, S] = n(u, l, o, e);
      a[c++] = p, a[c++] = h, a[c++] = g, a[c++] = S;
    }
  const i = new s.DataTexture(
    a,
    o,
    e,
    s.RGBAFormat,
    s.FloatType
  );
  return i.minFilter = (t == null ? void 0 : t.minFilter) ?? s.NearestFilter, i.magFilter = (t == null ? void 0 : t.magFilter) ?? s.NearestFilter, i.wrapS = (t == null ? void 0 : t.wrapS) ?? s.RepeatWrapping, i.wrapT = (t == null ? void 0 : t.wrapT) ?? s.RepeatWrapping, i.needsUpdate = !0, i;
}
function Pe(o) {
  return o - Math.floor(o * (1 / 289)) * 289;
}
function E(o) {
  return Pe((o * 34 + 1) * o);
}
function W(o) {
  return o * o * o * (o * (o * 6 - 15) + 10);
}
function L(o, e, n, t) {
  const r = o & 15, a = r < 8 ? e : n, c = r < 4 ? n : r === 12 || r === 14 ? e : t ?? 0;
  return (r & 1 ? -a : a) + (r & 2 ? -c : c);
}
function q(o, e) {
  const n = Math.floor(o), t = Math.floor(e);
  o = o - n, e = e - t;
  const r = W(o), a = W(e), c = L(E(E(n) + t), o, e), i = L(E(E(n) + t + 1), o, e - 1), l = L(E(E(n + 1) + t), o - 1, e), u = L(E(E(n + 1) + t + 1), o - 1, e - 1), p = c + r * (l - c), h = i + r * (u - i);
  return 2.3 * (p + a * (h - p));
}
function Ce(o, e, n) {
  const t = Math.floor(o), r = Math.floor(e), a = Math.floor(n);
  o = o - t, e = e - r, n = n - a;
  const c = W(o), i = W(e), l = W(n), u = E(t) + r, p = E(u) + a, h = E(u + 1) + a, g = E(t + 1) + r, S = E(g) + a, d = E(g + 1) + a, m = L(E(p), o, e, n), y = L(E(h), o, e, n - 1), w = L(E(p + 1), o, e - 1, n), f = L(E(h + 1), o, e - 1, n - 1), v = L(E(S), o - 1, e, n), x = L(E(d), o - 1, e, n - 1), P = L(E(S + 1), o - 1, e - 1, n), D = L(E(d + 1), o - 1, e - 1, n - 1), F = m + c * (v - m), b = y + c * (x - y), _ = w + c * (P - w), T = f + c * (D - f), C = F + i * (_ - F), A = b + i * (T - b);
  return 2.3 * (C + l * (A - C));
}
function O(o, e, n = 6, t = 2, r = 0.5) {
  let a = 0, c = 0.5, i = 1;
  for (let l = 0; l < n; l++)
    a += c * q(o * i, e * i), i *= t, c *= r;
  return a;
}
function mn(o, e, n, t = 6, r = 2, a = 0.5) {
  let c = 0, i = 0.5, l = 1;
  for (let u = 0; u < t; u++)
    c += i * Ce(o * l, e * l, n * l), l *= r, i *= a;
  return c;
}
function hn(o, e, n = 6, t = 2, r = 0.5, a = 1) {
  let c = 0, i = 0.5, l = 1;
  for (let u = 0; u < n; u++) {
    let p = q(o * l, e * l);
    p = a - Math.abs(p), p *= p, c += p * i, l *= t, i *= r;
  }
  return c * 1.25;
}
function qe(o, e, n = 0.1) {
  const t = q(o, e) * n, r = q(o + 100, e + 100) * n;
  return {
    x: o + t,
    y: e + r
  };
}
function N(o) {
  let e = o;
  return () => (e = (e * 1664525 + 1013904223) % 4294967296, e / 4294967296);
}
function xn(o, e, n = {}) {
  const {
    bounds: t = 2,
    is2D: r = !1,
    noiseScale: a = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 }
  } = n, l = N(c);
  return V(o, e, (u, p, h, g) => {
    const S = u / h, d = p / g, m = l() * 0.1, y = (S + m) * a + i.x, w = (d + m) * a + i.y, v = O(y, w, 4, 2, 0.5) * t, x = O(y + 100, w + 100, 4, 2, 0.5) * t;
    if (r)
      return [v, x, 0, 1];
    {
      const P = O(y + 200, w + 200, 4, 2, 0.5) * t;
      return [v, x, P, 1];
    }
  });
}
function gn(o, e, n = {}) {
  const {
    bounds: t = 2,
    is2D: r = !1,
    noiseScale: a = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 }
  } = n, l = N(c);
  return V(o, e, (u, p, h, g) => {
    const S = u / h, d = p / g, m = S * Math.PI * 4, y = d * t, w = (S + l() * 0.1) * a + i.x, f = (d + l() * 0.1) * a + i.y, v = q(w, f) * 0.3, x = (y + v) * Math.cos(m), P = (y + v) * Math.sin(m);
    if (r)
      return [x, P, 0, 1];
    {
      const D = O(w + 200, f + 200, 3, 2, 0.5) * t * 0.5;
      return [x, P, D, 1];
    }
  });
}
function yn(o, e, n = {}) {
  const {
    bounds: t = 2,
    is2D: r = !1,
    noiseScale: a = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    numClusters: l = 5,
    clusterSize: u = 0.8
  } = n;
  return V(o, e, (p, h, g, S) => {
    const d = p / g, m = h / S;
    let y = 1 / 0, w = { x: 0, y: 0 };
    for (let b = 0; b < l; b++) {
      const _ = c + b * 1e3, T = N(_), C = T() * t * 2 - t, A = T() * t * 2 - t, U = Math.sqrt((d - (C + t) / (t * 2)) ** 2 + (m - (A + t) / (t * 2)) ** 2);
      U < y && (y = U, w = { x: C, y: A });
    }
    const f = d * a + i.x, v = m * a + i.y, x = qe(f, v, 0.2), P = q(x.x, x.y) * u, D = w.x + P, F = w.y + q(x.x + 100, x.y + 100) * u;
    if (r)
      return [D, F, 0, 1];
    {
      const b = O(x.x + 200, x.y + 200, 3, 2, 0.5) * t * 0.5;
      return [D, F, b, 1];
    }
  });
}
function wn(o, e, n = {}) {
  const {
    bounds: t = 2,
    is2D: r = !1,
    noiseScale: a = 0.1,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    numWaves: l = 3,
    waveAmplitude: u = 0.5
  } = n, p = N(c);
  return V(o, e, (h, g, S, d) => {
    const m = h / S, y = g / d;
    let w = 0, f = 0;
    for (let b = 0; b < l; b++) {
      const _ = (b + 1) * 2, T = p() * Math.PI * 2;
      w += Math.sin(y * _ + T) * u, f += Math.cos(m * _ + T) * u;
    }
    const v = m * a + i.x, x = y * a + i.y, P = q(v, x) * 0.3, D = m * t * 2 - t + w + P, F = y * t * 2 - t + f + q(v + 100, x + 100) * 0.3;
    if (r)
      return [D, F, 0, 1];
    {
      const b = O(v + 200, x + 200, 3, 2, 0.5) * t * 0.5;
      return [D, F, b, 1];
    }
  });
}
function bn(o, e, n, t = {}) {
  const {
    bounds: r = 2,
    is2D: a = !1,
    noiseScale: c = 0.1,
    seed: i = Math.random() * 1e3,
    noiseOffset: l = { x: 0, y: 0, z: 0 },
    distance: u = 5
  } = t;
  return V(o, e, (p, h, g, S) => {
    const d = p / g, m = h / S, y = d * 2 - 1, w = m * 2 - 1;
    let f, v, x;
    if (n instanceof s.PerspectiveCamera) {
      const b = n.aspect, _ = n.fov * Math.PI / 180, T = 2 * u * Math.tan(_ / 2), C = T * b;
      f = y * C / 2, v = w * T / 2, x = u;
    } else if (n instanceof s.OrthographicCamera) {
      const b = n.left, _ = n.right, T = n.top, C = n.bottom;
      f = b + (_ - b) * d, v = C + (T - C) * m, x = u;
    } else
      f = y * r, v = w * r, x = u;
    const P = d * c + l.x, D = m * c + l.y, F = q(P, D) * 0.2;
    return f += F, v += q(P + 100, D + 100) * 0.2, a ? [f, v, 0, 1] : (x += O(P + 200, D + 200, 3, 2, 0.5) * r * 0.3, [f, v, x, 1]);
  });
}
function Sn(o, e, n) {
  const { width: t, height: r } = ne(e), a = t * r, c = new Float32Array(a * 4);
  for (let l = 0; l < e; l++) {
    const u = l * 3, p = l * 4;
    c[p + 0] = o[u + 0], c[p + 1] = o[u + 1], c[p + 2] = o[u + 2], c[p + 3] = n ? n[l] : 1;
  }
  for (let l = e; l < a; l++) {
    const u = l * 4;
    c[u + 0] = 0, c[u + 1] = 0, c[u + 2] = 0, c[u + 3] = 0;
  }
  const i = new s.DataTexture(
    c,
    t,
    r,
    s.RGBAFormat,
    s.FloatType
  );
  return i.minFilter = s.NearestFilter, i.magFilter = s.NearestFilter, i.wrapS = s.ClampToEdgeWrapping, i.wrapT = s.ClampToEdgeWrapping, i.needsUpdate = !0, { texture: i, width: t, height: r };
}
function zn(o, e) {
  const { width: n, height: t } = ne(e), r = n * t, a = new Float32Array(r * 4);
  for (let i = 0; i < e; i++) {
    const l = i * 3, u = i * 4;
    a[u + 0] = o[l + 0], a[u + 1] = o[l + 1], a[u + 2] = o[l + 2], a[u + 3] = 1;
  }
  for (let i = e; i < r; i++) {
    const l = i * 4;
    a[l + 0] = 0, a[l + 1] = 1, a[l + 2] = 0, a[l + 3] = 1;
  }
  const c = new s.DataTexture(
    a,
    n,
    t,
    s.RGBAFormat,
    s.FloatType
  );
  return c.minFilter = s.NearestFilter, c.magFilter = s.NearestFilter, c.wrapS = s.ClampToEdgeWrapping, c.wrapT = s.ClampToEdgeWrapping, c.needsUpdate = !0, { texture: c, width: n, height: t };
}
function Tn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 }
  } = n;
  return V(o, e, (l, u, p, h) => {
    const g = l / p, S = u / h, d = g * a + i.x, m = S * a + i.y, y = q(d, m) * t, w = q(d + 100, m + 100) * t;
    if (r)
      return [y, w, 0, 1];
    {
      const f = q(d + 200, m + 200) * t;
      return [y, w, f, 1];
    }
  });
}
function Pn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 }
  } = n;
  return V(o, e, (l, u, p, h) => {
    const g = l / p, S = u / h, d = g * a + i.x, m = S * a + i.y, y = 0.01, w = q(d, m), f = q(d + y, m), v = q(d, m + y), x = -(f - w) / y * t, P = -(v - w) / y * t;
    if (r)
      return [x, P, 0, 1];
    {
      const D = q(d + 200, m + 200) * t * 0.5;
      return [x, P, D, 1];
    }
  });
}
function Cn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    numCenters: l = 3,
    rotationStrength: u = 1
  } = n;
  return V(o, e, (p, h, g, S) => {
    const d = p / g, m = h / S, y = d * 4 - 2, w = m * 4 - 2;
    let f = 0, v = 0;
    for (let b = 0; b < l; b++) {
      const _ = c + b * 1e3, T = N(_), C = T() * 4 - 2, A = T() * 4 - 2, U = y - C, I = w - A, M = Math.sqrt(U * U + I * I);
      if (M > 0.01) {
        const R = u * Math.exp(-M * 2);
        f += -I / M * R, v += U / M * R;
      }
    }
    const x = d * a + i.x, P = m * a + i.y, D = q(x, P) * t * 0.3, F = q(x + 100, P + 100) * t * 0.3;
    if (f = (f + D) * t, v = (v + F) * t, r)
      return [f, v, 0, 1];
    {
      const b = q(x + 200, P + 200) * t * 0.5;
      return [f, v, b, 1];
    }
  });
}
function qn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    numCenters: l = 2,
    radialStrength: u = 1
  } = n;
  return V(o, e, (p, h, g, S) => {
    const d = p / g, m = h / S, y = d * 4 - 2, w = m * 4 - 2;
    let f = 0, v = 0;
    for (let b = 0; b < l; b++) {
      const _ = c + b * 1e3, T = N(_), C = T() * 4 - 2, A = T() * 4 - 2, U = y - C, I = w - A, M = Math.sqrt(U * U + I * I);
      if (M > 0.01) {
        const R = u * Math.exp(-M * 1.5);
        f += U / M * R, v += I / M * R;
      }
    }
    const x = d * a + i.x, P = m * a + i.y, D = q(x, P) * t * 0.2, F = q(x + 100, P + 100) * t * 0.2;
    if (f = (f + D) * t, v = (v + F) * t, r)
      return [f, v, 0, 1];
    {
      const b = q(x + 200, P + 200) * t * 0.3;
      return [f, v, b, 1];
    }
  });
}
function Dn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    turbulenceIntensity: l = 1,
    turbulenceOctaves: u = 4
  } = n;
  return V(o, e, (p, h, g, S) => {
    const d = p / g, m = h / S, y = d * a + i.x, w = m * a + i.y, f = O(y, w, u, 2, 0.5) * t * l, v = O(y + 100, w + 100, u, 2, 0.5) * t * l;
    if (r)
      return [f, v, 0, 1];
    {
      const x = O(y + 200, w + 200, u, 2, 0.5) * t * l;
      return [f, v, x, 1];
    }
  });
}
function Fn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    numWaves: l = 3,
    waveFrequency: u = 2
  } = n, p = N(c);
  return V(o, e, (h, g, S, d) => {
    const m = h / S, y = g / d;
    let w = 0, f = 0;
    for (let F = 0; F < l; F++) {
      const b = p() * Math.PI * 2, _ = u * (F + 1);
      f += Math.sin(m * _ + b) * t * 0.5, w += Math.cos(y * _ + b) * t * 0.5;
    }
    const v = m * a + i.x, x = y * a + i.y, P = q(v, x) * t * 0.3, D = q(v + 100, x + 100) * t * 0.3;
    if (w = (w + P) * t, f = (f + D) * t, r)
      return [w, f, 0, 1];
    {
      const F = q(v + 200, x + 200) * t * 0.4;
      return [w, f, F, 1];
    }
  });
}
function Mn(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    numPoints: l = 2,
    convergenceStrength: u = 1
  } = n;
  return V(o, e, (p, h, g, S) => {
    const d = p / g, m = h / S, y = d * 4 - 2, w = m * 4 - 2;
    let f = 0, v = 0;
    for (let b = 0; b < l; b++) {
      const _ = c + b * 1e3, T = N(_), C = T() * 4 - 2, A = T() * 4 - 2, U = C - y, I = A - w, M = Math.sqrt(U * U + I * I);
      if (M > 0.01) {
        const R = u * Math.exp(-M * 1);
        f += U / M * R, v += I / M * R;
      }
    }
    const x = d * a + i.x, P = m * a + i.y, D = q(x, P) * t * 0.2, F = q(x + 100, P + 100) * t * 0.2;
    if (f = (f + D) * t, v = (v + F) * t, r)
      return [f, v, 0, 1];
    {
      const b = q(x + 200, P + 200) * t * 0.3;
      return [f, v, b, 1];
    }
  });
}
function _n(o, e, n = {}) {
  const {
    maxSpeed: t = 0.5,
    is2D: r = !1,
    noiseScale: a = 0.05,
    seed: c = Math.random() * 1e3,
    noiseOffset: i = { x: 0, y: 0, z: 0 },
    patterns: l = [
      { type: "flow", weight: 0.4 },
      { type: "rotational", weight: 0.3 },
      { type: "turbulent", weight: 0.3 }
    ]
  } = n;
  return V(o, e, (u, p, h, g) => {
    const S = u / h, d = p / g;
    let m = 0, y = 0, w = 0, f = 0;
    return l.forEach((v, x) => {
      const P = c + x * 1e3, D = N(P);
      let F = 0, b = 0, _ = 0;
      switch (v.type) {
        case "flow": {
          const T = S * a + i.x, C = d * a + i.y;
          F = q(T, C) * t, b = q(T + 100, C + 100) * t, r || (_ = q(T + 200, C + 200) * t);
          break;
        }
        case "rotational": {
          const T = S * 4 - 2, C = d * 4 - 2, A = D() * 4 - 2, U = D() * 4 - 2, I = T - A, M = C - U, R = Math.sqrt(I * I + M * M);
          if (R > 0.01) {
            const G = Math.exp(-R * 2);
            F = -M / R * G * t, b = I / R * G * t;
          }
          break;
        }
        case "turbulent": {
          const T = S * a + i.x, C = d * a + i.y;
          F = O(T, C, 4, 2, 0.5) * t, b = O(T + 100, C + 100, 4, 2, 0.5) * t, r || (_ = O(T + 200, C + 200, 4, 2, 0.5) * t);
          break;
        }
        case "wave": {
          const C = D() * Math.PI * 2;
          F = Math.cos(d * 2 + C) * t * 0.5, b = Math.sin(S * 2 + C) * t * 0.5;
          break;
        }
        case "radial": {
          const T = S * 4 - 2, C = d * 4 - 2, A = D() * 4 - 2, U = D() * 4 - 2, I = T - A, M = C - U, R = Math.sqrt(I * I + M * M);
          if (R > 0.01) {
            const G = Math.exp(-R * 1.5);
            F = I / R * G * t, b = M / R * G * t;
          }
          break;
        }
        case "convergent": {
          const T = S * 4 - 2, C = d * 4 - 2, A = D() * 4 - 2, U = D() * 4 - 2, I = A - T, M = U - C, R = Math.sqrt(I * I + M * M);
          if (R > 0.01) {
            const G = Math.exp(-R * 1);
            F = I / R * G * t, b = M / R * G * t;
          }
          break;
        }
      }
      m += F * v.weight, y += b * v.weight, w += _ * v.weight, f += v.weight;
    }), f > 0 && (m /= f, y /= f, w /= f), r ? [m, y, 0, 1] : [m, y, w, 1];
  });
}
function De(o, e, n, t, r) {
  if (o instanceof s.Box3) {
    const g = o, S = e ?? 16711680, d = g.getSize(new s.Vector3()), m = g.getCenter(new s.Vector3());
    return De(d.x, d.y, d.z, S, m);
  }
  if (typeof e == "number" && typeof n == "number") {
    const g = o, S = e, d = n, m = t ?? 65280, y = r ?? new s.Vector3(0, 0, 0), w = new s.BoxGeometry(g, S, d), f = new s.EdgesGeometry(w), v = new s.LineBasicMaterial({ color: m }), x = new s.LineSegments(f, v);
    return x.position.copy(y), x;
  }
  const a = o, c = e ?? 65280, i = n instanceof s.Vector3 ? n : new s.Vector3(0, 0, 0), l = new s.BoxGeometry(a, a, a), u = new s.EdgesGeometry(l), p = new s.LineBasicMaterial({ color: c }), h = new s.LineSegments(u, p);
  return h.position.copy(i), h;
}
function Fe(o = 0.2) {
  const e = new s.BufferGeometry(), n = [], t = [], r = [];
  return n.push(
    0,
    0.5,
    0,
    -0.5,
    -0.5,
    0,
    0,
    -0.5 + o,
    0,
    0.5,
    -0.5,
    0
  ), t.push(
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
  ), e.setAttribute("position", new s.Float32BufferAttribute(n, 3)), e.setAttribute("uv", new s.Float32BufferAttribute(t, 2)), e.setIndex(r), e.computeVertexNormals(), e;
}
function In() {
  return Fe(0.2);
}
function Rn(o, e = 0) {
  const t = new s.Matrix4().multiplyMatrices(
    o.projectionMatrix,
    o.matrixWorldInverse
  ).elements, r = (i, l) => t[l * 4 + i], a = new s.Matrix3().set(
    r(0, 0),
    r(0, 1),
    r(0, 2) * e + r(0, 3),
    r(1, 0),
    r(1, 1),
    r(1, 2) * e + r(1, 3),
    r(3, 0),
    r(3, 1),
    r(3, 2) * e + r(3, 3)
  ), c = a.determinant();
  return Math.abs(c) < 1e-8 ? null : new s.Matrix3().copy(a).invert();
}
var Me = `uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy ) / uResolution.xy;
  gl_FragColor = vec4(uv, 0.0, 1.0);
}`, _e = `float circleSDF(vec2 uv, float r) {
  return length(uv) - r;
}

vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

mat4 rotationAxisAngle( vec3 v, float angle )
{
    float s = sin( angle );
    float c = cos( angle );
    float ic = 1.0 - c;

    return mat4( v.x*v.x*ic + c,     v.y*v.x*ic - s*v.z, v.z*v.x*ic + s*v.y, 0.0,
                 v.x*v.y*ic + s*v.z, v.y*v.y*ic + c,     v.z*v.y*ic - s*v.x, 0.0,
                 v.x*v.z*ic - s*v.y, v.y*v.z*ic + s*v.x, v.z*v.z*ic + c,     0.0,
			     0.0,                0.0,                0.0,                1.0 );
}`, Ie = `float easeLinear(float t) {
  return t;
}

float easeInQuad(float t) {
  return t * t;
}

float easeOutQuad(float t) {
  return 1.0 - (1.0 - t) * (1.0 - t);
}

float easeInOutQuad(float t) {
  return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;
}

float easeInCubic(float t) {
  return t * t * t;
}

float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float easeInQuart(float t) {
  return t * t * t * t;
}

float easeOutQuart(float t) {
  return 1.0 - pow(1.0 - t, 4.0);
}

float easeInOutQuart(float t) {
  return t < 0.5 ? 8.0 * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 4.0) / 2.0;
}

float easeInQuint(float t) {
  return t * t * t * t * t;
}

float easeOutQuint(float t) {
  return 1.0 - pow(1.0 - t, 5.0);
}

float easeInOutQuint(float t) {
  return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 5.0) / 2.0;
}

float easeInSine(float t) {
  return 1.0 - cos((t * 3.14159265359) / 2.0);
}

float easeOutSine(float t) {
  return sin((t * 3.14159265359) / 2.0);
}

float easeInOutSine(float t) {
  return -(cos(3.14159265359 * t) - 1.0) / 2.0;
}

float easeInExpo(float t) {
  return t == 0.0 ? 0.0 : pow(2.0, 10.0 * (t - 1.0));
}

float easeOutExpo(float t) {
  return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

float easeInOutExpo(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return t < 0.5 ? pow(2.0, 20.0 * t - 10.0) / 2.0 : (2.0 - pow(2.0, -20.0 * t + 10.0)) / 2.0;
}

float easeInCirc(float t) {
  return 1.0 - sqrt(1.0 - pow(t, 2.0));
}

float easeOutCirc(float t) {
  return sqrt(1.0 - pow(t - 1.0, 2.0));
}

float easeInOutCirc(float t) {
  return t < 0.5 ? (1.0 - sqrt(1.0 - pow(2.0 * t, 2.0))) / 2.0 : (sqrt(1.0 - pow(-2.0 * t + 2.0, 2.0)) + 1.0) / 2.0;
}

float easeInBack(float t) {
  const float c1 = 1.70158;
  const float c3 = c1 + 1.0;
  return c3 * t * t * t - c1 * t * t;
}

float easeOutBack(float t) {
  const float c1 = 1.70158;
  const float c3 = c1 + 1.0;
  return 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0);
}

float easeInOutBack(float t) {
  const float c1 = 1.70158;
  const float c2 = c1 * 1.525;
  return t < 0.5 ? (pow(2.0 * t, 2.0) * ((c2 + 1.0) * 2.0 * t - c2)) / 2.0 : (pow(2.0 * t - 2.0, 2.0) * ((c2 + 1.0) * (t * 2.0 - 2.0) + c2) + 2.0) / 2.0;
}

float easeInElastic(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return -pow(2.0, 10.0 * t - 10.0) * sin((t * 10.0 - 10.75) * (2.0 * 3.14159265359) / 3.0);
}

float easeOutElastic(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return pow(2.0, -10.0 * t) * sin((t * 10.0 - 0.75) * (2.0 * 3.14159265359) / 3.0) + 1.0;
}

float easeInOutElastic(float t) {
  if (t == 0.0) return 0.0;
  if (t == 1.0) return 1.0;
  return t < 0.5 ? -(pow(2.0, 20.0 * t - 10.0) * sin((20.0 * t - 11.125) * (2.0 * 3.14159265359) / 4.5)) / 2.0 : (pow(2.0, -20.0 * t + 10.0) * sin((20.0 * t - 11.125) * (2.0 * 3.14159265359) / 4.5)) / 2.0 + 1.0;
}

float easeOutBounce(float t) {
  const float n1 = 7.5625;
  const float d1 = 2.75;
  
  if (t < 1.0 / d1) {
    return n1 * t * t;
  } else if (t < 2.0 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

float easeInBounce(float t) {
  return 1.0 - easeOutBounce(1.0 - t);
}

float easeInOutBounce(float t) {
  return t < 0.5 ? (1.0 - easeOutBounce(1.0 - 2.0 * t)) / 2.0 : (1.0 + easeOutBounce(2.0 * t - 1.0)) / 2.0;
}`, Re = `vec3 toroidalDelta(vec3 cur, vec3 prev, vec3 bounds) {
  vec3 d = cur - prev;
  vec3 halfB = bounds * 0.5;
  if (d.x >  halfB.x) d.x -= bounds.x; else if (d.x < -halfB.x) d.x += bounds.x;
  if (d.y >  halfB.y) d.y -= bounds.y; else if (d.y < -halfB.y) d.y += bounds.y;
  if (d.z >  halfB.z) d.z -= bounds.z; else if (d.z < -halfB.z) d.z += bounds.z;
  return d;
}

vec3 wrapHysteresis(vec3 p, vec3 innerBounds, float margin) {
  vec3 innerHalf = innerBounds * 0.5;
  vec3 outerHalf = innerHalf * (1.0 + margin);
  const float eps = 0.001;
  if (p.x < -outerHalf.x)      p.x =  outerHalf.x - eps;
  else if (p.x >  outerHalf.x) p.x = -outerHalf.x + eps;
  if (p.y < -outerHalf.y)      p.y =  outerHalf.y - eps;
  else if (p.y >  outerHalf.y) p.y = -outerHalf.y + eps;
  if (p.z < -outerHalf.z)      p.z =  outerHalf.z - eps;
  else if (p.z >  outerHalf.z) p.z = -outerHalf.z + eps;
  return p;
}

float edgeFactorWithinBounds(vec3 pos, vec3 bounds, float wrapMargin) {
  vec3 innerHalf = 0.5 * bounds;
  vec3 outerHalf = innerHalf * (1.0 + wrapMargin);
  vec3 ap = abs(pos);
  vec3 over = max(ap - innerHalf, 0.0);
  vec3 span = max(outerHalf - innerHalf, vec3(1e-6));
  vec3 t = clamp(over / span, 0.0, 1.0);
  return 1.0 - max(max(t.x, t.y), t.z);
}`, Ee = `#define PI 3.14159265358979323846
#define TAU 6.28318530717958647692

float bumpSine(float x) {
    x = clamp(x, 0.0, 1.0);
    return sin(PI * x);
}

float bumpCirc(float x) {
    x = clamp(x, 0.0, 1.0);
    float u = 2.0 * x - 1.0;          
    return sqrt(max(0.0, 1.0 - u*u)); 
}

float bumpTriangle(float x) {
    x = clamp(x, 0.0, 1.0);
    return 1.0 - abs(2.0 * x - 1.0);
}`, Ue = `precision highp float;

varying vec2 vUv;

uniform sampler2D uInput;
uniform vec2 uTexelSize; 

void main() {
  vec2 d = vec2(uTexelSize.x, 0.0);
  vec4 sum = vec4(0.0);
  sum += texture2D(uInput, vUv + d * -4.0) * 0.05;
  sum += texture2D(uInput, vUv + d * -3.0) * 0.09;
  sum += texture2D(uInput, vUv + d * -2.0) * 0.12;
  sum += texture2D(uInput, vUv + d * -1.0) * 0.15;
  sum += texture2D(uInput, vUv)             * 0.16;
  sum += texture2D(uInput, vUv + d *  1.0) * 0.15;
  sum += texture2D(uInput, vUv + d *  2.0) * 0.12;
  sum += texture2D(uInput, vUv + d *  3.0) * 0.09;
  sum += texture2D(uInput, vUv + d *  4.0) * 0.05;
  gl_FragColor = sum;
}`, Be = `precision highp float;

varying vec2 vUv;

uniform sampler2D uInput;
uniform vec2 uTexelSize; 

void main() {
  vec2 d = vec2(0.0, uTexelSize.y);
  vec4 sum = vec4(0.0);
  sum += texture2D(uInput, vUv + d * -4.0) * 0.05;
  sum += texture2D(uInput, vUv + d * -3.0) * 0.09;
  sum += texture2D(uInput, vUv + d * -2.0) * 0.12;
  sum += texture2D(uInput, vUv + d * -1.0) * 0.15;
  sum += texture2D(uInput, vUv)             * 0.16;
  sum += texture2D(uInput, vUv + d *  1.0) * 0.15;
  sum += texture2D(uInput, vUv + d *  2.0) * 0.12;
  sum += texture2D(uInput, vUv + d *  3.0) * 0.09;
  sum += texture2D(uInput, vUv + d *  4.0) * 0.05;
  gl_FragColor = sum;
}`, Ae = `precision highp float;

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
    
    
    
    
    vec4 s; float d; float dw; float w;
    float depthThreshSq = uDepthThreshold * uDepthThreshold + 0.0001;
    
    
    s = texture2D(uInput, vUv + dir * -4.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.05 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * -3.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.09 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * -2.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.12 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * -1.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.15 * dw;
    colorSum += s * w; weightSum += w;
    
    
    d = 0.0;  
    dw = 1.0;
    w = 0.16 * dw;
    colorSum += centerSample * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 1.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.15 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 2.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.12 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 3.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.09 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 4.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.05 * dw;
    colorSum += s * w; weightSum += w;
    
    
    gl_FragColor = colorSum / max(weightSum, 0.0001);
}`, Oe = `precision highp float;

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
    
    vec2 dir = vec2(0.0, uTexelSize.y * uBlurScale);
    
    
    
    
    vec4 s; float d; float dw; float w;
    float depthThreshSq = uDepthThreshold * uDepthThreshold + 0.0001;
    
    
    s = texture2D(uInput, vUv + dir * -4.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.05 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * -3.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.09 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * -2.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.12 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * -1.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.15 * dw;
    colorSum += s * w; weightSum += w;
    
    
    d = 0.0;  
    dw = 1.0;
    w = 0.16 * dw;
    colorSum += centerSample * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 1.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.15 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 2.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.12 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 3.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.09 * dw;
    colorSum += s * w; weightSum += w;
    
    
    s = texture2D(uInput, vUv + dir * 4.0);
    d = abs(s.a - centerDepth);
    dw = exp(-d * d / depthThreshSq);
    w = 0.05 * dw;
    colorSum += s * w; weightSum += w;
    
    
    gl_FragColor = colorSum / max(weightSum, 0.0001);
}`, Ve = `attribute vec2 instUv;       
uniform sampler2D uPositionTex;
uniform float quadSize;   

varying vec2 vUv;
varying vec2 vQuadUv;
varying float vAlive;  

void main() {
  
  vec4 posData = texture2D(uPositionTex, instUv);
  vec3 pos = posData.xyz;
  vAlive = posData.w;  

  
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  
  vec2 offset = position.xy * quadSize * mvPos.w;

  mvPos.xy += offset;

  
  gl_Position = projectionMatrix * mvPos;

  
  vUv = instUv;
  vQuadUv = uv;
}`, Le = `attribute vec2 instUv; 

uniform sampler2D uPositionTex;
uniform sampler2D uPrevPositionTex;
uniform float quadSize; 
uniform float stretchFactor; 
uniform float squashFactor; 
uniform float uTime;

varying vec2 vUv;

void main() {
  vec3 curPos = texture2D(uPositionTex, instUv).xyz;
  vec3 prevPos = texture2D(uPrevPositionTex, instUv).xyz;
  vec3 Vcur = (modelViewMatrix * vec4(curPos,1.)).xyz;
  vec3 Vprev = (modelViewMatrix * vec4(prevPos,1.)).xyz;

  
  vec3 motion = Vcur - Vprev;
  float speed = length(motion);
  vec3 mDir = speed > 1e-6 ? motion/speed : vec3(0,1,0);

  
  vec3 normal = normalize(-Vcur);
  vec3 upUn = mDir - normal * dot(mDir, normal);
  vec3 up = length(upUn) > 1e-6 ? normalize(upUn) : vec3(0,1,0);
  vec3 right = normalize(cross(normal, up));

  
  vec4 mvPos = vec4(Vcur, 1.0);
  float halfSz = quadSize * mvPos.w;
  float stretch = 1.0 + speed * stretchFactor;
  float invStretch = 1.0 / stretch;
  float squash = mix(1.0, invStretch, squashFactor);

  
  vec3 offset = right*(position.x * halfSz * squash) + up*(position.y * halfSz * stretch);
  mvPos.xyz += offset;
  gl_Position = projectionMatrix * mvPos;

  vUv = position.xy + 0.5; 
}`, ke = `attribute vec2 instUv; 

uniform sampler2D uPositionTex;
uniform sampler2D uVelocityTex;
uniform float quadSize; 
uniform float stretchFactor; 
uniform float squashFactor; 
uniform float speedMin; 
uniform float speedMax; 
uniform float useSpeedVariation; 
uniform float uTime;

varying vec2 vUv;

void main() {
  vec3 curPos = texture2D(uPositionTex, instUv).xyz;
  vec3 velocity = texture2D(uVelocityTex, instUv).xyz;
  vec3 Vcur = (modelViewMatrix * vec4(curPos,1.)).xyz;

  
  float speed = length(velocity);
  vec3 mDir = speed > 1e-6 ? normalize(velocity) : vec3(0,1,0);
  
  
  vec3 mDirView = normalize((modelViewMatrix * vec4(mDir, 0.0)).xyz);

  
  vec3 normal = normalize(-Vcur);
  vec3 upUn = mDirView - normal * dot(mDirView, normal);
  vec3 up = length(upUn) > 1e-6 ? normalize(upUn) : vec3(0,1,0);
  vec3 right = normalize(cross(normal, up));

  
  vec4 mvPos = vec4(Vcur, 1.0);
  float halfSz = quadSize * mvPos.w;
  
  
  float effectAmount = 0.0;
  
  if (useSpeedVariation > 0.5) {
    
    if (speed > speedMin) {
      float speedRange = speedMax - speedMin;
      if (speedRange > 0.0) {
        effectAmount = clamp((speed - speedMin) / speedRange, 0.0, 1.0);
      }
    }
  } else {
    
    effectAmount = speed > 0.01 ? 1.0 : 0.0;
  }
  
  float stretchAmount = effectAmount * stretchFactor;
  float stretch = 1.0 + stretchAmount;
  
  float squashAmount = effectAmount * squashFactor;
  float invStretch = 1.0 / stretch;
  float squash = mix(1.0, invStretch, squashAmount);

  
  vec3 offset = right*(position.x * halfSz * squash) + up*(position.y * halfSz * stretch);
  mvPos.xyz += offset;
  gl_Position = projectionMatrix * mvPos;

  vUv = position.xy + 0.5; 
}`, Ne = `#define PI 3.14159265358979323846
#define TAU 6.28318530717958647692

float bumpSine(float x) {
    x = clamp(x, 0.0, 1.0);
    return sin(PI * x);
}

float bumpCirc(float x) {
    x = clamp(x, 0.0, 1.0);
    float u = 2.0 * x - 1.0;          
    return sqrt(max(0.0, 1.0 - u*u)); 
}

float bumpTriangle(float x) {
    x = clamp(x, 0.0, 1.0);
    return 1.0 - abs(2.0 * x - 1.0);
}

attribute vec2 instUv;       
uniform sampler2D uPositionTex;
uniform float quadSize;   

varying vec2 vUv;
varying vec2 vQuadUv;

void main() {
  
  vec4 posData = texture2D(uPositionTex, instUv);
  vec3 pos = posData.xyz;
  float life = posData.w;

  
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  float lifeScale = bumpSine(life);
  float scaledQuadSize = quadSize * lifeScale;

  
  vec2 offset = position.xy * scaledQuadSize * mvPos.w;

  mvPos.xy += offset;

  
  gl_Position = projectionMatrix * mvPos;

  
  vUv = instUv;
  vQuadUv = uv;
}`, Ge = `float circleAlpha(vec2 uv, float softEdge) {
  vec2 center = uv * 2.0 - 1.0;
  float d = length(center);
  float a = 1.0 - clamp((d - (1.0 - softEdge)) / softEdge, 0.0, 1.0);
  return a;
}

void alphaTestDiscard(float alpha, float threshold) {
  if (alpha < threshold) discard;
}

#ifdef ENABLE_ALPHA_TEST
  #define ALPHA_TEST(alpha, threshold) if ((alpha) < (threshold)) discard;
#else
  #define ALPHA_TEST(alpha, threshold)
#endif`, We = `varying vec2 vUv;
varying vec2 vQuadUv;
void main() {
  
  
  gl_FragColor = vec4(vQuadUv, 0.0, 1.0);
}`, Ye = `uniform vec3 uColorAlive;
uniform vec3 uColorDead;

varying float vAlive;

void main() {
  vec3 color = mix(uColorDead, uColorAlive, vAlive);
  gl_FragColor = vec4(color, 1.0);
}`, Xe = `precision highp float;

uniform sampler2D uPositionTex; 
varying vec2 vUv;               
varying vec2 vQuadUv;           

uniform float uSmoothFrom;      
uniform float uSmoothTo;        

void main() {
  float life = texture2D(uPositionTex, vUv).w;
  if (life <= 0.0) discard;     
  
  
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vQuadUv, center);
  float radius = 0.5;
  
  
  
  float edge = smoothstep(uSmoothFrom * radius, uSmoothTo * radius, dist);
  float alpha = 1.0 - edge;
  
  
  alpha *= life;
  
  
  vec3 color = vec3(1.0, 1.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}`, He = `uniform sampler2D uVelocityTex;
uniform float speedMin;
uniform float speedMax;
uniform float useSpeedVariation;

varying vec2 vUv;

void main() {
  
  vec3 velocity = texture2D(uVelocityTex, vUv).xyz;
  float speed = length(velocity);
  
  vec3 color;
  
  if (useSpeedVariation > 0.5) {
    
    float normalizedSpeed = clamp((speed - speedMin) / (speedMax - speedMin), 0.0, 1.0);
    color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), normalizedSpeed);
  } else {
    
    if (speed > 0.01) {
      color = vec3(0.0, 0.8, 1.0); 
    } else {
      color = vec3(1.0, 0.0, 0.0); 
    }
  }
  
  
  float alpha = 0.7 + 0.3 * clamp(speed, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}`, $e = `#ifndef GLCORE_NOISE_COMMON_GLSL
#define GLCORE_NOISE_COMMON_GLSL

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }

vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

#endif`, je = `#ifndef GLCORE_NOISE_PERLIN_GLSL
#define GLCORE_NOISE_PERLIN_GLSL

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float pnoise(vec2 P)
{
  vec2 Pi = floor(P);
  vec2 Pf = P - Pi;
  vec2 f = fade(Pf);

  
  vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x,     Pi.x + 1.0);
  vec4 iy = vec4(Pi.y, Pi.y,       Pi.y + 1.0, Pi.y + 1.0);

  vec4 i  = permute(permute(ix) + iy);

  
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);

  float n00 = dot(g00, Pf);
  float n10 = dot(g10, Pf - vec2(1.0, 0.0));
  float n01 = dot(g01, Pf - vec2(0.0, 1.0));
  float n11 = dot(g11, Pf - vec2(1.0, 1.0));

  float nx0 = mix(n00, n10, f.x);
  float nx1 = mix(n01, n11, f.x);
  float nxy = mix(nx0, nx1, f.y);
  return 2.3 * nxy; 
}

float pnoise(vec3 P)
{
  vec3 Pi = floor(P);
  vec3 Pf = P - Pi;
  vec3 f = fade(Pf);

  
  vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x,     Pi.x + 1.0);
  vec4 iy = vec4(Pi.y, Pi.y,       Pi.y + 1.0, Pi.y + 1.0);
  vec4 iz0 = vec4(Pi.z);
  vec4 iz1 = vec4(Pi.z + 1.0);

  vec4 i0 = permute(permute(permute(ix) + iy) + iz0);
  vec4 i1 = permute(permute(permute(ix) + iy) + iz1);

  
  vec4 gx0 = fract(i0 * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy0 = abs(gx0) - 0.5;
  vec4 gz0 = 1.5 - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);

  vec4 gx1 = fract(i1 * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy1 = abs(gx1) - 0.5;
  vec4 gz1 = 1.5 - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  float n000 = dot(g000, Pf);
  float n100 = dot(g100, Pf - vec3(1.0, 0.0, 0.0));
  float n010 = dot(g010, Pf - vec3(0.0, 1.0, 0.0));
  float n110 = dot(g110, Pf - vec3(1.0, 1.0, 0.0));
  float n001 = dot(g001, Pf - vec3(0.0, 0.0, 1.0));
  float n101 = dot(g101, Pf - vec3(1.0, 0.0, 1.0));
  float n011 = dot(g011, Pf - vec3(0.0, 1.0, 1.0));
  float n111 = dot(g111, Pf - vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);

  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);

  float nxyz = mix(nxy0, nxy1, f.z);
  return 2.2 * nxyz; 
}

#endif`, Qe = `#ifndef GLCORE_NOISE_SIMPLEX_GLSL
#define GLCORE_NOISE_SIMPLEX_GLSL

float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec2 v)
{
  const vec4 C = vec4(0.211324865405187,  
                      0.366025403784439,  
                     -0.577350269189626,  
                      0.024390243902439); 
  
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  
  
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.y  = a0.y * x12.x + h.y * x12.y;
  g.z  = a0.z * x12.z + h.z * x12.w;
  return 130.0 * dot(m, g);
}

float snoise(vec3 v)
{
  const vec2  C  = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4  D  = vec4(0.0, 0.5, 1.0, 2.0);

  
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);    

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

#endif`, Ze = `#ifndef GLCORE_NOISE_WORLEY_GLSL
#define GLCORE_NOISE_WORLEY_GLSL

vec3 hash3(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return fract(sin(p) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  p = vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  );
  return fract(sin(p) * 43758.5453123);
}

vec2 worley2D(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);

  float F1 = 8.0;
  float F2 = 8.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      vec2 r = g - f + o;
      float d = dot(r, r);

      if (d < F1) {
        F2 = F1;
        F1 = d;
      } else if (d < F2) {
        F2 = d;
      }
    }
  }

  return vec2(sqrt(F1), sqrt(F2));
}

vec2 worley3D(vec3 p) {
  vec3 n = floor(p);
  vec3 f = fract(p);

  float F1 = 8.0;
  float F2 = 8.0;

  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash3(n + g);
        vec3 r = g - f + o;
        float d = dot(r, r);

        if (d < F1) {
          F2 = F1;
          F1 = d;
        } else if (d < F2) {
          F2 = d;
        }
      }
    }
  }

  return vec2(sqrt(F1), sqrt(F2));
}

float worley(vec2 p) {
  return worley2D(p).x;
}

float worley(vec3 p) {
  return worley3D(p).x;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

vec2 worley3DSmooth(vec3 p, float smoothness) {
  vec3 n = floor(p);
  vec3 f = fract(p);

  float F1 = 8.0;
  float F2 = 8.0;

  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash3(n + g);
        vec3 r = g - f + o;
        float d = dot(r, r);

        float newF1 = smin(F1, d, smoothness);
        if (newF1 < F1) {
          F2 = F1;
          F1 = newF1;
        } else {
          F2 = smin(F2, d, smoothness);
        }
      }
    }
  }

  return vec2(sqrt(F1), sqrt(F2));
}

#endif`, Ke = `#ifndef GLCORE_NOISE_FBM_GLSL
#define GLCORE_NOISE_FBM_GLSL

#if !defined(NOISE2) || !defined(NOISE3)
  
  
  float snoise(vec2);
  float snoise(vec3);
  #ifndef NOISE2
  #define NOISE2 snoise
  #endif
  #ifndef NOISE3
  #define NOISE3 snoise
  #endif
#endif

float fbm(vec2 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec2  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * NOISE2(pp);
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

float fbm(vec3 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec3  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * NOISE3(pp);
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

float fbm(vec2 p)
{
  return fbm(p, 6, 2.0, 0.5);
}

float fbm(vec3 p)
{
  return fbm(p, 6, 2.0, 0.5);
}

float fbmRidged(vec2 p, int octaves, float lacunarity, float gain, float offset)
{
  float sum = 0.0;
  float amp = 0.5;
  vec2  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    float n = NOISE2(pp);
    n = offset - abs(n);
    n *= n;
    sum += n * amp;
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum * 1.25; 
}

float fbmRidged(vec3 p, int octaves, float lacunarity, float gain, float offset)
{
  float sum = 0.0;
  float amp = 0.5;
  vec3  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    float n = NOISE3(pp);
    n = offset - abs(n);
    n *= n;
    sum += n * amp;
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum * 1.25;
}

float fbmTurbulence(vec2 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec2  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * abs(NOISE2(pp));
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

float fbmTurbulence(vec3 p, int octaves, float lacunarity, float gain)
{
  float sum = 0.0;
  float amp = 0.5;
  vec3  pp  = p;
  for (int i = 0; i < 32; i++) {
    if (i >= octaves) break;
    sum += amp * abs(NOISE3(pp));
    pp  *= lacunarity;
    amp *= gain;
  }
  return sum;
}

#endif`, Je = `attribute float aLocalY; 

attribute vec3 aStartPos;
attribute vec3 aEndPos;
attribute float aStartRadius;
attribute float aEndRadius;
attribute float aUvOffset;
attribute float aSegmentLength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vViewZ;

varying vec3 vCapsuleStart;
varying vec3 vCapsuleEnd;

void main() {
  
  vec3 axis = aEndPos - aStartPos;
  float len = length(axis);
  vec3 up = len > 0.0001 ? axis / len : vec3(0.0, 1.0, 0.0);

  
  vec3 notUp = abs(up.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, notUp));
  vec3 bitangent = cross(up, tangent);

  
  float r = mix(aStartRadius, aEndRadius, aLocalY);

  
  
  
  
  

  vec3 localPos = position;

  
  vec3 radialOffset = tangent * localPos.x * r + bitangent * localPos.z * r;

  
  
  
  
  vec3 axialPos;
  if (localPos.y < 0.0) {
    
    axialPos = aStartPos + up * (localPos.y * aStartRadius);
  } else if (localPos.y > 1.0) {
    
    axialPos = aEndPos + up * ((localPos.y - 1.0) * aEndRadius);
  } else {
    
    axialPos = mix(aStartPos, aEndPos, localPos.y);
  }

  vec3 worldPos = axialPos + radialOffset;

  
  
  vec3 localNormal = normal;
  vec3 worldNormal = normalize(
    tangent * localNormal.x + up * localNormal.y + bitangent * localNormal.z
  );

  
  
  
  vUv.x = uv.x;
  vUv.y = aUvOffset + uv.y * aSegmentLength;

  
  vNormal = worldNormal;
  vWorldPos = worldPos;
  
  
  vCapsuleStart = aStartPos;
  vCapsuleEnd = aEndPos;
  
  
  vec4 viewPos = modelViewMatrix * vec4(worldPos, 1.0);
  vViewZ = -viewPos.z; 

  gl_Position = projectionMatrix * viewPos;
}`, en = `uniform float uTileScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  
  vec2 scaledUv = vUv * uTileScale;

  
  float checker = mod(floor(scaledUv.x * 4.0) + floor(scaledUv.y), 2.0);

  
  vec3 colorA = vec3(1.0, 1.0, 1.0);
  vec3 colorB = vec3(0.0, 0.0, 0.0);
  vec3 baseColor = mix(colorA, colorB, checker);

  
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float ndotl = max(dot(normalize(vNormal), lightDir), 0.0);
  float ambient = 0.3;
  float lighting = ambient + (1.0 - ambient) * ndotl;

  vec3 finalColor = baseColor * lighting;

  gl_FragColor = vec4(finalColor, 1.0);
}`, nn = `uniform float uTileScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  
  float n_ = 0.142857142857; 
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  
  vec3 samplePos = vWorldPos * uTileScale;
  
  
  float noise = snoise(samplePos);
  float value = noise * 0.5 + 0.5;
  
  
  
  value = smoothstep(0.2, 0.8, value);
  
  
  vec3 baseColor = vec3(value);

  
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float ndotl = max(dot(normalize(vNormal), lightDir), 0.0);
  float ambient = 0.3;
  float lighting = ambient + (1.0 - ambient) * ndotl;

  vec3 finalColor = baseColor * lighting;

  gl_FragColor = vec4(finalColor, 1.0);
}`, tn = `uniform float uTileScale;
uniform float uFogNear;  
uniform float uFogFar;   
uniform vec3 uFogColor;  

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vViewZ;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  
  float n_ = 0.142857142857; 
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  
  vec3 samplePos = vWorldPos * uTileScale;
  
  
  float noise = snoise(samplePos);
  float value = noise * 0.5 + 0.5;
  
  
  value = smoothstep(0.2, 0.8, value);
  
  
  vec3 baseColor = vec3(value);

  
  float fogFactor = smoothstep(uFogNear, uFogFar, vViewZ);
  vec3 finalColor = mix(baseColor, uFogColor, fogFactor);

  gl_FragColor = vec4(finalColor, 1.0);
}`, on = `#pragma once

float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b + r;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdBoxFrame( vec3 p, vec3 b, float e )
{
       p = abs(p  )-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCappedTorus( vec3 p, vec2 sc, float ra, float rb)
{
  p.x = abs(p.x);
  float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
  return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}

float sdLink( vec3 p, float le, float r1, float r2 )
{
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}

float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float sdCone( vec3 p, vec2 c, float h )
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}

float sdCone( vec3 p, vec2 c )
{
    
    vec2 q = vec2( length(p.xz), -p.y );
    float d = length(q-c*max(dot(q,c), 0.0));
    return d * ((q.x*c.y-q.y*c.x<0.0)?-1.0:1.0);
}

float sdPlane( vec3 p, vec3 n, float h )
{
  
  return dot(p,n) + h;
}

float sdHexPrism( vec3 p, vec2 h )
{
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
  vec2 d = vec2(
       length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),
       p.z-h.y );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdTriPrism( vec3 p, vec2 h )
{
  vec3 q = abs(p);
  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

float sdVerticalCapsule( vec3 p, float h, float r )
{
  p.y -= clamp( p.y, 0.0, h );
  return length( p ) - r;
}

float sdCappedCylinder( vec3 p, float h, float r )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCappedCylinder( vec3 p, vec3 a, vec3 b, float r )
{
  vec3  ba = b - a;
  vec3  pa = p - a;
  float baba = dot(ba,ba);
  float paba = dot(pa,ba);
  float x = length(pa*baba-ba*paba) - r*baba;
  float y = abs(paba-baba*0.5)-baba*0.5;
  float x2 = x*x;
  float y2 = y*y*baba;
  float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));
  return sign(d)*sqrt(abs(d))/baba;
}

float sdRoundedCylinder( vec3 p, float ra, float rb, float h )
{
  vec2 d = vec2( length(p.xz)-2.0*ra+rb, abs(p.y) - h );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0)) - rb;
}

float sdCappedCone( vec3 p, float h, float r1, float r2 )
{
  vec2 q = vec2( length(p.xz), p.y );
  vec2 k1 = vec2(r2,h);
  vec2 k2 = vec2(r2-r1,2.0*h);
  vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
  return s*sqrt( min(dot2(ca),dot2(cb)) );
}

float sdCappedCone( vec3 p, vec3 a, vec3 b, float ra, float rb )
{
  float rba  = rb-ra;
  float baba = dot(b-a,b-a);
  float papa = dot(p-a,p-a);
  float paba = dot(p-a,b-a)/baba;
  float x = sqrt( papa - paba*paba*baba );
  float cax = max(0.0,x-((paba<0.5)?ra:rb));
  float cay = abs(paba-0.5)-0.5;
  float k = rba*rba + baba;
  float f = clamp( (rba*(x-ra)+paba*baba)/k, 0.0, 1.0 );
  float cbx = x-ra - f*rba;
  float cby = paba - f;
  float s = (cbx<0.0 && cay<0.0) ? -1.0 : 1.0;
  return s*sqrt( min(cax*cax + cay*cay*baba,
                     cbx*cbx + cby*cby*baba) );
}

float sdSolidAngle( vec3 p, vec2 c, float ra )
{
  
  vec2 q = vec2( length(p.xz), p.y );
  float l = length(q) - ra;
  float m = length(q - c*clamp(dot(q,c),0.0,ra) );
  return max(l,m*sign(c.y*q.x-c.x*q.y));
}

float sdCutSphere( vec3 p, float r, float h )
{
  
  float w = sqrt(r*r-h*h);

  
  vec2 q = vec2( length(p.xz), p.y );
  float s = max( (h-r)*q.x*q.x+w*w*(h+r-2.0*q.y), h*q.x-w*q.y );
  return (s<0.0) ? length(q)-r :
         (q.x<w) ? h - q.y     :
                   length(q-vec2(w,h));
}

float sdCutHollowSphere( vec3 p, float r, float h, float t )
{
  
  float w = sqrt(r*r-h*h);
  
  
  vec2 q = vec2( length(p.xz), p.y );
  return ((h*q.x<w*q.y) ? length(q-vec2(w,h)) : 
                          abs(length(q)-r) ) - t;
}

float sdDeathStar( vec3 p2, float ra, float rb, float d )
{
  
  float a = (ra*ra - rb*rb + d*d)/(2.0*d);
  float b = sqrt(max(ra*ra-a*a,0.0));
	
  
  vec2 p = vec2( p2.x, length(p2.yz) );
  if( p.x*b-p.y*a > d*max(b-p.y,0.0) )
    return length(p-vec2(a,b));
  else
    return max( (length(p            )-ra),
               -(length(p-vec2(d,0.0))-rb));
}

float sdRoundCone( vec3 p, float r1, float r2, float h )
{
  
  float b = (r1-r2)/h;
  float a = sqrt(1.0-b*b);

  
  vec2 q = vec2( length(p.xz), p.y );
  float k = dot(q,vec2(-b,a));
  if( k<0.0 ) return length(q) - r1;
  if( k>a*h ) return length(q-vec2(0.0,h)) - r2;
  return dot(q, vec2(a,b) ) - r1;
}

float sdRoundCone( vec3 p, vec3 a, vec3 b, float r1, float r2 )
{
  
  vec3  ba = b - a;
  float l2 = dot(ba,ba);
  float rr = r1 - r2;
  float a2 = l2 - rr*rr;
  float il2 = 1.0/l2;
    
  
  vec3 pa = p - a;
  float y = dot(pa,ba);
  float z = y - l2;
  float x2 = dot2( pa*l2 - ba*y );
  float y2 = y*y*l2;
  float z2 = z*z*l2;

  
  float k = sign(rr)*rr*rr*x2;
  if( sign(z)*a2*z2>k ) return  sqrt(x2 + z2)        *il2 - r2;
  if( sign(y)*a2*y2<k ) return  sqrt(x2 + y2)        *il2 - r1;
                        return (sqrt(x2*a2*il2)+y*rr)*il2 - r1;
}

float sdEllipsoid( vec3 p, vec3 r )
{
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float sdVesicaSegment( in vec3 p, in vec3 a, in vec3 b, in float w )
{
    vec3  c = (a+b)*0.5;
    float l = length(b-a);
    vec3  v = (b-a)/l;
    float y = dot(p-c,v);
    vec2  q = vec2(length(p-c-y*v),abs(y));
    
    float r = 0.5*l;
    float d = 0.5*(r*r-w*w)/w;
    vec3  h = (r*q.x<d*(q.y-r)) ? vec3(0.0,r,0.0) : vec3(-d,0.0,d+w);
 
    return length(q-h.xy) - h.z;
}

float sdRhombus( vec3 p, float la, float lb, float h, float ra )
{
  p = abs(p);
  vec2 b = vec2(la,lb);
  float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
  vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
  return min(max(q.x,q.y),0.0) + length(max(q,0.0));
}

float sdOctahedron( vec3 p, float s )
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
}

/*
float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}
*/

float sdPyramid( vec3 p, float h )
{
  float m2 = h*h + 0.25;
    
  p.xz = abs(p.xz);
  p.xz = (p.z>p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
   
  float s = max(-q.x,0.0);
  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
    
  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
  float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
    
  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
}

float udTriangle( vec3 p, vec3 a, vec3 b, vec3 c )
{
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 ac = a - c; vec3 pc = p - c;
  vec3 nor = cross( ba, ac );

  return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(ac,nor),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float udQuad( vec3 p, vec3 a, vec3 b, vec3 c, vec3 d )
{
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 dc = d - c; vec3 pc = p - c;
  vec3 ad = a - d; vec3 pd = p - d;
  vec3 nor = cross( ba, ad );

  return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(dc,nor),pc)) +
     sign(dot(cross(ad,nor),pd))<3.0)
     ?
     min( min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(dc*clamp(dot(dc,pc)/dot2(dc),0.0,1.0)-pc) ),
     dot2(ad*clamp(dot(ad,pd)/dot2(ad),0.0,1.0)-pd) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}`, rn = `float opRound( float d, float rad )
{
    return d - rad;
}
/*
float opOnion( in float sdf, in float thickness )
{
    return abs(sdf)-thickness;
}

float length2( vec3 p ) { p=p*p; return sqrt( p.x+p.y+p.z); }

float length6( vec3 p ) { p=p*p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/6.0); }

float length8( vec3 p ) { p=p*p; p=p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/8.0); }
*/
float opUnion( float d1, float d2 )
{
    return min(d1,d2);
}
float opSubtraction( float d1, float d2 )
{
    return max(-d1,d2);
}
float opIntersection( float d1, float d2 )
{
    return max(d1,d2);
}
float opXor(float d1, float d2 )
{
    return max(min(d1,d2),-max(d1,d2));
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothSubtraction( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float opSmoothIntersection( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}
/*

vec3 opTx( in vec3 p, in transform t, in sdf3d primitive )
{
    return primitive( invert(t)*p );
}

float opScale( in vec3 p, in float s, in sdf3d primitive )
{
    return primitive(p/s)*s;
}

float opRepetition( in vec3 p, in vec3 s, in sdf3d primitive )
{
    vec3 q = p - s*round(p/s);
    return primitive( q );
}

vec3 opLimitedRepetition( in vec3 p, in float s, in vec3 l, in sdf3d primitive )
{
    vec3 q = p - s*clamp(round(p/s),-l,l);
    return primitive( q );
}

float opTwist( in sdf3d primitive, in vec3 p )
{
    const float k = 10.0; 
    float c = cos(k*p.y);
    float s = sin(k*p.y);
    mat2  m = mat2(c,-s,s,c);
    vec3  q = vec3(m*p.xz,p.y);
    return primitive(q);
}

float opCheapBend( in sdf3d primitive, in vec3 p )
{
    const float k = 10.0; 
    float c = cos(k*p.x);
    float s = sin(k*p.x);
    mat2  m = mat2(c,-s,s,c);
    vec3  q = vec3(m*p.xy,p.z);
    return primitive(q);
}
*/`;
const En = {
  core: {
    passThroughVert: H,
    textureFrag: Q,
    uvFrag: Me,
    commonGlsl: _e,
    easingGlsl: Ie,
    spaceGlsl: Re,
    bumpCurvesGlsl: Ee,
    blurHFrag: Ue,
    blurVFrag: Be,
    blurBilateralHFrag: Ae,
    blurBilateralVFrag: Oe
  },
  particles: {
    billboardVert: Ve,
    billboardStretchedVert: Le,
    billboardStretchedVelocityVert: ke,
    billboardLifescaleVert: Ne,
    commonGlsl: Ge,
    particleDebugFrag: We,
    particleFlatColorFrag: Ye,
    particleLifeDiscardFrag: Xe,
    speedDebugFrag: He
  },
  noise: {
    commonGlsl: $e,
    perlinGlsl: je,
    simplexGlsl: Qe,
    worleyGlsl: Ze,
    fbmGlsl: Ke
  },
  oit: {
    compositeFrag: oe
  },
  capsule: {
    capsuleVert: Je,
    capsuleCheckerFrag: en,
    capsuleNoise3dFrag: nn,
    capsuleNoise3dFogFrag: tn
  },
  sdf: {
    primitivesGlsl: on,
    modifiersGlsl: rn
  }
};
export {
  ln as Compositor,
  un as FullscreenPass,
  pn as ParticlePass,
  fe as ParticleSystem,
  le as PingPongBuffer,
  fn as ScenePass,
  vn as WeightedOITParticlesPass,
  ee as blit,
  Rn as buildNDCToZConst,
  ne as computeTextureSize,
  Fe as createArrowGeometry,
  yn as createClusterPositionTexture,
  Mn as createConvergentVelocityTexture,
  V as createDataTexture,
  Tn as createFlowVelocityTexture,
  Pn as createGradientFlowVelocityTexture,
  te as createInstancedUvBuffer,
  _n as createMixedVelocityTexture,
  xn as createNoisePositionTexture,
  zn as createNormalTextureFromArray,
  In as createParticleArrowGeometry,
  Sn as createPositionTextureFromArray,
  ve as createQuad,
  qn as createRadialVelocityTexture,
  me as createRenderer,
  Cn as createRotationalVelocityTexture,
  bn as createScreenSpacePositionTexture,
  gn as createSpiralPositionTexture,
  Dn as createTurbulentVelocityTexture,
  wn as createWavePositionTexture,
  Fn as createWaveVelocityTexture,
  De as createWireframeBox,
  qe as domainWarp2D,
  O as fbm2D,
  mn as fbm3D,
  B as globalUniforms,
  Y as isMousePressed,
  X as mouseButton,
  q as perlin2D,
  Ce as perlin3D,
  hn as ridged2D,
  dn as runExperiment,
  N as seededRandom,
  he as setupInputs,
  xe as setupResize,
  En as shaders,
  ge as startLoop
};
