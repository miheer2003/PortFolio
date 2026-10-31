import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  MeshLambertMaterial,
  PerspectiveCamera,
  Points,
  Quaternion,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { prefersReducedMotion } from "./utils/lenis";

/** Rings of neurons stacked top (input) to bottom (output). */
const RINGS = [
  { n: 6, r: 0.5 },
  { n: 10, r: 0.92 },
  { n: 14, r: 1.1 },
  { n: 10, r: 0.88 },
  { n: 4, r: 0.38 },
];
const HEIGHT = 2.7;
const MAX_PULSES = 48;
const LAST = RINGS.length - 1;

const LATTE = new Color(0xfff8e7);
const MOCHA = new Color(0xa47864);
const ESPRESSO = new Color(0x2a1a15);
const BURGUNDY = new Color(0x5c1726);
const EDGE = MOCHA.clone().lerp(LATTE, 0.42);

const pulseVertex = /* glsl */ `
  uniform float uSize;
  uniform float uScale;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const pulseFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = (smoothstep(0.5, 0.0, d) * 0.3 + smoothstep(0.2, 0.12, d)) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, min(a, 1.0));
    #include <colorspace_fragment>
  }
`;

const build = () => {
  const pos: Vector3[] = [];
  const layer: number[] = [];
  const rings: number[][] = [];
  RINGS.forEach(({ n, r }, l) => {
    const y = HEIGHT / 2 - (l / LAST) * HEIGHT;
    const ids: number[] = [];
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + l * 0.5; // each ring is twisted a little
      ids.push(pos.length);
      pos.push(new Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      layer.push(l);
    }
    rings.push(ids);
  });

  // Each neuron feeds its nearest neurons in the next ring; every neuron gets an input.
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number) => {
    const k = `${a}:${b}`;
    if (!seen.has(k)) {
      seen.add(k);
      edges.push([a, b]);
    }
  };
  const nearest = (from: number, pool: number[]) =>
    [...pool].sort((x, y) => pos[from].distanceToSquared(pos[x]) - pos[from].distanceToSquared(pos[y]));
  for (let l = 0; l < LAST; l++) {
    const A = rings[l];
    const B = rings[l + 1];
    const k = B.length >= A.length ? 4 : 3;
    A.forEach((a) => nearest(a, B).slice(0, k).forEach((b) => add(a, b)));
    B.forEach((b) => {
      if (!edges.some(([, y]) => y === b)) add(nearest(b, A)[0], b);
    });
  }
  const out: number[][] = pos.map(() => []);
  edges.forEach(([a], i) => out[a].push(i));
  return { pos, layer, rings, edges, out };
};

type Pulse = { e: number; t: number; v: number };

/**
 * A small neural network in the palette: neurons on twisted rings, signals running
 * from the input ring to the output ring. Spins with scroll, leans toward the pointer,
 * fires on hover and on click/tap. Renders only while on screen.
 */
