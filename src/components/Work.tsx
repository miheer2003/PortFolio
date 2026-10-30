import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MdArrowOutward } from "react-icons/md";
import "./styles/Work.css";
import SectionHead from "./SectionHead";

gsap.registerPlugin(useGSAP);

const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;

const PROJECTS = [
  {
    title: "OptiRoute",
    kind: "Full-stack platform",
    tools: "Java · Spring Boot · React · MySQL · Docker · JWT",
    image: img("optiroute.jpg"),
    link: "https://github.com/miheer2003/OptiRoute",
  },
  {
    title: "Sign Language Recognition",
    kind: "AI / Deep learning",
    tools: "Python · TensorFlow · Keras · OpenCV · CNN",
    image: img("sign-language.jpg"),
    link: "https://github.com/miheer2003/Sign-Language-Recognition-Using-ML",
  },
  {
    title: "Software Dev Optimization",
    kind: "Machine learning",
    tools: "Python · Scikit-learn · Decision Tree · Random Forest",
    image: img("devoptimizer.jpg"),
  },
  {
    title: "Virtual Calculator",
    kind: "Computer vision",
    tools: "Python · OpenCV · MediaPipe · Hand tracking",
    image: img("virtual-calculator.jpg"),
    link: "https://github.com/miheer2003/Virtual-Calculator",
  },
  {
    title: "Bazaar Aaina",
    kind: "Full-stack + ML",
    tools: "Next.js · Node.js · Express · Machine learning",
    image: img("bazaar-aaina.jpg"),
    link: "https://github.com/miheer2003/Bazaar-Aaina",
  },
];

const Work = () => {
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Decode preview images ahead of time so the first hover doesn't stall.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        PROJECTS.forEach((p) => {
          const i = new Image();
          i.src = p.image;
          i.decode?.().catch(() => {});
        });
        io.disconnect();
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const preview = previewRef.current;
      const list = rootRef.current?.querySelector<HTMLElement>(".work-list");
      if (!preview || !list) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      gsap.set(preview, { xPercent: -50, yPercent: -50, transformPerspective: 900, force3D: true });
      const xTo = gsap.quickTo(preview, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.35, ease: "power3.out" });
      const rTo = gsap.quickTo(preview, "rotation", { duration: 0.5, ease: "power3.out" });
      const ryTo = gsap.quickTo(preview, "rotationY", { duration: 0.5, ease: "power3.out" });
      let lastX = 0;
      let frame = 0;
      let px = 0;
      let py = 0;

      const apply = () => {
        frame = 0;
        const v = px - lastX;
        lastX = px;
        xTo(px);
        yTo(py);
        rTo(gsap.utils.clamp(-5, 5, v * 0.25));
        ryTo(gsap.utils.clamp(-18, 18, v * 0.9));
      };
      const onMove = (e: PointerEvent) => {
        px = e.clientX;
        py = e.clientY;
        if (!frame) frame = requestAnimationFrame(apply);
      };
      // Jump straight to the cursor on entry instead of flying in from the last spot.
      const onEnter = (e: PointerEvent) => {
        px = lastX = e.clientX;
        py = e.clientY;
        xTo(px, px);
        yTo(py, py);
      };
      list.addEventListener("pointermove", onMove);
      list.addEventListener("pointerenter", onEnter);
      return () => {
        cancelAnimationFrame(frame);
        list.removeEventListener("pointermove", onMove);
        list.removeEventListener("pointerenter", onEnter);
      };
    },
    { scope: rootRef }
  );

  return (
    <section className="section work" id="work" ref={rootRef}>
      <div className="wrap">
        <SectionHead index="02" label="Selected work" />
        <h2 className="sec-title" data-reveal="lines">
          Things I've <span className="serif accent-text">built</span>
        </h2>

        <ol className="work-list" onPointerLeave={() => setHovered(null)}>
          {PROJECTS.map((p, i) => {
            const Tag = p.link ? "a" : "div";
            return (
              <li
                key={p.title}
                className={`work-item ${hovered !== null && hovered !== i ? "is-dim" : ""}`}
                onPointerEnter={() => setHovered(i)}
                data-reveal="fade"
              >
                <Tag
                  className="work-row"
                  {...(p.link ? { href: p.link, target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span className="mono work-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="work-title">{p.title}</span>
                  <span className="work-kind">{p.kind}</span>
                  <span className="work-tools mono">{p.tools}</span>
                  <span className="work-arrow" aria-hidden="true">
                    {p.link ? <MdArrowOutward /> : null}
                  </span>
                  <span className="work-thumb work-cover">
                    <img src={p.image} alt="" loading="lazy" decoding="async" />
                    <span className="work-cover-glare" aria-hidden="true" />
                    <span className="work-cover-tag mono">
                      {String(i + 1).padStart(2, "0")} · {p.kind}
                    </span>
                  </span>
                </Tag>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`work-preview ${hovered !== null ? "is-visible" : ""}`} ref={previewRef} aria-hidden="true">
        <div className="work-preview-in">
          {PROJECTS.map((p, i) => (
            <div key={p.title} className={`work-cover ${hovered === i ? "is-current" : ""}`}>
              <img src={p.image} alt="" decoding="async" />
            </div>
          ))}
          <span className="work-cover-glare" aria-hidden="true" />
          <div className="work-preview-label mono">
            <span className="work-chip">{hovered !== null ? String(hovered + 1).padStart(2, "0") : "00"}</span>
            <span className="work-chip">{hovered !== null ? PROJECTS[hovered].kind : ""}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
