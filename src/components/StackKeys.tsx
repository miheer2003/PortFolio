import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { IconType } from "react-icons";
import { prefersReducedMotion } from "./utils/lenis";
import "./styles/StackKeys.css";

gsap.registerPlugin(ScrollTrigger);

export type KeyTool = { name: string; group: string; Icon?: IconType };

type Kind = "icon" | "dark" | "accent";
type KeyDef = { name: string; w?: number; label?: string; kind?: Kind; chip?: string | null; display?: string; group?: string };

/** A 3-row macro board: AI tools at the back, then ML + product, then data & ship. */
const ROWS: KeyDef[][] = [
  ["MCP", "LangGraph", "LangChain", "CrewAI", "OpenAI", "Claude", "Gemini", "Hugging Face", "Ollama"].map((name) => ({ name })),
  [
    { name: "RAG", w: 1.5, label: "RAG", kind: "dark", group: "LLM concepts" },
    ...["Python", "PyTorch", "FastAPI", "Ruby on Rails", "Java", "Spring Boot"].map((name) => ({ name })),
    { name: "Ship it", w: 1.5, kind: "accent", chip: null, display: "Ship it ↵", group: "Data & ship" },
  ],
  [
    { name: "Agents", w: 2, label: "AGENTS", kind: "dark", chip: "Agentic workflows", display: "Agentic workflows", group: "LLM concepts" },
    ...["React", "TypeScript", "PostgreSQL", "AWS", "Docker", "Git", "GitHub"].map((name) => ({ name })),
  ],
];
const DEMO = ["LangGraph", "MCP", "Claude", "RAG", "Ruby on Rails", "Python", "PostgreSQL", "Agents", "Docker", "Ship it"];

// World units: 1 = one key pitch. x runs right, y toward the back, z up.
const M = 0.32; // case margin
const STRIP = 0.78; // display strip behind the back row
const CASE_W = 9 + M * 2;
const CASE_D = 3 + M * 2 + STRIP;
const CASE_H = 0.34;
const KEY_H = 0.44;
const GAP = 0.07;
const TAPER = 0.11;
const L = 100; // drawing units per world unit (keeps font sizes sane)
const YAW = (-16 * Math.PI) / 180;
const ELEV = (50 * Math.PI) / 180;
// How far the board turns with the page (q), toward the pointer (px, py) and in its idle sway.
// Page tilt raises the view and un-twists together, so the board's outline barely grows.
const TILT_Q = 0.06;
const TILT_PX = 0.055;
const TILT_PY = 0.035;
const SWAY = 0.014;
const LIFT = 0.16; // it floats this high over its shadow
const BOB = 0.07;
const WAVE_P = 5.5; // spacing of the light crests that run across the board while scrolling

const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Key = {
  def: KeyDef;
  kind: Kind;
  display: string;
  group: string;
  chip: string | null;
  x0: number; // left edge of the cell
  y1: number; // back edge of the cell
  w: number;
  cx: number;
  cy: number;
  p: number; // press depth 0..1 (spring)
  v: number;
  lit: number; // burgundy light 0..1
  hold: number; // ms left on a tap/demo press
  sideG?: CanvasGradient;
  topG?: CanvasGradient;
};

const PALETTE: Record<Kind, { side: [string, string]; top: [string, string]; ink: string }> = {
  icon: { side: ["#ecdcc4", "#cdb29b"], top: ["#fffaf0", "#f3e4cb"], ink: "#2a1a15" },
  dark: { side: ["#3d2921", "#1f130e"], top: ["#3a261f", "#2a1a15"], ink: "#fff8e7" },
  accent: { side: ["#702536", "#43101b"], top: ["#74283a", "#5c1726"], ink: "#fff8e7" },
};
const HOT_INK = "#5c1726";

