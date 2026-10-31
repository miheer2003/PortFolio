import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MdArrowOutward } from "react-icons/md";
import "./styles/Work.css";
import SectionHead from "./SectionHead";
import ProjectArt, { type ArtKey } from "./ProjectArt";
import { StarDock } from "./ScrollStar";

gsap.registerPlugin(useGSAP);

const GH = "https://github.com/miheer2003";

const PROJECTS: { title: string; kind: string; tools: string; art: ArtKey; link: string }[] = [
  {
    title: "UniYaar",
    kind: "Full-stack platform",
    tools: "Java 21 · Spring Boot 3 · React · TypeScript · MySQL",
    art: "uniyaar",
    link: `${GH}/Uni-Yaar`,
  },
  {
    title: "PDF Tool",
    kind: "Document utility",
    tools: "In progress",
    art: "pdf",
    link: `${GH}/PDF-Tool`,
  },
  {
    title: "OptiRoute",
    kind: "Route optimisation",
    tools: "Java · JavaScript · Docker",
    art: "optiroute",
    link: `${GH}/OptiRoute`,
  },
  {
    title: "AirLight",
    kind: "Computer vision · IoT",
    tools: "Python · MediaPipe · OpenCV · Flask · Tuya",
    art: "airlight",
    link: `${GH}/Air-Light`,
  },
  {
    title: "Task Manager API",
    kind: "Backend · REST",
    tools: "Java · Spring Boot 3 · Hibernate · MySQL · OpenAPI",
    art: "tasks",
    link: `${GH}/Task-Manager`,
  },
  {
    title: "JobHunt Agent",
    kind: "AI agent · Automation",
    tools: "Python · Claude · Gemini · Ollama · ATS APIs",
    art: "jobhunt",
    link: `${GH}/JOB-HUNT-Automation-With-AI`,
  },
];

const Work = () => {
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

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
          Things I've <StarDock before={<span className="serif accent-text">built</span>} />
        </h2>

        <ol className="work-list" onPointerLeave={() => setHovered(null)}>
          {PROJECTS.map((p, i) => {
            return (
              <li
                key={p.title}
                className={`work-item ${hovered !== null && hovered !== i ? "is-dim" : ""}`}
                onPointerEnter={() => setHovered(i)}
                data-reveal="fade"
              >
                <a className="work-row" href={p.link} target="_blank" rel="noopener noreferrer">
                  <span className="mono work-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="work-title">{p.title}</span>
                  <span className="work-kind">{p.kind}</span>
                  <span className="work-tools mono">{p.tools}</span>
                  <span className="work-arrow" aria-hidden="true">
                    <MdArrowOutward />
                  </span>
                  <span className="work-thumb work-cover">
                    <ProjectArt art={p.art} id={`t-${p.art}`} />
                    <span className="work-cover-glare" aria-hidden="true" />
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <a className="work-more mono link-line" href={`${GH}?tab=repositories`} target="_blank" rel="noopener noreferrer">
          More on GitHub <MdArrowOutward />
        </a>
      </div>

      <div className={`work-preview ${hovered !== null ? "is-visible" : ""}`} ref={previewRef} aria-hidden="true">
        <div className="work-preview-in">
          {PROJECTS.map((p, i) => (
            <div key={p.title} className={`work-cover ${hovered === i ? "is-current" : ""}`}>
              <ProjectArt art={p.art} id={`p-${p.art}`} />
            </div>
          ))}
          <span className="work-cover-glare" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default Work;
