import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import About from "./About";
import Career from "./Career";
import Certifications from "./Certifications";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import Quote from "./Quote";
import TechStack from "./TechStack";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import { prefersReducedMotion } from "./utils/lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Reveal system, driven by data attributes:
 *  data-reveal="lines"   masked line-by-line rise (SplitText)
 *  data-reveal="fade"    fade + rise
 *  data-reveal="stagger" children fade + rise in sequence
 *  .sec-line             section rule draws left to right
 */
const MainContainer = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const start = "top 88%";

      gsap.utils.toArray<HTMLElement>(".sec-line").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.6,
            ease: "expo.out",
            scrollTrigger: { trigger: line, start, once: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='lines']").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(self.masks, { paddingBottom: "0.14em", marginBottom: "-0.14em", perspective: 900 });
            return gsap.from(self.lines, {
              yPercent: 105,
              rotationX: -55,
              transformOrigin: "50% 100%",
              duration: 1.4,
              ease: "expo.out",
              stagger: 0.08,
              scrollTrigger: { trigger: el, start, once: true },
            });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='fade']").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 32,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start, once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='stagger']").forEach((el) => {
        gsap.from(el.children, {
          autoAlpha: 0,
          y: 28,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <div className="site" ref={rootRef}>
      <Cursor />
      <Navbar />
      <Landing />
      <About />
      <Work />
      <WhatIDo />
      <Career />
      <Quote />
      <TechStack />
      <Certifications />
      <Contact />
      <div className="grain" aria-hidden="true" />
    </div>
  );
};

export default MainContainer;
