import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./styles/Career.css";
import SectionHead from "./SectionHead";
import { prefersReducedMotion } from "./utils/lenis";

gsap.registerPlugin(useGSAP);

const ENTRIES = [
  {
    period: "Now",
    role: "AI Engineer · Ruby on Rails",
    org: "Nutsovertech",
    body: "Building LLM-powered features and agentic workflows, and handling Ruby on Rails projects end to end, from client requirements to production releases.",
    tags: ["Gen AI", "Agents", "Ruby on Rails"],
    current: true,
  },
  {
    period: "2025 – 2026",
    role: "PG-DAC, Advanced Computing",
    org: "CDAC ACTS, Pune",
    body: "Post Graduate Diploma in Advanced Computing (Aug 2025 – Jan 2026). Secured All India Rank (AIR) 23.",
  },
  {
    period: "2025",
    role: "Software Development Intern",
    org: "Xpedio Live, Pune",
    body: "Built a full-stack Doctor Management Application with React and Spring Boot. Designed 10+ REST APIs with optimised MySQL queries, cutting data load time by 35%.",
  },
  {
    period: "2022 – 2025",
    role: "B.Tech, Computer Engineering",
    org: "MIT ADT University",
    body: "First Class. Coursework in OOP, DSA, DBMS, Computer Networks, Software Engineering, Operating Systems and Web Development.",
  },
  {
    period: "2019 – 2022",
    role: "Diploma, Computer Science",
    org: "Sandip Polytechnic, MSBTE",
    body: "Graduated with 80.11%. Coursework in C, OOP (C++), Data Structures, Operating Systems, Computer Networks and Web Development.",
  },
];

const Career = () => {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".exp-progress",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".exp-list",
            start: "top 70%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section className="section experience" id="experience" ref={rootRef}>
      <div className="wrap">
        <SectionHead index="04" label="Experience & education" />
        <h2 className="sec-title" data-reveal="lines">
          The <span className="serif accent-text">journey</span> so far
        </h2>

        <ol className="exp-list">
          <span className="exp-rail" aria-hidden="true">
            <span className="exp-progress" />
          </span>
          {ENTRIES.map((e) => (
            <li key={e.role} className={`exp-item ${e.current ? "is-current" : ""}`} data-reveal="fade">
              <span className="exp-node" aria-hidden="true" />
              <span className="mono exp-period">{e.period}</span>
              <div className="exp-head">
                <h3>{e.role}</h3>
                <span className="exp-org">{e.org}</span>
              </div>
              <div className="exp-text">
                <p className="exp-body">{e.body}</p>
                {"tags" in e && e.tags && (
                  <ul className="exp-tags mono">
                    {e.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Career;
