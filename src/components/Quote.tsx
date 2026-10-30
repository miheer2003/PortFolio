import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./styles/Quote.css";
import { prefersReducedMotion } from "./utils/lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WORDS: { text: string; serif?: boolean }[] = [
  { text: "Pressure" },
  { text: "is" },
  { text: "a" },
  { text: "privilege.", serif: true },
];

const Quote = () => {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const chars = gsap.utils.toArray<HTMLElement>(".quote-char");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".quote-text",
          start: "top 85%",
          end: "bottom 45%",
          scrub: 0.8,
        },
      });
      tl.from(chars, {
        opacity: 0.12,
        yPercent: 40,
        rotationX: -80,
        transformOrigin: "50% 100% -0.3em",
        stagger: 0.04,
        ease: "power2.out",
      }).from(".quote-meta > *", { autoAlpha: 0, y: 16, stagger: 0.1 }, "-=0.2");

      // the mark drifts against the scroll for depth
      gsap.to(".quote-mark", {
        yPercent: -40,
        rotation: -8,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="quote" ref={rootRef} aria-label="Quote">
      <div className="wrap quote-in">
        <span className="quote-mark serif" aria-hidden="true">
          “
        </span>
        <blockquote className="quote-text" aria-label="Pressure is a privilege.">
          {WORDS.map((w) => (
            <span className={`quote-word ${w.serif ? "serif accent-text" : ""}`} key={w.text} aria-hidden="true">
              {[...w.text].map((c, i) => (
                <span className="quote-char" key={i}>
                  {c}
                </span>
              ))}
            </span>
          ))}
        </blockquote>
        <div className="quote-meta mono">
          <span>Billie Jean King</span>
          <span className="quote-rule" />
          <span>A line I work by</span>
        </div>
      </div>
    </section>
  );
};

export default Quote;