const StackKeys = ({ tools }: { tools: KeyTool[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;
    const still = prefersReducedMotion();
    const isFine = fine();
    const section = root.closest("section");
    const groupOf = new Map(tools.map((t) => [t.name, t.group]));

    // ---- keys
    const keys: Key[] = [];
    ROWS.forEach((row, r) => {
      let x = M;
      const y1 = M + 3 - r;
      row.forEach((def) => {
        const w = def.w ?? 1;
        keys.push({
          def,
          kind: def.kind ?? "icon",
          display: def.display ?? def.name,
          group: def.group ?? groupOf.get(def.name) ?? "",
          chip: def.chip === undefined ? def.name : def.chip,
          x0: x,
          y1,
          w,
          cx: x + w / 2,
          cy: y1 - 0.5,
          p: 0,
          v: 0,
          lit: 0,
          hold: 0,
        });
        x += w;
      });
    });
    const byName = new Map(keys.map((k) => [k.def.name, k]));
    const byChip = new Map(keys.filter((k) => k.chip).map((k) => [k.chip as string, k]));

    // ---- icons: rasterise the hidden react-icons SVGs once, in two inks
    const icons = new Map<string, { ink: HTMLCanvasElement; hot: HTMLCanvasElement }>();
    let dirty = true;
    const raster = async (svg: SVGElement, color: string) => {
      const c = svg.cloneNode(true) as SVGElement;
      c.setAttribute("width", "96");
      c.setAttribute("height", "96");
      c.setAttribute("style", `color:${color}`);
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(c))}`;
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = cv.height = 96;
      cv.getContext("2d")?.drawImage(img, 0, 0, 96, 96);
      return cv;
    };
    root.querySelectorAll<SVGElement>(".keys-icons svg").forEach((svg) => {
      const name = svg.getAttribute("data-name") ?? "";
      Promise.all([raster(svg, PALETTE.icon.ink), raster(svg, HOT_INK)])
        .then(([ink, hot]) => {
          icons.set(name, { ink, hot });
          dirty = true;
        })
        .catch(() => {});
    });

    // A soft burgundy glow, drawn once and stamped under lit keys.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 128;
    {
      const g = glow.getContext("2d");
      if (g) {
        const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        rg.addColorStop(0, "rgba(124, 30, 50, 0.6)");
        rg.addColorStop(1, "rgba(124, 30, 50, 0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, 128, 128);
      }
    }

    // ---- view: orthographic, so every face maps to the screen with one affine transform
    const view = { yaw: YAW, el: ELEV, lift: LIFT, S: 40, ox: 0, oy: 0, dpr: 1, w: 0, h: 0 };
    const cx0 = CASE_W / 2;
    const cy0 = CASE_D / 2;
    const proj = (x: number, y: number, z: number) => {
      const c = Math.cos(view.yaw);
      const s = Math.sin(view.yaw);
      const zz = z + view.lift;
      const X = (x - cx0) * c - (y - cy0) * s;
      const Y = (x - cx0) * s + (y - cy0) * c;
      return {
        x: view.ox + view.S * X,
        y: view.oy - view.S * (Y * Math.sin(view.el) + zz * Math.cos(view.el)),
        d: Y * Math.cos(view.el) - zz * Math.sin(view.el),
      };
    };
    /** Draw in a horizontal plane at height z; local u runs right, local w toward the front. */
    const plane = (x: number, yBack: number, z: number, shiftX = 0) => {
      const c = Math.cos(view.yaw);
      const s = Math.sin(view.yaw);
      const se = Math.sin(view.el);
      const k = (view.S / L) * view.dpr;
      const o = proj(x, yBack, z);
      ctx.setTransform(k * c, -k * s * se, k * s, k * c * se, o.x * view.dpr + shiftX, o.y * view.dpr);
    };
    /** Screen point -> world (x, y) on the plane at height z. */
    const unproject = (sx: number, sy: number, z: number) => {
      const zz = z + view.lift;
      const X = (sx - view.ox) / view.S;
      const Y = ((view.oy - sy) / view.S - zz * Math.cos(view.el)) / Math.sin(view.el);
      const c = Math.cos(view.yaw);
      const s = Math.sin(view.yaw);
      return { x: X * c + Y * s + cx0, y: -X * s + Y * c + cy0 };
    };

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      view.dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.w = r.width;
      view.h = r.height;
      canvas.width = Math.round(r.width * view.dpr);
      canvas.height = Math.round(r.height * view.dpr);
      const keep = { yaw: view.yaw, el: view.el, lift: view.lift };
      view.S = 1;
      view.ox = 0;
      view.oy = 0;
      const box = (yaw: number, el: number, lift: number) => {
        view.yaw = yaw;
        view.el = el;
        view.lift = lift;
        const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
        for (const x of [0, CASE_W])
          for (const y of [0, CASE_D])
            for (const z of [-lift, CASE_H + KEY_H]) {
              const p = proj(x, y, z);
              b.x0 = Math.min(b.x0, p.x);
              b.x1 = Math.max(b.x1, p.x);
              b.y0 = Math.min(b.y0, p.y);
              b.y1 = Math.max(b.y1, p.y);
            }
        return b;
      };
      // Centre on the resting pose, then scale so every pose the board can reach still fits.
      const rest = box(YAW, ELEV, LIFT);
      const mx = (rest.x0 + rest.x1) / 2;
      const my = (rest.y0 + rest.y1) / 2;
      const span = isFine && !still ? [-1, 0, 1] : [0];
      let dx = 0;
      let dy = 0;
      for (const q of still ? [0] : [-1, 0, 1])
        for (const px of span)
          for (const py of span)
            for (const sw of still ? [0] : [-1, 1])
              for (const lift of still ? [LIFT] : [LIFT - BOB, LIFT + BOB]) {
                const b = box(YAW + q * TILT_Q + px * TILT_PX + sw * SWAY, ELEV + q * TILT_Q + py * TILT_PY, lift);
                dx = Math.max(dx, mx - b.x0, b.x1 - mx);
                dy = Math.max(dy, my - b.y0, b.y1 - my);
              }
      view.S = Math.min((r.width * 0.47) / dx, (r.height * 0.45) / dy);
      view.ox = r.width / 2 - mx * view.S;
      view.oy = r.height / 2 - my * view.S;
      Object.assign(view, keep);
      dirty = true;
    };

    // ---- drawing helpers
    const rrect = (x: number, y: number, w: number, h: number, r: number) => {
      const q = Math.max(0, Math.min(r, w / 2, h / 2));
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, q);
      else {
        // Safari < 16
        ctx.moveTo(x + q, y);
        ctx.arcTo(x + w, y, x + w, y + h, q);
        ctx.arcTo(x + w, y + h, x, y + h, q);
        ctx.arcTo(x, y + h, x, y, q);
        ctx.arcTo(x, y, x + w, y, q);
        ctx.closePath();
      }
    };
    const ensureGrads = (k: Key) => {
      if (k.sideG && k.topG) return;
      const pal = PALETTE[k.kind];
      const W = k.w * L;
      const sg = ctx.createLinearGradient(0, 0, W, L);
      sg.addColorStop(0, pal.side[0]);
      sg.addColorStop(1, pal.side[1]);
      const tg = ctx.createLinearGradient(0, 0, W * 0.35, L);
      tg.addColorStop(0, pal.top[0]);
      tg.addColorStop(1, pal.top[1]);
      k.sideG = sg;
      k.topG = tg;
    };
    let caseSide: CanvasGradient | null = null;
    let caseTop: CanvasGradient | null = null;

    // ---- interaction state
    const ripples: { x: number; y: number; t: number; a: number }[] = [];
    let hover: Key | null = null;
    let chipHold: Key | null = null;
    let pointer: { x: number; y: number } | null = null; // world, on the key tops
    const tilt = { px: 0, py: 0 };
    const cur = { q: 0, px: 0, py: 0 };
    let lastInput = -1e9;
    let demoAt = 0;
    let demoI = 0;
    let current: Key | null = null; // the key on the display
    let shown = "";
    let typed = 0;
    let typeAt = 0;
    const idleText = isFine ? "tools --trusted · hover or type" : "tools --trusted · tap a key";
    let caretOn = true;
    let knob = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let running = false;

    // One chip in the list lights up: the tool on the display.
    let hotName: string | null = null;
    const chipEl = (n: string) => section?.querySelector(`.stack-item[data-name="${CSS.escape(n)}"]`);
    const setHot = (n: string | null) => {
      if (n === hotName) return;
      if (hotName) chipEl(hotName)?.classList.remove("is-hot");
      if (n) chipEl(n)?.classList.add("is-hot");
      hotName = n;
    };

    const say = (k: Key | null) => {
      current = k;
      if (running) setHot(k?.chip ?? null);
      const t = k ? k.display : idleText;
      if (t === shown) return;
      shown = t;
      typed = still ? t.length : 0;
      typeAt = 0;
      dirty = true;
    };
    say(null);

    const press = (k: Key, ms: number, amp: number) => {
      k.hold = Math.max(k.hold, ms);
      if (!still && amp > 0) ripples.push({ x: k.cx, y: k.cy, t: 0, a: amp });
      say(k);
      dirty = true;
    };

    // ---- the board
    const draw = () => {
      const { dpr } = view;
      const px = (view.S / 60) * dpr; // shadow sizes follow the board's size
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ground shadow: only the blur is drawn (the shape itself sits off-canvas).
      const off = 4000;
      plane(0, CASE_D, -view.lift, -off);
      ctx.save();
      ctx.shadowColor = `rgba(42, 26, 21, ${(0.36 - view.lift * 0.45).toFixed(3)})`;
      ctx.shadowBlur = (16 + view.lift * 70) * px;
      ctx.shadowOffsetX = off;
      ctx.shadowOffsetY = 6 * px;
      ctx.fillStyle = "#000";
      rrect(30, 34, CASE_W * L - 60, CASE_D * L - 50, 40);
      ctx.fill();
      ctx.restore();

      // case: stacked slices make the slab, then the top
      if (!caseSide || !caseTop) {
        caseSide = ctx.createLinearGradient(0, 0, CASE_W * L, CASE_D * L);
        caseSide.addColorStop(0, "#d9c2a6");
        caseSide.addColorStop(1, "#b9967f");
        caseTop = ctx.createLinearGradient(0, 0, CASE_W * L * 0.3, CASE_D * L);
        caseTop.addColorStop(0, "#f8ecd6");
        caseTop.addColorStop(1, "#ecdcc2");
      }
      for (let i = 0; i < 5; i++) {
        plane(0, CASE_D, (CASE_H * i) / 5);
        ctx.fillStyle = caseSide;
        rrect(0, 0, CASE_W * L, CASE_D * L, 30);
        ctx.fill();
      }
      plane(0, CASE_D, CASE_H);
      ctx.fillStyle = caseTop;
      rrect(0, 0, CASE_W * L, CASE_D * L, 30);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // key well
      ctx.fillStyle = "#e7d4b8";
      rrect((M - 0.08) * L, (STRIP + M - 0.06) * L, (9 + 0.16) * L, (3 + 0.14) * L, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(42, 26, 21, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // display strip
      const dx = M + 0.02;
      const dy = CASE_D - M * 0.55;
      const dw = 7.35;
      const dh = STRIP - 0.12;
      const small = view.S < 46;
      plane(dx, dy, CASE_H + 0.004);
      ctx.fillStyle = "#2a1a15";
      rrect(0, 0, dw * L, dh * L, 12);
      ctx.fill();
      ctx.save();
      ctx.clip();
      const dg = ctx.createRadialGradient(dw * L * 0.18, dh * L * 0.5, 0, dw * L * 0.18, dh * L * 0.5, dw * L * 0.6);
      dg.addColorStop(0, "rgba(124, 30, 50, 0.45)");
      dg.addColorStop(1, "rgba(124, 30, 50, 0)");
      ctx.fillStyle = dg;
      ctx.fillRect(0, 0, dw * L, dh * L);
      ctx.restore();
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.font = `500 ${small ? 30 : 24}px "Geist Mono", ui-monospace, monospace`;
      ctx.fillStyle = "#fff8e7";
      const line = `> ${shown.slice(0, typed)}`;
      ctx.fillText(line, 22, dh * L * 0.52);
      if (caretOn || typed < shown.length) {
        const cw = ctx.measureText(line).width;
        const ch = small ? 28 : 24;
        ctx.fillStyle = "#e9d8bf";
        ctx.fillRect(26 + cw, dh * L * 0.52 - ch / 2, small ? 15 : 13, ch);
      }
      if (current?.group) {
        ctx.textAlign = "right";
        ctx.font = `500 ${small ? 18 : 15}px "Geist Mono", ui-monospace, monospace`;
        ctx.fillStyle = "rgba(233, 216, 191, 0.6)";
        ctx.fillText(current.group.toUpperCase(), dw * L - 20, dh * L * 0.52);
      }

      // knob (turns with the page)
      const kx = M + 8.1;
      const ky = CASE_D - M * 0.55 - dh / 2;
      const kr = 0.3;
      for (let i = 0; i <= 5; i++) {
        plane(kx, ky, CASE_H + (0.26 * i) / 5);
        ctx.fillStyle = i < 5 ? (i % 2 ? "#3a261f" : "#2a1a15") : "#3a261f";
        ctx.beginPath();
        ctx.arc(0, 0, kr * L, 0, Math.PI * 2);
        ctx.fill();
      }
      plane(kx, ky, CASE_H + 0.26);
      const kg = ctx.createRadialGradient(-10, -10, 2, 0, 0, kr * L);
      kg.addColorStop(0, "#fff8e7");
      kg.addColorStop(1, "#d9c2a6");
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.arc(0, 0, kr * L * 0.86, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = HOT_INK;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(Math.cos(knob) * 6, Math.sin(knob) * 6);
      ctx.lineTo(Math.cos(knob) * kr * L * 0.7, Math.sin(knob) * kr * L * 0.7);
      ctx.stroke();

      // burgundy light on the plate under pressed / lit keys
      for (const k of keys) {
        const e = Math.max(Math.min(1, k.p), k.lit);
        if (e < 0.04) continue;
        const r = L * (0.62 + k.w * 0.32);
        plane(k.cx, k.cy, CASE_H + 0.002);
        ctx.globalAlpha = Math.min(1, e);
        ctx.drawImage(glow, -r, -r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      // keys, back to front
      const order = keys.map((k) => ({ k, d: proj(k.cx, k.cy, CASE_H).d })).sort((a, b) => b.d - a.d);
      const slices = view.S * dpr > 70 ? 7 : 5;
      for (const { k } of order) {
        ensureGrads(k);
        const pal = PALETTE[k.kind];
        const W = (k.w - GAP * 2) * L;
        const D = (1 - GAP * 2) * L;
        const bx = k.x0 + GAP;
        const by = k.y1 - GAP;
        const zTop = CASE_H + KEY_H * (1 - 0.58 * Math.min(1.15, Math.max(0, k.p)));
        for (let i = 0; i < slices; i++) {
          const t = i / slices;
          const ins = TAPER * L * t;
          plane(bx, by, lerp(CASE_H, zTop, t));
          ctx.fillStyle = k.sideG as CanvasGradient;
          rrect(ins, ins, W - ins * 2, D - ins * 2, 16 - t * 4);
          ctx.fill();
        }
        const ins = TAPER * L;
        const tw = W - ins * 2;
        const td = D - ins * 2;
        plane(bx, by, zTop);
        ctx.fillStyle = k.topG as CanvasGradient;
        rrect(ins, ins, tw, td, 12);
        ctx.fill();
        ctx.strokeStyle = k.kind === "icon" ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 248, 231, 0.12)";
        ctx.lineWidth = 2;
        ctx.stroke();
        if (k.p > 0.02 || k.lit > 0.02) {
          const p = Math.min(1, Math.max(0, k.p));
          ctx.fillStyle =
            k.kind === "icon"
              ? `rgba(124, 30, 50, ${(0.05 * p + 0.22 * k.lit).toFixed(3)})`
              : k.kind === "dark"
                ? `rgba(124, 30, 50, ${(0.65 * k.lit).toFixed(3)})`
                : `rgba(255, 248, 231, ${(0.16 * k.lit).toFixed(3)})`;
          ctx.fill();
        }
        // legend
        const mx = ins + tw / 2;
        const my = ins + td / 2;
        if (k.kind === "icon") {
          const ic = icons.get(k.def.name);
          if (ic) {
            const s = 40;
            ctx.drawImage(ic.ink, mx - s / 2, my - s / 2, s, s);
            const a = Math.min(1, Math.max(k.p * 1.6, k.lit * 1.3));
            if (a > 0.02) {
              ctx.globalAlpha = a;
              ctx.drawImage(ic.hot, mx - s / 2, my - s / 2, s, s);
              ctx.globalAlpha = 1;
            }
          }
        } else if (k.def.label) {
          ctx.fillStyle = pal.ink;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `500 19px "Geist Mono", ui-monospace, monospace`;
          ctx.fillText(k.def.label, mx, my + 1);
        } else {
          // return arrow
          ctx.strokeStyle = pal.ink;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(mx + 18, my - 14);
          ctx.lineTo(mx + 18, my + 6);
          ctx.lineTo(mx - 18, my + 6);
          ctx.moveTo(mx - 9, my - 3);
          ctx.lineTo(mx - 18, my + 6);
          ctx.lineTo(mx - 9, my + 15);
          ctx.stroke();
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    // ---- hit test: the front-most key whose cap (or front face) is under the point
    const hit = (sx: number, sy: number): Key | null => {
      const order = keys.map((k) => ({ k, d: proj(k.cx, k.cy, CASE_H).d })).sort((a, b) => a.d - b.d);
      for (const { k } of order) {
        const zTop = CASE_H + KEY_H * (1 - 0.58 * Math.max(0, k.p));
        for (const z of [zTop, CASE_H + 0.05]) {
          const p = unproject(sx, sy, z);
          if (p.x >= k.x0 + GAP && p.x <= k.x0 + k.w - GAP && p.y <= k.y1 - GAP && p.y >= k.y1 - 1 + GAP) return k;
        }
      }
      return null;
    };
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    // ---- frame loop
    let caretT = 0;
    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs, 50) / 1000;
      const now = performance.now();
      const sec = now / 1000;

      // where the board is on screen, and how fast the page moves
      const y = window.scrollY;
      vel += ((y - lastY) / Math.max(dt, 1 / 240) - vel) * Math.min(1, dt * 10);
      lastY = y;
      if (!still) {
        // 1 while the board comes in at the bottom of the screen, -1 as it leaves at the top
        const q = st ? 1 - 2 * st.progress : 0;
        cur.q += (q - cur.q) * Math.min(1, dt * 4);
        cur.px += (tilt.px - cur.px) * Math.min(1, dt * 5);
        cur.py += (tilt.py - cur.py) * Math.min(1, dt * 5);
        view.yaw = YAW + cur.q * TILT_Q + cur.px * TILT_PX + Math.sin(sec * 0.7) * SWAY;
        view.el = ELEV + cur.q * TILT_Q + cur.py * TILT_PY;
        view.lift = LIFT + Math.sin(sec * 1.3) * BOB;
        dirty = true;
      }

      // demo: plays itself when nobody is touching it
      if (!still && now - lastInput > 2600 && now > demoAt) {
        demoAt = now + 1300;
        const k = byName.get(DEMO[demoI++ % DEMO.length]);
        if (k) press(k, 210, k.kind === "accent" ? 0.85 : 0.32);
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].t += dt;
        if (ripples[i].t > 2.2) ripples.splice(i, 1);
      }
      const A = still ? 0 : Math.min(1, Math.abs(vel) / 1100);
      const phase = y * 0.008;
      for (const k of keys) {
        k.hold = Math.max(0, k.hold - dtMs);
        let target = k.hold > 0 ? 1 : 0;
        let lit = target;
        if (k === hover || k === chipHold) {
          target = Math.max(target, 0.82);
          lit = Math.max(lit, 0.75);
        }
        if (pointer && !still) {
          const d2 = (k.cx - pointer.x) ** 2 + (k.cy - pointer.y) ** 2;
          target = Math.max(target, 0.26 * Math.exp(-d2 / 1.1));
        }
        if (A > 0.01) {
          const m = (((k.cx + (k.cy - 2) * 0.45 - phase) % WAVE_P) + WAVE_P) % WAVE_P;
          const d = Math.min(m, WAVE_P - m);
          const w = A * Math.exp(-(d * d) / 1.1);
          target = Math.max(target, w * 0.85);
          lit = Math.max(lit, w);
        }
        for (const r of ripples) {
          const dist = Math.hypot(k.cx - r.x, k.cy - r.y);
          const ring = r.a * Math.exp(-((dist - r.t * 5.2) ** 2) / 0.55) * Math.exp(-r.t * 1.15);
          target = Math.max(target, ring * 0.9);
          lit = Math.max(lit, ring * 1.2);
        }
        lit = Math.min(1, lit);
        if (still) {
          if (k.p !== target || k.lit !== lit) dirty = true;
          k.p = target;
          k.lit = lit;
          continue;
        }
        k.lit += (lit - k.lit) * Math.min(1, dt * 16);
        for (let s = 0; s < 2; s++) {
          const h = dt / 2;
          k.v += (900 * (target - k.p) - 34 * k.v) * h;
          k.p += k.v * h;
        }
        if (Math.abs(target - k.p) < 0.001 && Math.abs(k.v) < 0.001) {
          k.p = target;
          k.v = 0;
        }
      }

      // display: typewriter + caret
      if (typed < shown.length && now > typeAt) {
        typed += 1;
        typeAt = now + 30;
        dirty = true;
      }
      caretT += dtMs;
      if (caretT > 530) {
        caretT = 0;
        caretOn = !caretOn;
        dirty = true;
      }
      const kn = y * 0.006;
      if (Math.abs(kn - knob) > 0.002) {
        knob = kn;
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        draw();
      }
    };

    // ---- input
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const { x, y } = local(e);
      lastInput = performance.now();
      const k = hit(x, y);
      if (k !== hover) {
        hover = k;
        if (k) say(k);
        canvas.style.cursor = k ? "pointer" : "";
      }
      const w = unproject(x, y, CASE_H + KEY_H);
      pointer = w.x > -0.5 && w.x < CASE_W + 0.5 && w.y > -0.5 && w.y < CASE_D + 0.5 ? w : null;
      if (isFine) {
        tilt.px = Math.max(-1, Math.min(1, (x / view.w - 0.5) * 2));
        tilt.py = Math.max(-1, Math.min(1, (y / view.h - 0.5) * 2));
      }
    };
    const onLeave = () => {
      hover = null;
      pointer = null;
      canvas.style.cursor = "";
      tilt.px = 0;
      tilt.py = 0;
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = local(e);
      const k = hit(x, y);
      lastInput = performance.now();
      if (!k) return;
      press(k, e.pointerType === "mouse" ? 160 : 420, k.kind === "accent" ? 1.15 : 0.75);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!running || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      // Leave keys alone while another widget has focus (the deck flips on Enter, the terminal types).
      if (el && el !== document.body && !section?.contains(el)) return;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "Enter") {
        if (el && /^(A|BUTTON)$/.test(el.tagName)) return;
        const k = byName.get("Ship it");
        if (k) press(k, 220, 1.15);
      } else if (/^[a-z]$/i.test(e.key)) {
        const list = keys.filter((k) => k.display.toLowerCase().startsWith(e.key.toLowerCase()));
        if (!list.length) return;
        const i = (list.findIndex((k) => k === current) + 1) % list.length;
        press(list[i], 200, 0.6);
      } else return;
      lastInput = performance.now();
    };
    // The list below: hovering (laptops) or tapping (phones) a chip presses its key.
    const chipOf = (e: Event) => (e.target as Element | null)?.closest?.<HTMLElement>(".stack-item[data-name]");
    const onChipOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const k = byChip.get(chipOf(e)?.dataset.name ?? "");
      if (!k) return;
      chipHold = k;
      lastInput = performance.now();
      say(k);
    };
    const onChipOut = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && chipOf(e)) chipHold = null;
    };
    const onChipTap = (e: MouseEvent) => {
      if (isFine) return;
      const k = byChip.get(chipOf(e)?.dataset.name ?? "");
      if (!k) return;
      lastInput = performance.now();
      press(k, 1400, 0.75);
    };

    const st = still ? null : ScrollTrigger.create({ trigger: canvas, start: "top bottom", end: "bottom top" });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    let seen = false;
    const start = () => {
      if (running) return;
      running = true;
      lastY = window.scrollY;
      vel = 0;
      if (!seen) {
        seen = true;
        demoAt = performance.now() + 1700; // let the prompt type out first
      }
      setHot(current?.chip ?? null);
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
      setHot(null);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "80px 0px" });
    io.observe(canvas);
    document.fonts?.ready.then(() => (dirty = true));

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    section?.addEventListener("pointerover", onChipOver);
    section?.addEventListener("pointerout", onChipOut);
    section?.addEventListener("click", onChipTap);

    return () => {
      stop();
      st?.kill();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      section?.removeEventListener("pointerover", onChipOver);
      section?.removeEventListener("pointerout", onChipOut);
      section?.removeEventListener("click", onChipTap);
      setHot(null);
    };
  }, [tools]);

  return (
    <div className="keys" ref={rootRef}>
      <canvas className="keys-canvas" ref={canvasRef} aria-hidden="true" />
      <p className="mono keys-hint" aria-hidden="true">
        <span className="for-fine">Hover, click or type a letter</span>
        <span className="for-touch">Tap a key · scroll to send a wave</span>
      </p>
      <div className="keys-icons" hidden>
        {tools.map(({ name, Icon }) => (Icon ? <Icon key={name} data-name={name} /> : null))}
      </div>
    </div>
  );
};

export default StackKeys;
