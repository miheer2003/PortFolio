import type { IconType } from "react-icons";
import { FaAws, FaJava } from "react-icons/fa6";
import {
  SiAnthropic,
  SiCrewai,
  SiDocker,
  SiFastapi,
  SiGit,
  SiGithub,
  SiGooglegemini,
  SiHuggingface,
  SiLangchain,
  SiLanggraph,
  SiModelcontextprotocol,
  SiOllama,
  SiOpenai,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiRubyonrails,
  SiSpringboot,
  SiTypescript,
} from "react-icons/si";
import "./styles/TechStack.css";
import SectionHead from "./SectionHead";

type Tech = { name: string; Icon?: IconType };
type Group = { label: string; items: Tech[]; concept?: boolean; wide?: boolean };

const GROUPS: Group[] = [
  {
    label: "AI engineering",
    wide: true,
    items: [
      { name: "MCP", Icon: SiModelcontextprotocol },
      { name: "LangGraph", Icon: SiLanggraph },
      { name: "LangChain", Icon: SiLangchain },
      { name: "CrewAI", Icon: SiCrewai },
      { name: "OpenAI", Icon: SiOpenai },
      { name: "Claude", Icon: SiAnthropic },
      { name: "Gemini", Icon: SiGooglegemini },
      { name: "Hugging Face", Icon: SiHuggingface },
      { name: "Ollama", Icon: SiOllama },
    ],
  },
  {
    label: "LLM concepts",
    concept: true,
    items: [
      { name: "RAG" },
      { name: "Context engineering" },
      { name: "Embeddings & vector DBs" },
      { name: "Tool calling" },
      { name: "Agentic workflows" },
      { name: "Evals & guardrails" },
    ],
  },
  {
    label: "ML",
    items: [
      { name: "Python", Icon: SiPython },
      { name: "PyTorch", Icon: SiPytorch },
      { name: "FastAPI", Icon: SiFastapi },
    ],
  },
  {
    label: "Product",
    items: [
      { name: "Ruby on Rails", Icon: SiRubyonrails },
      { name: "Java", Icon: FaJava },
      { name: "Spring Boot", Icon: SiSpringboot },
      { name: "React", Icon: SiReact },
      { name: "TypeScript", Icon: SiTypescript },
    ],
  },
  {
    label: "Data & ship",
    items: [
      { name: "PostgreSQL", Icon: SiPostgresql },
      { name: "AWS", Icon: FaAws },
      { name: "Docker", Icon: SiDocker },
      { name: "Git", Icon: SiGit },
      { name: "GitHub", Icon: SiGithub },
    ],
  },
];

const TechStack = () => (
  <section className="section stack" id="stack">
    <div className="wrap">
      <SectionHead index="05" label="Stack" />
      <h2 className="sec-title" data-reveal="lines">
        Tools I <span className="serif accent-text">trust</span>
      </h2>

      <div className="stack-groups">
        {GROUPS.map((g) => (
          <div className={`stack-group ${g.wide ? "is-wide" : ""}`} key={g.label}>
            <h3 className="mono stack-label">{g.label}</h3>
            <ul className="stack-items" data-reveal="stagger">
              {g.items.map(({ name, Icon }) => (
                <li key={name} className={`stack-item ${g.concept ? "is-concept" : ""}`}>
                  {Icon ? <Icon aria-hidden="true" /> : <span className="stack-mark" aria-hidden="true" />}
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TechStack;
