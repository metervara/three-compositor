import { AddEquation as e, Box3 as t, BoxGeometry as n, BufferGeometry as r, ClampToEdgeWrapping as i, Color as a, CustomBlending as o, DataTexture as s, EdgesGeometry as c, Float32BufferAttribute as l, FloatType as u, HalfFloatType as d, InstancedBufferAttribute as f, InstancedBufferGeometry as p, LineBasicMaterial as m, LineSegments as h, LinearFilter as g, Matrix3 as _, Matrix4 as v, Mesh as y, NearestFilter as b, NoBlending as x, OneFactor as S, OneMinusSrcAlphaFactor as C, OrthographicCamera as w, PerspectiveCamera as T, PlaneGeometry as E, RGBAFormat as D, RepeatWrapping as ee, Scene as O, ShaderMaterial as k, UnsignedByteType as A, Vector2 as j, Vector3 as M, Vector4 as te, WebGLRenderTarget as N, WebGLRenderer as ne, ZeroFactor as re } from "three";
import { OrbitControls as ie } from "three/examples/jsm/controls/OrbitControls.js";
//#region src/utils/PingPongBuffer.ts
var P = class {
	rtA;
	rtB;
	flag = !1;
	constructor(e, t, n) {
		let r = {
			minFilter: g,
			magFilter: g,
			wrapS: i,
			wrapT: i,
			format: D,
			type: u,
			depthBuffer: !1,
			stencilBuffer: !1,
			...n
		};
		this.rtA = new N(e, t, r), this.rtB = new N(e, t, r), this.rtA.texture.generateMipmaps = !1, this.rtB.texture.generateMipmaps = !1, this.rtA.texture.anisotropy = 1, this.rtB.texture.anisotropy = 1;
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
}, F = "varying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = vec4(position, 1.0);\n}", ae = "precision highp float;\n\nuniform sampler2D srcTexture;\nvarying vec2 vUv;\n\nvoid main() {\n  gl_FragColor = texture2D(srcTexture, vUv);\n}", oe = new w(-1, 1, 1, -1, 0, 1), se = new k({
	uniforms: { srcTexture: { value: null } },
	vertexShader: F,
	fragmentShader: ae
}), ce = new O(), le = new y(new E(2, 2), se);
ce.add(le);
function I(e, t, n, r) {
	let i = r ?? se;
	r && !("srcTexture" in r.uniforms) && console.warn("Blit: provided material does not have a `srcTexture` uniform. If it uses another sampler uniform name, you'll need to set it yourself before calling."), le.material = i, i.uniforms.srcTexture.value = t, e.setRenderTarget(n), e.clear(), e.render(ce, oe), e.setRenderTarget(null);
}
//#endregion
//#region src/core/Compositor.ts
var ue = class {
	passes = [];
	pingPongBuffers = /* @__PURE__ */ new Map();
	renderer;
	textureRegistry = /* @__PURE__ */ new Map();
	passRegistry = /* @__PURE__ */ new Map();
	pingPongPassMapping = /* @__PURE__ */ new Map();
	constructor(e) {
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
	createPingPong(e, t, n, r) {
		let i = new P(t, n, r);
		return this.pingPongBuffers.set(e, i), this.textureRegistry.set(`${e}_read`, i.read.texture), this.textureRegistry.set(`${e}_write`, i.write.texture), i;
	}
	getPingPong(e) {
		return this.pingPongBuffers.get(e);
	}
	swapPingPong(e) {
		let t = this.pingPongBuffers.get(e);
		return t && (t.swap(), this.textureRegistry.set(`${e}_read`, t.read.texture), this.textureRegistry.set(`${e}_write`, t.write.texture)), this;
	}
	swapAllPingPong() {
		for (let [e, t] of this.pingPongBuffers) t.swap(), this.textureRegistry.set(`${e}_read`, t.read.texture), this.textureRegistry.set(`${e}_write`, t.write.texture);
		return this;
	}
	renderPass(e) {
		if (e >= 0 && e < this.passes.length) {
			let t = this.passes[e];
			this.resolveDependencies(t), t.render(this.renderer);
		}
		return this;
	}
	renderPassByName(e) {
		let t = this.getPass(e);
		return t && (this.resolveDependencies(t), t.render(this.renderer)), this;
	}
	renderRange(e, t) {
		let n = this.passes.slice(e, t);
		for (let e of n) this.resolveDependencies(e), e.render(this.renderer);
		return this;
	}
	render() {
		for (let e of this.passes) this.resolveDependencies(e), e.render(this.renderer);
		return this;
	}
	renderToScreen(e) {
		let t = new j();
		this.renderer.getSize(t), e && this.renderer.setViewport(e.x, e.y, e.width, e.height);
		let n = this.passes[this.passes.length - 1];
		return n && (this.resolveDependencies(n), n.render(this.renderer)), this.renderer.setViewport(0, 0, t.x, t.y), this;
	}
	blit(e, t) {
		return I(this.renderer, e, t), this;
	}
	execute(e) {
		return e(this.renderer), this;
	}
	clear() {
		return this.passes = [], this.textureRegistry.clear(), this.passRegistry.clear(), this;
	}
	removePass(e) {
		let t = this.passes.findIndex((t) => this.passRegistry.get(e) === t);
		return t !== -1 && (this.passes.splice(t, 1), this.passRegistry.delete(e)), this;
	}
	getPassCount() {
		return this.passes.length;
	}
	getDescription() {
		let e = [], t = 0;
		if (e.push(`Compositor with ${this.passes.length} pass${this.passes.length === 1 ? "" : "es"}:`), this.passes.forEach((n, r) => {
			let i = this.getPassNameByIndex(r), a = this.getPassType(n), o = this.getPassDetails(n), s = this.estimateQuadFragments(n);
			s > 0 && (t += s), e.push(`  ${r + 1}. ${i} (${a})${o ? ` - ${o}` : ""}`);
		}), t > 0) {
			e.push("");
			let n = Math.max(1, Math.round(Math.sqrt(t)));
			e.push(`Estimated fragments (quad passes): ${t} (~${n}x${n})`);
		}
		if (this.pingPongBuffers.size > 0) {
			e.push(""), e.push("Ping-pong buffers:");
			for (let [t, n] of this.pingPongBuffers) e.push(`  - ${t} (${n.read.width}x${n.read.height})`);
		}
		if (this.textureRegistry.size > 0) {
			e.push(""), e.push("Registered textures:");
			for (let [t, n] of this.textureRegistry) {
				let r = `${n.image?.width || n.image?.videoWidth || "?"}x${n.image?.height || n.image?.videoHeight || "?"}`;
				e.push(`  - ${t} (${r})`);
			}
		}
		return e.join("\n");
	}
	getPassNameByIndex(e) {
		for (let [t, n] of this.passRegistry) if (this.passes[e] === n) return t;
		return `Pass ${e + 1}`;
	}
	getPassType(e) {
		return e.constructor.name === "FullscreenPass" ? "Quad" : e.constructor.name === "ParticlePass" ? "Particle" : e.constructor.name === "WeightedOITParticlesPass" ? "WeightedOIT" : e.constructor.name;
	}
	getPassDetails(e) {
		let t = [], n = null, r = this.getPassNameByIndex(this.passes.indexOf(e));
		if (this.pingPongPassMapping.has(r)) n = this.pingPongPassMapping.get(r);
		else for (let [t, r] of this.pingPongBuffers) if (e.outputTarget === r.write || e.outputTarget === r.read) {
			n = t;
			break;
		}
		if (n) {
			let e = this.pingPongBuffers.get(n);
			e && t.push(`ping-pong (${e.read.width}x${e.read.height}, ${n})`);
		} else if (e.opts.rtSize) t.push(`render-target (${e.opts.rtSize.width}x${e.opts.rtSize.height})`);
		else if (e.opts.outputTarget) t.push("custom render-target");
		else {
			let e = new j();
			this.renderer.getSize(e), t.push(`screen (${e.x}x${e.y})`);
		}
		if (e.opts.viewport && t.push(`viewport (${e.opts.viewport.width}x${e.opts.viewport.height})`), e.opts.inputTextures && Object.keys(e.opts.inputTextures).length > 0) {
			let n = Object.values(e.opts.inputTextures).join(", ");
			t.push(`inputs: ${n}`);
		}
		return e.opts.outputTextureName && t.push(`output: ${e.opts.outputTextureName}`), e.opts.particleOptions && t.push(`${e.opts.particleOptions.count} particles`), t.join(", ");
	}
	updatePingPongPass(e, t, n, r) {
		let i = this.getPass(e), a = this.getPingPong(t);
		return i && a && (i.setUniform(n, a.read.texture), r && (i.outputTarget = r), this.pingPongPassMapping.set(e, t)), this;
	}
	resolveDependencies(e) {
		if (e.opts.inputTextures) for (let [t, n] of Object.entries(e.opts.inputTextures)) {
			let r = this.textureRegistry.get(n);
			r && e.setUniform(t, r);
		}
	}
	estimateQuadFragments(e) {
		let t = 0, n = 0, r = e;
		if (e.constructor.name === "FullscreenPass") if (r.outputTarget) e.opts.rtSize ? (t = e.opts.rtSize.width, n = e.opts.rtSize.height) : r.outputTarget.width && r.outputTarget.height && (t = r.outputTarget.width, n = r.outputTarget.height);
		else if (e.opts.viewport) t = e.opts.viewport.width, n = e.opts.viewport.height;
		else {
			let e = new j();
			this.renderer.getSize(e), t = e.x, n = e.y;
		}
		else if (e.constructor.name === "ParticlePass" && r.outRT === null) if (e.opts.viewport) t = e.opts.viewport.width, n = e.opts.viewport.height;
		else {
			let e = new j();
			this.renderer.getSize(e), t = e.x, n = e.y;
		}
		return Math.max(0, Math.floor(t)) * Math.max(0, Math.floor(n));
	}
	resize(e, t) {
		for (let n of this.passes) n.resize && n.resize(e, t);
	}
	resizePass(e, t, n) {
		let r = this.getPass(e);
		r && r.resize && r.resize(t, n);
	}
};
//#endregion
//#region src/utils/particle.ts
function L(e, t = !1) {
	if (!Number.isInteger(e) || e <= 0) throw Error("computeTextureSize: count must be a positive integer");
	function n(e) {
		return 2 ** Math.ceil(Math.log2(e));
	}
	if (!t) {
		let t = Math.ceil(Math.sqrt(e));
		return {
			width: t,
			height: Math.ceil(e / t)
		};
	}
	let r = n(Math.ceil(Math.sqrt(e)));
	return {
		width: r,
		height: n(Math.ceil(e / r))
	};
}
function R(e, t, n) {
	if (!Number.isInteger(e) || e <= 0) throw Error("createInstancedUvBuffer: count must be a positive integer");
	if (!Number.isInteger(t) || t <= 0) throw Error("createInstancedUvBuffer: width must be a positive integer");
	if (!Number.isInteger(n) || n <= 0) throw Error("createInstancedUvBuffer: height must be a positive integer");
	if (t * n < e) throw Error(`createInstancedUvBuffer: texture too small (${t}x${n} = ${t * n} < count=${e})`);
	let r = new Float32Array(e * 2);
	for (let i = 0; i < e; i++) {
		let e = i % t + .5, a = Math.floor(i / t) + .5;
		r[2 * i + 0] = e / t, r[2 * i + 1] = a / n;
	}
	return r;
}
//#endregion
//#region src/core/ParticleSystem.ts
var de = class {
	mesh;
	material;
	geometry;
	constructor(e) {
		let { count: t, width: n, height: r, geometry: i, materialOptions: a } = e;
		if (!a) throw Error("ParticleSystem: missing materialOptions");
		let o = i || new E(1, 1);
		this.geometry = new p(), this.geometry.index = o.index, this.geometry.attributes = o.attributes;
		let s = R(t, n, r);
		this.geometry.setAttribute("instUv", new f(s, 2));
		let c = { ...a.defines || {} }, l = !!a.transparent, u = a.depthWrite === void 0 ? !1 : a.depthWrite, d = a.depthTest === void 0 ? !0 : a.depthTest;
		!l && u && d && (c.ENABLE_ALPHA_TEST = 1), this.material = new k({
			...a,
			defines: c
		}), this.mesh = new y(this.geometry, this.material), this.mesh.frustumCulled = !1;
	}
	setUniform(e, t) {
		this.material.uniforms[e] ? this.material.uniforms[e].value = t : this.material.uniforms[e] = { value: t };
	}
	getUniform(e) {
		return this.material.uniforms[e]?.value;
	}
	dispose() {
		this.geometry.dispose(), this.material.dispose();
	}
}, z = {
	uTime: { value: 0 },
	uResolution: { value: new j() },
	uMouse: { value: new j() },
	uMouseUV: { value: new j() },
	uMouseNDC: { value: new j() },
	uMouseDelta: { value: new j() },
	uMousePrev: { value: new j() },
	uMouseUVPrev: { value: new j() },
	uMouseNDCPrev: { value: new j() },
	uMouseDeltaPrev: { value: new j() },
	uScroll: { value: 0 }
};
//#endregion
//#region src/mesh/quad.ts
function B(e, t = 2, n = 2) {
	let r = {
		...z,
		...e.uniforms || {}
	};
	return new y(new E(t, n), new k({
		vertexShader: e.vertexShader,
		fragmentShader: e.fragmentShader,
		uniforms: r
	}));
}
//#endregion
//#region src/core/passes/FullscreenPass.ts
var fe = class {
	scene;
	camera;
	outputTarget = null;
	material;
	opts;
	constructor(e) {
		this.opts = e;
	}
	init(e) {
		let { renderer: t } = e, { outputTarget: n, rtSize: r, clearColor: a = !0, clearDepth: o = !1, clearStencil: s = !1, materialOptions: c, seedTexture: l } = this.opts;
		if (!c) throw Error("FullscreenPass: missing materialOptions");
		if (n) this.outputTarget = n;
		else if (r) {
			let { width: e, height: t } = r;
			this.outputTarget = new N(e, t, {
				minFilter: g,
				magFilter: g,
				wrapS: i,
				wrapT: i,
				format: D,
				type: u,
				depthBuffer: !1,
				stencilBuffer: !1
			});
		} else this.outputTarget = null;
		this.camera = new w(-1, 1, 1, -1, 0, 1), this.scene = new O();
		let d = B(c);
		this.material = d.material, this.material && this.material.blending !== x && (this.material.blending = x, this.material.transparent = !1, this.material.depthWrite = !1, this.material.depthTest = !1), d.frustumCulled = !1, this.scene.add(d), this.opts.clearColor = a, this.opts.clearDepth = o, this.opts.clearStencil = s, l && this.outputTarget && I(t, l, this.outputTarget);
	}
	update(e) {}
	render(e) {
		let { clearColor: t = !0, clearDepth: n = !1, clearStencil: r = !1, clearColorValue: i, clearAlpha: o, viewport: s } = this.opts;
		e.setRenderTarget(this.outputTarget);
		let c = null;
		s && !this.outputTarget && (c = new te(), e.getViewport(c), e.setViewport(s.x, s.y, s.width, s.height));
		let l = null, u = null;
		if (t && (i !== void 0 || o !== void 0)) if (l = new a(), e.getClearColor(l), u = e.getClearAlpha ? e.getClearAlpha() : 1, i !== void 0) {
			let t = i instanceof a ? i : new a(i);
			e.setClearColor(t, o === void 0 ? u ?? 1 : o);
		} else o !== void 0 && l && e.setClearColor(l, o);
		(t || n || r) && e.clear(t, n, r), e.render(this.scene, this.camera), e.setRenderTarget(null), c && e.setViewport(c.x, c.y, c.z, c.w), l && e.setClearColor(l, u ?? 1);
	}
	get texture() {
		return this.outputTarget ? this.outputTarget.texture : null;
	}
	setUniform(e, t) {
		if (!this.material) throw Error("FullscreenPass: must call init() first");
		this.material.uniforms[e] ? this.material.uniforms[e].value = t : this.material.uniforms[e] = { value: t };
	}
	resize(e, t) {
		this.outputTarget && this.opts.rtSize && (this.outputTarget.dispose(), this.outputTarget = new N(e, t, {
			minFilter: g,
			magFilter: g,
			wrapS: i,
			wrapT: i,
			format: D,
			type: u,
			depthBuffer: !1,
			stencilBuffer: !1
		}), this.opts.rtSize.width = e, this.opts.rtSize.height = t);
	}
}, pe = class {
	scene;
	camera;
	outRT;
	particleSystem;
	opts;
	constructor(e) {
		this.opts = e;
	}
	init(e) {
		let { outputTarget: t, rtSize: n, clearColor: r = !0, clearDepth: a = !1, clearStencil: o = !1, materialOptions: s, particleOptions: c, particleSystem: l } = this.opts;
		if (this.scene = new O(), this.camera = e.camera, l) this.particleSystem = l;
		else {
			if (!c) throw Error("ParticlePass: missing particleOptions (or provide a particleSystem)");
			if (!s) throw Error("ParticlePass: missing materialOptions (or provide a particleSystem)");
			this.particleSystem = new de({
				count: c.count,
				width: c.width,
				height: c.height,
				geometry: c.geometry,
				materialOptions: s
			});
		}
		if (this.scene.add(this.particleSystem.mesh), t) this.outRT = t;
		else if (n) {
			let { width: e, height: t } = n;
			this.outRT = new N(e, t, {
				minFilter: g,
				magFilter: g,
				wrapS: i,
				wrapT: i,
				format: D,
				type: A,
				depthBuffer: this.opts.depthBuffer === void 0 ? !1 : this.opts.depthBuffer,
				stencilBuffer: !1
			});
		} else this.outRT = null;
		this.opts.clearColor = r, this.opts.clearDepth = a, this.opts.clearStencil = o;
	}
	update(e) {}
	render(e) {
		let { clearColor: t = !0, clearDepth: n = !1, clearStencil: r = !1, clearColorValue: i, clearAlpha: o } = this.opts;
		e.setRenderTarget(this.outRT);
		let s = null, c = null;
		if (t && (i !== void 0 || o !== void 0)) if (s = new a(), e.getClearColor(s), c = e.getClearAlpha ? e.getClearAlpha() : 1, i !== void 0) {
			let t = i instanceof a ? i : new a(i);
			e.setClearColor(t, o === void 0 ? c ?? 1 : o);
		} else o !== void 0 && s && e.setClearColor(s, o);
		(t || n || r) && e.clear(t, n, r), e.render(this.scene, this.camera), s && e.setClearColor(s, c ?? 1), e.setRenderTarget(null);
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
		this.outRT && this.opts.rtSize && (this.outRT.dispose(), this.outRT = new N(e, t, {
			minFilter: g,
			magFilter: g,
			wrapS: i,
			wrapT: i,
			format: D,
			type: A,
			depthBuffer: this.opts.depthBuffer === void 0 ? !1 : this.opts.depthBuffer,
			stencilBuffer: !1
		}), this.opts.rtSize.width = e, this.opts.rtSize.height = t);
	}
}, me = class {
	scene;
	camera;
	_outputTarget = null;
	opts;
	constructor(e) {
		this.opts = e;
	}
	init(e) {
		let { outputTarget: t, rtSize: n, clearColor: r = !0, clearDepth: a = !0, clearStencil: o = !1 } = this.opts;
		if (this.scene = this.opts.scene || e.scene, this.camera = this.opts.camera || e.camera, t) this._outputTarget = t;
		else if (n) {
			let { width: e, height: t } = n;
			this._outputTarget = new N(e, t, {
				minFilter: g,
				magFilter: g,
				wrapS: i,
				wrapT: i,
				format: D,
				type: A,
				depthBuffer: this.opts.depthBuffer === void 0 ? !0 : this.opts.depthBuffer,
				stencilBuffer: !1
			});
		} else this._outputTarget = null;
		this.opts.clearColor = r, this.opts.clearDepth = a, this.opts.clearStencil = o;
	}
	update(e) {}
	render(e) {
		let { clearColor: t = !0, clearDepth: n = !0, clearStencil: r = !1, viewport: i } = this.opts;
		e.setRenderTarget(this._outputTarget);
		let a = null;
		i && !this._outputTarget && (a = new te(), e.getViewport(a), e.setViewport(i.x, i.y, i.width, i.height)), (t || n || r) && e.clear(t, n, r), e.render(this.scene, this.camera), e.setRenderTarget(null), a && e.setViewport(a.x, a.y, a.z, a.w);
	}
	get texture() {
		return this._outputTarget ? this._outputTarget.texture : null;
	}
	resize(e, t) {
		this._outputTarget && this.opts.rtSize && (this._outputTarget.dispose(), this._outputTarget = new N(e, t, {
			minFilter: g,
			magFilter: g,
			wrapS: i,
			wrapT: i,
			format: D,
			type: A,
			depthBuffer: this.opts.depthBuffer === void 0 ? !0 : this.opts.depthBuffer,
			stencilBuffer: !1
		}), this.opts.rtSize.width = e, this.opts.rtSize.height = t);
	}
}, V = "precision highp float;\n\nuniform sampler2D tAccum;\nuniform sampler2D tReveal;\nvarying vec2 vUv;\n\nvoid main() {\n  vec4 accum = texture2D(tAccum, vUv);\n  vec4 reveal = texture2D(tReveal, vUv);\n\n  float oneMinusAlpha = clamp(reveal.r, 0.0, 1.0);\n  float alpha = 1.0 - oneMinusAlpha;\n  vec3 color = accum.rgb / max(accum.a, 1e-6);\n  \n  gl_FragColor = vec4(color, alpha);\n}", he = class {
	particleScene;
	camera;
	accumRT;
	revealRT;
	particleMesh;
	accumMaterial;
	revealMaterial;
	compositeScene;
	compositeCamera;
	compositeMesh;
	opts;
	constructor(e) {
		this.opts = e;
	}
	init(t) {
		let { materialOptions: n, particleOptions: r, rtSize: a } = this.opts;
		if (!n) throw Error("WeightedOITParticlesPass: missing materialOptions");
		if (!r) throw Error("WeightedOITParticlesPass: missing particleOptions");
		this.camera = t.camera, this.particleScene = new O();
		let s = r.geometry || new E(1, 1), c = new p();
		c.index = s.index, c.attributes = s.attributes;
		let l = R(r.count, r.width, r.height);
		c.setAttribute("instUv", new f(l, 2)), this.accumMaterial = new k({
			...n,
			transparent: !0,
			depthWrite: !1,
			blending: o,
			blendEquation: e,
			blendSrc: S,
			blendDst: S,
			blendEquationAlpha: e,
			blendSrcAlpha: S,
			blendDstAlpha: S
		}), this.revealMaterial = new k({
			...n,
			defines: {
				...n.defines || {},
				REVEAL_PASS: 1
			},
			transparent: !0,
			depthWrite: !1,
			blending: o,
			blendEquation: e,
			blendSrc: re,
			blendDst: C,
			blendEquationAlpha: e,
			blendSrcAlpha: re,
			blendDstAlpha: C
		}), this.particleMesh = new y(c, this.accumMaterial), this.particleMesh.frustumCulled = !1, this.particleScene.add(this.particleMesh);
		let u = a || (() => {
			let e = new j();
			return t.renderer.getSize(e), {
				width: e.x,
				height: e.y
			};
		})(), m = {
			minFilter: g,
			magFilter: g,
			wrapS: i,
			wrapT: i,
			format: D,
			type: d,
			depthBuffer: !1,
			stencilBuffer: !1
		};
		this.accumRT = new N(u.width, u.height, m), this.revealRT = new N(u.width, u.height, m), this.compositeCamera = new w(-1, 1, 1, -1, 0, 1), this.compositeScene = new O(), this.compositeMesh = new y(new E(2, 2), new k({
			vertexShader: F,
			fragmentShader: V,
			uniforms: {
				tAccum: { value: this.accumRT.texture },
				tReveal: { value: this.revealRT.texture }
			},
			depthTest: !1,
			depthWrite: !1,
			transparent: !0
		})), this.compositeMesh.frustumCulled = !1, this.compositeScene.add(this.compositeMesh);
	}
	update(e) {}
	setUniform(e, t) {
		this.accumMaterial.uniforms[e] ? this.accumMaterial.uniforms[e].value = t : this.accumMaterial.uniforms[e] = { value: t }, this.revealMaterial.uniforms[e] ? this.revealMaterial.uniforms[e].value = t : this.revealMaterial.uniforms[e] = { value: t };
	}
	render(e) {
		let t = e.getClearColor(new a()).clone(), n = e.getClearAlpha();
		e.setRenderTarget(null), e.render(this.particleScene.parent || this.particleScene, this.camera), e.setRenderTarget(this.accumRT), e.setClearColor(0, 0), e.clear(!0, !0, !1), this.particleMesh.material = this.accumMaterial, e.render(this.particleScene, this.camera), e.setRenderTarget(this.revealRT), e.setClearColor(16777215, 1), e.clear(!0, !0, !1), this.particleMesh.material = this.revealMaterial, e.render(this.particleScene, this.camera), e.setClearColor(t, n), e.setRenderTarget(null), e.render(this.compositeScene, this.compositeCamera);
	}
	get texture() {
		return null;
	}
}, ge = {
	dpi: 1,
	scale: 1,
	antialias: !0,
	imageRendering: "auto",
	cameraType: "orthographic",
	fov: 50,
	near: .1,
	far: 100,
	cameraPosition: new M(0, 0, 5),
	useOrbit: !1
};
function H(e = {}) {
	let t = {
		...ge,
		...e
	}, n = t.canvas || document.createElement("canvas");
	n.style.imageRendering = t.imageRendering, t.canvas || document.body.appendChild(n);
	let r = new ne({
		canvas: n,
		antialias: t.antialias
	});
	r.setPixelRatio(t.dpi), r.autoClear = !1;
	let i, a = window.innerWidth / window.innerHeight;
	if (t.cameraType === "perspective") {
		let e = new T(t.fov, a, t.near, t.far);
		e.position.set(t.cameraPosition.x, t.cameraPosition.y, t.cameraPosition.z), e.lookAt(0, 0, 0), i = e;
	} else i = new w(-a, a, 1, -1, t.near, t.far);
	return t.useOrbit && new ie(i, r.domElement).update(), {
		renderer: r,
		scene: new O(),
		camera: i,
		canvas: n,
		dpi: t.dpi,
		scale: t.scale
	};
}
//#endregion
//#region src/core/input.ts
var U = !1, W = -1;
function _e(e) {
	let { dpi: t, scale: n } = e, r = t * n, i, a, o, s, c = () => {
		if (i === void 0 || a === void 0 || o === void 0 || s === void 0) {
			requestAnimationFrame(c);
			return;
		}
		let t = e.canvas.getBoundingClientRect(), n = t.width, l = t.height, u = o - t.left, d = s - t.top, f = u * r, p = l * r - d * r, m = u / n, h = d / l, g = m * 2 - 1, _ = -(h * 2 - 1), v = f - i, y = p - a;
		i = f, a = p, z.uMousePrev.value.set(i, a), z.uMouseUVPrev.value.set(z.uMouseUV.value.x, z.uMouseUV.value.y), z.uMouseNDCPrev.value.set(z.uMouseNDC.value.x, z.uMouseNDC.value.y), z.uMouseDeltaPrev.value.set(z.uMouseDelta.value.x, z.uMouseDelta.value.y), z.uMouse.value.set(f, p), z.uMouseUV.value.set(m, h), z.uMouseNDC.value.set(g, _), z.uMouseDelta.value.set(v, y), requestAnimationFrame(c);
	};
	window.addEventListener("mousemove", (t) => {
		if (o = t.clientX, s = t.clientY, i === void 0 || a === void 0) {
			let n = e.canvas.getBoundingClientRect(), o = t.clientX - n.left, s = t.clientY - n.top;
			i = o * r, a = n.height * r - s * r, requestAnimationFrame(c);
		}
	}), window.addEventListener("scroll", () => {
		z.uScroll.value = window.scrollY;
	}), window.addEventListener("mousedown", (e) => {
		U = !0, W = e.button;
	}), window.addEventListener("mouseup", () => {
		U = !1, W = -1;
	}), window.addEventListener("mouseleave", () => {
		U = !1, W = -1;
	});
}
//#endregion
//#region src/core/resize.ts
function ve(e, t) {
	let { renderer: n, camera: r, dpi: i, scale: a } = e;
	function o() {
		let o = e.canvas.clientWidth, s = e.canvas.clientHeight;
		n.setSize(o * a, s * a, !1), r instanceof T && (r.aspect = o / s, r.updateProjectionMatrix()), z.uResolution.value.set(o * a * i, s * a * i), t && t(e);
	}
	window.addEventListener("resize", o), o();
}
//#endregion
//#region src/core/loop.ts
var ye = !1;
function be(e) {
	ye = e;
}
function G(e, t) {
	function n(e) {
		if (!ye) {
			let n = e * .001;
			z.uTime.value = n, t(n);
		}
		requestAnimationFrame(n);
	}
	requestAnimationFrame(n);
}
//#endregion
//#region src/core/experimentRunner.ts
function xe(e) {
	let t = H(e.config), n = e.setupInputs ?? !0, r = e.setupResize ?? !0;
	if (n && _e(t), r && ve(t, e.onResize), e.init(t), e.onInit && e.onInit(t), Se(), we(), Oe(e.onToggleInfo), e.afterUpdate) {
		let n = e.update, r = e.afterUpdate;
		G(t, (e) => {
			n(e), r(e);
		});
	} else G(t, e.update);
}
function Se() {
	setTimeout(() => {
		let e = window.__compositor;
		e && typeof e.getDescription == "function" && Ae(e.getDescription());
	}, 0);
}
function Ce() {
	let e = document.getElementById("info-overlay");
	return e || (e = document.createElement("div"), e.id = "info-overlay", e.className = "info-overlay", document.body.appendChild(e)), e.style.display = "none", e;
}
function we() {
	document.removeEventListener("keydown", Te), document.addEventListener("keydown", Te);
}
function Te(e) {
	(e.key === "i" || e.key === "I") && Ee();
}
function Ee() {
	let e = document.getElementById("info-overlay");
	if (e) {
		let t = getComputedStyle(e).display === "none";
		e.style.display = t ? "block" : "none", typeof ke() == "function" && ke()(t);
	}
}
var De;
function Oe(e) {
	De = e;
}
function ke() {
	return De;
}
function Ae(e) {
	let t = document.getElementById("compositor-description");
	t ? t.innerHTML = "" : (t = document.createElement("div"), t.id = "compositor-description", t.className = "compositor-description", Ce().appendChild(t));
	let n = e.split("\n");
	n.forEach((e, r) => {
		if (e.trim()) {
			let n = document.createElement("span");
			n.textContent = e, e.includes(":") && !e.startsWith("  ") && !e.startsWith("	") && n.classList.add("title"), t.appendChild(n);
		}
		r < n.length - 1 && t.appendChild(document.createElement("br"));
	});
}
//#endregion
//#region src/utils/texture.ts
function K(e, t, n, r) {
	let i = e * t * 4, a = new Float32Array(i), o = 0;
	for (let r = 0; r < t; r++) for (let i = 0; i < e; i++) {
		let [s, c, l, u] = n(i, r, e, t);
		a[o++] = s, a[o++] = c, a[o++] = l, a[o++] = u;
	}
	let c = new s(a, e, t, D, u);
	return c.minFilter = r?.minFilter ?? b, c.magFilter = r?.magFilter ?? b, c.wrapS = r?.wrapS ?? ee, c.wrapT = r?.wrapT ?? ee, c.needsUpdate = !0, c;
}
//#endregion
//#region src/utils/noise.ts
function je(e) {
	return e - Math.floor(1 / 289 * e) * 289;
}
function q(e) {
	return je((e * 34 + 1) * e);
}
function J(e) {
	return e * e * e * (e * (e * 6 - 15) + 10);
}
function Y(e, t, n, r) {
	let i = e & 15, a = i < 8 ? t : n, o = i < 4 ? n : i === 12 || i === 14 ? t : r ?? 0;
	return (i & 1 ? -a : a) + (i & 2 ? -o : o);
}
function X(e, t) {
	let n = Math.floor(e), r = Math.floor(t);
	e -= n, t -= r;
	let i = J(e), a = J(t), o = Y(q(q(n) + r), e, t), s = Y(q(q(n) + r + 1), e, t - 1), c = Y(q(q(n + 1) + r), e - 1, t), l = Y(q(q(n + 1) + r + 1), e - 1, t - 1), u = o + i * (c - o);
	return 2.3 * (u + a * (s + i * (l - s) - u));
}
function Me(e, t, n) {
	let r = Math.floor(e), i = Math.floor(t), a = Math.floor(n);
	e -= r, t -= i, n -= a;
	let o = J(e), s = J(t), c = J(n), l = q(r) + i, u = q(l) + a, d = q(l + 1) + a, f = q(r + 1) + i, p = q(f) + a, m = q(f + 1) + a, h = Y(q(u), e, t, n), g = Y(q(d), e, t, n - 1), _ = Y(q(u + 1), e, t - 1, n), v = Y(q(d + 1), e, t - 1, n - 1), y = Y(q(p), e - 1, t, n), b = Y(q(m), e - 1, t, n - 1), x = Y(q(p + 1), e - 1, t - 1, n), S = Y(q(m + 1), e - 1, t - 1, n - 1), C = h + o * (y - h), w = g + o * (b - g), T = _ + o * (x - _), E = v + o * (S - v), D = C + s * (T - C);
	return 2.3 * (D + c * (w + s * (E - w) - D));
}
function Z(e, t, n = 6, r = 2, i = .5) {
	let a = 0, o = .5, s = 1;
	for (let c = 0; c < n; c++) a += o * X(e * s, t * s), s *= r, o *= i;
	return a;
}
function Ne(e, t, n, r = 6, i = 2, a = .5) {
	let o = 0, s = .5, c = 1;
	for (let l = 0; l < r; l++) o += s * Me(e * c, t * c, n * c), c *= i, s *= a;
	return o;
}
function Pe(e, t, n = 6, r = 2, i = .5, a = 1) {
	let o = 0, s = .5, c = 1;
	for (let l = 0; l < n; l++) {
		let n = X(e * c, t * c);
		n = a - Math.abs(n), n *= n, o += n * s, c *= r, s *= i;
	}
	return o * 1.25;
}
function Fe(e, t, n = .1) {
	let r = X(e, t) * n, i = X(e + 100, t + 100) * n;
	return {
		x: e + r,
		y: t + i
	};
}
function Q(e) {
	let t = e;
	return () => (t = (t * 1664525 + 1013904223) % 4294967296, t / 4294967296);
}
//#endregion
//#region src/utils/positionTextures.ts
function Ie(e, t, n = {}) {
	let { bounds: r = 2, is2D: i = !1, noiseScale: a = .1, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	} } = n, c = Q(o);
	return K(e, t, (e, t, n, o) => {
		let l = e / n, u = t / o, d = c() * .1, f = (l + d) * a + s.x, p = (u + d) * a + s.y, m = Z(f, p, 4, 2, .5) * r, h = Z(f + 100, p + 100, 4, 2, .5) * r;
		return i ? [
			m,
			h,
			0,
			1
		] : [
			m,
			h,
			Z(f + 200, p + 200, 4, 2, .5) * r,
			1
		];
	});
}
function Le(e, t, n = {}) {
	let { bounds: r = 2, is2D: i = !1, noiseScale: a = .1, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	} } = n, c = Q(o);
	return K(e, t, (e, t, n, o) => {
		let l = e / n, u = t / o, d = l * Math.PI * 4, f = u * r, p = (l + c() * .1) * a + s.x, m = (u + c() * .1) * a + s.y, h = X(p, m) * .3, g = (f + h) * Math.cos(d), _ = (f + h) * Math.sin(d);
		return i ? [
			g,
			_,
			0,
			1
		] : [
			g,
			_,
			Z(p + 200, m + 200, 3, 2, .5) * r * .5,
			1
		];
	});
}
function Re(e, t, n = {}) {
	let { bounds: r = 2, is2D: i = !1, noiseScale: a = .1, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, numClusters: c = 5, clusterSize: l = .8 } = n;
	return K(e, t, (e, t, n, u) => {
		let d = e / n, f = t / u, p = Infinity, m = {
			x: 0,
			y: 0
		};
		for (let e = 0; e < c; e++) {
			let t = Q(o + e * 1e3), n = t() * r * 2 - r, i = t() * r * 2 - r, a = Math.sqrt((d - (n + r) / (r * 2)) ** 2 + (f - (i + r) / (r * 2)) ** 2);
			a < p && (p = a, m = {
				x: n,
				y: i
			});
		}
		let h = Fe(d * a + s.x, f * a + s.y, .2), g = X(h.x, h.y) * l, _ = m.x + g, v = m.y + X(h.x + 100, h.y + 100) * l;
		return i ? [
			_,
			v,
			0,
			1
		] : [
			_,
			v,
			Z(h.x + 200, h.y + 200, 3, 2, .5) * r * .5,
			1
		];
	});
}
function ze(e, t, n = {}) {
	let { bounds: r = 2, is2D: i = !1, noiseScale: a = .1, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, numWaves: c = 3, waveAmplitude: l = .5 } = n, u = Q(o);
	return K(e, t, (e, t, n, o) => {
		let d = e / n, f = t / o, p = 0, m = 0;
		for (let e = 0; e < c; e++) {
			let t = (e + 1) * 2, n = u() * Math.PI * 2;
			p += Math.sin(f * t + n) * l, m += Math.cos(d * t + n) * l;
		}
		let h = d * a + s.x, g = f * a + s.y, _ = X(h, g) * .3, v = d * r * 2 - r + p + _, y = f * r * 2 - r + m + X(h + 100, g + 100) * .3;
		return i ? [
			v,
			y,
			0,
			1
		] : [
			v,
			y,
			Z(h + 200, g + 200, 3, 2, .5) * r * .5,
			1
		];
	});
}
function Be(e, t, n, r = {}) {
	let { bounds: i = 2, is2D: a = !1, noiseScale: o = .1, seed: s = Math.random() * 1e3, noiseOffset: c = {
		x: 0,
		y: 0,
		z: 0
	}, distance: l = 5 } = r;
	return K(e, t, (e, t, r, s) => {
		let u = e / r, d = t / s, f = u * 2 - 1, p = d * 2 - 1, m, h, g;
		if (n instanceof T) {
			let e = n.aspect, t = n.fov * Math.PI / 180, r = 2 * l * Math.tan(t / 2);
			m = r * e * f / 2, h = p * r / 2, g = l;
		} else if (n instanceof w) {
			let e = n.left, t = n.right, r = n.top, i = n.bottom;
			m = e + (t - e) * u, h = i + (r - i) * d, g = l;
		} else m = f * i, h = p * i, g = l;
		let _ = u * o + c.x, v = d * o + c.y, y = X(_, v) * .2;
		return m += y, h += X(_ + 100, v + 100) * .2, a ? [
			m,
			h,
			0,
			1
		] : (g += Z(_ + 200, v + 200, 3, 2, .5) * i * .3, [
			m,
			h,
			g,
			1
		]);
	});
}
function Ve(e, t, n) {
	let { width: r, height: a } = L(t), o = r * a, c = new Float32Array(o * 4);
	for (let r = 0; r < t; r++) {
		let t = r * 3, i = r * 4;
		c[i + 0] = e[t + 0], c[i + 1] = e[t + 1], c[i + 2] = e[t + 2], c[i + 3] = n ? n[r] : 1;
	}
	for (let e = t; e < o; e++) {
		let t = e * 4;
		c[t + 0] = 0, c[t + 1] = 0, c[t + 2] = 0, c[t + 3] = 0;
	}
	let l = new s(c, r, a, D, u);
	return l.minFilter = b, l.magFilter = b, l.wrapS = i, l.wrapT = i, l.needsUpdate = !0, {
		texture: l,
		width: r,
		height: a
	};
}
function He(e, t) {
	let { width: n, height: r } = L(t), a = n * r, o = new Float32Array(a * 4);
	for (let n = 0; n < t; n++) {
		let t = n * 3, r = n * 4;
		o[r + 0] = e[t + 0], o[r + 1] = e[t + 1], o[r + 2] = e[t + 2], o[r + 3] = 1;
	}
	for (let e = t; e < a; e++) {
		let t = e * 4;
		o[t + 0] = 0, o[t + 1] = 1, o[t + 2] = 0, o[t + 3] = 1;
	}
	let c = new s(o, n, r, D, u);
	return c.minFilter = b, c.magFilter = b, c.wrapS = i, c.wrapT = i, c.needsUpdate = !0, {
		texture: c,
		width: n,
		height: r
	};
}
//#endregion
//#region src/utils/velocityTextures.ts
function Ue(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	} } = n;
	return K(e, t, (e, t, n, o) => {
		let c = e / n, l = t / o, u = c * a + s.x, d = l * a + s.y, f = X(u, d) * r, p = X(u + 100, d + 100) * r;
		return i ? [
			f,
			p,
			0,
			1
		] : [
			f,
			p,
			X(u + 200, d + 200) * r,
			1
		];
	});
}
function We(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	} } = n;
	return K(e, t, (e, t, n, o) => {
		let c = e / n, l = t / o, u = c * a + s.x, d = l * a + s.y, f = .01, p = X(u, d), m = X(u + f, d), h = X(u, d + f), g = -(m - p) / f * r, _ = -(h - p) / f * r;
		return i ? [
			g,
			_,
			0,
			1
		] : [
			g,
			_,
			X(u + 200, d + 200) * r * .5,
			1
		];
	});
}
function Ge(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, numCenters: c = 3, rotationStrength: l = 1 } = n;
	return K(e, t, (e, t, n, u) => {
		let d = e / n, f = t / u, p = d * 4 - 2, m = f * 4 - 2, h = 0, g = 0;
		for (let e = 0; e < c; e++) {
			let t = Q(o + e * 1e3), n = t() * 4 - 2, r = t() * 4 - 2, i = p - n, a = m - r, s = Math.sqrt(i * i + a * a);
			if (s > .01) {
				let e = l * Math.exp(-s * 2);
				h += -a / s * e, g += i / s * e;
			}
		}
		let _ = d * a + s.x, v = f * a + s.y, y = X(_, v) * r * .3, b = X(_ + 100, v + 100) * r * .3;
		if (h = (h + y) * r, g = (g + b) * r, i) return [
			h,
			g,
			0,
			1
		];
		{
			let e = X(_ + 200, v + 200) * r * .5;
			return [
				h,
				g,
				e,
				1
			];
		}
	});
}
function Ke(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, numCenters: c = 2, radialStrength: l = 1 } = n;
	return K(e, t, (e, t, n, u) => {
		let d = e / n, f = t / u, p = d * 4 - 2, m = f * 4 - 2, h = 0, g = 0;
		for (let e = 0; e < c; e++) {
			let t = Q(o + e * 1e3), n = t() * 4 - 2, r = t() * 4 - 2, i = p - n, a = m - r, s = Math.sqrt(i * i + a * a);
			if (s > .01) {
				let e = l * Math.exp(-s * 1.5);
				h += i / s * e, g += a / s * e;
			}
		}
		let _ = d * a + s.x, v = f * a + s.y, y = X(_, v) * r * .2, b = X(_ + 100, v + 100) * r * .2;
		if (h = (h + y) * r, g = (g + b) * r, i) return [
			h,
			g,
			0,
			1
		];
		{
			let e = X(_ + 200, v + 200) * r * .3;
			return [
				h,
				g,
				e,
				1
			];
		}
	});
}
function qe(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, turbulenceIntensity: c = 1, turbulenceOctaves: l = 4 } = n;
	return K(e, t, (e, t, n, o) => {
		let u = e / n, d = t / o, f = u * a + s.x, p = d * a + s.y, m = Z(f, p, l, 2, .5) * r * c, h = Z(f + 100, p + 100, l, 2, .5) * r * c;
		return i ? [
			m,
			h,
			0,
			1
		] : [
			m,
			h,
			Z(f + 200, p + 200, l, 2, .5) * r * c,
			1
		];
	});
}
function Je(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, numWaves: c = 3, waveFrequency: l = 2 } = n, u = Q(o);
	return K(e, t, (e, t, n, o) => {
		let d = e / n, f = t / o, p = 0, m = 0;
		for (let e = 0; e < c; e++) {
			let t = u() * Math.PI * 2, n = l * (e + 1);
			m += Math.sin(d * n + t) * r * .5, p += Math.cos(f * n + t) * r * .5;
		}
		let h = d * a + s.x, g = f * a + s.y, _ = X(h, g) * r * .3, v = X(h + 100, g + 100) * r * .3;
		if (p = (p + _) * r, m = (m + v) * r, i) return [
			p,
			m,
			0,
			1
		];
		{
			let e = X(h + 200, g + 200) * r * .4;
			return [
				p,
				m,
				e,
				1
			];
		}
	});
}
function Ye(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, numPoints: c = 2, convergenceStrength: l = 1 } = n;
	return K(e, t, (e, t, n, u) => {
		let d = e / n, f = t / u, p = d * 4 - 2, m = f * 4 - 2, h = 0, g = 0;
		for (let e = 0; e < c; e++) {
			let t = Q(o + e * 1e3), n = t() * 4 - 2, r = t() * 4 - 2, i = n - p, a = r - m, s = Math.sqrt(i * i + a * a);
			if (s > .01) {
				let e = l * Math.exp(-s * 1);
				h += i / s * e, g += a / s * e;
			}
		}
		let _ = d * a + s.x, v = f * a + s.y, y = X(_, v) * r * .2, b = X(_ + 100, v + 100) * r * .2;
		if (h = (h + y) * r, g = (g + b) * r, i) return [
			h,
			g,
			0,
			1
		];
		{
			let e = X(_ + 200, v + 200) * r * .3;
			return [
				h,
				g,
				e,
				1
			];
		}
	});
}
function Xe(e, t, n = {}) {
	let { maxSpeed: r = .5, is2D: i = !1, noiseScale: a = .05, seed: o = Math.random() * 1e3, noiseOffset: s = {
		x: 0,
		y: 0,
		z: 0
	}, patterns: c = [
		{
			type: "flow",
			weight: .4
		},
		{
			type: "rotational",
			weight: .3
		},
		{
			type: "turbulent",
			weight: .3
		}
	] } = n;
	return K(e, t, (e, t, n, l) => {
		let u = e / n, d = t / l, f = 0, p = 0, m = 0, h = 0;
		return c.forEach((e, t) => {
			let n = Q(o + t * 1e3), c = 0, l = 0, g = 0;
			switch (e.type) {
				case "flow": {
					let e = u * a + s.x, t = d * a + s.y;
					c = X(e, t) * r, l = X(e + 100, t + 100) * r, i || (g = X(e + 200, t + 200) * r);
					break;
				}
				case "rotational": {
					let e = u * 4 - 2, t = d * 4 - 2, i = n() * 4 - 2, a = n() * 4 - 2, o = e - i, s = t - a, f = Math.sqrt(o * o + s * s);
					if (f > .01) {
						let e = Math.exp(-f * 2);
						c = -s / f * e * r, l = o / f * e * r;
					}
					break;
				}
				case "turbulent": {
					let e = u * a + s.x, t = d * a + s.y;
					c = Z(e, t, 4, 2, .5) * r, l = Z(e + 100, t + 100, 4, 2, .5) * r, i || (g = Z(e + 200, t + 200, 4, 2, .5) * r);
					break;
				}
				case "wave": {
					let e = n() * Math.PI * 2;
					c = Math.cos(d * 2 + e) * r * .5, l = Math.sin(u * 2 + e) * r * .5;
					break;
				}
				case "radial": {
					let e = u * 4 - 2, t = d * 4 - 2, i = n() * 4 - 2, a = n() * 4 - 2, o = e - i, s = t - a, f = Math.sqrt(o * o + s * s);
					if (f > .01) {
						let e = Math.exp(-f * 1.5);
						c = o / f * e * r, l = s / f * e * r;
					}
					break;
				}
				case "convergent": {
					let e = u * 4 - 2, t = d * 4 - 2, i = n() * 4 - 2, a = n() * 4 - 2, o = i - e, s = a - t, f = Math.sqrt(o * o + s * s);
					if (f > .01) {
						let e = Math.exp(-f * 1);
						c = o / f * e * r, l = s / f * e * r;
					}
					break;
				}
			}
			f += c * e.weight, p += l * e.weight, m += g * e.weight, h += e.weight;
		}), h > 0 && (f /= h, p /= h, m /= h), i ? [
			f,
			p,
			0,
			1
		] : [
			f,
			p,
			m,
			1
		];
	});
}
//#endregion
//#region src/utils/debug.ts
function Ze(e, r, i, a, o) {
	if (e instanceof t) {
		let t = e, n = r ?? 16711680, i = t.getSize(new M()), a = t.getCenter(new M());
		return Ze(i.x, i.y, i.z, n, a);
	}
	if (typeof r == "number" && typeof i == "number") {
		let t = e, s = r, l = i, u = a ?? 65280, d = o ?? new M(0, 0, 0), f = new h(new c(new n(t, s, l)), new m({ color: u }));
		return f.position.copy(d), f;
	}
	let s = e, l = r ?? 65280, u = i instanceof M ? i : new M(0, 0, 0), d = new h(new c(new n(s, s, s)), new m({ color: l }));
	return d.position.copy(u), d;
}
//#endregion
//#region src/utils/arrowGeometry.ts
function $(e = .2) {
	let t = new r(), n = [], i = [], a = [];
	return n.push(0, .5, 0, -.5, -.5, 0, 0, -.5 + e, 0, .5, -.5, 0), i.push(.5, 1, 0, 0, .5, .2, 1, 0), a.push(0, 1, 2, 0, 2, 3), t.setAttribute("position", new l(n, 3)), t.setAttribute("uv", new l(i, 2)), t.setIndex(a), t.computeVertexNormals(), t;
}
function Qe() {
	return $(.2);
}
//#endregion
//#region src/utils/matrices.ts
function $e(e, t = 0) {
	let n = new v().multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse).elements, r = (e, t) => n[t * 4 + e], i = new _().set(r(0, 0), r(0, 1), r(0, 2) * t + r(0, 3), r(1, 0), r(1, 1), r(1, 2) * t + r(1, 3), r(3, 0), r(3, 1), r(3, 2) * t + r(3, 3)), a = i.determinant();
	return Math.abs(a) < 1e-8 ? null : new _().copy(i).invert();
}
//#endregion
//#region src/shaders/index.ts
var et = {
	core: {
		passThroughVert: F,
		textureFrag: ae,
		uvFrag: "uniform vec2 uResolution;\n\nvoid main() {\n  vec2 uv = (gl_FragCoord.xy ) / uResolution.xy;\n  gl_FragColor = vec4(uv, 0.0, 1.0);\n}",
		commonGlsl: "float circleSDF(vec2 uv, float r) {\n  return length(uv) - r;\n}\n\nvec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {\n  return a + b * cos(6.28318 * (c * t + d));\n}\n\nmat4 rotationAxisAngle( vec3 v, float angle )\n{\n    float s = sin( angle );\n    float c = cos( angle );\n    float ic = 1.0 - c;\n\n    return mat4( v.x*v.x*ic + c,     v.y*v.x*ic - s*v.z, v.z*v.x*ic + s*v.y, 0.0,\n                 v.x*v.y*ic + s*v.z, v.y*v.y*ic + c,     v.z*v.y*ic - s*v.x, 0.0,\n                 v.x*v.z*ic - s*v.y, v.y*v.z*ic + s*v.x, v.z*v.z*ic + c,     0.0,\n			     0.0,                0.0,                0.0,                1.0 );\n}",
		colorGlsl: "vec3 sample6LobesSphereLinear(vec3 dir,\n                              vec3 colPosX, vec3 colNegX,\n                              vec3 colPosY, vec3 colNegY,\n                              vec3 colPosZ, vec3 colNegZ,\n                              float sharpness)\n{\n    float len2 = dot(dir, dir);\n    if (len2 < 1e-12) return colPosZ;\n    dir *= inversesqrt(len2);\n\n    float wxp = pow(max( dir.x, 0.0), sharpness);\n    float wxn = pow(max(-dir.x, 0.0), sharpness);\n    float wyp = pow(max( dir.y, 0.0), sharpness);\n    float wyn = pow(max(-dir.y, 0.0), sharpness);\n    float wzp = pow(max( dir.z, 0.0), sharpness);\n    float wzn = pow(max(-dir.z, 0.0), sharpness);\n\n    float wSum = max(wxp + wxn + wyp + wyn + wzp + wzn, 1e-8);\n\n    return (colPosX * wxp + colNegX * wxn +\n            colPosY * wyp + colNegY * wyn +\n            colPosZ * wzp + colNegZ * wzn) / wSum;\n}",
		easingGlsl: "float easeLinear(float t) {\n  return t;\n}\n\nfloat easeInQuad(float t) {\n  return t * t;\n}\n\nfloat easeOutQuad(float t) {\n  return 1.0 - (1.0 - t) * (1.0 - t);\n}\n\nfloat easeInOutQuad(float t) {\n  return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;\n}\n\nfloat easeInCubic(float t) {\n  return t * t * t;\n}\n\nfloat easeOutCubic(float t) {\n  return 1.0 - pow(1.0 - t, 3.0);\n}\n\nfloat easeInOutCubic(float t) {\n  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;\n}\n\nfloat easeInQuart(float t) {\n  return t * t * t * t;\n}\n\nfloat easeOutQuart(float t) {\n  return 1.0 - pow(1.0 - t, 4.0);\n}\n\nfloat easeInOutQuart(float t) {\n  return t < 0.5 ? 8.0 * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 4.0) / 2.0;\n}\n\nfloat easeInQuint(float t) {\n  return t * t * t * t * t;\n}\n\nfloat easeOutQuint(float t) {\n  return 1.0 - pow(1.0 - t, 5.0);\n}\n\nfloat easeInOutQuint(float t) {\n  return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 5.0) / 2.0;\n}\n\nfloat easeInSine(float t) {\n  return 1.0 - cos((t * 3.14159265359) / 2.0);\n}\n\nfloat easeOutSine(float t) {\n  return sin((t * 3.14159265359) / 2.0);\n}\n\nfloat easeInOutSine(float t) {\n  return -(cos(3.14159265359 * t) - 1.0) / 2.0;\n}\n\nfloat easeInExpo(float t) {\n  return t == 0.0 ? 0.0 : pow(2.0, 10.0 * (t - 1.0));\n}\n\nfloat easeOutExpo(float t) {\n  return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);\n}\n\nfloat easeInOutExpo(float t) {\n  if (t == 0.0) return 0.0;\n  if (t == 1.0) return 1.0;\n  return t < 0.5 ? pow(2.0, 20.0 * t - 10.0) / 2.0 : (2.0 - pow(2.0, -20.0 * t + 10.0)) / 2.0;\n}\n\nfloat easeInCirc(float t) {\n  return 1.0 - sqrt(1.0 - pow(t, 2.0));\n}\n\nfloat easeOutCirc(float t) {\n  return sqrt(1.0 - pow(t - 1.0, 2.0));\n}\n\nfloat easeInOutCirc(float t) {\n  return t < 0.5 ? (1.0 - sqrt(1.0 - pow(2.0 * t, 2.0))) / 2.0 : (sqrt(1.0 - pow(-2.0 * t + 2.0, 2.0)) + 1.0) / 2.0;\n}\n\nfloat easeInBack(float t) {\n  const float c1 = 1.70158;\n  const float c3 = c1 + 1.0;\n  return c3 * t * t * t - c1 * t * t;\n}\n\nfloat easeOutBack(float t) {\n  const float c1 = 1.70158;\n  const float c3 = c1 + 1.0;\n  return 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0);\n}\n\nfloat easeInOutBack(float t) {\n  const float c1 = 1.70158;\n  const float c2 = c1 * 1.525;\n  return t < 0.5 ? (pow(2.0 * t, 2.0) * ((c2 + 1.0) * 2.0 * t - c2)) / 2.0 : (pow(2.0 * t - 2.0, 2.0) * ((c2 + 1.0) * (t * 2.0 - 2.0) + c2) + 2.0) / 2.0;\n}\n\nfloat easeInElastic(float t) {\n  if (t == 0.0) return 0.0;\n  if (t == 1.0) return 1.0;\n  return -pow(2.0, 10.0 * t - 10.0) * sin((t * 10.0 - 10.75) * (2.0 * 3.14159265359) / 3.0);\n}\n\nfloat easeOutElastic(float t) {\n  if (t == 0.0) return 0.0;\n  if (t == 1.0) return 1.0;\n  return pow(2.0, -10.0 * t) * sin((t * 10.0 - 0.75) * (2.0 * 3.14159265359) / 3.0) + 1.0;\n}\n\nfloat easeInOutElastic(float t) {\n  if (t == 0.0) return 0.0;\n  if (t == 1.0) return 1.0;\n  return t < 0.5 ? -(pow(2.0, 20.0 * t - 10.0) * sin((20.0 * t - 11.125) * (2.0 * 3.14159265359) / 4.5)) / 2.0 : (pow(2.0, -20.0 * t + 10.0) * sin((20.0 * t - 11.125) * (2.0 * 3.14159265359) / 4.5)) / 2.0 + 1.0;\n}\n\nfloat easeOutBounce(float t) {\n  const float n1 = 7.5625;\n  const float d1 = 2.75;\n  \n  if (t < 1.0 / d1) {\n    return n1 * t * t;\n  } else if (t < 2.0 / d1) {\n    return n1 * (t -= 1.5 / d1) * t + 0.75;\n  } else if (t < 2.5 / d1) {\n    return n1 * (t -= 2.25 / d1) * t + 0.9375;\n  } else {\n    return n1 * (t -= 2.625 / d1) * t + 0.984375;\n  }\n}\n\nfloat easeInBounce(float t) {\n  return 1.0 - easeOutBounce(1.0 - t);\n}\n\nfloat easeInOutBounce(float t) {\n  return t < 0.5 ? (1.0 - easeOutBounce(1.0 - 2.0 * t)) / 2.0 : (1.0 + easeOutBounce(2.0 * t - 1.0)) / 2.0;\n}",
		spaceGlsl: "vec3 toroidalDelta(vec3 cur, vec3 prev, vec3 bounds) {\n  vec3 d = cur - prev;\n  vec3 halfB = bounds * 0.5;\n  if (d.x >  halfB.x) d.x -= bounds.x; else if (d.x < -halfB.x) d.x += bounds.x;\n  if (d.y >  halfB.y) d.y -= bounds.y; else if (d.y < -halfB.y) d.y += bounds.y;\n  if (d.z >  halfB.z) d.z -= bounds.z; else if (d.z < -halfB.z) d.z += bounds.z;\n  return d;\n}\n\nvec3 wrapHysteresis(vec3 p, vec3 innerBounds, float margin) {\n  vec3 innerHalf = innerBounds * 0.5;\n  vec3 outerHalf = innerHalf * (1.0 + margin);\n  const float eps = 0.001;\n  if (p.x < -outerHalf.x)      p.x =  outerHalf.x - eps;\n  else if (p.x >  outerHalf.x) p.x = -outerHalf.x + eps;\n  if (p.y < -outerHalf.y)      p.y =  outerHalf.y - eps;\n  else if (p.y >  outerHalf.y) p.y = -outerHalf.y + eps;\n  if (p.z < -outerHalf.z)      p.z =  outerHalf.z - eps;\n  else if (p.z >  outerHalf.z) p.z = -outerHalf.z + eps;\n  return p;\n}\n\nfloat edgeFactorWithinBounds(vec3 pos, vec3 bounds, float wrapMargin) {\n  vec3 innerHalf = 0.5 * bounds;\n  vec3 outerHalf = innerHalf * (1.0 + wrapMargin);\n  vec3 ap = abs(pos);\n  vec3 over = max(ap - innerHalf, 0.0);\n  vec3 span = max(outerHalf - innerHalf, vec3(1e-6));\n  vec3 t = clamp(over / span, 0.0, 1.0);\n  return 1.0 - max(max(t.x, t.y), t.z);\n}",
		bumpCurvesGlsl: "#define PI 3.14159265358979323846\n#define TAU 6.28318530717958647692\n\nfloat bumpSine(float x) {\n    x = clamp(x, 0.0, 1.0);\n    return sin(PI * x);\n}\n\nfloat bumpCirc(float x) {\n    x = clamp(x, 0.0, 1.0);\n    float u = 2.0 * x - 1.0;          \n    return sqrt(max(0.0, 1.0 - u*u)); \n}\n\nfloat bumpTriangle(float x) {\n    x = clamp(x, 0.0, 1.0);\n    return 1.0 - abs(2.0 * x - 1.0);\n}",
		blurHFrag: "precision highp float;\n\nvarying vec2 vUv;\n\nuniform sampler2D uInput;\nuniform vec2 uTexelSize; \n\nvoid main() {\n  vec2 d = vec2(uTexelSize.x, 0.0);\n  vec4 sum = vec4(0.0);\n  sum += texture2D(uInput, vUv + d * -4.0) * 0.05;\n  sum += texture2D(uInput, vUv + d * -3.0) * 0.09;\n  sum += texture2D(uInput, vUv + d * -2.0) * 0.12;\n  sum += texture2D(uInput, vUv + d * -1.0) * 0.15;\n  sum += texture2D(uInput, vUv)             * 0.16;\n  sum += texture2D(uInput, vUv + d *  1.0) * 0.15;\n  sum += texture2D(uInput, vUv + d *  2.0) * 0.12;\n  sum += texture2D(uInput, vUv + d *  3.0) * 0.09;\n  sum += texture2D(uInput, vUv + d *  4.0) * 0.05;\n  gl_FragColor = sum;\n}",
		blurVFrag: "precision highp float;\n\nvarying vec2 vUv;\n\nuniform sampler2D uInput;\nuniform vec2 uTexelSize; \n\nvoid main() {\n  vec2 d = vec2(0.0, uTexelSize.y);\n  vec4 sum = vec4(0.0);\n  sum += texture2D(uInput, vUv + d * -4.0) * 0.05;\n  sum += texture2D(uInput, vUv + d * -3.0) * 0.09;\n  sum += texture2D(uInput, vUv + d * -2.0) * 0.12;\n  sum += texture2D(uInput, vUv + d * -1.0) * 0.15;\n  sum += texture2D(uInput, vUv)             * 0.16;\n  sum += texture2D(uInput, vUv + d *  1.0) * 0.15;\n  sum += texture2D(uInput, vUv + d *  2.0) * 0.12;\n  sum += texture2D(uInput, vUv + d *  3.0) * 0.09;\n  sum += texture2D(uInput, vUv + d *  4.0) * 0.05;\n  gl_FragColor = sum;\n}",
		blurBilateralHFrag: "precision highp float;\n\nvarying vec2 vUv;\n\nuniform sampler2D uInput;\nuniform vec2 uTexelSize;\nuniform float uBlurScale;\nuniform float uDepthThreshold;\n\nvoid main() {\n    vec4 centerSample = texture2D(uInput, vUv);\n    float centerDepth = centerSample.a;\n    \n    vec4 colorSum = vec4(0.0);\n    float weightSum = 0.0;\n    \n    vec2 dir = vec2(uTexelSize.x * uBlurScale, 0.0);\n    \n    \n    \n    \n    vec4 s; float d; float dw; float w;\n    float depthThreshSq = uDepthThreshold * uDepthThreshold + 0.0001;\n    \n    \n    s = texture2D(uInput, vUv + dir * -4.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.05 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * -3.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.09 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * -2.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.12 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * -1.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.15 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    d = 0.0;  \n    dw = 1.0;\n    w = 0.16 * dw;\n    colorSum += centerSample * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 1.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.15 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 2.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.12 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 3.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.09 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 4.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.05 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    gl_FragColor = colorSum / max(weightSum, 0.0001);\n}",
		blurBilateralVFrag: "precision highp float;\n\nvarying vec2 vUv;\n\nuniform sampler2D uInput;\nuniform vec2 uTexelSize;\nuniform float uBlurScale;\nuniform float uDepthThreshold;\n\nvoid main() {\n    vec4 centerSample = texture2D(uInput, vUv);\n    float centerDepth = centerSample.a;\n    \n    vec4 colorSum = vec4(0.0);\n    float weightSum = 0.0;\n    \n    vec2 dir = vec2(0.0, uTexelSize.y * uBlurScale);\n    \n    \n    \n    \n    vec4 s; float d; float dw; float w;\n    float depthThreshSq = uDepthThreshold * uDepthThreshold + 0.0001;\n    \n    \n    s = texture2D(uInput, vUv + dir * -4.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.05 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * -3.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.09 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * -2.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.12 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * -1.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.15 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    d = 0.0;  \n    dw = 1.0;\n    w = 0.16 * dw;\n    colorSum += centerSample * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 1.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.15 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 2.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.12 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 3.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.09 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    s = texture2D(uInput, vUv + dir * 4.0);\n    d = abs(s.a - centerDepth);\n    dw = exp(-d * d / depthThreshSq);\n    w = 0.05 * dw;\n    colorSum += s * w; weightSum += w;\n    \n    \n    gl_FragColor = colorSum / max(weightSum, 0.0001);\n}"
	},
	particles: {
		billboardVert: "attribute vec2 instUv;       \nuniform sampler2D uPositionTex;\nuniform float quadSize;   \n\nvarying vec2 vUv;\nvarying vec2 vQuadUv;\nvarying float vAlive;  \n\nvoid main() {\n  \n  vec4 posData = texture2D(uPositionTex, instUv);\n  vec3 pos = posData.xyz;\n  vAlive = posData.w;  \n\n  \n  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);\n\n  \n  vec2 offset = position.xy * quadSize * mvPos.w;\n\n  mvPos.xy += offset;\n\n  \n  gl_Position = projectionMatrix * mvPos;\n\n  \n  vUv = instUv;\n  vQuadUv = uv;\n}",
		billboardStretchedVert: "attribute vec2 instUv; \n\nuniform sampler2D uPositionTex;\nuniform sampler2D uPrevPositionTex;\nuniform float quadSize; \nuniform float stretchFactor; \nuniform float squashFactor; \nuniform float uTime;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vec3 curPos = texture2D(uPositionTex, instUv).xyz;\n  vec3 prevPos = texture2D(uPrevPositionTex, instUv).xyz;\n  vec3 Vcur = (modelViewMatrix * vec4(curPos,1.)).xyz;\n  vec3 Vprev = (modelViewMatrix * vec4(prevPos,1.)).xyz;\n\n  \n  vec3 motion = Vcur - Vprev;\n  float speed = length(motion);\n  vec3 mDir = speed > 1e-6 ? motion/speed : vec3(0,1,0);\n\n  \n  vec3 normal = normalize(-Vcur);\n  vec3 upUn = mDir - normal * dot(mDir, normal);\n  vec3 up = length(upUn) > 1e-6 ? normalize(upUn) : vec3(0,1,0);\n  vec3 right = normalize(cross(normal, up));\n\n  \n  vec4 mvPos = vec4(Vcur, 1.0);\n  float halfSz = quadSize * mvPos.w;\n  float stretch = 1.0 + speed * stretchFactor;\n  float invStretch = 1.0 / stretch;\n  float squash = mix(1.0, invStretch, squashFactor);\n\n  \n  vec3 offset = right*(position.x * halfSz * squash) + up*(position.y * halfSz * stretch);\n  mvPos.xyz += offset;\n  gl_Position = projectionMatrix * mvPos;\n\n  vUv = position.xy + 0.5; \n}",
		billboardStretchedVelocityVert: "attribute vec2 instUv; \n\nuniform sampler2D uPositionTex;\nuniform sampler2D uVelocityTex;\nuniform float quadSize; \nuniform float stretchFactor; \nuniform float squashFactor; \nuniform float speedMin; \nuniform float speedMax; \nuniform float useSpeedVariation; \nuniform float uTime;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vec3 curPos = texture2D(uPositionTex, instUv).xyz;\n  vec3 velocity = texture2D(uVelocityTex, instUv).xyz;\n  vec3 Vcur = (modelViewMatrix * vec4(curPos,1.)).xyz;\n\n  \n  float speed = length(velocity);\n  vec3 mDir = speed > 1e-6 ? normalize(velocity) : vec3(0,1,0);\n  \n  \n  vec3 mDirView = normalize((modelViewMatrix * vec4(mDir, 0.0)).xyz);\n\n  \n  vec3 normal = normalize(-Vcur);\n  vec3 upUn = mDirView - normal * dot(mDirView, normal);\n  vec3 up = length(upUn) > 1e-6 ? normalize(upUn) : vec3(0,1,0);\n  vec3 right = normalize(cross(normal, up));\n\n  \n  vec4 mvPos = vec4(Vcur, 1.0);\n  float halfSz = quadSize * mvPos.w;\n  \n  \n  float effectAmount = 0.0;\n  \n  if (useSpeedVariation > 0.5) {\n    \n    if (speed > speedMin) {\n      float speedRange = speedMax - speedMin;\n      if (speedRange > 0.0) {\n        effectAmount = clamp((speed - speedMin) / speedRange, 0.0, 1.0);\n      }\n    }\n  } else {\n    \n    effectAmount = speed > 0.01 ? 1.0 : 0.0;\n  }\n  \n  float stretchAmount = effectAmount * stretchFactor;\n  float stretch = 1.0 + stretchAmount;\n  \n  float squashAmount = effectAmount * squashFactor;\n  float invStretch = 1.0 / stretch;\n  float squash = mix(1.0, invStretch, squashAmount);\n\n  \n  vec3 offset = right*(position.x * halfSz * squash) + up*(position.y * halfSz * stretch);\n  mvPos.xyz += offset;\n  gl_Position = projectionMatrix * mvPos;\n\n  vUv = position.xy + 0.5; \n}",
		billboardLifescaleVert: "#define PI 3.14159265358979323846\n#define TAU 6.28318530717958647692\n\nfloat bumpSine(float x) {\n    x = clamp(x, 0.0, 1.0);\n    return sin(PI * x);\n}\n\nfloat bumpCirc(float x) {\n    x = clamp(x, 0.0, 1.0);\n    float u = 2.0 * x - 1.0;          \n    return sqrt(max(0.0, 1.0 - u*u)); \n}\n\nfloat bumpTriangle(float x) {\n    x = clamp(x, 0.0, 1.0);\n    return 1.0 - abs(2.0 * x - 1.0);\n}\n\nattribute vec2 instUv;       \nuniform sampler2D uPositionTex;\nuniform float quadSize;   \n\nvarying vec2 vUv;\nvarying vec2 vQuadUv;\n\nvoid main() {\n  \n  vec4 posData = texture2D(uPositionTex, instUv);\n  vec3 pos = posData.xyz;\n  float life = posData.w;\n\n  \n  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);\n\n  float lifeScale = bumpSine(life);\n  float scaledQuadSize = quadSize * lifeScale;\n\n  \n  vec2 offset = position.xy * scaledQuadSize * mvPos.w;\n\n  mvPos.xy += offset;\n\n  \n  gl_Position = projectionMatrix * mvPos;\n\n  \n  vUv = instUv;\n  vQuadUv = uv;\n}",
		commonGlsl: "float circleAlpha(vec2 uv, float softEdge) {\n  vec2 center = uv * 2.0 - 1.0;\n  float d = length(center);\n  float a = 1.0 - clamp((d - (1.0 - softEdge)) / softEdge, 0.0, 1.0);\n  return a;\n}\n\nvoid alphaTestDiscard(float alpha, float threshold) {\n  if (alpha < threshold) discard;\n}\n\n#ifdef ENABLE_ALPHA_TEST\n  #define ALPHA_TEST(alpha, threshold) if ((alpha) < (threshold)) discard;\n#else\n  #define ALPHA_TEST(alpha, threshold)\n#endif",
		particleDebugFrag: "varying vec2 vUv;\nvarying vec2 vQuadUv;\nvoid main() {\n  \n  \n  gl_FragColor = vec4(vQuadUv, 0.0, 1.0);\n}",
		particleFlatColorFrag: "uniform vec3 uColorAlive;\nuniform vec3 uColorDead;\n\nvarying float vAlive;\n\nvoid main() {\n  vec3 color = mix(uColorDead, uColorAlive, vAlive);\n  gl_FragColor = vec4(color, 1.0);\n}",
		particleLifeDiscardFrag: "precision highp float;\n\nuniform sampler2D uPositionTex; \nvarying vec2 vUv;               \nvarying vec2 vQuadUv;           \n\nuniform float uSmoothFrom;      \nuniform float uSmoothTo;        \n\nvoid main() {\n  float life = texture2D(uPositionTex, vUv).w;\n  if (life <= 0.0) discard;     \n  \n  \n  vec2 center = vec2(0.5, 0.5);\n  float dist = distance(vQuadUv, center);\n  float radius = 0.5;\n  \n  \n  \n  float edge = smoothstep(uSmoothFrom * radius, uSmoothTo * radius, dist);\n  float alpha = 1.0 - edge;\n  \n  \n  alpha *= life;\n  \n  \n  vec3 color = vec3(1.0, 1.0, 1.0);\n  \n  gl_FragColor = vec4(color, alpha);\n}",
		speedDebugFrag: "uniform sampler2D uVelocityTex;\nuniform float speedMin;\nuniform float speedMax;\nuniform float useSpeedVariation;\n\nvarying vec2 vUv;\n\nvoid main() {\n  \n  vec3 velocity = texture2D(uVelocityTex, vUv).xyz;\n  float speed = length(velocity);\n  \n  vec3 color;\n  \n  if (useSpeedVariation > 0.5) {\n    \n    float normalizedSpeed = clamp((speed - speedMin) / (speedMax - speedMin), 0.0, 1.0);\n    color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), normalizedSpeed);\n  } else {\n    \n    if (speed > 0.01) {\n      color = vec3(0.0, 0.8, 1.0); \n    } else {\n      color = vec3(1.0, 0.0, 0.0); \n    }\n  }\n  \n  \n  float alpha = 0.7 + 0.3 * clamp(speed, 0.0, 1.0);\n  \n  gl_FragColor = vec4(color, alpha);\n}"
	},
	noise: {
		commonGlsl: "#ifndef GLCORE_NOISE_COMMON_GLSL\n#define GLCORE_NOISE_COMMON_GLSL\n\nfloat mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n\nvec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\nvec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }\n\nvec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\nvec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n\nvec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\nvec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\n\n#endif",
		perlinGlsl: "#ifndef GLCORE_NOISE_PERLIN_GLSL\n#define GLCORE_NOISE_PERLIN_GLSL\n\nfloat mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n\nvec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\nvec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }\n\nvec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\nvec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\n\nfloat pnoise(vec2 P)\n{\n  vec2 Pi = floor(P);\n  vec2 Pf = P - Pi;\n  vec2 f = fade(Pf);\n\n  \n  vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x,     Pi.x + 1.0);\n  vec4 iy = vec4(Pi.y, Pi.y,       Pi.y + 1.0, Pi.y + 1.0);\n\n  vec4 i  = permute(permute(ix) + iy);\n\n  \n  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\n  vec4 gy = abs(gx) - 0.5;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n\n  vec2 g00 = vec2(gx.x, gy.x);\n  vec2 g10 = vec2(gx.y, gy.y);\n  vec2 g01 = vec2(gx.z, gy.z);\n  vec2 g11 = vec2(gx.w, gy.w);\n\n  float n00 = dot(g00, Pf);\n  float n10 = dot(g10, Pf - vec2(1.0, 0.0));\n  float n01 = dot(g01, Pf - vec2(0.0, 1.0));\n  float n11 = dot(g11, Pf - vec2(1.0, 1.0));\n\n  float nx0 = mix(n00, n10, f.x);\n  float nx1 = mix(n01, n11, f.x);\n  float nxy = mix(nx0, nx1, f.y);\n  return 2.3 * nxy; \n}\n\nfloat pnoise(vec3 P)\n{\n  vec3 Pi = floor(P);\n  vec3 Pf = P - Pi;\n  vec3 f = fade(Pf);\n\n  \n  vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x,     Pi.x + 1.0);\n  vec4 iy = vec4(Pi.y, Pi.y,       Pi.y + 1.0, Pi.y + 1.0);\n  vec4 iz0 = vec4(Pi.z);\n  vec4 iz1 = vec4(Pi.z + 1.0);\n\n  vec4 i0 = permute(permute(permute(ix) + iy) + iz0);\n  vec4 i1 = permute(permute(permute(ix) + iy) + iz1);\n\n  \n  vec4 gx0 = fract(i0 * (1.0 / 41.0)) * 2.0 - 1.0;\n  vec4 gy0 = abs(gx0) - 0.5;\n  vec4 gz0 = 1.5 - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n\n  vec4 gx1 = fract(i1 * (1.0 / 41.0)) * 2.0 - 1.0;\n  vec4 gy1 = abs(gx1) - 0.5;\n  vec4 gz1 = 1.5 - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n\n  float n000 = dot(g000, Pf);\n  float n100 = dot(g100, Pf - vec3(1.0, 0.0, 0.0));\n  float n010 = dot(g010, Pf - vec3(0.0, 1.0, 0.0));\n  float n110 = dot(g110, Pf - vec3(1.0, 1.0, 0.0));\n  float n001 = dot(g001, Pf - vec3(0.0, 0.0, 1.0));\n  float n101 = dot(g101, Pf - vec3(1.0, 0.0, 1.0));\n  float n011 = dot(g011, Pf - vec3(0.0, 1.0, 1.0));\n  float n111 = dot(g111, Pf - vec3(1.0, 1.0, 1.0));\n\n  float nx00 = mix(n000, n100, f.x);\n  float nx10 = mix(n010, n110, f.x);\n  float nx01 = mix(n001, n101, f.x);\n  float nx11 = mix(n011, n111, f.x);\n\n  float nxy0 = mix(nx00, nx10, f.y);\n  float nxy1 = mix(nx01, nx11, f.y);\n\n  float nxyz = mix(nxy0, nxy1, f.z);\n  return 2.2 * nxyz; \n}\n\n#endif",
		simplexGlsl: "#ifndef GLCORE_NOISE_SIMPLEX_GLSL\n#define GLCORE_NOISE_SIMPLEX_GLSL\n\nfloat mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\nvec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n\nvec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\nvec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }\n\nvec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\nvec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n\nfloat snoise(vec2 v)\n{\n  const vec4 C = vec4(0.211324865405187,  \n                      0.366025403784439,  \n                     -0.577350269189626,  \n                      0.024390243902439); \n  \n  vec2 i  = floor(v + dot(v, C.yy));\n  vec2 x0 = v - i + dot(i, C.xx);\n\n  \n  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n  \n  i = mod289(i);\n  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))\n                 + i.x + vec3(0.0, i1.x, 1.0));\n\n  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\n  m = m * m;\n  m = m * m;\n\n  \n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n  \n  \n  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\n\n  \n  vec3 g;\n  g.x  = a0.x * x0.x + h.x * x0.y;\n  g.y  = a0.y * x12.x + h.y * x12.y;\n  g.z  = a0.z * x12.z + h.z * x12.w;\n  return 130.0 * dot(m, g);\n}\n\nfloat snoise(vec3 v)\n{\n  const vec2  C  = vec2(1.0 / 6.0, 1.0 / 3.0);\n  const vec4  D  = vec4(0.0, 0.5, 1.0, 2.0);\n\n  \n  vec3 i  = floor(v + dot(v, C.yyy));\n  vec3 x0 = v - i + dot(i, C.xxx);\n\n  \n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min(g.xyz, l.zxy);\n  vec3 i2 = max(g.xyz, l.zxy);\n\n  \n  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;\n\n  \n  i = mod289(i);\n  vec4 p = permute(permute(permute(\n            i.z + vec4(0.0, i1.z, i2.z, 1.0))\n          + i.y + vec4(0.0, i1.y, i2.y, 1.0))\n          + i.x + vec4(0.0, i1.x, i2.x, 1.0));\n\n  \n  float n_ = 0.142857142857; \n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); \n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_);    \n\n  vec4 x = x_ * ns.x + ns.yyyy;\n  vec4 y = y_ * ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4(x.xy, y.xy);\n  vec4 b1 = vec4(x.zw, y.zw);\n\n  vec4 s0 = floor(b0) * 2.0 + 1.0;\n  vec4 s1 = floor(b1) * 2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n  vec3 p0 = vec3(a0.xy, h.x);\n  vec3 p1 = vec3(a0.zw, h.y);\n  vec3 p2 = vec3(a1.xy, h.z);\n  vec3 p3 = vec3(a1.zw, h.w);\n\n  \n  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  \n  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));\n}\n\n#endif",
		worleyGlsl: "#ifndef GLCORE_NOISE_WORLEY_GLSL\n#define GLCORE_NOISE_WORLEY_GLSL\n\nvec3 hash3(vec3 p) {\n  p = vec3(\n    dot(p, vec3(127.1, 311.7, 74.7)),\n    dot(p, vec3(269.5, 183.3, 246.1)),\n    dot(p, vec3(113.5, 271.9, 124.6))\n  );\n  return fract(sin(p) * 43758.5453123);\n}\n\nvec2 hash2(vec2 p) {\n  p = vec2(\n    dot(p, vec2(127.1, 311.7)),\n    dot(p, vec2(269.5, 183.3))\n  );\n  return fract(sin(p) * 43758.5453123);\n}\n\nvec2 worley2D(vec2 p) {\n  vec2 n = floor(p);\n  vec2 f = fract(p);\n\n  float F1 = 8.0;\n  float F2 = 8.0;\n\n  for (int j = -1; j <= 1; j++) {\n    for (int i = -1; i <= 1; i++) {\n      vec2 g = vec2(float(i), float(j));\n      vec2 o = hash2(n + g);\n      vec2 r = g - f + o;\n      float d = dot(r, r);\n\n      if (d < F1) {\n        F2 = F1;\n        F1 = d;\n      } else if (d < F2) {\n        F2 = d;\n      }\n    }\n  }\n\n  return vec2(sqrt(F1), sqrt(F2));\n}\n\nvec2 worley3D(vec3 p) {\n  vec3 n = floor(p);\n  vec3 f = fract(p);\n\n  float F1 = 8.0;\n  float F2 = 8.0;\n\n  for (int k = -1; k <= 1; k++) {\n    for (int j = -1; j <= 1; j++) {\n      for (int i = -1; i <= 1; i++) {\n        vec3 g = vec3(float(i), float(j), float(k));\n        vec3 o = hash3(n + g);\n        vec3 r = g - f + o;\n        float d = dot(r, r);\n\n        if (d < F1) {\n          F2 = F1;\n          F1 = d;\n        } else if (d < F2) {\n          F2 = d;\n        }\n      }\n    }\n  }\n\n  return vec2(sqrt(F1), sqrt(F2));\n}\n\nfloat worley(vec2 p) {\n  return worley2D(p).x;\n}\n\nfloat worley(vec3 p) {\n  return worley3D(p).x;\n}\n\nfloat smin(float a, float b, float k) {\n  float h = max(k - abs(a - b), 0.0) / k;\n  return min(a, b) - h * h * k * 0.25;\n}\n\nvec2 worley3DSmooth(vec3 p, float smoothness) {\n  vec3 n = floor(p);\n  vec3 f = fract(p);\n\n  float F1 = 8.0;\n  float F2 = 8.0;\n\n  for (int k = -1; k <= 1; k++) {\n    for (int j = -1; j <= 1; j++) {\n      for (int i = -1; i <= 1; i++) {\n        vec3 g = vec3(float(i), float(j), float(k));\n        vec3 o = hash3(n + g);\n        vec3 r = g - f + o;\n        float d = dot(r, r);\n\n        float newF1 = smin(F1, d, smoothness);\n        if (newF1 < F1) {\n          F2 = F1;\n          F1 = newF1;\n        } else {\n          F2 = smin(F2, d, smoothness);\n        }\n      }\n    }\n  }\n\n  return vec2(sqrt(F1), sqrt(F2));\n}\n\n#endif",
		fbmGlsl: "#ifndef GLCORE_NOISE_FBM_GLSL\n#define GLCORE_NOISE_FBM_GLSL\n\n#if !defined(NOISE2) || !defined(NOISE3)\n  \n  \n  float snoise(vec2);\n  float snoise(vec3);\n  #ifndef NOISE2\n  #define NOISE2 snoise\n  #endif\n  #ifndef NOISE3\n  #define NOISE3 snoise\n  #endif\n#endif\n\nfloat fbm(vec2 p, int octaves, float lacunarity, float gain)\n{\n  float sum = 0.0;\n  float amp = 0.5;\n  vec2  pp  = p;\n  for (int i = 0; i < 32; i++) {\n    if (i >= octaves) break;\n    sum += amp * NOISE2(pp);\n    pp  *= lacunarity;\n    amp *= gain;\n  }\n  return sum;\n}\n\nfloat fbm(vec3 p, int octaves, float lacunarity, float gain)\n{\n  float sum = 0.0;\n  float amp = 0.5;\n  vec3  pp  = p;\n  for (int i = 0; i < 32; i++) {\n    if (i >= octaves) break;\n    sum += amp * NOISE3(pp);\n    pp  *= lacunarity;\n    amp *= gain;\n  }\n  return sum;\n}\n\nfloat fbm(vec2 p)\n{\n  return fbm(p, 6, 2.0, 0.5);\n}\n\nfloat fbm(vec3 p)\n{\n  return fbm(p, 6, 2.0, 0.5);\n}\n\nfloat fbmRidged(vec2 p, int octaves, float lacunarity, float gain, float offset)\n{\n  float sum = 0.0;\n  float amp = 0.5;\n  vec2  pp  = p;\n  for (int i = 0; i < 32; i++) {\n    if (i >= octaves) break;\n    float n = NOISE2(pp);\n    n = offset - abs(n);\n    n *= n;\n    sum += n * amp;\n    pp  *= lacunarity;\n    amp *= gain;\n  }\n  return sum * 1.25; \n}\n\nfloat fbmRidged(vec3 p, int octaves, float lacunarity, float gain, float offset)\n{\n  float sum = 0.0;\n  float amp = 0.5;\n  vec3  pp  = p;\n  for (int i = 0; i < 32; i++) {\n    if (i >= octaves) break;\n    float n = NOISE3(pp);\n    n = offset - abs(n);\n    n *= n;\n    sum += n * amp;\n    pp  *= lacunarity;\n    amp *= gain;\n  }\n  return sum * 1.25;\n}\n\nfloat fbmTurbulence(vec2 p, int octaves, float lacunarity, float gain)\n{\n  float sum = 0.0;\n  float amp = 0.5;\n  vec2  pp  = p;\n  for (int i = 0; i < 32; i++) {\n    if (i >= octaves) break;\n    sum += amp * abs(NOISE2(pp));\n    pp  *= lacunarity;\n    amp *= gain;\n  }\n  return sum;\n}\n\nfloat fbmTurbulence(vec3 p, int octaves, float lacunarity, float gain)\n{\n  float sum = 0.0;\n  float amp = 0.5;\n  vec3  pp  = p;\n  for (int i = 0; i < 32; i++) {\n    if (i >= octaves) break;\n    sum += amp * abs(NOISE3(pp));\n    pp  *= lacunarity;\n    amp *= gain;\n  }\n  return sum;\n}\n\n#endif"
	},
	oit: { compositeFrag: V },
	capsule: {
		capsuleVert: "attribute float aLocalY; \n\nattribute vec3 aStartPos;\nattribute vec3 aEndPos;\nattribute float aStartRadius;\nattribute float aEndRadius;\nattribute float aUvOffset;\nattribute float aSegmentLength;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vWorldPos;\nvarying float vViewZ;\n\nvarying vec3 vCapsuleStart;\nvarying vec3 vCapsuleEnd;\n\nvoid main() {\n  \n  vec3 axis = aEndPos - aStartPos;\n  float len = length(axis);\n  vec3 up = len > 0.0001 ? axis / len : vec3(0.0, 1.0, 0.0);\n\n  \n  vec3 notUp = abs(up.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);\n  vec3 tangent = normalize(cross(up, notUp));\n  vec3 bitangent = cross(up, tangent);\n\n  \n  float r = mix(aStartRadius, aEndRadius, aLocalY);\n\n  \n  \n  \n  \n  \n\n  vec3 localPos = position;\n\n  \n  vec3 radialOffset = tangent * localPos.x * r + bitangent * localPos.z * r;\n\n  \n  \n  \n  \n  vec3 axialPos;\n  if (localPos.y < 0.0) {\n    \n    axialPos = aStartPos + up * (localPos.y * aStartRadius);\n  } else if (localPos.y > 1.0) {\n    \n    axialPos = aEndPos + up * ((localPos.y - 1.0) * aEndRadius);\n  } else {\n    \n    axialPos = mix(aStartPos, aEndPos, localPos.y);\n  }\n\n  vec3 worldPos = axialPos + radialOffset;\n\n  \n  \n  vec3 localNormal = normal;\n  vec3 worldNormal = normalize(\n    tangent * localNormal.x + up * localNormal.y + bitangent * localNormal.z\n  );\n\n  \n  \n  \n  vUv.x = uv.x;\n  vUv.y = aUvOffset + uv.y * aSegmentLength;\n\n  \n  vNormal = worldNormal;\n  vWorldPos = worldPos;\n  \n  \n  vCapsuleStart = aStartPos;\n  vCapsuleEnd = aEndPos;\n  \n  \n  vec4 viewPos = modelViewMatrix * vec4(worldPos, 1.0);\n  vViewZ = -viewPos.z; \n\n  gl_Position = projectionMatrix * viewPos;\n}",
		capsuleCheckerFrag: "uniform float uTileScale;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vWorldPos;\n\nvoid main() {\n  \n  vec2 scaledUv = vUv * uTileScale;\n\n  \n  float checker = mod(floor(scaledUv.x * 4.0) + floor(scaledUv.y), 2.0);\n\n  \n  vec3 colorA = vec3(1.0, 1.0, 1.0);\n  vec3 colorB = vec3(0.0, 0.0, 0.0);\n  vec3 baseColor = mix(colorA, colorB, checker);\n\n  \n  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));\n  float ndotl = max(dot(normalize(vNormal), lightDir), 0.0);\n  float ambient = 0.3;\n  float lighting = ambient + (1.0 - ambient) * ndotl;\n\n  vec3 finalColor = baseColor * lighting;\n\n  gl_FragColor = vec4(finalColor, 1.0);\n}",
		capsuleNoise3dFrag: "uniform float uTileScale;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vWorldPos;\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n  return mod289(((x * 34.0) + 1.0) * x);\n}\n\nvec4 taylorInvSqrt(vec4 r) {\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v) {\n  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  \n  vec3 i = floor(v + dot(v, C.yyy));\n  vec3 x0 = v - i + dot(i, C.xxx);\n\n  \n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min(g.xyz, l.zxy);\n  vec3 i2 = max(g.xyz, l.zxy);\n\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy;\n  vec3 x3 = x0 - D.yyy;\n\n  \n  i = mod289(i);\n  vec4 p = permute(permute(permute(\n      i.z + vec4(0.0, i1.z, i2.z, 1.0))\n    + i.y + vec4(0.0, i1.y, i2.y, 1.0))\n    + i.x + vec4(0.0, i1.x, i2.x, 1.0));\n\n  \n  float n_ = 0.142857142857; \n  vec3 ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_);\n\n  vec4 x = x_ * ns.x + ns.yyyy;\n  vec4 y = y_ * ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4(x.xy, y.xy);\n  vec4 b1 = vec4(x.zw, y.zw);\n\n  vec4 s0 = floor(b0) * 2.0 + 1.0;\n  vec4 s1 = floor(b1) * 2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n  vec3 p0 = vec3(a0.xy, h.x);\n  vec3 p1 = vec3(a0.zw, h.y);\n  vec3 p2 = vec3(a1.xy, h.z);\n  vec3 p3 = vec3(a1.zw, h.w);\n\n  \n  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  \n  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));\n}\n\nvoid main() {\n  \n  vec3 samplePos = vWorldPos * uTileScale;\n  \n  \n  float noise = snoise(samplePos);\n  float value = noise * 0.5 + 0.5;\n  \n  \n  \n  value = smoothstep(0.2, 0.8, value);\n  \n  \n  vec3 baseColor = vec3(value);\n\n  \n  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));\n  float ndotl = max(dot(normalize(vNormal), lightDir), 0.0);\n  float ambient = 0.3;\n  float lighting = ambient + (1.0 - ambient) * ndotl;\n\n  vec3 finalColor = baseColor * lighting;\n\n  gl_FragColor = vec4(finalColor, 1.0);\n}",
		capsuleNoise3dFogFrag: "uniform float uTileScale;\nuniform float uFogNear;  \nuniform float uFogFar;   \nuniform vec3 uFogColor;  \n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vWorldPos;\nvarying float vViewZ;\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n  return mod289(((x * 34.0) + 1.0) * x);\n}\n\nvec4 taylorInvSqrt(vec4 r) {\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v) {\n  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  \n  vec3 i = floor(v + dot(v, C.yyy));\n  vec3 x0 = v - i + dot(i, C.xxx);\n\n  \n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min(g.xyz, l.zxy);\n  vec3 i2 = max(g.xyz, l.zxy);\n\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy;\n  vec3 x3 = x0 - D.yyy;\n\n  \n  i = mod289(i);\n  vec4 p = permute(permute(permute(\n      i.z + vec4(0.0, i1.z, i2.z, 1.0))\n    + i.y + vec4(0.0, i1.y, i2.y, 1.0))\n    + i.x + vec4(0.0, i1.x, i2.x, 1.0));\n\n  \n  float n_ = 0.142857142857; \n  vec3 ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_);\n\n  vec4 x = x_ * ns.x + ns.yyyy;\n  vec4 y = y_ * ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4(x.xy, y.xy);\n  vec4 b1 = vec4(x.zw, y.zw);\n\n  vec4 s0 = floor(b0) * 2.0 + 1.0;\n  vec4 s1 = floor(b1) * 2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n  vec3 p0 = vec3(a0.xy, h.x);\n  vec3 p1 = vec3(a0.zw, h.y);\n  vec3 p2 = vec3(a1.xy, h.z);\n  vec3 p3 = vec3(a1.zw, h.w);\n\n  \n  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  \n  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));\n}\n\nvoid main() {\n  \n  vec3 samplePos = vWorldPos * uTileScale;\n  \n  \n  float noise = snoise(samplePos);\n  float value = noise * 0.5 + 0.5;\n  \n  \n  value = smoothstep(0.2, 0.8, value);\n  \n  \n  vec3 baseColor = vec3(value);\n\n  \n  float fogFactor = smoothstep(uFogNear, uFogFar, vViewZ);\n  vec3 finalColor = mix(baseColor, uFogColor, fogFactor);\n\n  gl_FragColor = vec4(finalColor, 1.0);\n}"
	},
	sdf: {
		primitivesGlsl: "#pragma once\n\nfloat dot2( in vec2 v ) { return dot(v,v); }\nfloat dot2( in vec3 v ) { return dot(v,v); }\nfloat ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }\n\nfloat sdSphere(vec3 p, float r) {\n  return length(p) - r;\n}\n\nfloat sdBox(vec3 p, vec3 b) {\n  vec3 q = abs(p) - b;\n  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);\n}\n\nfloat sdRoundBox( vec3 p, vec3 b, float r )\n{\n  vec3 q = abs(p) - b + r;\n  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;\n}\n\nfloat sdBoxFrame( vec3 p, vec3 b, float e )\n{\n       p = abs(p  )-b;\n  vec3 q = abs(p+e)-e;\n  return min(min(\n      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),\n      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),\n      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));\n}\n\nfloat sdTorus( vec3 p, vec2 t )\n{\n  vec2 q = vec2(length(p.xz)-t.x,p.y);\n  return length(q)-t.y;\n}\n\nfloat sdCappedTorus( vec3 p, vec2 sc, float ra, float rb)\n{\n  p.x = abs(p.x);\n  float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);\n  return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;\n}\n\nfloat sdLink( vec3 p, float le, float r1, float r2 )\n{\n  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );\n  return length(vec2(length(q.xy)-r1,q.z)) - r2;\n}\n\nfloat sdCylinder( vec3 p, vec3 c )\n{\n  return length(p.xz-c.xy)-c.z;\n}\n\nfloat sdCone( vec3 p, vec2 c, float h )\n{\n  float q = length(p.xz);\n  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);\n}\n\nfloat sdCone( vec3 p, vec2 c )\n{\n    \n    vec2 q = vec2( length(p.xz), -p.y );\n    float d = length(q-c*max(dot(q,c), 0.0));\n    return d * ((q.x*c.y-q.y*c.x<0.0)?-1.0:1.0);\n}\n\nfloat sdPlane( vec3 p, vec3 n, float h )\n{\n  \n  return dot(p,n) + h;\n}\n\nfloat sdHexPrism( vec3 p, vec2 h )\n{\n  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);\n  p = abs(p);\n  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;\n  vec2 d = vec2(\n       length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),\n       p.z-h.y );\n  return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\nfloat sdTriPrism( vec3 p, vec2 h )\n{\n  vec3 q = abs(p);\n  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);\n}\n\nfloat sdCapsule( vec3 p, vec3 a, vec3 b, float r )\n{\n  vec3 pa = p - a, ba = b - a;\n  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );\n  return length( pa - ba*h ) - r;\n}\n\nfloat sdVerticalCapsule( vec3 p, float h, float r )\n{\n  p.y -= clamp( p.y, 0.0, h );\n  return length( p ) - r;\n}\n\nfloat sdCappedCylinder( vec3 p, float h, float r )\n{\n  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);\n  return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\nfloat sdCappedCylinder( vec3 p, vec3 a, vec3 b, float r )\n{\n  vec3  ba = b - a;\n  vec3  pa = p - a;\n  float baba = dot(ba,ba);\n  float paba = dot(pa,ba);\n  float x = length(pa*baba-ba*paba) - r*baba;\n  float y = abs(paba-baba*0.5)-baba*0.5;\n  float x2 = x*x;\n  float y2 = y*y*baba;\n  float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));\n  return sign(d)*sqrt(abs(d))/baba;\n}\n\nfloat sdRoundedCylinder( vec3 p, float ra, float rb, float h )\n{\n  vec2 d = vec2( length(p.xz)-2.0*ra+rb, abs(p.y) - h );\n  return min(max(d.x,d.y),0.0) + length(max(d,0.0)) - rb;\n}\n\nfloat sdCappedCone( vec3 p, float h, float r1, float r2 )\n{\n  vec2 q = vec2( length(p.xz), p.y );\n  vec2 k1 = vec2(r2,h);\n  vec2 k2 = vec2(r2-r1,2.0*h);\n  vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);\n  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );\n  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;\n  return s*sqrt( min(dot2(ca),dot2(cb)) );\n}\n\nfloat sdCappedCone( vec3 p, vec3 a, vec3 b, float ra, float rb )\n{\n  float rba  = rb-ra;\n  float baba = dot(b-a,b-a);\n  float papa = dot(p-a,p-a);\n  float paba = dot(p-a,b-a)/baba;\n  float x = sqrt( papa - paba*paba*baba );\n  float cax = max(0.0,x-((paba<0.5)?ra:rb));\n  float cay = abs(paba-0.5)-0.5;\n  float k = rba*rba + baba;\n  float f = clamp( (rba*(x-ra)+paba*baba)/k, 0.0, 1.0 );\n  float cbx = x-ra - f*rba;\n  float cby = paba - f;\n  float s = (cbx<0.0 && cay<0.0) ? -1.0 : 1.0;\n  return s*sqrt( min(cax*cax + cay*cay*baba,\n                     cbx*cbx + cby*cby*baba) );\n}\n\nfloat sdSolidAngle( vec3 p, vec2 c, float ra )\n{\n  \n  vec2 q = vec2( length(p.xz), p.y );\n  float l = length(q) - ra;\n  float m = length(q - c*clamp(dot(q,c),0.0,ra) );\n  return max(l,m*sign(c.y*q.x-c.x*q.y));\n}\n\nfloat sdCutSphere( vec3 p, float r, float h )\n{\n  \n  float w = sqrt(r*r-h*h);\n\n  \n  vec2 q = vec2( length(p.xz), p.y );\n  float s = max( (h-r)*q.x*q.x+w*w*(h+r-2.0*q.y), h*q.x-w*q.y );\n  return (s<0.0) ? length(q)-r :\n         (q.x<w) ? h - q.y     :\n                   length(q-vec2(w,h));\n}\n\nfloat sdCutHollowSphere( vec3 p, float r, float h, float t )\n{\n  \n  float w = sqrt(r*r-h*h);\n  \n  \n  vec2 q = vec2( length(p.xz), p.y );\n  return ((h*q.x<w*q.y) ? length(q-vec2(w,h)) : \n                          abs(length(q)-r) ) - t;\n}\n\nfloat sdDeathStar( vec3 p2, float ra, float rb, float d )\n{\n  \n  float a = (ra*ra - rb*rb + d*d)/(2.0*d);\n  float b = sqrt(max(ra*ra-a*a,0.0));\n	\n  \n  vec2 p = vec2( p2.x, length(p2.yz) );\n  if( p.x*b-p.y*a > d*max(b-p.y,0.0) )\n    return length(p-vec2(a,b));\n  else\n    return max( (length(p            )-ra),\n               -(length(p-vec2(d,0.0))-rb));\n}\n\nfloat sdRoundCone( vec3 p, float r1, float r2, float h )\n{\n  \n  float b = (r1-r2)/h;\n  float a = sqrt(1.0-b*b);\n\n  \n  vec2 q = vec2( length(p.xz), p.y );\n  float k = dot(q,vec2(-b,a));\n  if( k<0.0 ) return length(q) - r1;\n  if( k>a*h ) return length(q-vec2(0.0,h)) - r2;\n  return dot(q, vec2(a,b) ) - r1;\n}\n\nfloat sdRoundCone( vec3 p, vec3 a, vec3 b, float r1, float r2 )\n{\n  \n  vec3  ba = b - a;\n  float l2 = dot(ba,ba);\n  float rr = r1 - r2;\n  float a2 = l2 - rr*rr;\n  float il2 = 1.0/l2;\n    \n  \n  vec3 pa = p - a;\n  float y = dot(pa,ba);\n  float z = y - l2;\n  float x2 = dot2( pa*l2 - ba*y );\n  float y2 = y*y*l2;\n  float z2 = z*z*l2;\n\n  \n  float k = sign(rr)*rr*rr*x2;\n  if( sign(z)*a2*z2>k ) return  sqrt(x2 + z2)        *il2 - r2;\n  if( sign(y)*a2*y2<k ) return  sqrt(x2 + y2)        *il2 - r1;\n                        return (sqrt(x2*a2*il2)+y*rr)*il2 - r1;\n}\n\nfloat sdEllipsoid( vec3 p, vec3 r )\n{\n  float k0 = length(p/r);\n  float k1 = length(p/(r*r));\n  return k0*(k0-1.0)/k1;\n}\n\nfloat sdVesicaSegment( in vec3 p, in vec3 a, in vec3 b, in float w )\n{\n    vec3  c = (a+b)*0.5;\n    float l = length(b-a);\n    vec3  v = (b-a)/l;\n    float y = dot(p-c,v);\n    vec2  q = vec2(length(p-c-y*v),abs(y));\n    \n    float r = 0.5*l;\n    float d = 0.5*(r*r-w*w)/w;\n    vec3  h = (r*q.x<d*(q.y-r)) ? vec3(0.0,r,0.0) : vec3(-d,0.0,d+w);\n \n    return length(q-h.xy) - h.z;\n}\n\nfloat sdRhombus( vec3 p, float la, float lb, float h, float ra )\n{\n  p = abs(p);\n  vec2 b = vec2(la,lb);\n  float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );\n  vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);\n  return min(max(q.x,q.y),0.0) + length(max(q,0.0));\n}\n\nfloat sdOctahedron( vec3 p, float s )\n{\n  p = abs(p);\n  float m = p.x+p.y+p.z-s;\n  vec3 q;\n       if( 3.0*p.x < m ) q = p.xyz;\n  else if( 3.0*p.y < m ) q = p.yzx;\n  else if( 3.0*p.z < m ) q = p.zxy;\n  else return m*0.57735027;\n    \n  float k = clamp(0.5*(q.z-q.y+s),0.0,s); \n  return length(vec3(q.x,q.y-s+k,q.z-k)); \n}\n\n/*\nfloat sdOctahedron( vec3 p, float s)\n{\n  p = abs(p);\n  return (p.x+p.y+p.z-s)*0.57735027;\n}\n*/\n\nfloat sdPyramid( vec3 p, float h )\n{\n  float m2 = h*h + 0.25;\n    \n  p.xz = abs(p.xz);\n  p.xz = (p.z>p.x) ? p.zx : p.xz;\n  p.xz -= 0.5;\n\n  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);\n   \n  float s = max(-q.x,0.0);\n  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );\n    \n  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;\n  float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);\n    \n  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);\n    \n  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));\n}\n\nfloat udTriangle( vec3 p, vec3 a, vec3 b, vec3 c )\n{\n  vec3 ba = b - a; vec3 pa = p - a;\n  vec3 cb = c - b; vec3 pb = p - b;\n  vec3 ac = a - c; vec3 pc = p - c;\n  vec3 nor = cross( ba, ac );\n\n  return sqrt(\n    (sign(dot(cross(ba,nor),pa)) +\n     sign(dot(cross(cb,nor),pb)) +\n     sign(dot(cross(ac,nor),pc))<2.0)\n     ?\n     min( min(\n     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),\n     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),\n     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )\n     :\n     dot(nor,pa)*dot(nor,pa)/dot2(nor) );\n}\n\nfloat udQuad( vec3 p, vec3 a, vec3 b, vec3 c, vec3 d )\n{\n  vec3 ba = b - a; vec3 pa = p - a;\n  vec3 cb = c - b; vec3 pb = p - b;\n  vec3 dc = d - c; vec3 pc = p - c;\n  vec3 ad = a - d; vec3 pd = p - d;\n  vec3 nor = cross( ba, ad );\n\n  return sqrt(\n    (sign(dot(cross(ba,nor),pa)) +\n     sign(dot(cross(cb,nor),pb)) +\n     sign(dot(cross(dc,nor),pc)) +\n     sign(dot(cross(ad,nor),pd))<3.0)\n     ?\n     min( min( min(\n     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),\n     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),\n     dot2(dc*clamp(dot(dc,pc)/dot2(dc),0.0,1.0)-pc) ),\n     dot2(ad*clamp(dot(ad,pd)/dot2(ad),0.0,1.0)-pd) )\n     :\n     dot(nor,pa)*dot(nor,pa)/dot2(nor) );\n}",
		modifiersGlsl: "float opRound( float d, float rad )\n{\n    return d - rad;\n}\n/*\nfloat opOnion( in float sdf, in float thickness )\n{\n    return abs(sdf)-thickness;\n}\n\nfloat length2( vec3 p ) { p=p*p; return sqrt( p.x+p.y+p.z); }\n\nfloat length6( vec3 p ) { p=p*p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/6.0); }\n\nfloat length8( vec3 p ) { p=p*p; p=p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/8.0); }\n*/\nfloat opUnion( float d1, float d2 )\n{\n    return min(d1,d2);\n}\nfloat opSubtraction( float d1, float d2 )\n{\n    return max(-d1,d2);\n}\nfloat opIntersection( float d1, float d2 )\n{\n    return max(d1,d2);\n}\nfloat opXor(float d1, float d2 )\n{\n    return max(min(d1,d2),-max(d1,d2));\n}\n\nfloat opSmoothUnion( float d1, float d2, float k )\n{\n    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );\n    return mix( d2, d1, h ) - k*h*(1.0-h);\n}\n\nfloat opSmoothSubtraction( float d1, float d2, float k )\n{\n    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );\n    return mix( d2, -d1, h ) + k*h*(1.0-h);\n}\n\nfloat opSmoothIntersection( float d1, float d2, float k )\n{\n    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );\n    return mix( d2, d1, h ) + k*h*(1.0-h);\n}\n/*\n\nvec3 opTx( in vec3 p, in transform t, in sdf3d primitive )\n{\n    return primitive( invert(t)*p );\n}\n\nfloat opScale( in vec3 p, in float s, in sdf3d primitive )\n{\n    return primitive(p/s)*s;\n}\n\nfloat opRepetition( in vec3 p, in vec3 s, in sdf3d primitive )\n{\n    vec3 q = p - s*round(p/s);\n    return primitive( q );\n}\n\nvec3 opLimitedRepetition( in vec3 p, in float s, in vec3 l, in sdf3d primitive )\n{\n    vec3 q = p - s*clamp(round(p/s),-l,l);\n    return primitive( q );\n}\n\nfloat opTwist( in sdf3d primitive, in vec3 p )\n{\n    const float k = 10.0; \n    float c = cos(k*p.y);\n    float s = sin(k*p.y);\n    mat2  m = mat2(c,-s,s,c);\n    vec3  q = vec3(m*p.xz,p.y);\n    return primitive(q);\n}\n\nfloat opCheapBend( in sdf3d primitive, in vec3 p )\n{\n    const float k = 10.0; \n    float c = cos(k*p.x);\n    float s = sin(k*p.x);\n    mat2  m = mat2(c,-s,s,c);\n    vec3  q = vec3(m*p.xy,p.z);\n    return primitive(q);\n}\n*/"
	}
};
//#endregion
export { ue as Compositor, fe as FullscreenPass, pe as ParticlePass, de as ParticleSystem, P as PingPongBuffer, me as ScenePass, he as WeightedOITParticlesPass, I as blit, $e as buildNDCToZConst, L as computeTextureSize, $ as createArrowGeometry, Re as createClusterPositionTexture, Ye as createConvergentVelocityTexture, K as createDataTexture, Ue as createFlowVelocityTexture, We as createGradientFlowVelocityTexture, R as createInstancedUvBuffer, Xe as createMixedVelocityTexture, Ie as createNoisePositionTexture, He as createNormalTextureFromArray, Qe as createParticleArrowGeometry, Ve as createPositionTextureFromArray, B as createQuad, Ke as createRadialVelocityTexture, H as createRenderer, Ge as createRotationalVelocityTexture, Be as createScreenSpacePositionTexture, Le as createSpiralPositionTexture, qe as createTurbulentVelocityTexture, ze as createWavePositionTexture, Je as createWaveVelocityTexture, Ze as createWireframeBox, Fe as domainWarp2D, Z as fbm2D, Ne as fbm3D, z as globalUniforms, U as isMousePressed, W as mouseButton, X as perlin2D, Me as perlin3D, Pe as ridged2D, xe as runExperiment, Q as seededRandom, be as setLoopPaused, _e as setupInputs, ve as setupResize, et as shaders, G as startLoop };
