import type { IconType } from "react-icons";
import { FaAws, FaJava } from "react-icons/fa6";
import {
  SiAnthropic,
  SiCplusplus,
  SiCrewai,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiGit,
  SiGithubcopilot,
  SiGooglegemini,
  SiHuggingface,
  SiJavascript,
  SiKeras,
  SiLangchain,
  SiLanggraph,
  SiLinux,
  SiModelcontextprotocol,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOllama,
  SiOpenai,
  SiOpencv,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiSpringboot,
  SiStreamlit,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";
import "./styles/TechStack.css";
import SectionHead from "./SectionHead";

type Tech = { name: string; Icon?: IconType };
type Group = { label: string; note?: string; items: Tech[]; concept?: boolean };

const GROUPS: Group[] = [
  {
    label: "Agents & orchestration",
    note: "Gen AI",
    items: [
      { name: "MCP", Icon: SiModelcontextprotocol },
      { name: "LangGraph", Icon: SiLanggraph },
      { name: "LangChain", Icon: SiLangchain },
      { name: "CrewAI", Icon: SiCrewai },
      { name: "AutoGen" },
      { name: "GitHub Copilot", Icon: SiGithubcopilot },
    ],
  },
  {
    label: "Models & platforms",
    note: "Gen AI",
    items: [
      { name: "OpenAI", Icon: SiOpenai },
      { name: "Claude", Icon: SiAnthropic },
      { name: "Gemini", Icon: SiGooglegemini },
      { name: "Hugging Face", Icon: SiHuggingface },
      { name: "Ollama", Icon: SiOllama },
    ],
  },
  {
    label: "LLM concepts",
    note: "Gen AI",
    concept: true,
    items: [
      { name: "Context windows" },
      { name: "RAG" },
      { name: "Embeddings" },
      { name: "Vector databases" },
      { name: "Tool / function calling" },
      { name: "Agentic workflows" },
      { name: "Prompt engineering" },
      { name: "Structured outputs" },
      { name: "Evals & guardrails" },
      { name: "Fine-tuning (LoRA)" },
    ],
  },
  {
    label: "AI / ML",
    items: [
      { name: "Python", Icon: SiPython },
      { name: "PyTorch", Icon: SiPytorch },
      { name: "TensorFlow", Icon: SiTensorflow },
      { name: "Keras", Icon: SiKeras },
      { name: "Scikit-learn", Icon: SiScikitlearn },
      { name: "OpenCV", Icon: SiOpencv },
      { name: "FastAPI", Icon: SiFastapi },
      { name: "Streamlit", Icon: SiStreamlit },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Java", Icon: FaJava },
      { name: "Spring Boot", Icon: SiSpringboot },
      { name: "Node.js", Icon: SiNodedotjs },
      { name: "Express", Icon: SiExpress },
      { name: "C++", Icon: SiCplusplus },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "React", Icon: SiReact },
      { name: "Next.js", Icon: SiNextdotjs },
      { name: "TypeScript", Icon: SiTypescript },
      { name: "JavaScript", Icon: SiJavascript },
    ],
  },
  {
    label: "Data & cloud",
    items: [
      { name: "MySQL", Icon: SiMysql },
      { name: "PostgreSQL", Icon: SiPostgresql },
      { name: "MongoDB", Icon: SiMongodb },
      { name: "AWS", Icon: FaAws },
      { name: "Docker", Icon: SiDocker },
      { name: "Git", Icon: SiGit },
      { name: "Linux", Icon: SiLinux },
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
          <div className={`stack-group ${g.note ? "is-genai" : ""}`} key={g.label}>
            <div className="stack-label">
              <h3 className="mono">{g.label}</h3>
              {g.note && <span className="mono stack-note">{g.note}</span>}
            </div>
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
