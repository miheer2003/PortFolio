import gsap from "gsap";
import { prefersReducedMotion } from "./lenis";

/* Elements whose own CSS never sets `transform`, so GSAP's x/y can't clobber a hover style. */
const SELECTOR = ".btn, .nav-term, .contact-email, .footer-top";

/**
 * Magnetic buttons: the element leans toward the pointer while hovered and springs
 * back on leave. Laptops only (fine pointer); off for reduced motion. Uses one
 * delegated listener, so buttons rendered later (popups) work too. Returns a cleanup.
 */
export const initMagnetic = () => {
  if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return () => {};
  }

  let el: HTMLElement | null = null;
  let cx = 0;
  let cy = 0;
  let pull = 0.3;
  let cap = 12;
  let qx: ((v: number) => void) | null = null;
  let qy: ((v: number) => void) | null = null;

  const release = () => {
    if (!el) return;
    gsap.killTweensOf(el, "x,y");
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    el = null;
  };

  const grab = (next: HTMLElement) => {
    el = next;
    gsap.killTweensOf(el, "x,y");
    const r = el.getBoundingClientRect();
    // Centre without the current offset, so a re-grab mid-spring doesn't drift.
    cx = r.left + r.width / 2 - Number(gsap.getProperty(el, "x"));
    cy = r.top + r.height / 2 - Number(gsap.getProperty(el, "y"));
    // Wide elements (the email link) pull less than round icon buttons.
    pull = r.width > 260 ? 0.08 : r.width > 70 ? 0.22 : 0.34;
    cap = r.width > 260 ? 8 : 12;
    qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
  };

  const onMove = (e: PointerEvent) => {
    const hit = (e.target as Element | null)?.closest?.<HTMLElement>(SELECTOR) ?? null;
    if (hit !== el) {
      release();
      if (hit) grab(hit);
    }
    if (!el || !qx || !qy) return;
    qx(gsap.utils.clamp(-cap, cap, (e.clientX - cx) * pull));
    qy(gsap.utils.clamp(-cap, cap, (e.clientY - cy) * pull));
  };

  document.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", release);
  window.addEventListener("blur", release);
  return () => {
    document.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", release);
    window.removeEventListener("blur", release);
    release();
  };
};