const AboutNet = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const lead = host?.parentElement;
    if (!canvas || !host || !lead) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the space simply stays empty
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const still = prefersReducedMotion();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const { pos, layer, rings, edges, out } = build();

    const scene = new Scene();
    const fog = new Fog(LATTE, 5, 9);
    scene.fog = fog;
    const camera = new PerspectiveCamera(30, 1, 0.1, 40);
    const tilt = new Group();
    const spinner = new Group();
    tilt.add(spinner);
    scene.add(tilt);
    scene.add(new HemisphereLight(0xffffff, MOCHA, 2.4));
    const sun = new DirectionalLight(0xffffff, 1.9);
    sun.position.set(2.5, 4, 5);
    scene.add(sun);

    // Synapses
    const ePos = new Float32Array(edges.length * 6);
    const eCol = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      pos[a].toArray(ePos, i * 6);
      pos[b].toArray(ePos, i * 6 + 3);
    });
    const eGeo = new BufferGeometry();
    eGeo.setAttribute("position", new BufferAttribute(ePos, 3));
    const eColor = new BufferAttribute(eCol, 3);
    eGeo.setAttribute("color", eColor);
    const eMat = new LineBasicMaterial({ vertexColors: true });
    spinner.add(new LineSegments(eGeo, eMat));

    // Neurons: faceted (low-poly) icosahedra
    const nGeo = new IcosahedronGeometry(1, 0);
    const nMat = new MeshLambertMaterial({ flatShading: true });
    const neurons = new InstancedMesh(nGeo, nMat, pos.length);
    spinner.add(neurons);
    const base = layer.map((l) => (l === 0 ? ESPRESSO : l === LAST ? BURGUNDY : MOCHA));
    const flash = layer.map((l) => (l === LAST ? ESPRESSO : BURGUNDY));
    const size = layer.map((l) => (l === 0 || l === LAST ? 0.075 : 0.056));

    // Signals
    const pPos = new Float32Array(MAX_PULSES * 3);
    const pAlpha = new Float32Array(MAX_PULSES);
    const pGeo = new BufferGeometry();
    const pPosAttr = new BufferAttribute(pPos, 3);
    const pAlphaAttr = new BufferAttribute(pAlpha, 1);
    pGeo.setAttribute("position", pPosAttr);
    pGeo.setAttribute("aAlpha", pAlphaAttr);
    const pMat = new ShaderMaterial({
      uniforms: { uColor: { value: BURGUNDY }, uSize: { value: 0.17 }, uScale: { value: 1 } },
      vertexShader: pulseVertex,
      fragmentShader: pulseFragment,
      transparent: true,
      depthWrite: false,
    });
    const points = new Points(pGeo, pMat);
    points.frustumCulled = false;
    spinner.add(points);

    const eHeat = new Float32Array(edges.length);
    const nHeat = new Float32Array(pos.length);
    const cool = new Float32Array(pos.length);
    const pulses: Pulse[] = [];
    const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

    const spawn = (from?: number) => {
      if (pulses.length >= MAX_PULSES) return;
      const n = from ?? pick(rings[0]);
      if (!out[n].length) return;
      pulses.push({ e: pick(out[n]), t: 0, v: 1.5 + Math.random() * 0.9 });
      nHeat[n] = 1;
    };

    const m = new Matrix4();
    const q = new Quaternion();
    const sv = new Vector3();
    const tv = new Vector3();
    const tc = new Color();

    const step = (dt: number) => {
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.v * dt;
        eHeat[p.e] = Math.max(eHeat[p.e], 0.9);
        if (p.t >= 1) {
          const b = edges[p.e][1];
          nHeat[b] = 1;
          if (out[b].length && Math.random() < 0.9) {
            p.e = pick(out[b]);
            p.t -= 1;
          } else pulses.splice(i, 1);
        }
      }
      const ek = Math.exp(-dt * 3.2);
      const nk = Math.exp(-dt * 4);
      for (let i = 0; i < eHeat.length; i++) eHeat[i] *= ek;
      for (let i = 0; i < nHeat.length; i++) {
        nHeat[i] *= nk;
        cool[i] = Math.max(0, cool[i] - dt);
      }
    };

    const paint = () => {
      edges.forEach((_, i) => {
        tc.copy(EDGE).lerp(BURGUNDY, Math.min(eHeat[i], 1));
        tc.toArray(eCol, i * 6);
        tc.toArray(eCol, i * 6 + 3);
      });
      eColor.needsUpdate = true;
      pos.forEach((p, i) => {
        const s = size[i] * (1 + nHeat[i] * 0.8);
        neurons.setMatrixAt(i, m.compose(p, q, sv.set(s, s, s)));
        neurons.setColorAt(i, tc.copy(base[i]).lerp(flash[i], nHeat[i]));
      });
      neurons.instanceMatrix.needsUpdate = true;
      if (neurons.instanceColor) neurons.instanceColor.needsUpdate = true;
      pulses.forEach((p, i) => {
        const [a, b] = edges[p.e];
        tv.lerpVectors(pos[a], pos[b], p.t).toArray(pPos, i * 3);
        pAlpha[i] = 1;
      });
      pGeo.setDrawRange(0, pulses.length);
      pPosAttr.needsUpdate = true;
      pAlphaAttr.needsUpdate = true;
    };

    let spin = 0.6;
    let spinV = 0.25;
    let yaw = 0;
    let pitch = 0;
    let tYaw = 0;
    let tPitch = 0;
    let scrollV = 0;
    let lastY = window.scrollY;
    let spawnAcc = 0;
    const pointer = { x: 0, y: 0, inside: false };

    const pose = (c: number) => {
      spinner.rotation.y = spin;
      tilt.rotation.set(0.34 + c * 0.22 + pitch, yaw, 0);
    };
    const draw = () => {
      paint();
      renderer.render(scene, camera);
      canvas.classList.add("is-ready");
    };

    const fit = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const t = Math.tan((camera.fov * Math.PI) / 360);
      const d = Math.max(1.85 / t, 1.35 / (t * camera.aspect));
      camera.position.set(0, 0, d);
      camera.updateProjectionMatrix();
      fog.near = d - 0.6;
      fog.far = d + 3.2;
      pMat.uniforms.uScale.value = (h * renderer.getPixelRatio()) / 2 / t;
      if (still) draw();
    };

    // Excite the neuron under the pointer (laptops).
    const probe = (r: DOMRect) => {
      spinner.updateWorldMatrix(true, false);
      let best = -1;
      let bestD = 30 * 30;
      pos.forEach((p, i) => {
        tv.copy(p).applyMatrix4(spinner.matrixWorld).project(camera);
        const x = r.left + ((tv.x + 1) / 2) * r.width - pointer.x;
        const y = r.top + ((1 - tv.y) / 2) * r.height - pointer.y;
        const d = x * x + y * y;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best >= 0 && cool[best] <= 0) {
        cool[best] = 0.35;
        nHeat[best] = 1;
        if (layer[best] < LAST) spawn(best);
      }
    };

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs / 1000, 0.05);
      const sy = window.scrollY;
      scrollV += (gsap.utils.clamp(-80, 80, sy - lastY) - scrollV) * 0.15;
      lastY = sy;
      spinV += (0.25 + scrollV * 0.035 - spinV) * 0.08;
      spin += spinV * dt;
      const ease = 1 - Math.pow(0.94, dt * 60);
      yaw += (tYaw - yaw) * ease;
      pitch += (tPitch - pitch) * ease;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      pose(gsap.utils.clamp(-1, 1, (r.top + r.height / 2 - vh / 2) / vh));

      spawnAcc += dt * (2.4 + Math.abs(scrollV) * 0.35);
      while (spawnAcc > 1) {
        spawn();
        spawnAcc -= 1;
      }
      if (fine && pointer.inside) probe(r);
      step(dt);
      draw();
    };

    const onPointer = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      tYaw = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / r.width) * 0.6;
      tPitch = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / r.height) * 0.3;
    };
    const burst = () => {
      rings[0].forEach((n) => spawn(n));
      for (let i = 0; i < 4; i++) spawn();
      spinV += 1.4;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    if (still) {
      // Static frame: a few signals frozen mid-flight.
      for (let i = 0; i < 9; i++) spawn();
      step(0.32);
      pulses.forEach((p) => (eHeat[p.e] = 0.75));
      pose(0);
      draw();
      return () => {
        ro.disconnect();
        eGeo.dispose();
        eMat.dispose();
        nGeo.dispose();
        nMat.dispose();
        pGeo.dispose();
        pMat.dispose();
        renderer.dispose();
      };
    }

    let running = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        lastY = window.scrollY;
        gsap.ticker.add(tick);
      }
      if (!e.isIntersecting && running) gsap.ticker.remove(tick);
      running = e.isIntersecting;
    });
    io.observe(host);
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });
    lead.addEventListener("click", burst);
    const lost = (e: Event) => {
      e.preventDefault();
      gsap.ticker.remove(tick);
      running = false;
      io.disconnect();
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onPointer);
      lead.removeEventListener("click", burst);
      canvas.removeEventListener("webglcontextlost", lost);
      eGeo.dispose();
      eMat.dispose();
      nGeo.dispose();
      nMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="about-net-canvas" />;
};

export default AboutNet;
