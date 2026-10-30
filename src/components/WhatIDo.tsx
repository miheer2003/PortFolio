import "./styles/WhatIDo.css";
import SectionHead from "./SectionHead";

const CAPABILITIES = [
  {
    no: "A",
    title: "AI Engineering",
    sub: "Intelligent systems & automation",
    body: "AI-powered products built on LLMs, NLP, prompt engineering, RAG and agent workflows, designed to make software smarter and teams faster.",
    tags: ["Python", "LangGraph", "LangChain", "MCP", "RAG", "AutoGen", "CrewAI", "TensorFlow", "PyTorch", "OpenCV"],
  },
  {
    no: "B",
    title: "Software Engineering",
    sub: "Scalable full-stack applications",
    body: "High-performance web applications with Java, Spring Boot, React, REST APIs and MySQL, with clean architecture and a strong focus on user experience.",
    tags: ["Ruby on Rails", "Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker", "REST APIs", "AWS"],
  },
];

const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const onMove = (e: React.PointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
  if (!fine()) return;
  el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
};
const onLeave = (e: React.PointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
};

const WhatIDo = () => (
  <section className="section capabilities" id="capabilities">
    <div className="wrap">
      <SectionHead index="03" label="Capabilities" />
      <h2 className="sec-title" data-reveal="lines">
        What I <span className="serif accent-text">do</span>
      </h2>

      <div className="cap-grid" data-reveal="stagger">
        {CAPABILITIES.map((c) => (
          <div className="cap-cell" key={c.title}>
            <article className="cap-card" onPointerMove={onMove} onPointerLeave={onLeave}>
              <div className="cap-top">
                <span className="mono cap-no">{c.no}</span>
                <span className="mono">{c.sub}</span>
              </div>
              <h3 className="cap-title">{c.title}</h3>
              <p className="cap-body">{c.body}</p>
              <ul className="cap-tags">
                {c.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhatIDo;
