import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis, prefersReducedMotion } from "./lenis";

gsap.registerPlugin(ScrollTrigger);

export function initialFX() {
  document.body.style.overflowY = "auto";
  getLenis()?.start();

  const enter = () => {
    document.documentElement.dataset.entered = "1";
    document.querySelector(".hero-photo")?.classList.add("is-in");
    window.dispatchEvent(new Event("site:enter"));
  };

  if (prefersReducedMotion()) {
    gsap.set(".header", { autoAlpha: 1 });
    enter();
    ScrollTrigger.refresh();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.fromTo(".hero-glow", { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.4, ease: "power2.out" }, 0)
    .add(enter, 0.15)
    .fromTo(
      ".hero-char",
      { yPercent: 70, rotationX: -95, opacity: 0, transformOrigin: "50% 100% -0.25em" },
      { yPercent: 0, rotationX: 0, opacity: 1, duration: 1.7, stagger: 0.05 },
      0.1
    )
    .fromTo(
      "[data-hero-fade]",
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.07 },
      0.55
    )
    .fromTo(".header", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.6)
    .fromTo(
      ".header-bar",
      { yPercent: -60 },
      { yPercent: 0, duration: 1.2, clearProps: "transform" },
      0.6
    );

  ScrollTrigger.refresh();
}
