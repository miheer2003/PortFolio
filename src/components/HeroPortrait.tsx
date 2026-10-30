import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from "three";
import { getLenis } from "./utils/lenis";

const vertexShader = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uVelocity;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uv.y * 3.14159) * uVelocity * 0.18;          // scroll bend
    float d = distance(uv, uMouse);
    p.z += (1.0 - smoothstep(0.0, 0.55, d)) * uHover * 0.09; // pointer bulge
    p.z += sin(uv.x * 3.0 + uTime * 0.8) * 0.006;           // breathing
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uVelocity;
  uniform float uTime;
  uniform float uReveal;
  uniform float uAspect;
  uniform float uImgAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  // Organic radius: a few slow sine lobes around the angle.
  float lobes(float a, float t, float phase) {
    return 0.055 * sin(3.0 * a + t * 0.9 + phase)
         + 0.035 * sin(5.0 * a - t * 1.3 + phase * 1.7)
         + 0.025 * sin(2.0 * a + t * 0.6 - phase);
  }

  void main() {
    // ---- image sampling (object-fit: cover) ----
    vec2 uv = vUv;
    vec2 scale = uAspect > uImgAspect
      ? vec2(1.0, uImgAspect / uAspect)
      : vec2(uAspect / uImgAspect, 1.0);
    uv = (uv - 0.5) * scale + 0.5;

    vec2 diff = (vUv - uMouse) * vec2(uAspect, 1.0);
    float infl = (1.0 - smoothstep(0.0, 0.32, length(diff))) * uHover;
    float n = noise(vUv * 7.0 + uTime * 0.6) - 0.5;
    uv += n * infl * 0.045;
    uv -= normalize(diff + 1e-5) * infl * 0.018;
    uv.y += (vUv.y - 0.5) * abs(uVelocity) * 0.04;
    uv = (uv - 0.5) / mix(1.35, 1.0, uReveal) + 0.5;

    float shift = infl * 0.006 + abs(uVelocity) * 0.004;
    vec3 col;
    col.r = texture2D(uTex, uv + vec2(shift, 0.0)).r;
    col.g = texture2D(uTex, uv).g;
    col.b = texture2D(uTex, uv - vec2(shift, 0.0)).b;
    col = mix(col, col * vec3(1.0, 0.973, 0.906), 0.35);   // warm grade

    // ---- blob mask, in a unit ellipse that fills the frame ----
    vec2 q = (vUv - 0.5) * 2.0;                 // -1..1 both axes
    float a = atan(q.y, q.x);
    float len = length(q);
    float t = uTime;

    // bulge toward the pointer
    vec2 m = (uMouse - 0.5) * 2.0;
    float toward = max(0.0, dot(normalize(q + 1e-5), normalize(m + 1e-5)));
    float pull = pow(toward, 6.0) * uHover * 0.06;

    float grow = smoothstep(0.0, 1.0, uReveal);
    float r = (0.86 + lobes(a, t, 0.0) + pull) * grow;
    float aa = fwidth(len) * 1.5;
    float shape = 1.0 - smoothstep(r - aa, r + aa, len);

    // inner shading near the edge for depth
    col *= 1.0 - 0.22 * smoothstep(r - 0.35, r, len);

    // ---- orbit outline: thinner, different phase, slightly larger ----
    float r2 = (0.95 + lobes(a, t * 0.8, 2.1)) * grow;
    float line = 1.0 - smoothstep(0.0, aa * 1.2, abs(len - r2) - 0.004);
    // a travelling bright dot on the outline
    float dotA = t * 0.45;
    vec2 dp = vec2(cos(dotA), sin(dotA)) * (0.95 + lobes(dotA, t * 0.8, 2.1)) * grow;
    float dotM = 1.0 - smoothstep(0.018, 0.018 + aa, length(q - dp));

    vec3 wine = vec3(0.361, 0.090, 0.149);
    vec3 outCol = col * shape;
    float outA = shape;
    float ring = max(line * (1.0 - shape) * 0.75, dotM) * grow;
    outCol = mix(outCol, wine, ring * (1.0 - outA));
    outA = max(outA, ring);

    gl_FragColor = vec4(outCol, outA);
  }
