import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { RendererInfo, RendererOptions } from "../types";

const defaultOptions: Required<RendererOptions> = {
  dpi: 1.0,
  scale: 1.0,
  antialias: true,
  imageRendering: "auto",
  cameraType: "orthographic",
  fov: 50,
  near: 0.1,
  far: 100,
  cameraPosition: new THREE.Vector3(0, 0, 5),
  useOrbit: false,
};

export function createRenderer(options: RendererOptions = {}): RendererInfo {
  const opts = { ...defaultOptions, ...options };

  const canvas = document.createElement("canvas");
  canvas.style.imageRendering = opts.imageRendering;
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: opts.antialias,
  });
  renderer.setPixelRatio(opts.dpi);
  renderer.autoClear = false;

  let camera: THREE.Camera;
  const aspect = window.innerWidth / window.innerHeight;

  if (opts.cameraType === "perspective") {
    const cam = new THREE.PerspectiveCamera(opts.fov, aspect, opts.near, opts.far);
    cam.position.set(opts.cameraPosition.x, opts.cameraPosition.y, opts.cameraPosition.z);
    cam.lookAt(0, 0, 0);
    camera = cam;
  } else {
    const left = -aspect;
    const right = aspect;
    const top = 1;
    const bottom = -1;
    camera = new THREE.OrthographicCamera(left, right, top, bottom, opts.near, opts.far);
  }

  if(opts.useOrbit) {
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();
  }

  const scene = new THREE.Scene();

  return { renderer, scene, camera, canvas, dpi: opts.dpi, scale: opts.scale };
}
