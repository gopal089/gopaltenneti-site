// The hero's "topographic data field": a grid of points whose height comes from
// layered waves. Scrolling flies the camera across it; the pointer tilts it.
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  varying float vHeight;
  varying float vDepth;

  float wave(vec2 p, float t) {
    float h = sin(p.x * 0.18 + t * 0.6) * 0.9;
    h += sin(p.y * 0.23 - t * 0.45) * 0.7;
    h += sin((p.x + p.y) * 0.11 + t * 0.3) * 1.2;
    h += sin(length(p - vec2(6.0, -8.0)) * 0.35 - t * 0.9) * 0.45;
    return h;
  }

  void main() {
    vec3 pos = position;
    float t = uTime;
    float h = wave(pos.xz + vec2(0.0, uScroll * 26.0), t);
    // A soft ridge follows the pointer.
    vec2 pointer = uPointer * vec2(30.0, 18.0);
    h += exp(-dot(pos.xz - pointer, pos.xz - pointer) * 0.012) * 2.2;
    pos.y += h;
    vHeight = h;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min((2.6 * uPixelRatio) * (26.0 / vDepth), 7.0 * uPixelRatio);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uSignal;
  uniform float uFade;
  varying float vHeight;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    float peak = smoothstep(1.4, 3.4, vHeight);
    vec3 col = mix(uInk, uSignal, peak);
    float alpha = smoothstep(95.0, 22.0, vDepth) * smoothstep(9.0, 20.0, vDepth) * mix(0.38, 0.95, peak) * uFade;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function createField(canvas, { reducedMotion = false } = {}) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  } catch {
    return null; // No WebGL: the page still works, just without the field.
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, 1, 0.1, 200);

  const small = window.innerWidth < 700;
  const cols = small ? 110 : 190;
  const rows = small ? 90 : 140;
  const spacing = 0.62;
  const positions = new Float32Array(cols * rows * 3);
  let i = 0;
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      positions[i++] = (x - cols / 2) * spacing;
      positions[i++] = 0;
      positions[i++] = (z - rows / 2) * spacing;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));

  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: { x: 0.2, y: -0.1 } },
      uPixelRatio: { value: pixelRatio },
      uInk: { value: new Color("#16211D") },
      uSignal: { value: new Color("#3B5BFF") },
      uFade: { value: 1 },
    },
  });
  const points = new Points(geometry, material);
  scene.add(points);

  const state = { scroll: 0, fade: 1, pointerX: 0.2, pointerY: -0.1, targetX: 0.2, targetY: -0.1 };

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  if (!reducedMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        state.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        state.targetY = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true },
    );
  }

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
  });

  function frame(timeSeconds) {
    state.pointerX += (state.targetX - state.pointerX) * 0.05;
    state.pointerY += (state.targetY - state.pointerY) * 0.05;
    const s = state.scroll;
    // Camera: starts low over the field, rises and tilts down as you scroll.
    camera.position.set(state.pointerX * 1.6, 7 + s * 9, 26 - s * 8);
    camera.lookAt(0, -2 - s * 4, -10);
    material.uniforms.uTime.value = reducedMotion ? 4 : timeSeconds;
    material.uniforms.uScroll.value = s;
    material.uniforms.uPointer.value = { x: state.pointerX, y: state.pointerY };
    material.uniforms.uFade.value = state.fade;
    renderer.render(scene, camera);
  }

  return {
    state,
    // Called from GSAP's ticker so the field and Lenis share one clock.
    tick(timeSeconds) {
      if (running && state.fade > 0.01) frame(timeSeconds);
    },
    renderOnce() {
      frame(4);
    },
  };
}
