/** Shared profile data used by the page sections and the terminal. */
import type { ArtKey } from "../components/ProjectArt";

export const EMAIL = "miheerjangale7@gmail.com";
export const LINKEDIN = "https://linkedin.com/in/miheer-jangale";
export const RESUME =
  "https://drive.google.com/file/d/1qq9yPUU2tygYuroMppPYi_-x5V9dt0Oe/view?usp=sharing";

export const GH = "https://github.com/miheer2003";

export const PROJECTS: { title: string; kind: string; tools: string; art: ArtKey; link: string }[] = [
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
