import "./styles/About.css";
import SectionHead from "./SectionHead";

const FACTS = [
  { k: "Role", v: "AI Engineer, Nutsovertech" },
  { k: "Education", v: "PG-DAC, CDAC ACTS · AIR 23" },
  { k: "Focus", v: "LLMs, RAG, full-stack Java" },
  { k: "Based in", v: "Pune, India" },
];

const About = () => (
  <section className="section about" id="about">
    <div className="wrap">
      <SectionHead index="01" label="About" />

      <p className="about-statement" data-reveal="lines">
        I'm Miheer, an AI Engineer at Nutsovertech and a full-stack Java
        developer. I combine clean engineering with AI to build software that
        is fast, intelligent and useful.
      </p>

      <div className="about-grid">
        <p className="about-body" data-reveal="fade">
          I completed the PG-DAC programme at CDAC ACTS, Pune with an All India
          Rank of 23. Before that I earned a
          B.Tech in Computer Engineering from MIT ADT University. I work across
          Java, Spring Boot, React and MySQL, and build LLM-powered workflows
          with RAG and agent tooling.
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
