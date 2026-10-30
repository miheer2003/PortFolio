import { useRef, useState } from "react";
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

  useGSAP(
    () => {
      const preview = previewRef.current;
      const list = rootRef.current?.querySelector(".work-list");
      if (!preview || !list) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3.out" });
      const rTo = gsap.quickTo(preview, "rotation", { duration: 0.9, ease: "power3.out" });
      const ryTo = gsap.quickTo(preview, "rotationY", { duration: 0.9, ease: "power3.out" });
      gsap.set(preview, { transformPerspective: 900 });
      let lastX = 0;

      const onMove = (e: Event) => {
        const { clientX, clientY } = e as PointerEvent;
        xTo(clientX);
        yTo(clientY);
        const v = clientX - lastX;
        rTo(gsap.utils.clamp(-6, 6, v * 0.3));
        ryTo(gsap.utils.clamp(-22, 22, v * 1.2));
        lastX = clientX;
      };
      list.addEventListener("pointermove", onMove);
      return () => list.removeEventListener("pointermove", onMove);
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
                  {...(p.link
                    ? { href: p.link, target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="mono work-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="work-title">{p.title}</span>
                  <span className="work-kind">{p.kind}</span>
                  <span className="work-tools mono">{p.tools}</span>
                  <span className="work-arrow" aria-hidden="true">
                    {p.link ? <MdArrowOutward /> : null}
                  </span>
                  <span className="work-thumb work-cover">
                    <img src={p.image} alt="" loading="lazy" />
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

      <div
        className={`work-preview ${hovered !== null ? "is-visible" : ""}`}
        ref={previewRef}
        aria-hidden="true"
      >
        <div className="work-preview-in">
          {PROJECTS.map((p, i) => (
            <div key={p.title} className={`work-cover ${hovered === i ? "is-current" : ""}`}>
              <img src={p.image} alt="" loading="lazy" />
            </div>
          ))}
          <div className="work-preview-label mono">
            <span>{hovered !== null ? String(hovered + 1).padStart(2, "0") : ""}</span>
            <span>{hovered !== null ? PROJECTS[hovered].kind : ""}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
