import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./styles/About.css";
import SectionHead from "./SectionHead";

const AboutNet = lazy(() => import("./AboutNet"));

/** Loads the WebGL network only when About gets close to the screen. */
const NetSlot = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="about-net" ref={ref} aria-hidden="true">
      {on && (
        <Suspense fallback={null}>
          <AboutNet />
        </Suspense>
      )}
      <span className="mono about-net-hint">Click to fire</span>
    </div>
  );
};

const FACTS = [
  { k: "Role", v: "AI Engineer, Nutsovertech" },
  { k: "Education", v: "PG-DAC, CDAC ACTS · AIR 23" },
  { k: "Focus", v: "Gen AI, agents, Ruby on Rails" },
  { k: "Based in", v: "Pune, India" },
];

const About = () => (
  <section className="section about" id="about">
    <div className="wrap">
      <SectionHead index="01" label="About" />

      <div className="about-lead">
        <p className="about-statement" data-reveal="lines">
          I'm Miheer, an AI Engineer at Nutsovertech. I build LLM-powered
          products and handle Ruby on Rails projects, combining clean
          engineering with AI to ship software that is fast and useful.
        </p>
        <NetSlot />
      </div>

      <div className="about-grid">
        <p className="about-body" data-reveal="fade">
          I completed the PG-DAC programme at CDAC ACTS, Pune with an All India
          Rank of 23. Before that I earned a
          B.Tech in Computer Engineering from MIT ADT University. Today I work
          across LangGraph, MCP and RAG pipelines on the AI side, and Ruby on
          Rails, Java, React and PostgreSQL on the product side.
        </p>

        <dl className="about-facts" data-reveal="stagger">
          {FACTS.map(({ k, v }) => (
            <div key={k}>
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

export default About;