`;

const loadTexture = (src: string) =>
  new Promise<Texture>((resolve, reject) =>
    new TextureLoader().load(src, resolve, undefined, reject)
  );

/** Canvas sits inside .hero-photo and overflows it so the tilt can break the frame. */
const HeroPortrait = ({ src, onReady }: { src: string; onReady: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    if (!canvas || !frame) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the <img> fallback stays visible
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 50);
    const uniforms = {
      uTex: { value: null as Texture | null },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uVelocity: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uAspect: { value: 0.8 },
      uImgAspect: { value: 0.714 },
    };
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
    const geometry = new PlaneGeometry(1, 1, 48, 48);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const target = { mx: 0.5, my: 0.5, hover: 0, tiltX: 0, tiltY: 0 };
    let visible = true;
    let disposed = false;

    const resize = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      if (!cw || !ch || !fh) return;
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      // 1 world unit = frame height; fit the canvas height in view at z = 0.
      const viewH = ch / fh;
      camera.position.z = viewH / 2 / Math.tan((camera.fov * Math.PI) / 360);
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = fw / fh;
      mesh.scale.set(fw / fh, 1, 1);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    resize();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(frame);

    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      target.mx = x;
      target.my = y;
      const pad = 0.2;
      target.hover = x > -pad && x < 1 + pad && y > -pad && y < 1 + pad ? 1 : 0;
      target.tiltY = (e.clientX / window.innerWidth - 0.5) * 0.5;
      target.tiltX = -(e.clientY / window.innerHeight - 0.5) * 0.35;
    };
    if (fine) window.addEventListener("pointermove", onMove);

    let velocity = 0;
    const tick = (time: number) => {
      if (disposed || !visible || !uniforms.uTex.value) return;
      uniforms.uTime.value = time;

      const lv = getLenis()?.velocity ?? 0;
      velocity += (gsap.utils.clamp(-1, 1, lv / 40) - velocity) * 0.1;
      uniforms.uVelocity.value = velocity;

      const m = uniforms.uMouse.value;
      m.x += (target.mx - m.x) * 0.08;
      m.y += (target.my - m.y) * 0.08;
      uniforms.uHover.value += (target.hover - uniforms.uHover.value) * 0.06;

      const r = frame.getBoundingClientRect();
      const out = gsap.utils.clamp(0, 1, -r.top / window.innerHeight);
      const idleY = fine ? 0 : Math.sin(time * 0.6) * 0.12;
      const idleX = fine ? 0 : Math.cos(time * 0.5) * 0.06;
      mesh.rotation.y += (target.tiltY + idleY - mesh.rotation.y) * 0.06;
      mesh.rotation.x += (target.tiltX + idleX + out * 0.7 - mesh.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };

    const reveal = () =>
      gsap.to(uniforms.uReveal, { value: 1, duration: 2.4, ease: "expo.out", delay: 0.15 });
    const onEnter = () => reveal();

    loadTexture(src)
      .then((tex) => {
        if (disposed) return tex.dispose();
        uniforms.uTex.value = tex;
        uniforms.uImgAspect.value = tex.image.width / tex.image.height;
        renderer.compile(scene, camera);
        gsap.ticker.add(tick);
        onReady();
        if (document.documentElement.dataset.entered) uniforms.uReveal.value = 1;
        else window.addEventListener("site:enter", onEnter, { once: true });
      })
      .catch(() => {
        /* keep <img> fallback */
      });

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("site:enter", onEnter);
      ro.disconnect();
      io.disconnect();
      uniforms.uTex.value?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [src, onReady]);

  return <canvas className="hero-photo-canvas" ref={canvasRef} aria-hidden="true" />;
};

export default HeroPortrait;
