import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth-scroll to a selector, element or pixel offset. */
export const scrollToTarget = (target: string | HTMLElement | number) => {
  if (instance) {
    instance.scrollTo(target, { duration: 1.6, offset: 0, force: true });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView();
};
