import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { IconType } from "react-icons";
import { prefersReducedMotion } from "./utils/lenis";
import "./styles/StackOrbit.css";

export type OrbitItem = { name: string; Icon: IconType };

const TILT = -0.32; // resting tilt in radians: the sphere is seen slightly from above
const AUTO = 0.00024; // idle spin, radians per ms
const DRAG = 0.0085; // radians per dragged pixel
const MAX_V = 0.22; // fling speed cap, radians per frame

const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
const lattice = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Tools on a 3D sphere. Positions are computed with the same rotation that
 * CSS applies to the rings (rotateX · rotateY), and the browser depth-sorts
 * the chips through preserve-3d. Runs only while on screen.
 */
const StackOrbit = ({ items }: { items: OrbitItem[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const rings = ringsRef.current;
    if (!root || !rings) return;
    const chips = [...root.querySelectorAll<HTMLElement>(".orbit-chip")];
    const pts = lattice(chips.length);
    const list = root.closest("section")?.querySelector<HTMLElement>(".stack-groups") ?? null;
    const reduce = prefersReducedMotion();

    const s = { rx: TILT, ry: 0.5, vx: 0, vy: 0, grow: reduce ? 1 : 0 };
    let radius = 0;
    let dragging = false;
    let focus: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let lastScroll = window.scrollY;
    let tapTimer = 0;

    const measure = () => {
      radius = root.clientWidth * 0.36;
      rings.style.setProperty("--d", `${(radius * 2).toFixed(1)}px`);
    };

    const render = () => {
      const cx = Math.cos(s.rx);
      const sx = Math.sin(s.rx);
      const cy = Math.cos(s.ry);
      const sy = Math.sin(s.ry);
      const r = radius * s.grow;
      const fade = Math.min(1, s.grow * 1.6);
      for (let i = 0; i < chips.length; i++) {
        const p = pts[i];
        const x1 = cy * p.x + sy * p.z; // rotateY
        const z1 = -sy * p.x + cy * p.z;
        const y2 = cx * p.y - sx * z1; // then rotateX
        const z2 = sx * p.y + cx * z1;
        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        const c = chips[i];
        c.style.transform = `translate3d(${(x1 * r).toFixed(1)}px,${(y2 * r).toFixed(1)}px,${(z2 * r).toFixed(1)}px)`;
        c.style.opacity = ((0.18 + 0.82 * depth) * fade).toFixed(3);
      }
      rings.style.transform = `rotateX(${s.rx.toFixed(4)}rad) rotateY(${s.ry.toFixed(4)}rad) scale(${s.grow.toFixed(3)})`;
    };

    const tick = (_t: number, dt: number) => {
      const k = Math.min(dt, 50) / 16.67;
      const y = window.scrollY;
      const scrolled = y - lastScroll;
      lastScroll = y;

      if (!dragging) {
        if (focus !== null) {
          // Bring the focused tool to the front.
          const p = pts[focus];
          const ty = Math.atan2(-p.x, p.z);
          const tx = Math.atan2(p.y, Math.hypot(p.x, p.z));
          s.ry += wrapAngle(ty - s.ry) * 0.12 * k;
          s.rx += (tx - s.rx) * 0.12 * k;
          s.vx = 0;
          s.vy = 0;
        } else {
          s.ry += s.vy * k;
          s.rx = clamp(s.rx + s.vx * k, -1.25, 1.25);
          if (!reduce) s.ry += AUTO * dt + scrolled * 0.0012;
          const damp = Math.pow(0.94, k);
          s.vx *= damp;
          s.vy *= damp;
          s.rx += (TILT - s.rx) * 0.02 * k;
        }
      }
      render();
    };

    // ---- drag / swipe ----
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      focus = null;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      s.vx = 0;
      s.vy = 0;
      root.setPointerCapture?.(e.pointerId);
      root.classList.add("is-drag");
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const ms = Math.max(1, e.timeStamp - lastT);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      s.ry += dx * DRAG;
      s.rx = clamp(s.rx - dy * DRAG, -1.25, 1.25);
      s.vy = clamp(((dx * DRAG) / ms) * 16.67, -MAX_V, MAX_V);
      s.vx = clamp(((-dy * DRAG) / ms) * 16.67, -MAX_V, MAX_V);
      if (reduce) render();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-drag");
    };

    // ---- linked highlight with the chip list ----
    const hot = (name: string | null) => {
      chips.forEach((c) => c.classList.toggle("is-hot", c.dataset.name === name));
      list?.querySelectorAll<HTMLElement>(".stack-item").forEach((li) => li.classList.toggle("is-hot", li.dataset.name === name));
    };
    const indexOf = (name?: string) => chips.findIndex((c) => c.dataset.name === name);

    const overOrbit = (e: PointerEvent) => {
      if (dragging) return;
      hot((e.target as Element).closest<HTMLElement>(".orbit-chip")?.dataset.name ?? null);
    };
    const leaveOrbit = () => !dragging && hot(null);

    const overList = (e: PointerEvent) => {
      if (!fine()) return;
      const name = (e.target as Element).closest<HTMLElement>(".stack-item")?.dataset.name;
      const i = indexOf(name);
      focus = i >= 0 ? i : null;
      hot(i >= 0 ? name! : null);
    };
    const leaveList = () => {
      if (!fine()) return;
      focus = null;
      hot(null);
    };
    // Touch: a tap on a list chip spins its icon to the front for a moment.
    const tapList = (e: MouseEvent) => {
      if (fine()) return;
      const name = (e.target as Element).closest<HTMLElement>(".stack-item")?.dataset.name;
      const i = indexOf(name);
      if (i < 0) return;
      focus = i;
      hot(name!);
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(() => {
        focus = null;
        hot(null);
      }, 2600);
    };

    // ---- run only while visible ----
    let running = false;
    let grown = reduce;
    const start = () => {
      if (running) return;
      running = true;
      lastScroll = window.scrollY;
      gsap.ticker.add(tick);
      if (!grown) {
        grown = true;
        s.vy = 0.14; // entrance spin
        gsap.to(s, { grow: 1, duration: 1.8, ease: "expo.out" });
      }
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "120px 0px" });
    const ro = new ResizeObserver(() => {
      measure();
      render();
    });

    measure();
    render();
    io.observe(root);
    ro.observe(root);
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    root.addEventListener("lostpointercapture", up);
    root.addEventListener("pointerover", overOrbit);
    root.addEventListener("pointerleave", leaveOrbit);
    list?.addEventListener("pointerover", overList);
    list?.addEventListener("pointerleave", leaveList);
    list?.addEventListener("click", tapList);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      gsap.killTweensOf(s);
      window.clearTimeout(tapTimer);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      root.removeEventListener("lostpointercapture", up);
      root.removeEventListener("pointerover", overOrbit);
      root.removeEventListener("pointerleave", leaveOrbit);
      list?.removeEventListener("pointerover", overList);
      list?.removeEventListener("pointerleave", leaveList);
      list?.removeEventListener("click", tapList);
    };
  }, [items]);

  return (
    <div className="orbit" ref={rootRef} role="img" aria-label="The tools I use, arranged on a sphere you can spin">
      <div className="orbit-stage" aria-hidden="true">
        <span className="orbit-core" />
        <div className="orbit-rings" ref={ringsRef}>
          <i />
          <i />
          <i />
          <i />
        </div>
        {items.map(({ name, Icon }) => (
          <span className="orbit-chip" data-name={name} key={name}>
            <span className="orbit-face">
              <Icon />
            </span>
            <span className="orbit-tip mono">{name}</span>
          </span>
        ))}
      </div>
      <span className="orbit-hint mono" aria-hidden="true">
        <span className="for-fine">Drag to spin</span>
        <span className="for-touch">Swipe to spin</span>
      </span>
    </div>
  );
};

export default StackOrbit;
