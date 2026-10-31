import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Cursor.css";

const INTERACTIVE = "a, button, [role='button'], .work-item, .cap-card, .orbit-chip, .about-net";

const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      ring.classList.add("is-on");
      dot.classList.add("is-on");
    };
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      ring.classList.toggle("is-hover", Boolean(hit));
    };
    const onLeave = () => {
      ring.classList.remove("is-on");
      dot.classList.remove("is-on");
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
};

export default Cursor;
